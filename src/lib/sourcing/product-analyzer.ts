/**
 * AI Product Analyzer
 *
 * Uses Claude AI to analyze user input (URL/image/description),
 * extract structured search parameters, generate Chinese keywords,
 * and rank search results by relevance.
 */

import type { Product1688 } from "./1688order";

export interface SearchParams {
  keywords: string[];
  keywordsChinese: string[];
  category: string;
  estimatedPriceRange: { min: number; max: number } | null;
  productFeatures: string[];
  suggestedProductIds: string[];
}

export interface RankedResult {
  product: Product1688;
  relevanceScore: number; // 0-100
  matchReason: string;
  pricingAnalysis: {
    chinaDirectPrice: number;
    estimatedShipping: number;
    dogePrice: number;
    savingsPercent: number | null;
  };
}

export interface AnalysisResult {
  searchParams: SearchParams;
  results: RankedResult[];
  searchUrl: string;
  query: string;
}

// Known popular product IDs organized by category.
// These are real 1688order.com product IDs used for seeding initial results.
const CATEGORY_PRODUCT_IDS: Record<string, string[]> = {
  furniture: [
    "657069344826", "681379099966", "907494691942",
  ],
  toys: [
    "997680691809", "734983575632", "629450450743",
    "732793689063", "907494691942",
  ],
  accessories: [
    "679063761027", "1000130480950", "978119950893",
  ],
  clothing: [
    "874983995405", "886531125439", "675156757012",
    "803040169601", "969331223430",
  ],
  bags: [
    "910448683292", "628878297460", "855781221765",
  ],
  tools: [
    "819596893730", "574772368965",
  ],
  shoes: [
    "719029536385", "977993884486",
  ],
  general: [
    "997680691809", "657069344826", "874983995405",
    "910448683292", "679063761027",
  ],
};

/**
 * Analyze user input and generate structured search parameters using Claude AI
 */
export async function analyzeUserInput(input: {
  url?: string | null;
  imageBase64?: string | null;
  description?: string | null;
  sourcePrice?: number | null;
}): Promise<SearchParams> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // Build a description of what we're searching for
  let inputDescription = "";
  if (input.description) {
    inputDescription = input.description;
  } else if (input.url) {
    inputDescription = `Product from URL: ${input.url}`;
  }

  if (input.sourcePrice) {
    inputDescription += ` (US retail price: $${input.sourcePrice})`;
  }

  // If no AI key available, use rule-based keyword extraction
  if (!ANTHROPIC_API_KEY) {
    return extractKeywordsRuleBased(inputDescription, input);
  }

  try {
    const messages: Array<{ role: string; content: unknown }> = [
      {
        role: "user",
        content: buildAnalysisPrompt(inputDescription, input.imageBase64),
      },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error("Claude API error:", res.status);
      return extractKeywordsRuleBased(inputDescription, input);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";

    return parseAIResponse(text, input);
  } catch (error) {
    console.error("AI analysis error:", error);
    return extractKeywordsRuleBased(inputDescription, input);
  }
}

function buildAnalysisPrompt(
  inputDescription: string,
  imageBase64?: string | null,
): unknown {
  const textPrompt = `You are a China product sourcing expert. Analyze this product request and extract structured search parameters.

Product request: "${inputDescription}"

Respond in EXACTLY this JSON format (no other text):
{
  "keywords": ["english keyword 1", "english keyword 2", "english keyword 3"],
  "keywordsChinese": ["中文关键词1", "中文关键词2"],
  "category": "one of: furniture, toys, accessories, clothing, bags, tools, shoes, electronics, home-goods, lighting, general",
  "estimatedPriceRange": {"min": 1.0, "max": 10.0},
  "productFeatures": ["feature1", "feature2"],
  "suggestedProductIds": []
}

Guidelines:
- Keywords: 3-5 precise English search terms a buyer would use on a Chinese wholesale platform
- Chinese keywords: 2-3 Chinese search terms for the same product on 1688.com
- Category: best match from the list above
- Price range: estimated China factory unit price in USD (typically 30-70% of US retail)
- Features: key product attributes (material, size, color, style)`;

  if (imageBase64) {
    return [
      {
        type: "image",
        source: { type: "base64", media_type: "image/jpeg", data: imageBase64.replace(/^data:image\/[^;]+;base64,/, "") },
      },
      { type: "text", text: textPrompt },
    ];
  }

  return textPrompt;
}

function parseAIResponse(
  text: string,
  input: { url?: string | null; description?: string | null; sourcePrice?: number | null },
): SearchParams {
  try {
    // Extract JSON from response (may have markdown code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
      keywordsChinese: Array.isArray(parsed.keywordsChinese) ? parsed.keywordsChinese.slice(0, 3) : [],
      category: typeof parsed.category === "string" ? parsed.category : "general",
      estimatedPriceRange: parsed.estimatedPriceRange?.min != null
        ? { min: Number(parsed.estimatedPriceRange.min), max: Number(parsed.estimatedPriceRange.max) }
        : null,
      productFeatures: Array.isArray(parsed.productFeatures) ? parsed.productFeatures.slice(0, 5) : [],
      suggestedProductIds: Array.isArray(parsed.suggestedProductIds) ? parsed.suggestedProductIds : [],
    };
  } catch {
    return extractKeywordsRuleBased(input.description || input.url || "", input);
  }
}

/**
 * Rule-based keyword extraction (fallback when AI is unavailable)
 */
