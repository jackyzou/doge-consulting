import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/dashboard — aggregated stats
export async function GET() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      activeOrders,
      totalQuotes,
      pendingQuotes,
      totalCustomers,
      totalProducts,
      payments,
      recentOrders,
      recentQuotes,
      statusCounts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { notIn: ["delivered", "closed", "cancelled"] } } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: { in: ["draft", "sent"] } } }),
      prisma.user.count({ where: { role: "user" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.payment.findMany({ where: { status: "completed" }, select: { amount: true, currency: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { items: true, payments: true },
      }),
      prisma.quote.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = payments.length;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyPayments = await prisma.payment.findMany({
      where: { status: "completed", paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const p of monthlyPayments) {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[key] = (monthlyRevenue[key] || 0) + p.amount;
      }
    }

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalPaid,
        totalOrders,
        activeOrders,
        totalQuotes,
        pendingQuotes,
        totalCustomers,
        totalProducts,
      },
      statusCounts: statusCounts.map((s) => ({ status: s.status, count: s._count })),
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
