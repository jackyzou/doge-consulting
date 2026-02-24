import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/airwallex";

// Airwallex webhook event types we care about
type WebhookEvent = {
  id: string;
  name: string;
  account_id: string;
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      order: {
        shipping: {
          tracking_number?: string;
        };
      };
      metadata?: Record<string, string>;
    };
  };
  created_at: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-signature") || "";
    const timestamp = request.headers.get("x-timestamp") || "";

    // Verify webhook signature
    const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;
    if (secret) {
      const isValid = verifyWebhookSignature(body, signature, secret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event: WebhookEvent = JSON.parse(body);
    console.log(`[Airwallex Webhook] ${event.name} - ${event.data.object.id}`);

    switch (event.name) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        console.log(`✅ Payment succeeded for order ${orderId}: ${paymentIntent.amount} ${paymentIntent.currency}`);

        // TODO: Update order status in database
        // TODO: Send confirmation email
        // TODO: Create shipment tracking entry
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        console.log(`❌ Payment failed for order ${orderId}`);

        // TODO: Notify customer of failure
        // TODO: Update order status
        break;
      }

      case "payment_intent.requires_payment_method": {
        const paymentIntent = event.data.object;
        console.log(`⚠️ Payment requires action: ${paymentIntent.id}`);
        break;
      }

      case "refund.succeeded": {
        const refund = event.data.object;
        console.log(`💰 Refund processed: ${refund.amount} ${refund.currency}`);
        // TODO: Update order with refund info
        break;
      }

      default:
        console.log(`Unhandled event: ${event.name}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
