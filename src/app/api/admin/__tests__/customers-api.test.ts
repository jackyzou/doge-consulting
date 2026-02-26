/**
 * API contract tests for admin customers route.
 *
 * Validates GET returns { customers: [...] } with _count aggregation,
 * search filters, and auth guards.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockPrisma } = vi.hoisted(() => {
  const mockCustomers = [
    {
      id: "u1",
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      company: "Acme Inc",
      role: "user",
      createdAt: new Date("2025-01-01"),
      _count: { orders: 3, quotes: 5, payments: 2 },
    },
  ];
  return {
    mockRequireAdmin: vi.fn(),
    mockPrisma: {
      user: {
        findMany: vi.fn().mockResolvedValue(mockCustomers),
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

import { GET } from "@/app/api/admin/customers/route";

describe("GET /api/admin/customers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns { customers: [...] } — NOT a flat array (contract test)", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    const response = await GET(request);
    const data = await response.json();

    // CONTRACT TEST — this was the exact class of bug that caused runtime errors
    expect(data).toHaveProperty("customers");
    expect(Array.isArray(data.customers)).toBe(true);
    expect(data.customers).toHaveLength(1);
    expect(data.customers[0].name).toBe("John Doe");
  });

  it("includes _count with orders, quotes, and payments", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    const response = await GET(request);
    const data = await response.json();

    expect(data.customers[0]._count).toEqual({ orders: 3, quotes: 5, payments: 2 });
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-admin users", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it("passes search filter with OR across name, email, company, phone", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/customers?search=acme");
    await GET(request);
    const call = mockPrisma.user.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR).toHaveLength(4);
    const fields = call.where.OR.map((c: Record<string, unknown>) => Object.keys(c)[0]);
    expect(fields).toContain("name");
    expect(fields).toContain("email");
    expect(fields).toContain("company");
    expect(fields).toContain("phone");
  });

  it("selects correct fields including _count", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    await GET(request);
    const call = mockPrisma.user.findMany.mock.calls[0][0];
    expect(call.select._count).toBeDefined();
    expect(call.select._count.select.orders).toBe(true);
    expect(call.select._count.select.quotes).toBe(true);
    expect(call.select._count.select.payments).toBe(true);
  });

  it("orders by createdAt desc", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/customers?");
    await GET(request);
    const call = mockPrisma.user.findMany.mock.calls[0][0];
    expect(call.orderBy).toEqual({ createdAt: "desc" });
  });
});
