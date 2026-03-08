import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("doge_session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

// GET — list all product match queries
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;

  const [queries, total] = await Promise.all([
    prisma.productMatchQuery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        sourceUrl: true,
        description: true,
        sourcePrice: true,
        estimatedPrice: true,
        quotedPrice: true,
        category: true,
        status: true,
        adminNotes: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        userId: true,
        createdAt: true,
        // Exclude imageData from list view (too large)
      },
    }),
    prisma.productMatchQuery.count({ where }),
  ]);

  return NextResponse.json({ queries, total, page, pages: Math.ceil(total / limit) });
}

// PATCH — update a match query (admin sets quoted price, notes, status)
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, quotedPrice, adminNotes, status } = body;

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (quotedPrice !== undefined) data.quotedPrice = quotedPrice ? parseFloat(quotedPrice) : null;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;
  if (status) data.status = status;

  const updated = await prisma.productMatchQuery.update({
    where: { id },
    data,
  });

  return NextResponse.json({ query: updated });
}
