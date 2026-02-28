import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPaymentIntent, buildCheckoutUrl, isLiveMode } from "@/lib/airwallex";

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
      status: paymentLink.status,
      quote: paymentLink.quote ? {
        quoteNumber: paymentLink.quote.quoteNumber,
        customerName: paymentLink.quote.customerName,
        customerEmail: paymentLink.quote.customerEmail,
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

// POST /api/pay/[token] — initiate payment via this link
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await request.json();

    const paymentLink = await prisma.paymentLink.findUnique({
      where: { token },
      include: { quote: true, payment: true },
    });

    if (!paymentLink || paymentLink.status !== "active") {
      return NextResponse.json({ error: "Invalid or expired payment link" }, { status: 410 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";

    // In demo mode (no Airwallex creds), simulate success
    if (!isLiveMode()) {
      // Mark link as used
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

    // ── Production: create real Airwallex Payment Intent ──
    const customerEmail = body.email || paymentLink.quote?.customerEmail || "";
    const customerName = body.name || paymentLink.quote?.customerName || "";
    const orderId = paymentLink.quote?.quoteNumber || paymentLink.id;

    const intent = await createPaymentIntent({
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      orderId,
      customerEmail,
      customerName,
      description: paymentLink.description || "Doge Consulting Payment",
      returnUrl: `${origin}/pay/${token}/success`,
      metadata: {
        paymentLinkToken: token,
        paymentLinkId: paymentLink.id,
      },
    });

    // Store external reference on Payment record
    if (paymentLink.paymentId) {
      await prisma.payment.update({
        where: { id: paymentLink.paymentId },
        data: {
          externalId: intent.id,
          status: "processing",
        },
      });
    }

    // Build Airwallex Hosted Payment Page checkout URL
    const checkoutUrl = buildCheckoutUrl(intent.id, intent.client_secret, paymentLink.currency);

    return NextResponse.json({
      success: true,
      redirectUrl: checkoutUrl,
    });
  } catch (error) {
    console.error("POST payment link error:", error);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}
