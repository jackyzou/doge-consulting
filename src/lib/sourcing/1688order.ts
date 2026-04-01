/**
 * 1688order.com Integration Layer
 *
 * Uses Playwright headless browser to:
 * 1. Search 1688order.com by keywords (real search, not hardcoded)
 * 2. Fetch individual product detail pages
 * 3. Extract structured product data from rendered SPA pages
 *
 * The site is a Nuxt.js SPA — plain fetch returns an empty JS shell.
 */

export interface Product1688 {
  id: string;
  name: string;
  priceUSD: number;
  priceCNY: number;
  imageUrl: string;
  salesVolume: number;
  detailUrl: string;
  supplierRating: number | null;
  minOrder: number;
  category?: string;
  variants?: ProductVariant[];
  images?: string[];
  matchConfidence?: number;
}

export interface ProductVariant {
  name: string;
  priceUSD: number;
  available: number;
}

// Simple in-memory cache with TTL — keyed by search query or product ID
const searchCache = new Map<string, { data: Product1688[]; expiry: number }>();
const productCache = new Map<string, { data: Product1688; expiry: number }>();
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for search results
const PRODUCT_CACHE_TTL = 60 * 60 * 1000; // 1 hour for product detail

// Singleton browser instance
let browserPromise: Promise<import("playwright").Browser> | null = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = import("playwright").then(async (pw) => {
      const browser = await pw.chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      });
      return browser;
    }).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

/**
 * Search 1688order.com by keyword — returns real search results
 */
export async function searchProducts(keyword: string): Promise<Product1688[]> {
  if (!keyword.trim()) return [];

  const cacheKey = `search:${keyword.trim().toLowerCase()}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) return cached.data;

  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    // Block heavy resources
    await page.route("**/*.{woff,woff2,ttf}", (route) => route.abort());
    await page.route("**/gtm.js", (route) => route.abort());
    await page.route("**/gtag/**", (route) => route.abort());
    await page.route("**/fbevents.js", (route) => route.abort());
    await page.route("**/bat.bing.com/**", (route) => route.abort());

    // Navigate directly to the search results URL
    const searchUrl = `https://1688order.com/pc/goods_list?name=${encodeURIComponent(keyword)}&searchType=text&is_input=1`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Wait for product listings to render
    await page.waitForSelector('a[href*="goods_details"]', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const html = await page.content();
    await context.close();

    const products = parseSearchResults(html);

    // Cache results
    searchCache.set(cacheKey, { data: products, expiry: Date.now() + SEARCH_CACHE_TTL });

    return products;
  } catch (err) {
    console.error(`1688 search failed for "${keyword}":`, err);
    return [];
  }
}

/**
 * Parse search results from 1688order.com rendered HTML
 *
 * The SPA renders product cards with this text pattern:
 *   "Product Name $PRICE NUMBERPurchased"
 * with links to goods_details/PRODUCT_ID
 */
function parseSearchResults(html: string): Product1688[] {
  const products: Product1688[] = [];

  // Strip all HTML tags to get clean text with product info
  const text = html.replace(/<[^>]+>/g, "\n");

  // Extract product links and their positions in the original HTML
  const linkRegex = /goods_details\/(\d{10,15})/g;
  const foundIds: string[] = [];
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    if (!foundIds.includes(match[1])) foundIds.push(match[1]);
  }

  // For each product ID, find product info near it in the clean text
  // Pattern in text: "...Product Title $PRICE NUMPurchased..."
  const productPattern = /([A-Z][^$\n]{10,200}?)\s*\$([\d.]+)\s+([\d,]+)\s*Purchased/g;
  const productEntries: { name: string; price: number; sales: number }[] = [];
  let pm;
  while ((pm = productPattern.exec(text)) !== null) {
    productEntries.push({
      name: pm[1].trim(),
      price: parseFloat(pm[2]),
      sales: parseInt(pm[3].replace(/,/g, ""), 10),
    });
  }

  // Also extract image URLs in order — they correspond to products
  const imageRegex = /(https:\/\/cdns\.1688order\.com\/uploads\/images\/[^"'\s)]+|https:\/\/cbu01\.alicdn\.com[^"'\s)]+)/g;
  const images: string[] = [];
  let im;
  while ((im = imageRegex.exec(html)) !== null) {
    if (!images.includes(im[1]) && !im[1].includes("logo") && !im[1].includes("icon")) {
      images.push(im[1]);
    }
  }

  // Match product entries with IDs (they appear in order on the page)
  const limit = Math.min(foundIds.length, productEntries.length, 12);
  for (let i = 0; i < limit; i++) {
    const id = foundIds[i];
    const entry = productEntries[i];

    if (entry && entry.name.length > 5) {
      products.push({
        id,
        name: entry.name.substring(0, 200),
        priceUSD: entry.price,
        priceCNY: Math.round(entry.price * 7.2 * 100) / 100,
        imageUrl: images[i] || "",
        salesVolume: entry.sales,
        detailUrl: `https://1688order.com/pc/goods_details/${id}`,
        supplierRating: null,
        minOrder: 1,
      });
    }
  }

  return products;
}

/**
 * Fetch and parse a product detail page from 1688order.com using Playwright
 */
export async function getProductDetails(productId: string): Promise<Product1688 | null> {
  // Validate product ID format (numeric only)
  if (!/^\d+$/.test(productId)) return null;

  const cached = productCache.get(productId);
  if (cached && cached.expiry > Date.now()) return cached.data;

  const url = `https://1688order.com/pc/goods_details/${productId}`;

  try {
    const browser = await getBrowser();
    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    // Block unnecessary resources to speed up page load
    await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf}", (route) => route.abort());
    await page.route("**/gtm.js", (route) => route.abort());
    await page.route("**/gtag/**", (route) => route.abort());
    await page.route("**/fbevents.js", (route) => route.abort());
    await page.route("**/bat.bing.com/**", (route) => route.abort());

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    // Wait for SPA to render product data (look for price indicator)
    await page.waitForSelector("text=USD", { timeout: 15000 }).catch(() => {});
    // Small extra wait for full render
    await page.waitForTimeout(2000);

    const html = await page.content();
    await context.close();

    return parseProductPage(productId, html);
  } catch (err) {
    console.error(`Failed to fetch product ${productId}:`, err);
    return null;
  }
}

