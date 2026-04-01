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

  // Step 1: If URL provided, scrape the source product page first
  let scrapedData: { title?: string; description?: string; price?: number; imageUrl?: string } = {};
  if (input.url && !input.url.includes("1688")) {
    scrapedData = await scrapeSourceProduct(input.url);
  }

  // Build context from all available information
  const combinedContext = buildContext(input, scrapedData);

  // Step 2: Use AI to extract canonical profile
  if (ANTHROPIC_API_KEY) {
    try {
      return await extractWithAI(combinedContext, input.imageBase64, ANTHROPIC_API_KEY);
    } catch (err) {
      console.error("AI extraction failed, using fallback:", err);
    }
  }

  // Step 3: Fallback — rule-based extraction
  return extractRuleBased(combinedContext);
}

/**
 * Scrape a source product page (Amazon, Shopify, etc.) to extract product info
 */
async function scrapeSourceProduct(url: string): Promise<{
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });

    if (!res.ok) return {};
    const html = await res.text();

    // Extract Open Graph / meta data (works on most e-commerce sites)
    const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/)?.[1]
      || html.match(/name="og:title"\s+content="([^"]+)"/)?.[1];
    const metaTitle = html.match(/<title[^>]*>([^<]+)/)?.[1];

    const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/)?.[1];

    const ogImage = html.match(/property="og:image"\s+content="([^"]+)"/)?.[1];

    // Extract price — look for structured data or common patterns
    const priceLD = html.match(/"price"\s*:\s*"?([\d.]+)"?/)?.[1];
    const priceMeta = html.match(/property="product:price:amount"\s+content="([^"]+)"/)?.[1];

    const title = ogTitle || metaTitle?.replace(/\s*[-|].*$/, "").trim();
    const price = parseFloat(priceLD || priceMeta || "0") || undefined;

    return {
      title: title?.substring(0, 200),
      description: ogDesc?.substring(0, 500),
      price,
      imageUrl: ogImage,
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

Strip all marketing language. Focus on: the core product type, materials, dimensions, and what a Chinese factory would call this item.

Respond in EXACTLY this JSON format (no other text):
{
  "title": "concise product title in English",
  "searchQuery": "best 2-4 word English search term for 1688order.com (what a buyer would search)",
  "searchQueryChinese": "Chinese search terms for 1688 (2-4 words)",
  "category": "one of: furniture, toys, accessories, clothing, bags, tools, shoes, electronics, home-goods, lighting, general",
  "materials": ["material1", "material2"],
  "features": ["key feature 1", "key feature 2"],
  "estimatedFactoryPrice": {"min": 5.0, "max": 25.0}
}

Guidelines:
- searchQuery: use simple, concrete terms. "oak coffee table" not "mid-century modern artisan oak coffee table"
- searchQueryChinese: translate the product name to Chinese wholesale terms (e.g., "实木咖啡桌")
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
  const lower = context.toLowerCase();

  // Extract meaningful words
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "are", "was",
    "product", "url", "retail", "price", "about", "its", "our", "your", "new",
    "best", "great", "high", "quality", "premium", "luxury", "modern", "details",
    "source", "description", "http", "https", "www", "com",
  ]);

  const words = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Take 3-5 most relevant words as search query
  const searchQuery = words.slice(0, 4).join(" ");

  // Extract price
  const priceMatch = context.match(/\$\s*([\d.]+)/);
  const retailPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

  return {
    title: words.slice(0, 6).join(" "),
    searchQuery,
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
