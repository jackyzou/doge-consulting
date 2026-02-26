import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/customer/quotes — customer's own quotes
export async function GET() {
  try {
    const session = await requireAuth();

    const quotes = await prisma.quote.findMany({
      where: {
        OR: [
          { customerId: session.id },
          { customerEmail: session.email },
        ],
      },
      include: {
        items: true,
        paymentLink: { select: { token: true, status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
