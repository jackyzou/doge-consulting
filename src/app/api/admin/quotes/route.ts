import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateSequenceNumber } from "@/lib/sequence";

// GET /api/admin/quotes — list all quotes
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: { items: true, paymentLink: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("GET quotes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/quotes — create a new quote
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const quoteNumber = await generateSequenceNumber("QT");

    // Calculate totals
    const items = body.items || [];
    const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + item.quantity * item.unitPrice, 0);
    const shippingCost = body.shippingCost || 0;
    const insuranceCost = body.insuranceCost || 0;
    const customsDuty = body.customsDuty || 0;
    const discount = body.discount || 0;
    const taxAmount = body.taxAmount || 0;
    const totalAmount = subtotal + shippingCost + insuranceCost + customsDuty + taxAmount - discount;

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        status: body.status || "draft",
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        customerCompany: body.customerCompany,
        subtotal,
        shippingCost,
        insuranceCost,
        customsDuty,
        discount,
        taxAmount,
        totalAmount,
        currency: body.currency || "USD",
        depositPercent: body.depositPercent || 70,
        shippingMethod: body.shippingMethod,
        originCity: body.originCity || "Shenzhen",
        destinationCity: body.destinationCity || "Seattle, WA",
        estimatedTransit: body.estimatedTransit,
        notes: body.notes,
        validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: {
          create: items.map((item: { name: string; description?: string; quantity: number; unitPrice: number; unit?: string; productId?: string; lengthCm?: number; widthCm?: number; heightCm?: number; weightKg?: number }) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: (item.quantity || 1) * item.unitPrice,
            unit: item.unit || "piece",
            productId: item.productId,
            lengthCm: item.lengthCm,
            widthCm: item.widthCm,
            heightCm: item.heightCm,
            weightKg: item.weightKg,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("POST quote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
