import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/pay/[token] — get payment link details (public)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const paymentLink = await prisma.paymentLink.findUnique({
      where: { token },
      include: {
        quote: { include: { items: true } },
      },
    });

    if (!paymentLink) {
      return NextResponse.json({ error: "Payment link not found" }, { status: 404 });
    }

    if (paymentLink.status === "used") {
      return NextResponse.json({ error: "This payment link has already been used" }, { status: 410 });
    }

    if (paymentLink.status === "expired" || (paymentLink.expiresAt && paymentLink.expiresAt < new Date())) {
      return NextResponse.json({ error: "This payment link has expired" }, { status: 410 });
    }

    return NextResponse.json({
      token: paymentLink.token,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      description: paymentLink.description,
      quote: paymentLink.quote ? {
        quoteNumber: paymentLink.quote.quoteNumber,
        customerName: paymentLink.quote.customerName,
        totalAmount: paymentLink.quote.totalAmount,
        depositPercent: paymentLink.quote.depositPercent,
        items: paymentLink.quote.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
      } : null,
    });
  } catch (error) {
    console.error("GET payment link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/pay/[token] — process payment via this link
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await request.json();

    const paymentLink = await prisma.paymentLink.findUnique({
      where: { token },
      include: { quote: true },
    });

    if (!paymentLink || paymentLink.status !== "active") {
      return NextResponse.json({ error: "Invalid or expired payment link" }, { status: 410 });
    }

    // In demo mode (no Airwallex API key), simulate success
    const isDemoMode = !process.env.AIRWALLEX_API_KEY;

    if (isDemoMode) {
      // Mark link as used
      await paymentLink;

      const origin = request.headers.get("origin") || "http://localhost:3000";

      // Update link status
      await prisma.paymentLink.update({
        where: { token },
        data: { status: "used" },
      });

      return NextResponse.json({
        success: true,
        demo: true,
        redirectUrl: `${origin}/pay/${token}/success?demo=1`,
      });
    }

    // Production: create Airwallex payment intent
    const { createPaymentIntent } = await import("@/lib/airwallex");
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const intent = await createPaymentIntent({
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      orderId: paymentLink.quote?.quoteNumber || paymentLink.id,
      customerEmail: body.email || paymentLink.quote?.customerEmail || "",
      customerName: body.name || paymentLink.quote?.customerName || "",
      description: paymentLink.description || "Payment",
      returnUrl: `${origin}/pay/${token}/success`,
    });

    // Store external reference
    if (paymentLink.paymentId) {
      await prisma.payment.update({
        where: { id: paymentLink.paymentId },
        data: { externalId: intent.id },
      });
    }

    // Build Airwallex checkout URL
    const env = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production" ? "" : "demo.";
    const checkoutUrl = `https://${env}airwallex.com/checkout/${intent.id}`;

    return NextResponse.json({
      success: true,
      redirectUrl: checkoutUrl,
    });
  } catch (error) {
    console.error("POST payment link error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
