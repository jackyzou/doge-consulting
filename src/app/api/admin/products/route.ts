import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/products
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const catalogOnly = searchParams.get("catalog") === "true";

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.category = category;
    if (catalogOnly) where.isCatalog = true;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({ where, orderBy: { name: "asc" } });
    return NextResponse.json({ products });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 });
  }
}

// POST /api/admin/products
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        sku: body.sku,
        unitPrice: body.unitPrice,
        unit: body.unit || "piece",
        lengthCm: body.lengthCm,
        widthCm: body.widthCm,
        heightCm: body.heightCm,
        weightKg: body.weightKg,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        isActive: body.isActive ?? true,
        isCatalog: body.isCatalog ?? false,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
