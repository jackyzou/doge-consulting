import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateSequenceNumber } from "@/lib/sequence";
import { sendQuoteRequestedEmail } from "@/lib/email-notifications";

// Rate limiting: simple in-memory store
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests
const RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// POST /api/quote — public quote submission from the quote calculator page
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customerName || !body.customerEmail) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const quoteNumber = await generateSequenceNumber("QT");

    // Build items from the shipping calculator data
    const items = body.items.map((item: { name: string; quantity: number; cbm: number; weightKG: number }) => ({
      name: item.name,
      quantity: item.quantity || 1,
      unitPrice: 0, // Public quotes don't have pricing from catalog — admin will fill in
      totalPrice: 0,
      unit: "piece",
      lengthCm: null,
      widthCm: null,
      heightCm: null,
      weightKg: item.weightKG || null,
    }));

    // Use the shipping quote totals if provided
    const shippingCost = body.shippingEstimateUSD || 0;
    const totalAmount = shippingCost; // Subtotal is 0 since product prices aren't set by public form

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        status: "draft",
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone || null,
        customerId: body.userId || null,
        subtotal: 0,
        shippingCost,
        totalAmount,
        currency: "USD",
        shippingMethod: body.deliveryType === "door-to-door" ? "Door-to-Door" : "Warehouse Pickup",
        destinationCity: body.destination || "Seattle, WA",
        estimatedTransit: body.transitDays || null,
        notes: body.notes || `Public quote request. Total CBM: ${body.totalCBM || "N/A"}, Total Weight: ${body.totalWeight || "N/A"} kg. Estimated shipping: $${shippingCost.toFixed(2)} USD.`,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    // Send confirmation email to customer
    await sendQuoteRequestedEmail({
      quoteNumber: quote.quoteNumber,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      shippingEstimateUSD: shippingCost,
      items: body.items.map((i: { name: string; quantity: number }) => ({ name: i.name, quantity: i.quantity || 1 })),
      deliveryType: quote.shippingMethod || "Door-to-Door",
      destination: quote.destinationCity || "Seattle, WA",
    }).catch((err: unknown) => console.error("Failed to send quote request email:", err));

    return NextResponse.json({
      ok: true,
      quoteNumber: quote.quoteNumber,
      quoteId: quote.id,
    }, { status: 201 });
  } catch (error) {
    console.error("Public quote submission error:", error);
    return NextResponse.json({ error: "Failed to submit quote. Please try again." }, { status: 500 });
  }
}
