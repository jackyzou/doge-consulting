/**
 * AI Product Analyzer — Canonical Product Profile Pipeline
 *
 * All inputs (URL, image, text) are normalized into a single
 * Canonical Product Profile before querying 1688order.com.
 *
 * Input → Extract → Canonical Profile → Search Keywords → 1688 → Rank
 */

import type { Product1688 } from "./1688order";

/**
 * Canonical Product Profile — the normalized identity of a product
 * regardless of input method (link, image, or text description)
 */
export interface CanonicalProfile {
  title: string;
  searchQuery: string;           // Best search term for 1688
  searchQueryAlt: string;        // Broader fallback search term
  searchQueryChinese: string;    // Chinese search term
  category: string;
  materials: string[];
  features: string[];
  estimatedRetailPrice: number | null;
  estimatedFactoryPrice: { min: number; max: number } | null;
  sourceUrl: string | null;
  sourceImageUrl: string | null;
}

export interface RankedResult {
  product: Product1688;
  relevanceScore: number;
  matchConfidence: string;       // "High" | "Medium" | "Low"
  matchReason: string;
  pricingAnalysis: {
    chinaDirectPrice: number;
    estimatedShipping: number;
    dogePrice: number;
    savingsPercent: number | null;
  };
}

/**
 * Extract a Canonical Product Profile from any user input.
 * This is the core normalization step — all 3 input types
 * converge to the same structured output.
 */
export async function extractCanonicalProfile(input: {
  url?: string | null;
  imageBase64?: string | null;
  description?: string | null;
  sourcePrice?: number | null;
}): Promise<CanonicalProfile> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // Step 1: If URL provided, try to scrape the source product page
  let scrapedData: ScrapedProduct = {};
  if (input.url && !input.url.includes("1688")) {
    scrapedData = await scrapeSourceProduct(input.url);

    // If scraping failed (bot detection), extract product info from the URL itself
    if (!scrapedData.title && input.url) {
      scrapedData.title = extractTitleFromUrl(input.url);
    }
  }

  // Use scraped price as retail price baseline if user didn't provide one
  const retailPrice = input.sourcePrice || scrapedData.price || null;

  // Build context from all available information
  const combinedContext = buildContext(input, scrapedData);

  // Step 2: Use AI to extract canonical profile
  let profile: CanonicalProfile;
  if (ANTHROPIC_API_KEY) {
    try {
      profile = await extractWithAI(combinedContext, input.imageBase64, ANTHROPIC_API_KEY);
    } catch (err) {
      console.error("AI extraction failed, using fallback:", err);
      profile = extractRuleBased(combinedContext);
    }
  } else {
    profile = extractRuleBased(combinedContext);
  }

  // Attach the scraped source data to the profile
  profile.estimatedRetailPrice = retailPrice;
  profile.sourceUrl = input.url || null;
  profile.sourceImageUrl = scrapedData.imageUrl || null;

  // If we have retail price, recalculate factory price estimate
  if (retailPrice && !profile.estimatedFactoryPrice) {
    profile.estimatedFactoryPrice = {
      min: Math.round(retailPrice * 0.10 * 100) / 100,
      max: Math.round(retailPrice * 0.35 * 100) / 100,
    };
  }

  return profile;
}

interface ScrapedProduct {
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

/**
 * Extract a human-readable product title from a URL path.
 * Works well for most e-commerce URLs which encode product names in the path.
 * e.g., "/products/mid-century-coffee-table-h3327/" → "mid century coffee table"
 * e.g., "/patagonia-nano-puff-jacket-mens" → "patagonia nano puff jacket mens"
 */
function extractTitleFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    // Find the longest path segment (usually the product name)
    let bestSegment = "";
    for (const seg of pathSegments) {
      // Skip common non-product segments
      if (/^(p|dp|ip|product|products|shop|category|pdp|s\d+)$/i.test(seg)) continue;
      // Skip very short segments or pure IDs
      if (seg.length < 5 || /^\d+$/.test(seg) || /^[A-Z0-9]{8,}$/.test(seg)) continue;

      if (seg.length > bestSegment.length) bestSegment = seg;
    }

    if (!bestSegment) return undefined;

    // Convert URL slugs to readable text
    const title = bestSegment
      .replace(/[-_]/g, " ")           // hyphens/underscores → spaces
      .replace(/\.[^.]*$/g, "")        // strip file extensions (.html, .product.xxx)
      .replace(/\b[a-z]?\d+\b/g, "")  // remove product codes (h3327, s153800)
      .replace(/\s+/g, " ")           // collapse whitespace
      .trim();

    // Capitalize first letter of each word
    const readable = title.replace(/\b\w/g, (c) => c.toUpperCase());

    // Prepend store name for context when sending to AI
    const store = hostname.split(".")[0];
    return `${readable} (from ${store})`;
  } catch {
    return undefined;
  }
}

/**
 * Scrape a source product page. Tries fast fetch first, then Playwright.
 * Extracts title, description, price, and main product image.
 */
