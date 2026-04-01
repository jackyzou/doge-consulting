import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getProductDetails,
  getMultipleProducts,
  extractProductId,
  buildSearchUrl,
  type Product1688,
} from "@/lib/sourcing/1688order";
import {
  analyzeUserInput,
  rankResults,
  getProductIdsForCategory,
} from "@/lib/sourcing/product-analyzer";

// POST /api/tools/product-matcher/search — AI product matching with 1688order.com
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, imageData, description, sourcePrice, category } = body;

    if (!sourceUrl && !imageData && !description) {
      return NextResponse.json(
        { error: "Please provide a URL, image, or description" },
        { status: 400 },
      );
    }

    // Enforce image size limit (~2MB base64 ≈ 2.7M chars)
    if (imageData && imageData.length > 3_000_000) {
      return NextResponse.json(
        { error: "Image too large. Please use an image under 2MB." },
        { status: 400 },
      );
    }

    // Step 1: Check if user provided a direct 1688order.com or 1688.com product URL
    if (sourceUrl) {
      const productId = extractProductId(sourceUrl);
      if (productId) {
        // Direct product lookup
        const product = await getProductDetails(productId);
        if (product) {
          const ranked = rankResults(
            {
              keywords: product.name.split(/\s+/).slice(0, 5),
              keywordsChinese: [],
              category: category || "general",
              estimatedPriceRange: null,
              productFeatures: [],
              suggestedProductIds: [],
            },
            [product],
            sourcePrice ? parseFloat(sourcePrice) : null,
          );

          // Store the query
          const query = await storeQuery({
            sourceUrl,
            description,
            sourcePrice,
            category,
            inputType: "url",
          });

          return NextResponse.json({
            id: query.id,
            results: ranked,
            searchUrl: product.detailUrl,
            query: product.name,
            inputType: "direct-lookup",
          });
        }
      }
    }

    // Step 2: AI-analyze the user input to extract search parameters
    const searchParams = await analyzeUserInput({
      url: sourceUrl,
      imageBase64: imageData,
      description,
      sourcePrice: sourcePrice ? parseFloat(sourcePrice) : null,
    });

    // Step 3: Fetch product details from 1688order.com
    // Use category-based product IDs + any AI-suggested product IDs
    const targetCategory = searchParams.category || category || "general";
    const productIds = [
      ...searchParams.suggestedProductIds,
      ...getProductIdsForCategory(targetCategory),
    ];

    // De-duplicate
    const uniqueIds = [...new Set(productIds)].slice(0, 12);

    // Fetch products in parallel
    const products: Product1688[] = await getMultipleProducts(uniqueIds);

    // Step 4: Rank results by relevance
    const ranked = rankResults(
      searchParams,
      products,
      sourcePrice ? parseFloat(sourcePrice) : null,
    );

    // Construct search URL for user to browse more
    const searchKeyword = searchParams.keywords[0] || description || "wholesale";
    const searchUrl = buildSearchUrl(searchKeyword);

    // Store the query in the database
    const query = await storeQuery({
      sourceUrl,
      imageData,
      description,
      sourcePrice,
      category: targetCategory,
      inputType: imageData ? "image" : sourceUrl ? "url" : "description",
      searchKeywords: searchParams.keywords.join(", "),
    });

    return NextResponse.json({
      id: query.id,
      results: ranked.slice(0, 8),
      searchUrl,
      query: searchParams.keywords.join(" "),
      keywords: searchParams.keywords,
      keywordsChinese: searchParams.keywordsChinese,
      category: targetCategory,
      inputType: imageData ? "image" : sourceUrl ? "url" : "description",
    });
  } catch (error) {
    console.error("Product matcher search error:", error);
    return NextResponse.json(
      { error: "Failed to search products. Please try again." },
      { status: 500 },
    );
  }
}

/** Store search query in database for tracking */
async function storeQuery(data: {
  sourceUrl?: string;
  imageData?: string;
  description?: string;
  sourcePrice?: string | number;
  category?: string;
  inputType?: string;
  searchKeywords?: string;
}) {
  // Get user ID if logged in
  let userId: string | null = null;
  try {
    // userId extraction is optional; handled at the API boundary above
  } catch { /* not logged in */ }

  return prisma.productMatchQuery.create({
    data: {
      sourceUrl: data.sourceUrl || null,
      // Don't store full image data to save space — just note that image was provided
      imageData: data.imageData ? "[image-provided]" : null,
      description: data.description || null,
      sourcePrice: data.sourcePrice ? parseFloat(String(data.sourcePrice)) : null,
      category: data.category || null,
      status: "pending",
      adminNotes: data.searchKeywords
        ? `AI Keywords: ${data.searchKeywords} | Input type: ${data.inputType || "unknown"}`
        : null,
      userId,
    },
  });
}
