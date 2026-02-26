/**
 * API contract tests for admin product routes.
 *
 * Validates that GET /api/admin/products returns { products: [...] }
 * and that POST creates a product. Catches the flat-array bug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockProducts, mockPrisma } = vi.hoisted(() => {
  const mockProducts = [
    { id: "p1", name: "Sofa", sku: "SOFA-001", unitPrice: 500, category: "furniture", isActive: true },
    { id: "p2", name: "Table", sku: "TABLE-001", unitPrice: 200, category: "furniture", isActive: true },
  ];
  return {
    mockRequireAdmin: vi.fn(),
    mockProducts,
    mockPrisma: {
      product: {
        findMany: vi.fn().mockResolvedValue(mockProducts),
        create: vi.fn().mockResolvedValue({ id: "p3", name: "Chair", sku: "CHAIR-001" }),
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

import { GET, POST } from "@/app/api/admin/products/route";

describe("GET /api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("returns { products: [...] } — NOT a flat array", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/products?");
    const response = await GET(request);
    const data = await response.json();

    // CONTRACT TEST: This is the exact bug we fixed
    expect(data).toHaveProperty("products");
    expect(Array.isArray(data.products)).toBe(true);
    expect(data.products).toHaveLength(2);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const request = new NextRequest("http://localhost:3000/api/admin/products?");
    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("returns 403 when not admin", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Forbidden"));
    const request = new NextRequest("http://localhost:3000/api/admin/products?");
    const response = await GET(request);
    expect(response.status).toBe(403);
  });

  it("passes category filter to prisma query", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/products?category=furniture");
    await GET(request);
    const call = mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.category).toBe("furniture");
  });

  it("passes search filter to prisma query with OR", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/products?search=sofa");
    await GET(request);
    const call = mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.OR).toBeDefined();
    expect(call.where.OR).toHaveLength(3); // name, sku, description
  });

  it("passes catalog filter to prisma query", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/products?catalog=true");
    await GET(request);
    const call = mockPrisma.product.findMany.mock.calls[0][0];
    expect(call.where.isCatalog).toBe(true);
  });
});

describe("POST /api/admin/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
  });

  it("creates a product and returns 201", async () => {
    const body = {
      name: "Chair",
      sku: "CHAIR-001",
      unitPrice: 100,
      category: "furniture",
    };
    const request = new NextRequest("http://localhost:3000/api/admin/products", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
  });
});
