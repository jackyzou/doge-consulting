/**
 * API contract tests for admin quotes routes.
 *
 * Validates GET returns { quotes: [...] }, POST creates quote
 * with auto-generated number and correct total calculations.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockPrisma } = vi.hoisted(() => {
  const mockQuotes = [
    {
      id: "q1",
      quoteNumber: "QT-2026-0001",
      status: "draft",
      customerName: "John Doe",
      customerEmail: "john@example.com",
      totalAmount: 1250,
      items: [{ name: "Sofa", quantity: 2, unitPrice: 500, totalPrice: 1000 }],
      paymentLink: null,
    },
  ];
  return {
    mockRequireAdmin: vi.fn(),
    mockPrisma: {
      quote: {
        findMany: vi.fn().mockResolvedValue(mockQuotes),
        create: vi.fn().mockResolvedValue({
          id: "q2",
          quoteNumber: "QT-2026-0001",
          status: "draft",
          totalAmount: 1250,
          items: [],
        }),
      },
    },
  };
});

vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/sequence", () => ({
  generateSequenceNumber: vi.fn().mockResolvedValue("QT-2026-0001"),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { GET, POST } from "@/app/api/admin/quotes/route";

describe("GET /api/admin/quotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns { quotes: [...] } — NOT a flat array (contract test)", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/quotes?");
    const response = await GET(request);
    const data = await response.json();

    // CONTRACT TEST
    expect(data).toHaveProperty("quotes");
    expect(Array.isArray(data.quotes)).toBe(true);
    expect(data.quotes).toHaveLength(1);
    expect(data.quotes[0].quoteNumber).toBe("QT-2026-0001");
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const request = new NextRequest("http://localhost:3000/api/admin/quotes?");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("passes status filter to prisma query", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/quotes?status=sent");
    await GET(request);
    const call = mockPrisma.quote.findMany.mock.calls[0][0];
    expect(call.where.status).toBe("sent");
  });

  it("passes search filter with OR", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/quotes?search=john");
    await GET(request);
    const call = mockPrisma.quote.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
  });

  it("includes items and paymentLink", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/quotes?");
    await GET(request);
    const call = mockPrisma.quote.findMany.mock.calls[0][0];
    expect(call.include.items).toBe(true);
    expect(call.include.paymentLink).toBe(true);
  });
});

describe("POST /api/admin/quotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("creates a quote with 201 status", async () => {
    const body = {
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      items: [
        { name: "Sofa", quantity: 2, unitPrice: 500 },
      ],
    };
    const request = new NextRequest("http://localhost:3000/api/admin/quotes", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(mockPrisma.quote.create).toHaveBeenCalledTimes(1);
  });

  it("calculates correct subtotal and total including all cost fields", async () => {
    const body = {
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      shippingCost: 200,
      insuranceCost: 50,
      customsDuty: 100,
      taxAmount: 30,
      discount: 80,
      items: [
        { name: "Sofa", quantity: 2, unitPrice: 500 },
        { name: "Table", quantity: 1, unitPrice: 300 },
      ],
    };
    const request = new NextRequest("http://localhost:3000/api/admin/quotes", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    const createCall = mockPrisma.quote.create.mock.calls[0][0];
    // subtotal = 2*500 + 1*300 = 1300
    expect(createCall.data.subtotal).toBe(1300);
    // total = 1300 + 200(ship) + 50(ins) + 100(customs) + 30(tax) - 80(disc) = 1600
    expect(createCall.data.totalAmount).toBe(1600);
  });
});
