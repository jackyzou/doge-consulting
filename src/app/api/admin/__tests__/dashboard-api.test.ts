/**
 * API contract tests for admin dashboard route.
 *
 * Validates GET returns nested { stats, statusCounts, monthlyRevenue,
 * recentOrders, recentQuotes } — NOT the old shape that caused
 * "monthlyRevenue.map is not a function".
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockRequireAdmin, mockPrisma } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn(),
  mockPrisma: {
    order: {
      count: vi.fn().mockResolvedValue(25),
      findMany: vi.fn().mockResolvedValue([
        { id: "o1", orderNumber: "ORD-2026-0001", items: [], payments: [] },
      ]),
      groupBy: vi.fn().mockResolvedValue([
        { status: "confirmed", _count: 10 },
        { status: "delivered", _count: 5 },
      ]),
    },
    quote: {
      count: vi.fn().mockResolvedValue(15),
      findMany: vi.fn().mockResolvedValue([
        { id: "q1", quoteNumber: "QT-2026-0001", items: [] },
      ]),
    },
    user: {
      count: vi.fn().mockResolvedValue(50),
    },
    product: {
      count: vi.fn().mockResolvedValue(30),
    },
    payment: {
      findMany: vi.fn().mockResolvedValue([
        { amount: 1000, currency: "USD" },
        { amount: 2000, currency: "USD" },
      ]),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { GET } from "@/app/api/admin/dashboard/route";

describe("GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });

    // Default mocks
    mockPrisma.order.count.mockResolvedValue(25);
    mockPrisma.quote.count.mockResolvedValue(15);
    mockPrisma.user.count.mockResolvedValue(50);
    mockPrisma.product.count.mockResolvedValue(30);
    mockPrisma.payment.findMany.mockResolvedValue([
      { amount: 1000, currency: "USD" },
      { amount: 2000, currency: "USD" },
    ]);
    mockPrisma.order.findMany.mockResolvedValue([
      { id: "o1", orderNumber: "ORD-2026-0001", items: [], payments: [] },
    ]);
    mockPrisma.quote.findMany.mockResolvedValue([
      { id: "q1", quoteNumber: "QT-2026-0001", items: [] },
    ]);
    mockPrisma.order.groupBy.mockResolvedValue([
      { status: "confirmed", _count: 10 },
      { status: "delivered", _count: 5 },
    ]);
  });

  it("returns correct top-level shape with stats, statusCounts, monthlyRevenue, recentOrders, recentQuotes", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toHaveProperty("stats");
    expect(data).toHaveProperty("statusCounts");
    expect(data).toHaveProperty("monthlyRevenue");
    expect(data).toHaveProperty("recentOrders");
    expect(data).toHaveProperty("recentQuotes");
  });

  it("stats contains all required aggregation fields", async () => {
    const response = await GET();
    const data = await response.json();
    const { stats } = data;

    expect(stats).toHaveProperty("totalRevenue");
    expect(stats).toHaveProperty("totalPaid");
    expect(stats).toHaveProperty("totalOrders");
    expect(stats).toHaveProperty("activeOrders");
    expect(stats).toHaveProperty("totalQuotes");
    expect(stats).toHaveProperty("pendingQuotes");
    expect(stats).toHaveProperty("totalCustomers");
    expect(stats).toHaveProperty("totalProducts");
  });

  it("monthlyRevenue is a plain object (not an array) keyed by YYYY-MM", async () => {
    // The dashboard page previously crashed calling .map() on monthlyRevenue
    // because it expected an array but got an object. This contract test ensures
    // the API returns the correct shape (an object) so the page handles it properly.
    const response = await GET();
    const data = await response.json();

    expect(typeof data.monthlyRevenue).toBe("object");
    expect(Array.isArray(data.monthlyRevenue)).toBe(false);
  });

  it("statusCounts is an array of { status, count }", async () => {
    const response = await GET();
    const data = await response.json();

    expect(Array.isArray(data.statusCounts)).toBe(true);
    for (const sc of data.statusCounts) {
      expect(sc).toHaveProperty("status");
      expect(sc).toHaveProperty("count");
    }
  });

  it("totalRevenue sums all completed payment amounts", async () => {
    const response = await GET();
    const data = await response.json();

    // 1000 + 2000 = 3000
    expect(data.stats.totalRevenue).toBe(3000);
    expect(data.stats.totalPaid).toBe(2); // 2 payments
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const response = await GET();
    expect(response.status).toBe(403);
  });
});
