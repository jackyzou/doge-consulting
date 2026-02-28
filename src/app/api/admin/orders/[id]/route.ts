import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendOrderClosedEmail, sendOrderStatusEmail } from "@/lib/email-notifications";

// GET /api/admin/orders/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
        documents: true,
        quote: true,
        customer: true,
      },
    });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — update status, details
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      "status", "trackingId", "vessel", "estimatedDelivery", "notes",
      "customerName", "customerEmail", "customerPhone",
      "shippingMethod", "originCity", "destinationCity",
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (body.estimatedDelivery) updateData.estimatedDelivery = new Date(body.estimatedDelivery);

    // Status change → record in history
    if (body.status && body.status !== order.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: body.status,
          note: body.statusNote || body.note || null,
          changedBy: admin.name,
        },
      });

      if (body.status === "closed" || body.status === "delivered") {
        updateData.closedAt = new Date();
      }

      // Send email notifications (non-blocking: don't fail the request if email fails)
      try {
        if (body.status === "closed" || body.status === "delivered") {
          await sendOrderClosedEmail({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
            currency: order.currency,
          });
        }

        await sendOrderStatusEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          status: body.status,
          trackingId: body.trackingId || order.trackingId,
          vessel: body.vessel || order.vessel,
          estimatedDelivery: body.estimatedDelivery || order.estimatedDelivery?.toISOString() || null,
          note: body.statusNote || body.note || null,
        });
      } catch (emailErr) {
        console.error("Failed to send order status email (non-fatal):", emailErr);
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true, payments: true, statusHistory: { orderBy: { createdAt: "desc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("PATCH order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
