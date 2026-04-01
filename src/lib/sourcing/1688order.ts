/**
 * 1688order.com Integration Layer
 *
 * Uses Playwright headless browser to render 1688order.com SPA pages
 * and extract product data. The site is a Nuxt.js SPA that loads data
 * via client-side XHR — plain fetch only returns an empty shell.
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
}

export interface ProductVariant {
  name: string;
  priceUSD: number;
  available: number;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: Product1688; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Singleton browser instance (reuse across requests)
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
 * Fetch and parse a product detail page from 1688order.com using Playwright
 */
export async function getProductDetails(productId: string): Promise<Product1688 | null> {
  // Validate product ID format (numeric only)
  if (!/^\d+$/.test(productId)) return null;

  const cached = cache.get(productId);
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
    cache.set(productId, { data: product, expiry: Date.now() + CACHE_TTL });

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
 * Clean the in-memory cache (for testing)
 */
export function clearCache(): void {
  cache.clear();
}
