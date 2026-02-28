import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/dashboard — aggregated stats
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const [
      totalOrders,
      activeOrders,
      totalQuotes,
      pendingQuotes,
      totalCustomers,
      totalProducts,
      revenueOrders,
      recentOrders,
      recentQuotes,
      orderStatusCounts,
      quoteStatusCounts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { notIn: ["delivered", "closed", "cancelled"] } } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: { in: ["draft", "sent"] } } }),
      prisma.user.count({ where: { role: "user" } }),
      prisma.product.count({ where: { isActive: true } }),
      // Revenue = totalAmount from orders that are converted or paid (not cancelled/pending)
      prisma.order.findMany({
        where: { status: { notIn: ["cancelled"] } },
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true, payments: true },
      }),
      prisma.quote.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.quote.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Total revenue from all non-cancelled orders
    const totalRevenue = revenueOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Monthly revenue from orders (date range or last 6 months)
    const rangeStart = fromParam ? new Date(fromParam) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const rangeEnd = toParam ? new Date(toParam + "T23:59:59") : new Date();
    const monthlyRevenue: Record<string, number> = {};
    for (const o of revenueOrders) {
      if (o.createdAt && o.createdAt >= rangeStart && o.createdAt <= rangeEnd) {
        const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.totalAmount;
      }
    }

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        activeOrders,
        totalQuotes,
        pendingQuotes,
        totalCustomers,
        totalProducts,
      },
      orderStatusCounts: orderStatusCounts.map((s) => ({ status: s.status, count: s._count })),
      quoteStatusCounts: quoteStatusCounts.map((s) => ({ status: s.status, count: s._count })),
      monthlyRevenue,
      recentOrders,
      recentQuotes,
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