/**
 * Fetch multiple product details sequentially (Playwright pages are heavy)
 */
export async function getMultipleProducts(
  productIds: string[],
  concurrency = 2,
): Promise<Product1688[]> {
  const results: Product1688[] = [];
  const batches: string[][] = [];

  for (let i = 0; i < productIds.length; i += concurrency) {
    batches.push(productIds.slice(i, i + concurrency));
  }

  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(getProductDetails));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}

/**
 * Parse product data from 1688order.com HTML page
 */
function parseProductPage(productId: string, html: string): Product1688 | null {
  try {
    // Extract product name from title or h1
    const titleMatch = html.match(/<title[^>]*>([^<]+)</);
    const h1Match = html.match(/<h1[^>]*>([^<]+)</);
    const name = h1Match?.[1]?.trim() || titleMatch?.[1]?.replace(/ - 1688order.*$/, "").trim() || "";

    if (!name) return null;

    // Extract USD price - pattern: "USD1.61" or "$  1.61" in the pricing section
    const priceUSDMatch = html.match(/USD\s*([\d.]+)/);
    const priceAltMatch = html.match(/\$\s*([\d.]+)\s*\d+available/);
    const priceUSD = parseFloat(priceUSDMatch?.[1] || priceAltMatch?.[1] || "0");

    // Extract CNY price - pattern: "CNY10.90"
    const priceCNYMatch = html.match(/CNY\s*([\d.]+)/);
    const priceCNY = parseFloat(priceCNYMatch?.[1] || "0");

    // Extract sales volume - pattern: "Sales Volume：25653" or "Sales Volume:25653"
    const salesMatch = html.match(/Sales\s*Volume[：:]\s*([\d,]+)/i);
    const salesVolume = parseInt((salesMatch?.[1] || "0").replace(/,/g, ""), 10);

    // Extract first product image from alicdn
    const imgMatch = html.match(/(https:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s]+\.jpg)/);
    const imageUrl = imgMatch?.[1] || "";

    // Extract all product images
    const imgRegex = /(https:\/\/cbu01\.alicdn\.com\/img\/ibank\/[^"'\s]+\.jpg)/g;
    const allImages: string[] = [];
    let m;
    while ((m = imgRegex.exec(html)) !== null) {
      if (!allImages.includes(m[1])) allImages.push(m[1]);
      if (allImages.length >= 8) break;
    }

    // Extract supplier rating - try multiple patterns
    const ratingMatch = html.match(/Supplier\s*Credit\s*Rating[\s\S]*?\(([\d.]+)\)/i)
      || html.match(/\((\d\.\d)\)\s*<\/span>[\s\S]*?Total/i)
      || html.match(/credit.*?rating.*?\(([\d.]+)\)/i);
    const supplierRating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    // Extract variants - pattern: "23cm long (20cm high) 120g $  1.61 11633available"
    const variantRegex = /([^<\n]+?)\s*\$\s*([\d.]+)\s*(\d+)\s*available/g;
    const variants: ProductVariant[] = [];
    let vm;
    while ((vm = variantRegex.exec(html)) !== null) {
      variants.push({
        name: vm[1].trim(),
        priceUSD: parseFloat(vm[2]),
        available: parseInt(vm[3], 10),
      });
      if (variants.length >= 10) break;
    }

    // Extract min order quantity
    const moqMatch = html.match(/Minimum\s*Quantity[\s\S]*?(\d+)\s*-/i);
    const minOrder = parseInt(moqMatch?.[1] || "1", 10);

    if (priceUSD <= 0 && variants.length === 0) return null;

    const product: Product1688 = {
      id: productId,
      name,
      priceUSD: priceUSD || (variants[0]?.priceUSD ?? 0),
      priceCNY,
      imageUrl,
      salesVolume,
      detailUrl: `https://1688order.com/pc/goods_details/${productId}`,
      supplierRating,
      minOrder,
      variants: variants.length > 0 ? variants : undefined,
      images: allImages.length > 0 ? allImages : undefined,
    };

    // Cache the result
    productCache.set(productId, { data: product, expiry: Date.now() + PRODUCT_CACHE_TTL });

    return product;
  } catch {
    return null;
  }
}

/**
 * Extract product ID from a 1688order.com or 1688.com URL
 */
export function extractProductId(url: string): string | null {
  // 1688order.com URL: https://1688order.com/pc/goods_details/997680691809
  const orderMatch = url.match(/1688order\.com\/pc\/goods_details\/(\d+)/);
  if (orderMatch) return orderMatch[1];

  // 1688.com URL: https://detail.1688.com/offer/997680691809.html
  const detailMatch = url.match(/1688\.com\/offer\/(\d+)/);
  if (detailMatch) return detailMatch[1];

  return null;
}

/**
 * Construct search URL for user to browse on 1688order.com
 */
export function buildSearchUrl(keyword: string): string {
  return `https://1688order.com/pc/search/${encodeURIComponent(keyword)}`;
}

/**
 * Clean caches (for testing)
 */
export function clearCache(): void {
  searchCache.clear();
  productCache.clear();
}
