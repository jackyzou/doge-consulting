import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/customer/documents — customer's documents through their orders
export async function GET() {
  try {
    const session = await requireAuth();

    // Get all order IDs belonging to this customer
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: session.id },
          { customerEmail: session.email },
        ],
      },
      select: { id: true, orderNumber: true },
    });

    const orderIds = orders.map((o) => o.id);

    const documents = await prisma.document.findMany({
      where: { orderId: { in: orderIds } },
      include: {
        order: { select: { orderNumber: true, customerName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
