import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/coupon/validate — validate a coupon code and calculate discount
export async function POST(request: NextRequest) {
  try {
    const { code, orderAmount, email } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" }, { status: 404 });
    }

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" });
    }

    // Check expiry
    if (coupon.validUntil && new Date() > coupon.validUntil) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" });
    }

    // Check valid from
    if (new Date() < coupon.validFrom) {
      return NextResponse.json({ valid: false, error: "This coupon is not yet valid" });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
    }

    // Check if already used by this email
    if (email) {
      const existing = await prisma.couponUsage.findUnique({
        where: { couponId_email: { couponId: coupon.id, email } },
      });
      if (existing) {
        return NextResponse.json({ valid: false, error: "You have already used this coupon" });
      }
    }

    // Check minimum order amount
    const amount = parseFloat(orderAmount) || 0;
    if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is $${coupon.minOrderAmount.toFixed(2)}`,
      });
    }

    // Calculate discount
    let discountAmount: number;
    if (coupon.discountType === "percentage") {
      discountAmount = amount * (coupon.discountValue / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Don't let discount exceed order amount
    discountAmount = Math.min(discountAmount, amount);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      newTotal: Math.round((amount - discountAmount) * 100) / 100,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
