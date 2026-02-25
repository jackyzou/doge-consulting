import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateSequenceNumber } from "@/lib/sequence";
import { sendPaymentReceivedEmail, sendOrderConfirmedEmail } from "@/lib/email-notifications";

// POST /api/admin/payments — record a payment against an order
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const order = await prisma.order.findUnique({ where: { id: body.orderId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const paymentNumber = await generateSequenceNumber("PAY");

    const payment = await prisma.payment.create({
      data: {
        paymentNumber,
        orderId: order.id,
        customerId: order.customerId,
        amount: body.amount,
        currency: body.currency || order.currency,
        method: body.method, // credit_card, debit_card, ach, wire
        status: "completed",
        type: body.type || "deposit", // deposit, balance, full
        externalId: body.externalId,
        paidAt: new Date(),
        notes: body.notes,
      },
    });

    // Update order balance
    const allPayments = await prisma.payment.findMany({
      where: { orderId: order.id, status: "completed" },
    });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        depositAmount: totalPaid,
        balanceDue: Math.max(0, order.totalAmount - totalPaid),
        status: order.status === "pending" ? "confirmed" : order.status,
      },
    });

    // Send notifications
    await sendPaymentReceivedEmail({
      paymentNumber,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      amount: body.amount,
      currency: body.currency || order.currency,
      method: body.method,
      type: body.type || "deposit",
    });

    if (order.status === "pending") {
      await sendOrderConfirmedEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        depositAmount: totalPaid,
        currency: order.currency,
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("POST payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/admin/payments — list payments
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const where: Record<string, unknown> = {};
    if (orderId) where.orderId = orderId;

    const payments = await prisma.payment.findMany({
      where,
      include: { order: { select: { orderNumber: true, customerName: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