async function scrapeSourceProduct(url: string): Promise<ScrapedProduct> {
  // Use plain fetch — works for sites that serve OG meta tags in SSR HTML
  // (Playwright doesn't work inside Next.js Turbopack runtime)
  return scrapeWithFetch(url);
}

/** Extract Amazon dynamic image URL from data-a-dynamic-image attribute */
function extractDynamicImage(html: string): string | undefined {
  const match = html.match(/data-a-dynamic-image="([^"]+)"/);
  if (!match) return undefined;
  try {
    const decoded = match[1].replace(/&quot;/g, '"');
    return Object.keys(JSON.parse(decoded))[0];
  } catch {
    return undefined;
  }
}

/** Plain fetch fallback for simple sites */
async function scrapeWithFetch(url: string): Promise<ScrapedProduct> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    if (!res.ok) return {};
    const html = await res.text();

    // Filter out bot-detection pages
    const botSignals = /Access Denied|Robot or human|Error Page|403 error|captcha/i;
    const rawTitle = html.match(/property="og:title"\s+content="([^"]+)"/)?.[1]
      || html.match(/content="([^"]+)"[^>]*property="og:title"/)?.[1]
      || html.match(/<title[^>]*>([^<]+)/)?.[1]?.replace(/\s*[-|].*/g, "").trim();

    const title = rawTitle && !botSignals.test(rawTitle) ? rawTitle.substring(0, 200) : undefined;

    return {
      title,
      description: (html.match(/property="og:description"\s+content="([^"]+)"/)?.[1]
        || html.match(/content="([^"]+)"[^>]*property="og:description"/)?.[1])?.substring(0, 500),
      price: parseFloat(html.match(/"price"\s*:\s*"?([\d.]+)/)?.[1] || "0") || undefined,
      imageUrl: html.match(/property="og:image"\s+content="([^"]+)"/)?.[1]
        || html.match(/content="([^"]+)"[^>]*property="og:image"/)?.[1],
    };
  } catch {
    return {};
  }
}

/**
 * Build combined context string from all inputs
 */
function buildContext(
  input: { url?: string | null; description?: string | null; sourcePrice?: number | null },
  scraped: { title?: string; description?: string; price?: number; imageUrl?: string },
): string {
  const parts: string[] = [];

  if (scraped.title) parts.push(`Product: ${scraped.title}`);
  if (input.description) parts.push(`Description: ${input.description}`);
  if (scraped.description) parts.push(`Details: ${scraped.description}`);

  const price = input.sourcePrice || scraped.price;
  if (price) parts.push(`US Retail Price: $${price}`);

  if (input.url) parts.push(`Source URL: ${input.url}`);

  return parts.join("\n") || "Unknown product";
}

/**
 * Use Claude AI to extract canonical profile from combined context
 */
async function extractWithAI(
  context: string,
  imageBase64: string | null | undefined,
  apiKey: string,
): Promise<CanonicalProfile> {
  const systemPrompt = `You are a China product sourcing expert. Your job is to analyze a product and create a structured profile for searching on the Chinese wholesale platform 1688.com.

Strip all marketing language AND brand names. Focus on: the core product type, materials, dimensions, and what a Chinese factory would call this item.

Respond in EXACTLY this JSON format (no other text):
{
  "title": "concise product title in English (no brand names)",
  "searchQuery": "best 2-4 word GENERIC search term for 1688order.com",
  "searchQueryAlt": "alternative 2-3 word broader search term",
  "searchQueryChinese": "Chinese search terms for 1688 (2-4 words)",
  "category": "one of: furniture, toys, accessories, clothing, bags, tools, shoes, electronics, home-goods, lighting, general",
  "materials": ["material1", "material2"],
  "features": ["key feature 1", "key feature 2"],
  "estimatedFactoryPrice": {"min": 5.0, "max": 25.0}
}

CRITICAL RULES for searchQuery:
- NEVER include brand names (Tbfit, IKEA, Hampton Bay, etc.) — 1688 won't have them
- Use generic product type words: "accent chair", "coffee table", "pendant light"
- Think: what would a Chinese factory call this item?
- searchQueryAlt should be an even simpler/broader 2-word term (e.g., "sofa chair", "dining table")
- searchQueryChinese: translate the GENERIC product name to Chinese (e.g., "单人沙发椅")
- estimatedFactoryPrice: China factory unit price in USD (typically 15-40% of US retail)
- Focus on physical product attributes, not brand or marketing`;

  const userContent: unknown = imageBase64
    ? [
        {
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: imageBase64.replace(/^data:image\/[^;]+;base64,/, "") },
        },
        { type: "text", text: `Analyze this product and create a sourcing profile:\n\n${context}` },
      ]
    : `Analyze this product and create a sourcing profile:\n\n${context}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Claude API ${res.status}`);

  const data = await res.json();
  const text = data.content?.[0]?.text || "";

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || "Unknown product",
    searchQuery: parsed.searchQuery || parsed.title || "",
    searchQueryAlt: parsed.searchQueryAlt || "",
    searchQueryChinese: parsed.searchQueryChinese || "",
    category: parsed.category || "general",
    materials: Array.isArray(parsed.materials) ? parsed.materials : [],
    features: Array.isArray(parsed.features) ? parsed.features : [],
    estimatedRetailPrice: null,
    estimatedFactoryPrice: parsed.estimatedFactoryPrice?.min != null
      ? { min: Number(parsed.estimatedFactoryPrice.min), max: Number(parsed.estimatedFactoryPrice.max) }
      : null,
    sourceUrl: null,
    sourceImageUrl: null,
  };
}

