import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/customers/[id] — single customer with quotes and orders
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if this is a registered user or a "lead" pseudo-ID
    const isLead = id.startsWith("lead-");

    if (isLead) {
      // Lead customer — extract email from ID
      const email = id.replace("lead-", "");

      const quotes = await prisma.quote.findMany({
        where: { customerEmail: email, customerId: null },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      if (quotes.length === 0) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }

      const first = quotes[0];
      return NextResponse.json({
        customer: {
          id,
          name: first.customerName,
          email: first.customerEmail,
          phone: first.customerPhone,
          company: first.customerCompany,
          role: "lead",
          createdAt: first.createdAt.toISOString(),
        },
        quotes: quotes.map((q) => ({
          id: q.id,
          quoteNumber: q.quoteNumber,
          status: q.status,
          totalAmount: q.totalAmount,
          createdAt: q.createdAt.toISOString(),
          itemCount: q.items.length,
        })),
        orders: [],
        payments: [],
      });
    }

    // Registered user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const [quotes, orders, payments] = await Promise.all([
      prisma.quote.findMany({
        where: { customerId: id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: { customerId: id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.findMany({
        where: { customerId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      customer: {
        ...user,
        createdAt: user.createdAt.toISOString(),
      },
      quotes: quotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        status: q.status,
        totalAmount: q.totalAmount,
        createdAt: q.createdAt.toISOString(),
        itemCount: q.items.length,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt.toISOString(),
        itemCount: o.items.length,
        shippingMethod: o.shippingMethod,
        destinationCity: o.destinationCity,
      })),
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
