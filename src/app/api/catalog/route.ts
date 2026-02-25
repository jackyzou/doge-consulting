import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/catalog — public product catalog
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isCatalog: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        unitPrice: true,
        unit: true,
        imageUrl: true,
        lengthCm: true,
        widthCm: true,
        heightCm: true,
        weightKg: true,
      },
      orderBy: { category: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Catalog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