/**
 * Rule-based canonical profile extraction (fallback)
 */
function extractRuleBased(context: string): CanonicalProfile {
  // Strip URLs from context — they contain path segments that look like keywords
  // but are useless (e.g., "/Oversized-Fireside-Reading-Assembly-Required/")
  const cleanContext = context.replace(/https?:\/\/[^\s]+/g, "").toLowerCase();

  // Extract meaningful words
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "are", "was",
    "product", "url", "retail", "price", "about", "its", "our", "your", "new",
    "best", "great", "high", "quality", "premium", "luxury", "modern", "details",
    "source", "description", "http", "https", "www", "com", "unknown",
  ]);

  const words = cleanContext.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Take 3-5 most relevant words as search query
  const searchQuery = words.slice(0, 4).join(" ");

  // Extract price
  const priceMatch = context.match(/\$\s*([\d.]+)/);
  const retailPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

  return {
    title: words.slice(0, 6).join(" "),
    searchQuery: searchQuery,
    searchQueryAlt: words.slice(0, 2).join(" "),
    searchQueryChinese: "",
    category: "general",
    materials: [],
    features: [],
    estimatedRetailPrice: retailPrice,
    estimatedFactoryPrice: retailPrice
      ? { min: retailPrice * 0.15, max: retailPrice * 0.40 }
      : null,
    sourceUrl: null,
    sourceImageUrl: null,
  };
}

/**
 * Rank 1688 search results against the canonical profile
 */
export function rankResults(
  profile: CanonicalProfile,
  products: Product1688[],
  sourcePrice: number | null,
): RankedResult[] {
  const queryWords = profile.searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  return products
    .map((product) => {
      const nameLower = product.name.toLowerCase();
      let score = 0;
      const matchReasons: string[] = [];

      // Keyword matching (up to 50 points)
      const hits = queryWords.filter((w) => nameLower.includes(w));
      const keywordScore = Math.min(50, hits.length * (50 / Math.max(queryWords.length, 1)));
      score += keywordScore;
      if (hits.length > 0) {
        matchReasons.push(`Keywords: ${hits.join(", ")}`);
      }

      // Sales volume signal (up to 20 points)
      if (product.salesVolume > 10000) {
        score += 20;
        matchReasons.push(`${product.salesVolume.toLocaleString()} sold`);
      } else if (product.salesVolume > 1000) {
        score += 12;
        matchReasons.push(`${product.salesVolume.toLocaleString()} sold`);
      } else if (product.salesVolume > 100) {
        score += 5;
      }

      // Supplier rating (up to 15 points)
      if (product.supplierRating && product.supplierRating >= 4.5) {
        score += 15;
        matchReasons.push(`Rated ${product.supplierRating}/5`);
      } else if (product.supplierRating && product.supplierRating >= 4.0) {
        score += 8;
      }

      // Price sanity check (up to 15 points)
      if (profile.estimatedFactoryPrice && product.priceUSD > 0) {
        const { min, max } = profile.estimatedFactoryPrice;
        if (product.priceUSD >= min && product.priceUSD <= max) {
          score += 15;
          matchReasons.push("Price in expected range");
        } else if (product.priceUSD < min * 0.5) {
          // Suspiciously cheap — deduct
          score -= 10;
          matchReasons.push("Price unusually low");
        }
      }

      // Pricing calculation
      const chinaDirectPrice = product.priceUSD;
      const estimatedShipping = chinaDirectPrice < 5 ? 2 : chinaDirectPrice < 50 ? 5 : 15;
      const margin = 0.20;
      const dogePrice = Math.round((chinaDirectPrice + estimatedShipping) * (1 + margin) * 100) / 100;
      const savingsPercent = sourcePrice && sourcePrice > 0
        ? Math.round((1 - dogePrice / sourcePrice) * 100)
        : null;

      if (savingsPercent && savingsPercent > 0) {
        matchReasons.push(`${savingsPercent}% cheaper`);
      }

      // Determine confidence level
      const confidence = score >= 60 ? "High" : score >= 30 ? "Medium" : "Low";

      return {
        product,
        relevanceScore: Math.max(0, Math.min(100, score)),
        matchConfidence: confidence,
        matchReason: matchReasons.join(" · ") || "Potential match",
        pricingAnalysis: {
          chinaDirectPrice,
          estimatedShipping,
          dogePrice,
          savingsPercent,
        },
      };
    })
    .filter((r) => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
