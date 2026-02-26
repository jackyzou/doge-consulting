import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/customer/orders — customer's own orders with tracking info
export async function GET() {
  try {
    const session = await requireAuth();

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: session.id },
          { customerEmail: session.email },
        ],
      },
      include: {
        items: true,
        payments: {
          select: { id: true, paymentNumber: true, amount: true, method: true, status: true, paidAt: true },
        },
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
