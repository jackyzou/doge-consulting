/**
 * Tests for Admin Dashboard data transformation logic.
 *
 * Validates that the API response shape is correctly converted
 * into the page's DashboardData interface — specifically the
 * monthlyRevenue object→array conversion that was the site of
 * the "monthlyRevenue.map is not a function" bug.
 *
 * These are pure unit tests (no React rendering) to avoid jsdom
 * hangs from Radix UI / shadcn component imports.
 */
import { describe, it, expect } from "vitest";

// ── Inline the exact transform logic from the dashboard page ─────
interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  quotesByStatus: Record<string, number>;
  monthlyRevenue: { month: string; revenue: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }[];
  recentQuotes: { id: string; quoteNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }[];
}

/**
 * This mirrors the transform inside AdminDashboard's useEffect.
 * If the page logic changes, this must be kept in sync.
 */
function transformDashboardResponse(raw: Record<string, unknown>): DashboardData {
  const ordersByStatus: Record<string, number> = {};
  for (const s of (raw.orderStatusCounts as { status: string; count: number }[]) || []) {
    ordersByStatus[s.status] = s.count;
  }

  const quotesByStatus: Record<string, number> = {};
  for (const s of (raw.quoteStatusCounts as { status: string; count: number }[]) || []) {
    quotesByStatus[s.status] = s.count;
  }

  const monthlyRevenue = Object.entries(
    ((raw.monthlyRevenue || {}) as Record<string, number>)
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));

  const stats = raw.stats as Record<string, number> | undefined;
  return {
    totalRevenue: stats?.totalRevenue ?? 0,
    totalOrders: stats?.totalOrders ?? 0,
    activeOrders: stats?.activeOrders ?? 0,
    totalQuotes: stats?.totalQuotes ?? 0,
    pendingQuotes: stats?.pendingQuotes ?? 0,
    totalCustomers: stats?.totalCustomers ?? 0,
    totalProducts: stats?.totalProducts ?? 0,
    ordersByStatus,
    quotesByStatus,
    monthlyRevenue,
    recentOrders: (raw.recentOrders ?? []) as DashboardData["recentOrders"],
    recentQuotes: (raw.recentQuotes ?? []) as DashboardData["recentQuotes"],
  };
}

// ── Test fixture ─────────────────────────────────────────────────
const dashboardApiResponse = {
  stats: {
    totalRevenue: 50000,
    totalPaid: 10,
    totalOrders: 25,
    activeOrders: 8,
    totalQuotes: 15,
    pendingQuotes: 5,
    totalCustomers: 40,
    totalProducts: 30,
  },
  orderStatusCounts: [
    { status: "confirmed", count: 10 },
    { status: "delivered", count: 5 },
  ],
  quoteStatusCounts: [
    { status: "sent", count: 3 },
    { status: "accepted", count: 7 },
  ],
  monthlyRevenue: {
    "2025-01": 5000,
    "2025-02": 8000,
    "2025-03": 12000,
  },
  recentOrders: [
    {
      id: "o1",
      orderNumber: "ORD-2026-0001",
      customerName: "John Doe",
      status: "confirmed",
      totalAmount: 3000,
      createdAt: "2025-06-01T00:00:00Z",
    },
  ],
  recentQuotes: [
    {
      id: "q1",
      quoteNumber: "QT-2026-0001",
      customerName: "Jane Smith",
      status: "sent",
      totalAmount: 2000,
      createdAt: "2025-06-01T00:00:00Z",
    },
  ],
};

describe("AdminDashboard data transform", () => {
  it("transforms stats correctly", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(data.totalRevenue).toBe(50000);
    expect(data.activeOrders).toBe(8);
    expect(data.pendingQuotes).toBe(5);
    expect(data.totalCustomers).toBe(40);
    expect(data.totalProducts).toBe(30);
  });

  it("converts monthlyRevenue object to sorted array (regression for .map bug)", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(Array.isArray(data.monthlyRevenue)).toBe(true);
    expect(data.monthlyRevenue).toEqual([
      { month: "2025-01", revenue: 5000 },
      { month: "2025-02", revenue: 8000 },
      { month: "2025-03", revenue: 12000 },
    ]);
  });

  it("handles monthlyRevenue with unsorted keys", () => {
    const data = transformDashboardResponse({
      ...dashboardApiResponse,
      monthlyRevenue: { "2025-03": 300, "2025-01": 100, "2025-02": 200 },
    });
    expect(data.monthlyRevenue.map((m) => m.month)).toEqual(["2025-01", "2025-02", "2025-03"]);
  });

  it("handles empty monthlyRevenue gracefully", () => {
    const data = transformDashboardResponse({
      ...dashboardApiResponse,
      monthlyRevenue: {},
    });
    expect(data.monthlyRevenue).toEqual([]);
  });

  it("handles missing monthlyRevenue gracefully", () => {
    const { monthlyRevenue: _, ...noRevenue } = dashboardApiResponse;
    void _;
    const data = transformDashboardResponse(noRevenue);
    expect(data.monthlyRevenue).toEqual([]);
  });

  it("builds ordersByStatus from array of counts", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(data.ordersByStatus).toEqual({ confirmed: 10, delivered: 5 });
  });

  it("builds quotesByStatus from array of counts", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(data.quotesByStatus).toEqual({ sent: 3, accepted: 7 });
  });

  it("preserves recentOrders from response", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(data.recentOrders).toHaveLength(1);
    expect(data.recentOrders[0].orderNumber).toBe("ORD-2026-0001");
  });

  it("preserves recentQuotes from response", () => {
    const data = transformDashboardResponse(dashboardApiResponse);
    expect(data.recentQuotes).toHaveLength(1);
    expect(data.recentQuotes[0].quoteNumber).toBe("QT-2026-0001");
  });

  it("defaults all stats to 0 when stats is missing", () => {
    const data = transformDashboardResponse({});
    expect(data.totalRevenue).toBe(0);
    expect(data.totalOrders).toBe(0);
    expect(data.activeOrders).toBe(0);
    expect(data.totalQuotes).toBe(0);
    expect(data.pendingQuotes).toBe(0);
    expect(data.totalCustomers).toBe(0);
    expect(data.totalProducts).toBe(0);
  });

  it("defaults lists to empty arrays when missing", () => {
    const data = transformDashboardResponse({});
    expect(data.recentOrders).toEqual([]);
    expect(data.recentQuotes).toEqual([]);
    expect(data.ordersByStatus).toEqual({});
    expect(data.quotesByStatus).toEqual({});
    expect(data.monthlyRevenue).toEqual([]);
  });
});
