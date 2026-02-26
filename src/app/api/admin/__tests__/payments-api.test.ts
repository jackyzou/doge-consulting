/**
 * API contract tests for admin payments route.
 *
 * Validates POST records payment with auto-generated number,
 * updates order balanceDue/depositAmount, and sends notifications.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, mockOrder, mockPayment, mockPrisma } = vi.hoisted(() => {
  const mockOrder = {
    id: "ord-1",
    orderNumber: "ORD-2026-0001",
    customerId: "cust-1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    totalAmount: 5000,
    currency: "USD",
    status: "pending",
  };
  const mockPayment = {
    id: "pay-1",
    paymentNumber: "PAY-2026-0001",
    amount: 3500,
    method: "wire",
    status: "completed",
  };
  return {
    mockRequireAdmin: vi.fn(),
    mockOrder,
    mockPayment,
    mockPrisma: {
      order: {
        findUnique: vi.fn().mockResolvedValue(mockOrder),
        update: vi.fn().mockResolvedValue(mockOrder),
      },
      payment: {
        create: vi.fn().mockResolvedValue(mockPayment),
        findMany: vi.fn().mockResolvedValue([mockPayment]),
      },
    },
  };
});

vi.mock("@/lib/auth", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

vi.mock("@/lib/sequence", () => ({
  generateSequenceNumber: vi.fn().mockResolvedValue("PAY-2026-0001"),
}));

vi.mock("@/lib/email-notifications", () => ({
  sendPaymentReceivedEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderConfirmedEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { POST } from "@/app/api/admin/payments/route";
import { sendPaymentReceivedEmail, sendOrderConfirmedEmail } from "@/lib/email-notifications";

describe("POST /api/admin/payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ id: "admin-1", role: "admin" });
    mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder });
    mockPrisma.payment.create.mockResolvedValue({ ...mockPayment });
    mockPrisma.payment.findMany.mockResolvedValue([{ ...mockPayment }]);
    mockPrisma.order.update.mockResolvedValue({ ...mockOrder });
  });

  it("creates payment with 201 status", async () => {
    const body = {
      orderId: "ord-1",
      amount: 3500,
      method: "wire",
      type: "deposit",
    };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });

  it("generates sequence number with PAY prefix", async () => {
    const body = { orderId: "ord-1", amount: 1000, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    const createCall = mockPrisma.payment.create.mock.calls[0][0];
    expect(createCall.data.paymentNumber).toBe("PAY-2026-0001");
  });

  it("updates order balance after recording payment", async () => {
    mockPrisma.payment.findMany.mockResolvedValue([{ amount: 3500, status: "completed" }]);
    const body = { orderId: "ord-1", amount: 3500, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    const updateCall = mockPrisma.order.update.mock.calls[0][0];
    expect(updateCall.data.depositAmount).toBe(3500);
    expect(updateCall.data.balanceDue).toBe(1500); // 5000 - 3500
  });

  it("changes pending order to confirmed on payment", async () => {
    const body = { orderId: "ord-1", amount: 3500, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    const updateCall = mockPrisma.order.update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("confirmed");
  });

  it("sends payment received email", async () => {
    const body = { orderId: "ord-1", amount: 3500, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    expect(sendPaymentReceivedEmail).toHaveBeenCalledTimes(1);
  });

  it("sends order confirmed email when order was pending", async () => {
    const body = { orderId: "ord-1", amount: 3500, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await POST(request);
    expect(sendOrderConfirmedEmail).toHaveBeenCalledTimes(1);
  });

  it("returns 404 when order not found", async () => {
    mockPrisma.order.findUnique.mockResolvedValue(null);
    const body = { orderId: "nonexistent", amount: 1000, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    mockRequireAdmin.mockRejectedValue(new Error("Unauthorized"));
    const body = { orderId: "ord-1", amount: 1000, method: "wire" };
    const request = new NextRequest("http://localhost:3000/api/admin/payments", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });
});
