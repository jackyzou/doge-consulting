import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/lib/airwallex";
import { z } from "zod/v4";

// ── Validation schema ──────────────────────────────────────────────
const createPaymentSchema = z.object({
  amount: z.number().min(1, "Amount must be positive"),
  currency: z.string().default("USD"),
  orderId: z.string().min(1, "Order ID is required"),
  customerEmail: z.email("Valid email required"),
  customerName: z.string().min(1, "Name is required"),
  description: z.string().default("Doge Consulting – Shipping Deposit"),
  items: z.array(z.string()).optional(),
});

// ── POST handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createPaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { amount, currency, orderId, customerEmail, customerName, description } = result.data;

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const returnUrl = `${origin}/payment/success?orderId=${encodeURIComponent(orderId)}`;

    // Create Payment Intent via Airwallex (or demo mode)
    const paymentIntent = await createPaymentIntent({
      amount,
      currency,
      orderId,
      customerEmail,
      customerName,
      description,
      returnUrl,
    });

    // Build checkout URL
    // In production: use Airwallex's hosted checkout page
    // In demo: return a simulated URL that redirects to our success page
    const isDemo = !process.env.AIRWALLEX_API_KEY;
    const airwallexEnv = process.env.NEXT_PUBLIC_AIRWALLEX_ENV === "production" ? "checkout" : "checkout-demo";

    let checkoutUrl: string;

    if (isDemo) {
      // Demo mode — skip Airwallex, redirect straight to success
      checkoutUrl = `${origin}/payment/success?orderId=${encodeURIComponent(orderId)}&amount=${amount}&currency=${currency}&demo=1`;
    } else {
      // Real Airwallex Hosted Payment Page
      checkoutUrl = `https://${airwallexEnv}.airwallex.com/#/standalone/checkout`
        + `?intent_id=${paymentIntent.id}`
        + `&client_secret=${encodeURIComponent((paymentIntent as unknown as Record<string, string>).client_secret || "")}`
        + `&currency=${currency}`
        + `&mode=payment`;
    }

    console.log(`💳 Payment intent created: ${paymentIntent.id} for ${currency} ${amount} (order ${orderId})`);

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      checkoutUrl,
      isDemo,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
