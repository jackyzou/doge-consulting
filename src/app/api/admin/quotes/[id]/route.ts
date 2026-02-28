import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateSequenceNumber } from "@/lib/sequence";
import { sendQuoteSentEmail, sendOrderConfirmedEmail } from "@/lib/email-notifications";

// GET /api/admin/quotes/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true, order: true, paymentLink: true, customer: true },
    });
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(quote);
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/quotes/[id] — update quote, send, convert to order
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const quote = await prisma.quote.findUnique({ where: { id }, include: { items: true } });
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Action: send quote to customer
    if (body.action === "send") {
      // Generate payment link
      const origin = request.headers.get("origin") || "http://localhost:3000";
      const paymentLink = await prisma.paymentLink.create({
        data: {
          quoteId: quote.id,
          amount: quote.totalAmount * (quote.depositPercent / 100),
          currency: quote.currency,
          description: `Deposit for ${quote.quoteNumber}`,
          expiresAt: quote.validUntil,
        },
      });

      const paymentUrl = `${origin}/pay/${paymentLink.token}`;

      await prisma.quote.update({
        where: { id },
        data: { status: "sent", sentAt: new Date() },
      });

      // Send email
      await sendQuoteSentEmail({
        quoteNumber: quote.quoteNumber,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        totalAmount: quote.totalAmount,
        currency: quote.currency,
        items: quote.items.map((i) => ({ name: i.name, quantity: i.quantity, totalPrice: i.totalPrice })),
        paymentLinkUrl: paymentUrl,
      });

      return NextResponse.json({ ok: true, paymentUrl, paymentLinkToken: paymentLink.token });
    }

    // Action: convert quote to order
    if (body.action === "convert") {
      const orderNumber = await generateSequenceNumber("ORD");
      const depositAmount = quote.totalAmount * (quote.depositPercent / 100);

      const order = await prisma.order.create({
        data: {
          orderNumber,
          quoteId: quote.id,
          customerId: quote.customerId,
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
          balanceDue: quote.totalAmount - depositAmount,
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
            create: { status: "confirmed", note: `Converted from ${quote.quoteNumber}`, changedBy: "admin" },
          },
        },
      });

      await prisma.quote.update({
        where: { id },
        data: { status: "converted" },
      });

      // Send order confirmation email
      await sendOrderConfirmedEmail({
        orderNumber,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        totalAmount: quote.totalAmount,
        depositAmount,
        currency: quote.currency,
      });

      return NextResponse.json({ ok: true, order });
    }

    // Regular update
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "customerName", "customerEmail", "customerPhone", "customerCompany",
      "shippingCost", "insuranceCost", "customsDuty", "discount", "taxAmount",
      "shippingMethod", "originCity", "destinationCity", "estimatedTransit",
      "notes", "depositPercent", "status",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // If items are provided, recalculate
    if (body.items) {
      // Delete old items, create new ones
      await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      const items = body.items;
      const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => sum + (item.quantity || 1) * item.unitPrice, 0);
      updateData.subtotal = subtotal;
      const sc = body.shippingCost ?? quote.shippingCost;
      const ic = body.insuranceCost ?? quote.insuranceCost;
      const cd = body.customsDuty ?? quote.customsDuty;
      const ta = body.taxAmount ?? quote.taxAmount;
      const di = body.discount ?? quote.discount;
      updateData.totalAmount = subtotal + sc + ic + cd + ta - di;

      await prisma.quoteItem.createMany({
        data: items.map((item: { name: string; description?: string; quantity?: number; unitPrice: number; unit?: string; productId?: string }) => ({
          quoteId: id,
          name: item.name,
          description: item.description,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          totalPrice: (item.quantity || 1) * item.unitPrice,
          unit: item.unit || "piece",
          productId: item.productId,
        })),
      });
    }

    if (body.validUntil) updateData.validUntil = new Date(body.validUntil);

    const updated = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("PATCH quote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/quotes/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.quote.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
