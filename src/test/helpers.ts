/**
 * Test helper utilities for Doge Consulting test suite.
 *
 * Provides mock factories for Prisma, auth, and common test data
 * so that API route tests are isolated and repeatable.
 */
import { vi } from "vitest";

// ─── Mock Prisma Client ─────────────────────────────────────────
// Returns a deeply-mocked prisma object for unit/integration tests
// that don't need a real database.
export function createMockPrisma() {
  const mockFindMany = vi.fn().mockResolvedValue([]);
  const mockFindUnique = vi.fn().mockResolvedValue(null);
  const mockFindFirst = vi.fn().mockResolvedValue(null);
  const mockCreate = vi.fn().mockResolvedValue({ id: "test-id" });
  const mockUpdate = vi.fn().mockResolvedValue({ id: "test-id" });
  const mockDelete = vi.fn().mockResolvedValue({ id: "test-id" });
  const mockDeleteMany = vi.fn().mockResolvedValue({ count: 0 });
  const mockCreateMany = vi.fn().mockResolvedValue({ count: 0 });
  const mockCount = vi.fn().mockResolvedValue(0);
  const mockGroupBy = vi.fn().mockResolvedValue([]);

  const createModelMock = () => ({
    findMany: mockFindMany,
    findUnique: mockFindUnique,
    findFirst: mockFindFirst,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
    deleteMany: mockDeleteMany,
    createMany: mockCreateMany,
    count: mockCount,
    groupBy: mockGroupBy,
  });

  return {
    user: createModelMock(),
    product: createModelMock(),
    quote: createModelMock(),
    quoteItem: createModelMock(),
    order: createModelMock(),
    orderItem: createModelMock(),
    orderStatusHistory: createModelMock(),
    payment: createModelMock(),
    paymentLink: createModelMock(),
    document: createModelMock(),
    emailLog: createModelMock(),
    setting: createModelMock(),
  };
}

// ─── Test Data Factories ────────────────────────────────────────

export function createTestUser(overrides = {}) {
  return {
    id: "user-1",
    email: "test@example.com",
    passwordHash: "$2a$12$hashedpassword",
    name: "Test User",
    role: "user",
    phone: "+1234567890",
    company: "Test Corp",
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

export function createTestAdmin(overrides = {}) {
  return createTestUser({
    id: "admin-1",
    email: "admin@dogeconsulting.com",
    name: "Admin User",
    role: "admin",
    ...overrides,
  });
}

export function createTestProduct(overrides = {}) {
  return {
    id: "prod-1",
    name: "Test Sofa",
    description: "A test sofa",
    category: "furniture",
    sku: "SOFA-001",
    unitPrice: 500,
    unit: "piece",
    lengthCm: 200,
    widthCm: 90,
    heightCm: 85,
    weightKg: 60,
    imageUrl: null,
    isActive: true,
    isCatalog: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

export function createTestQuote(overrides = {}) {
  return {
    id: "quote-1",
    quoteNumber: "QT-2026-0001",
    status: "draft",
    customerId: null,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567890",
    customerCompany: "Acme Inc",
    subtotal: 1000,
    shippingCost: 200,
    insuranceCost: 50,
    customsDuty: 0,
    discount: 0,
    taxAmount: 0,
    totalAmount: 1250,
    currency: "USD",
    depositPercent: 70,
    shippingMethod: "LCL",
    originCity: "Shenzhen",
    destinationCity: "Seattle, WA",
    estimatedTransit: "25-35 days",
    notes: null,
    validUntil: new Date("2026-03-01"),
    sentAt: null,
    acceptedAt: null,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    items: [
      {
        id: "qi-1",
        quoteId: "quote-1",
        productId: "prod-1",
        name: "Test Sofa",
        description: "A test sofa",
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        unit: "piece",
        lengthCm: 200,
        widthCm: 90,
        heightCm: 85,
        weightKg: 60,
      },
    ],
    ...overrides,
  };
}

export function createTestOrder(overrides = {}) {
  return {
    id: "order-1",
    orderNumber: "ORD-2026-0001",
    status: "confirmed",
    quoteId: "quote-1",
    customerId: null,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567890",
    subtotal: 1000,
    shippingCost: 200,
    insuranceCost: 50,
    customsDuty: 0,
    discount: 0,
    taxAmount: 0,
    totalAmount: 1250,
    depositAmount: 875,
    balanceDue: 375,
    currency: "USD",
    shippingMethod: "LCL",
    originCity: "Shenzhen",
    destinationCity: "Seattle, WA",
    trackingId: null,
    vessel: null,
    estimatedDelivery: null,
    notes: null,
    closedAt: null,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    items: [
      {
        id: "oi-1",
        orderId: "order-1",
        productId: "prod-1",
        name: "Test Sofa",
        description: "A test sofa",
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        unit: "piece",
      },
    ],
    payments: [],
    statusHistory: [
      {
        id: "sh-1",
        orderId: "order-1",
        status: "confirmed",
        note: "Converted from QT-2026-0001",
        changedBy: "admin",
        createdAt: new Date("2026-01-15"),
      },
    ],
    documents: [],
    ...overrides,
  };
}

export function createTestPayment(overrides = {}) {
  return {
    id: "pay-1",
    paymentNumber: "PAY-2026-0001",
    orderId: "order-1",
    customerId: null,
    amount: 875,
    currency: "USD",
    method: "credit_card",
    status: "completed",
    type: "deposit",
    externalId: null,
    externalUrl: null,
    paidAt: new Date("2026-01-16"),
    failedAt: null,
    refundedAt: null,
    notes: null,
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-01-16"),
    ...overrides,
  };
}

// ─── Mock Auth Session ──────────────────────────────────────────

export function mockAdminSession() {
  return {
    id: "admin-1",
    email: "admin@dogeconsulting.com",
    name: "Admin User",
    role: "admin" as const,
  };
}

export function mockUserSession() {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "user" as const,
  };
}

// ─── API Response Shape Validators ──────────────────────────────
// These are the contract tests that catch the exact class of bugs
// we've been hitting (flat array vs wrapped object).

export function assertWrappedArrayResponse(
  data: unknown,
  key: string,
  message?: string
) {
  const msg = message || `API response should wrap array in { ${key}: [...] }`;
  expect(data).toBeDefined();
  expect(typeof data).toBe("object");
  expect(data).not.toBeNull();
  expect(data).toHaveProperty(key);
  const record = data as Record<string, unknown>;
  expect(Array.isArray(record[key])).toBe(true);
}

// ─── Fetch Mock Helper ──────────────────────────────────────────
// Creates a mock fetch that returns specified data for given URLs

export function createFetchMock(
  responses: Record<string, { data: unknown; status?: number }>
) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const urlStr = typeof url === "string" ? url : String(url);
    const key = Object.keys(responses).find((pattern) =>
      urlStr.includes(pattern)
    );

    if (key) {
      const { data, status = 200 } = responses[key];
      return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: new Headers(),
      } as Response;
    }

    return {
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
      text: async () => '{"error":"Not found"}',
      headers: new Headers(),
    } as Response;
  });
}
