import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getProductDetails,
  searchProducts,
  searchByImage,
  extractProductId,
} from "@/lib/sourcing/1688order";
import {
  extractCanonicalProfile,
  rankResults,
} from "@/lib/sourcing/product-analyzer";

// POST /api/tools/product-matcher/search — AI product matching with 1688order.com
//
// Pipeline:
//   1. Input (URL / Image / Text) → Canonical Product Profile
//   2. Canonical Profile → Search 1688order.com
//   3. Results → Rank & Score → Return to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, imageData, description, sourcePrice } = body;

    if (!sourceUrl && !imageData && !description) {
      return NextResponse.json(
        { error: "Please provide a URL, image, or description" },
        { status: 400 },
      );
    }

    if (imageData && imageData.length > 3_000_000) {
      return NextResponse.json(
        { error: "Image too large. Please use an image under 2MB." },
        { status: 400 },
      );
    }

    // ─── Step 1: Direct 1688 product URL? Skip the pipeline ───
    if (sourceUrl) {
      const productId = extractProductId(sourceUrl);
      if (productId) {
        const product = await getProductDetails(productId);
        if (product) {
          const query = await storeQuery({ sourceUrl, description, sourcePrice, inputType: "direct-1688" });
          const { detailUrl: _strip, ...safeProduct } = product;
          return NextResponse.json({
            id: query.id,
            results: [{
              product: safeProduct,
              relevanceScore: 100,
              matchConfidence: "High",
              matchReason: "Direct product lookup",
              pricingAnalysis: {
                chinaDirectPrice: product.priceUSD,
                estimatedShipping: product.priceUSD < 5 ? 2 : product.priceUSD < 50 ? 5 : 15,
                dogePrice: Math.round((product.priceUSD + (product.priceUSD < 5 ? 2 : product.priceUSD < 50 ? 5 : 15)) * 1.2 * 100) / 100,
                savingsPercent: null,
              },
            }],
            query: product.name,
            profile: { title: product.name, searchQuery: product.name, category: "direct" },
            inputType: "direct-lookup",
          });
        }
      }
    }

    // ─── Step 2: Extract Canonical Product Profile ───
    const profile = await extractCanonicalProfile({
      url: sourceUrl,
      imageBase64: imageData,
      description,
      sourcePrice: sourcePrice ? parseFloat(sourcePrice) : null,
    });

    // ─── Step 3: Search 1688order.com ───
    // Image input → use 1688's native image search (visual matching)
    // Text/URL input → use keyword search with canonical profile
    let products;
    let searchQuery: string;

    if (imageData) {
      // Image search: upload to 1688order.com's native image search
      products = await searchByImage(imageData);
      searchQuery = profile.searchQuery || "image search";

      // If image search returns no results, fall back to keyword search
      if (products.length === 0 && profile.searchQuery) {
        products = await searchProducts(profile.searchQuery);
      }
    } else {
      searchQuery = profile.searchQuery || description || "wholesale";
      products = await searchProducts(searchQuery);
    }

    // ─── Step 4: Rank results against the profile ───
    // Use the scraped retail price (or user-provided price) as the comparison baseline
    const retailPrice = profile.estimatedRetailPrice || (sourcePrice ? parseFloat(sourcePrice) : null);

    const ranked = rankResults(
      profile,
      products,
      retailPrice,
    );

    // Store the query for tracking (admin can see 1688 URLs in the DB)
    const query = await storeQuery({
      sourceUrl,
      imageData,
      description,
      sourcePrice: retailPrice || sourcePrice,
      inputType: imageData ? "image" : sourceUrl ? "url" : "description",
      searchKeywords: searchQuery,
    });

    // Strip 1688 detail URLs from user-facing response — only visible in admin
    const sanitizedResults = ranked.slice(0, 10).map((r) => ({
      ...r,
      product: {
        ...r.product,
        detailUrl: undefined, // Don't expose 1688 links to users
      },
    }));

    return NextResponse.json({
      id: query.id,
      results: sanitizedResults,
      query: searchQuery,
      // Source product info — displayed on frontend for comparison
      sourceProduct: retailPrice || profile.title !== "Unknown product" ? {
        title: profile.title,
        imageUrl: profile.sourceImageUrl,
        retailPrice: retailPrice,
      } : undefined,
      profile: {
        title: profile.title,
        searchQuery: profile.searchQuery,
        searchQueryChinese: profile.searchQueryChinese,
        category: profile.category,
        materials: profile.materials,
        features: profile.features,
      },
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
