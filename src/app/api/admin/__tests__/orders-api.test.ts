/**
 * API contract tests for admin orders routes.
 *
 * Validates that GET /api/admin/orders returns { orders: [...] }
 * and not a flat array. This was one of the bugs we fixed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockPrisma } = vi.hoisted(() => {
  const mockOrders = [
    {
      id: "o1",
      orderNumber: "ORD-2026-0001",
      status: "confirmed",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      totalAmount: 1250,
      balanceDue: 375,
      items: [{ name: "Sofa", quantity: 2 }],
      payments: [],
      statusHistory: [{ status: "confirmed", createdAt: new Date() }],
      documents: [],
    },
  ];
  return {
    mockRequireAdmin: vi.fn(),
    mockPrisma: {
      order: {
        findMany: vi.fn().mockResolvedValue(mockOrders),
        findUnique: vi.fn().mockResolvedValue(mockOrders[0]),
        update: vi.fn().mockResolvedValue(mockOrders[0]),
      },
      orderStatusHistory: {
        create: vi.fn().mockResolvedValue({ id: "sh-1" }),
      },
    },
  };
});

vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/email-notifications", () => ({
  sendOrderClosedEmail: vi.fn().mockResolvedValue(true),
}));

import { GET } from "@/app/api/admin/orders/route";

describe("GET /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns { orders: [...] } — NOT a flat array (contract test)", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?");
    const response = await GET(request);
    const data = await response.json();

    // CONTRACT TEST: This is the exact bug we fixed
    expect(data).toHaveProperty("orders");
    expect(Array.isArray(data.orders)).toBe(true);
    expect(data.orders).toHaveLength(1);
    expect(data.orders[0].orderNumber).toBe("ORD-2026-0001");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const request = new NextRequest("http://localhost:3000/api/admin/orders?");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns 403 when user is not admin", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const request = new NextRequest("http://localhost:3000/api/admin/orders?");
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it("passes status filter to prisma query", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?status=confirmed");
    await GET(request);
    const call = mockPrisma.order.findMany.mock.calls[0][0];
    expect(call.where.status).toBe("confirmed");
  });

  it("does not set status filter for 'all'", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?status=all");
    await GET(request);
    const call = mockPrisma.order.findMany.mock.calls[0][0];
    expect(call.where.status).toBeUndefined();
  });

  it("passes search filter with OR condition", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?search=john");
    await GET(request);
    const call = mockPrisma.order.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR.length).toBeGreaterThanOrEqual(3);
  });

  it("includes items, payments, statusHistory, documents", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?");
    await GET(request);
    const call = mockPrisma.order.findMany.mock.calls[0][0];
    expect(call.include.items).toBe(true);
    expect(call.include.payments).toBe(true);
    expect(call.include.statusHistory).toBeDefined();
    expect(call.include.documents).toBe(true);
  });

  it("orders results by createdAt desc", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/orders?");
    await GET(request);
    const call = mockPrisma.order.findMany.mock.calls[0][0];
    expect(call.orderBy.createdAt).toBe("desc");
  });
});
