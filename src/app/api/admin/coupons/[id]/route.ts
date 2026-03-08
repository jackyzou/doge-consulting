import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PUT /api/admin/coupons/[id] — update a coupon
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code.toUpperCase().trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType !== undefined && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: parseFloat(data.discountValue) }),
        ...(data.minOrderAmount !== undefined && { minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : null }),
        ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses ? parseInt(data.maxUses) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil ? new Date(data.validUntil) : null }),
      },
    });

    return NextResponse.json(coupon);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] — delete a coupon
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.couponUsage.deleteMany({ where: { couponId: id } });
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
