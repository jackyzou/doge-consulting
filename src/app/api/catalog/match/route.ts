import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/catalog/match — submit a product match query (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceUrl, imageData, description, sourcePrice, category, customerName, customerEmail, customerPhone } = body;

    if (!sourceUrl && !imageData && !description) {
      return NextResponse.json({ error: "Please provide a URL, image, or description" }, { status: 400 });
    }

    // Enforce image size limit (~2MB base64 ≈ 2.7M chars)
    if (imageData && imageData.length > 3_000_000) {
      return NextResponse.json({ error: "Image too large. Please use an image under 2MB." }, { status: 400 });
    }

    // Calculate instant estimate: 20% off the source price, or a reasonable estimate
    let estimatedPrice: number | null = null;
    if (sourcePrice && sourcePrice > 0) {
      estimatedPrice = Math.round(sourcePrice * 0.8 * 100) / 100; // 20% off
    }

    // Get user ID if logged in (optional)
    let userId: string | null = null;
    try {
      const cookieHeader = request.headers.get("cookie") || "";
      const sessionMatch = cookieHeader.match(/doge_session=([^;]+)/);
      if (sessionMatch) {
        const jwt = await import("jsonwebtoken");
        const secret = process.env.JWT_SECRET || "dev-secret-change-me";
        const payload = jwt.default.verify(sessionMatch[1], secret) as { id: string };
        userId = payload.id;
      }
    } catch { /* not logged in, that's fine */ }

    const query = await prisma.productMatchQuery.create({
      data: {
        sourceUrl: sourceUrl || null,
        imageData: imageData || null,
        description: description || null,
        sourcePrice: sourcePrice ? parseFloat(sourcePrice) : null,
        estimatedPrice,
        category: category || null,
        status: "pending",
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        customerPhone: customerPhone || null,
        userId,
      },
    });

    return NextResponse.json({
      id: query.id,
      estimatedPrice,
      sourcePrice: query.sourcePrice,
      message: estimatedPrice
        ? `We can source this for approximately $${estimatedPrice.toLocaleString()} — that's ${sourcePrice ? Math.round((1 - estimatedPrice / sourcePrice) * 100) : 20}% less than the US retail price.`
        : "We've received your request! Our sourcing team will analyze this product and get back to you within 24 hours with a China-direct price.",
      status: "pending",
    });
  } catch (error) {
    console.error("Product match error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
