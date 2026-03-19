import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/airwallex";
import { prisma } from "@/lib/db";
import { sendPaymentReceivedEmail, sendOrderConfirmedEmail } from "@/lib/email-notifications";
import { generateSequenceNumber } from "@/lib/sequence";

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
      merchant_order_id?: string;
      order?: {
        shipping?: {
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
    const secret = process.env.AIRWALLEX_WEBHOOK_SECRET || "";
    if (secret) {
      const isValid = verifyWebhookSignature(body, signature, timestamp, secret);
      if (!isValid) {
        console.error("❌ Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event: WebhookEvent = JSON.parse(body);
    console.log(`[Airwallex Webhook] ${event.name} — ${event.data.object.id}`);

    switch (event.name) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        console.log(`✅ Payment succeeded: ${pi.id} — ${pi.amount} ${pi.currency}`);

        // Try 1: Find existing Payment by externalId (for orders that already have a payment record)
        const existingPayment = await prisma.payment.findFirst({
          where: { externalId: pi.id },
          include: {
            order: true,
            paymentLink: { include: { quote: { include: { items: true } } } },
          },
        });

        if (existingPayment) {
          // Update payment status
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { status: "completed", paidAt: new Date(), method: "credit_card" },
          });

          if (existingPayment.paymentLink) {
            await prisma.paymentLink.update({
              where: { id: existingPayment.paymentLink.id },
              data: { status: "used" },
            });
          }

          if (existingPayment.order) {
            const newDeposit = Math.round((existingPayment.order.depositAmount + existingPayment.amount) * 100) / 100;
            const newBalance = Math.round(Math.max(0, existingPayment.order.totalAmount - newDeposit) * 100) / 100;
            const newStatus = existingPayment.order.status === "pending" ? "confirmed" : existingPayment.order.status;

            await prisma.order.update({
              where: { id: existingPayment.order.id },
              data: { depositAmount: newDeposit, balanceDue: newBalance, status: newStatus },
            });

            await prisma.orderStatusHistory.create({
              data: {
                orderId: existingPayment.order.id,
                status: newStatus,
                note: `Payment ${existingPayment.paymentNumber} received: ${pi.currency} ${pi.amount} via Airwallex`,
                changedBy: "system",
              },
            });

            await sendPaymentReceivedEmail({
              paymentNumber: existingPayment.paymentNumber,
              orderNumber: existingPayment.order.orderNumber,
              customerName: existingPayment.order.customerName || "Customer",
              customerEmail: existingPayment.order.customerEmail || "",
              amount: existingPayment.amount,
              currency: existingPayment.currency,
              method: "credit_card",
              type: existingPayment.type,
            });
          }
          break;
        }

        // Try 2: No Payment record — look up PaymentLink from metadata (normal payment-link flow)
        const plToken = pi.metadata?.paymentLinkToken;
        if (!plToken) {
          console.warn(`⚠️ No Payment record and no paymentLinkToken in metadata for intent ${pi.id}`);
          break;
        }

        const paymentLink = await prisma.paymentLink.findUnique({
          where: { token: plToken },
          include: { quote: { include: { items: true } } },
        });

        if (!paymentLink?.quote || paymentLink.quote.status === "converted") {
          console.warn(`⚠️ PaymentLink ${plToken} has no quote or already converted`);
          // Still mark the link as used
          if (paymentLink) await prisma.paymentLink.update({ where: { id: paymentLink.id }, data: { status: "used" } });
          break;
        }

        const quote = paymentLink.quote;
        const depositAmount = Math.round(pi.amount * 100) / 100;
        const orderNumber = await generateSequenceNumber("ORD");
        const paymentNumber = await generateSequenceNumber("PAY");

        const customer = await prisma.user.findUnique({ where: { email: quote.customerEmail } });
        const customerId = customer?.id || quote.customerId || null;

        // Create Order from Quote
        const order = await prisma.order.create({
          data: {
            orderNumber,
            quoteId: quote.id,
            customerId,
            customerName: quote.customerName,
            customerEmail: quote.customerEmail,
            customerPhone: quote.customerPhone,
            subtotal: quote.subtotal,
            shippingCost: quote.shippingCost,
            insuranceCost: quote.insuranceCost,
            customsDuty: quote.customsDuty,
            discount: quote.discount,
            taxAmount: quote.taxAmount,
            totalAmount: quote.totalAmount,
            depositAmount,
            balanceDue: Math.round((quote.totalAmount - depositAmount) * 100) / 100,
            currency: quote.currency,
            shippingMethod: quote.shippingMethod,
            originCity: quote.originCity,
            destinationCity: quote.destinationCity,
            status: "confirmed",
            items: {
              create: quote.items.map((i) => ({
                name: i.name,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                unit: i.unit,
                productId: i.productId,
              })),
            },
            statusHistory: {
              create: {
                status: "confirmed",
                note: `Deposit paid via Airwallex. Converted from ${quote.quoteNumber}`,
                changedBy: "system",
              },
            },
          },
        });

        // Create Payment record linked to the new Order
        await prisma.payment.create({
          data: {
            paymentNumber,
            orderId: order.id,
            customerId,
            amount: depositAmount,
            currency: paymentLink.currency,
            method: "credit_card",
            status: "completed",
            type: "deposit",
            externalId: pi.id,
            paidAt: new Date(),
          },
        });

        // Mark payment link as used
        await prisma.paymentLink.update({
          where: { id: paymentLink.id },
          data: { status: "used" },
        });

        // Mark quote as converted
        await prisma.quote.update({
          where: { id: quote.id },
          data: { status: "converted", customerId },
        });

        console.log(`✅ Quote ${quote.quoteNumber} → Order ${orderNumber} (deposit: ${depositAmount} ${quote.currency})`);

        // Send order confirmation email
        try {
          await sendOrderConfirmedEmail({
            orderNumber,
            customerName: quote.customerName,
            customerEmail: quote.customerEmail,
            totalAmount: quote.totalAmount,
            depositAmount,
            currency: quote.currency,
          });
        } catch (emailErr) {
          console.error("Failed to send order confirmation email (non-fatal):", emailErr);
        }

        // Send payment receipt email
        try {
          await sendPaymentReceivedEmail({
            paymentNumber,
            orderNumber,
            customerName: quote.customerName,
            customerEmail: quote.customerEmail,
            amount: depositAmount,
            currency: paymentLink.currency,
            method: "credit_card",
            type: "deposit",
          });
        } catch (emailErr) {
          console.error("Failed to send payment receipt email (non-fatal):", emailErr);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId || pi.merchant_order_id;
        console.log(`❌ Payment failed for order ${orderId}`);

        // Mark payment as failed and reset payment link so customer can retry
        const failedPayment = await prisma.payment.findFirst({
          where: { externalId: pi.id },
          include: { paymentLink: true },
        });

        if (failedPayment) {
          await prisma.payment.update({
            where: { id: failedPayment.id },
            data: {
              status: "failed",
              failedAt: new Date(),
            },
          });

          // Reset payment link to active so customer can try again
          if (failedPayment.paymentLink && failedPayment.paymentLink.status === "processing") {
            await prisma.paymentLink.update({
              where: { id: failedPayment.paymentLink.id },
              data: { status: "active" },
            });
          }
        }
        break;
      }

      case "payment_intent.requires_payment_method": {
        const pi = event.data.object;
        console.log(`⚠️ Payment requires action: ${pi.id}`);
        // No DB action needed — customer needs to retry
        break;
      }

      case "refund.settled":
      case "refund.succeeded": {
        const refund = event.data.object;
        console.log(`💰 Refund processed: ${refund.amount} ${refund.currency}`);

        // Find payment by intent ID and mark refunded
        const refundedPayment = await prisma.payment.findFirst({
          where: { externalId: refund.id },
        });

        if (refundedPayment) {
          await prisma.payment.update({
            where: { id: refundedPayment.id },
            data: {
              status: "refunded",
              refundedAt: new Date(),
            },
          });
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.name}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
