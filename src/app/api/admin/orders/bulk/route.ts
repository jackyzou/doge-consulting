import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PATCH /api/admin/orders/bulk — bulk status change
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { ids, status, note } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids array is required" }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const validStatuses = ["pending", "confirmed", "sourcing", "packing", "in_transit", "customs", "delivered", "closed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
    }

    // Update all orders
    const result = await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    // Create status history entries for each
    await prisma.orderStatusHistory.createMany({
      data: ids.map((id: string) => ({
        orderId: id,
        status,
        note: note || `Bulk status change to ${status}`,
        changedBy: admin.name,
      })),
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("Bulk orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
