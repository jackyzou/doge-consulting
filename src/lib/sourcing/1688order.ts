/**
 * 1688order.com Integration Layer
 *
 * Calls the 1688 search microservice (scripts/1688-search-server.mjs)
 * via HTTP. The microservice handles Playwright headless browser searches
 * because Playwright doesn't work inside Next.js Turbopack runtime.
 *
 * The microservice runs on port 4688 (configurable via SEARCH_SERVICE_URL).
 */

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || "http://localhost:4688";

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

/**
 * Search 1688order.com by keyword via the search microservice
 */
export async function searchProducts(keyword: string): Promise<Product1688[]> {
  if (!keyword.trim()) return [];

  try {
    const res = await fetch(`${SEARCH_SERVICE_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: keyword.trim() }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      console.error(`[1688] Search service error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.products || []) as Product1688[];
  } catch (err) {
    console.error(`[1688] Search failed for "${keyword}":`, err);
    return [];
  }
}

/**
 * Search 1688order.com by image via the search microservice
 * Uses 1688order.com's native AI Image Search feature
 */
export async function searchByImage(imageBase64: string): Promise<Product1688[]> {
  try {
    const res = await fetch(`${SEARCH_SERVICE_URL}/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64 }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      console.error(`[1688] Image search service error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data.products || []) as Product1688[];
  } catch (err) {
    console.error("[1688] Image search failed:", err);
    return [];
  }
}

/**
 * Get product details by ID (currently unused — reserved for future direct lookup)
 */
export async function getProductDetails(productId: string): Promise<Product1688 | null> {
  if (!/^\d+$/.test(productId)) return null;
  // For now, return null — we primarily use search
  return null;
}

/**
 * Extract product ID from a 1688order.com or 1688.com URL
 */
export function extractProductId(url: string): string | null {
  const orderMatch = url.match(/1688order\.com\/pc\/goods_details\/(\d+)/);
  if (orderMatch) return orderMatch[1];

  const detailMatch = url.match(/1688\.com\/offer\/(\d+)/);
  if (detailMatch) return detailMatch[1];

  return null;
}

/**
 * Construct search URL for 1688order.com
 */
export function buildSearchUrl(keyword: string): string {
  return `https://1688order.com/pc/goods_list?name=${encodeURIComponent(keyword)}&searchType=text&is_input=1`;
}

/**
 * Clean caches (for testing)
 */
export function clearCache(): void {
  // No caching in the client — microservice handles its own state
}

/**
 * Expose a no-op for product-analyzer.ts compatibility
 */
export async function getBrowserInstance(): Promise<never> {
  throw new Error("Browser not available in Next.js — use the search microservice");
}