function extractKeywordsRuleBased(
  text: string,
  input: { url?: string | null; sourcePrice?: number | null },
): SearchParams {
  const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  const words = cleanText.split(/\s+/).filter((w) => w.length > 2);

  // Remove common stop words
  const stopWords = new Set([
    "the", "and", "for", "with", "from", "that", "this", "have", "are", "was",
    "product", "url", "retail", "price", "about", "seats", "back",
  ]);
  const keywords = words.filter((w) => !stopWords.has(w)).slice(0, 5);

  // Guess category from keywords
  const categoryMap: Record<string, string[]> = {
    furniture: ["table", "chair", "sofa", "desk", "cabinet", "shelf", "bed", "drawer", "bookcase"],
    lighting: ["light", "lamp", "pendant", "chandelier", "led", "sconce", "lantern"],
    toys: ["toy", "doll", "plush", "figure", "game", "puzzle"],
    clothing: ["shirt", "dress", "jacket", "coat", "pants", "sweater", "blouse"],
    shoes: ["shoe", "sneaker", "boot", "sandal", "slipper"],
    bags: ["bag", "backpack", "purse", "wallet", "tote", "luggage"],
    accessories: ["jewelry", "necklace", "earring", "bracelet", "ring", "watch"],
    electronics: ["phone", "cable", "charger", "speaker", "headphone", "camera"],
    "home-goods": ["kitchen", "bathroom", "towel", "curtain", "rug", "pillow"],
    tools: ["tool", "drill", "wrench", "hammer", "screwdriver"],
  };

  let category = "general";
  for (const [cat, catWords] of Object.entries(categoryMap)) {
    if (keywords.some((k) => catWords.includes(k))) {
      category = cat;
      break;
    }
  }

  // Estimate price range from source price
  let estimatedPriceRange: { min: number; max: number } | null = null;
  if (input.sourcePrice) {
    estimatedPriceRange = {
      min: Math.round(input.sourcePrice * 0.15 * 100) / 100,
      max: Math.round(input.sourcePrice * 0.45 * 100) / 100,
    };
  }

  return {
    keywords,
    keywordsChinese: [],
    category,
    estimatedPriceRange,
    productFeatures: [],
    suggestedProductIds: [],
  };
}

/**
 * Rank fetched products against the search parameters
 */
export function rankResults(
  params: SearchParams,
  products: Product1688[],
  sourcePrice: number | null,
): RankedResult[] {
  const keywordsLower = params.keywords.map((k) => k.toLowerCase());

  return products
    .map((product) => {
      const nameLower = product.name.toLowerCase();

      // Calculate relevance score (0-100)
      let score = 0;
      let matchReasons: string[] = [];

      // Keyword matching (up to 40 points)
      const keywordHits = keywordsLower.filter((k) => nameLower.includes(k));
      score += Math.min(40, keywordHits.length * 15);
      if (keywordHits.length > 0) {
        matchReasons.push(`Matches: ${keywordHits.join(", ")}`);
      }

      // Category matching (10 points)
      if (params.category !== "general" && product.category?.toLowerCase() === params.category) {
        score += 10;
      }

      // Sales volume signal (up to 20 points)
      if (product.salesVolume > 10000) {
        score += 20;
        matchReasons.push("High sales volume (10K+)");
      } else if (product.salesVolume > 1000) {
        score += 10;
        matchReasons.push("Good sales volume (1K+)");
      } else if (product.salesVolume > 100) {
        score += 5;
      }

      // Supplier rating (up to 15 points)
      if (product.supplierRating && product.supplierRating >= 4.5) {
        score += 15;
        matchReasons.push(`Rated ${product.supplierRating}/5`);
      } else if (product.supplierRating && product.supplierRating >= 4.0) {
        score += 10;
      }

      // Price in range (up to 15 points)
      if (params.estimatedPriceRange) {
        if (product.priceUSD >= params.estimatedPriceRange.min && product.priceUSD <= params.estimatedPriceRange.max) {
          score += 15;
          matchReasons.push("Price in expected range");
        }
      }

      // Calculate pricing
      const chinaDirectPrice = product.priceUSD;
      const estimatedShipping = calculateEstimatedShipping(product);
      const margin = 0.20; // 20% Doge margin
      const dogePrice = Math.round((chinaDirectPrice + estimatedShipping) * (1 + margin) * 100) / 100;
      const savingsPercent = sourcePrice && sourcePrice > 0
        ? Math.round((1 - dogePrice / sourcePrice) * 100)
        : null;

      if (savingsPercent && savingsPercent > 0) {
        matchReasons.push(`${savingsPercent}% cheaper than US retail`);
      }

      return {
        product,
        relevanceScore: Math.min(100, score),
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

/**
 * Estimate shipping cost per unit based on product price/category
 */
function calculateEstimatedShipping(product: Product1688): number {
  // Rough estimate: shipping ~$2-15 per item depending on size
  // Small items (<$5): ~$2 shipping
  // Medium items ($5-50): ~$5 shipping
  // Large items ($50+): ~$15 shipping
  if (product.priceUSD < 5) return 2.0;
  if (product.priceUSD < 50) return 5.0;
  return 15.0;
}

/**
 * Get product IDs for a category to seed initial results
 */
export function getProductIdsForCategory(category: string): string[] {
  return CATEGORY_PRODUCT_IDS[category] || CATEGORY_PRODUCT_IDS.general;
}
