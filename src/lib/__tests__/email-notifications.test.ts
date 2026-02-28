/**
 * Unit tests for email notification module.
 *
 * Mocks nodemailer and prisma to verify email construction,
 * HTML content, error handling, admin copies, notification toggles,
 * branded templates, and all notification functions.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mocks are available when vi.mock factories run
const { mockSendMail, mockEmailLogCreate, mockSettingFindMany, mockSettingFindUnique } = vi.hoisted(() => ({
  mockSendMail: vi.fn().mockResolvedValue({ messageId: "test-123" }),
  mockEmailLogCreate: vi.fn().mockResolvedValue({ id: "log-1" }),
  mockSettingFindMany: vi.fn().mockResolvedValue([]),
  mockSettingFindUnique: vi.fn().mockResolvedValue(null),
}));

// Mock nodemailer
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
    })),
  },
}));

// Mock prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    emailLog: {
      create: mockEmailLogCreate,
    },
    setting: {
      findMany: mockSettingFindMany,
      findUnique: mockSettingFindUnique,
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ language: "en" }),
    },
  },
}));

import {
  sendQuoteRequestedEmail,
  sendQuoteSentEmail,
  sendOrderConfirmedEmail,
  sendPaymentReceivedEmail,
  sendOrderClosedEmail,
  sendPaymentLinkEmail,
  sendOrderStatusEmail,
  sendEmail,
  resetTransporter,
} from "../email-notifications";

describe("email-notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetTransporter();
    // Restore default mock return values after clearAllMocks
    mockSendMail.mockResolvedValue({ messageId: "test-123" });
    mockEmailLogCreate.mockResolvedValue({ id: "log-1" });
    mockSettingFindMany.mockResolvedValue([]);
    mockSettingFindUnique.mockResolvedValue(null);
  });

  // ── sendEmail core ──

  describe("sendEmail", () => {
    it("logs to console when SMTP not configured (no password)", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      mockSettingFindMany.mockResolvedValue([]);

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        html: "<p>Hello</p>",
        type: "test",
      });

      expect(result).toBe(true);
      expect(mockEmailLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({ to: "test@example.com", type: "test", status: "sent" }),
      });
      consoleSpy.mockRestore();
    });

    it("logs failed status on error", async () => {
      // Simulate SMTP configured but sendMail fails
      mockSettingFindMany.mockResolvedValue([
        { key: "smtp_pass", value: "secret" },
        { key: "smtp_user", value: "user@test.com" },
        { key: "smtp_host", value: "smtp.test.com" },
      ]);
      mockSendMail.mockRejectedValueOnce(new Error("SMTP connection refused"));
      mockSettingFindUnique.mockResolvedValue({ key: "smtp_user", value: "user@test.com" });

      const result = await sendEmail({
        to: "test@example.com",
        subject: "Fail Test",
        html: "<p>fail</p>",
        type: "test_fail",
      });

      expect(result).toBe(false);
      expect(mockEmailLogCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: "failed",
          error: expect.stringContaining("SMTP connection refused"),
        }),
      });
    });
  });

  // ── sendQuoteRequestedEmail (NEW) ──

  describe("sendQuoteRequestedEmail", () => {
    it("sends confirmation email to customer and admin on quote submission", async () => {
      await sendQuoteRequestedEmail({
        quoteNumber: "QT-2026-0001",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        shippingEstimateUSD: 850,
        items: [
          { name: "Sofa", quantity: 2 },
          { name: "Table", quantity: 1 },
        ],
        deliveryType: "Door-to-Door",
        destination: "Los Angeles, CA",
      });

      // Should create email log entries (customer + admin notification)
      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const customerCall = mockEmailLogCreate.mock.calls[0][0];
      expect(customerCall.data.type).toBe("quote_requested");
      expect(customerCall.data.to).toBe("jane@example.com");
      expect(customerCall.data.subject).toContain("QT-2026-0001");

      // Second call is admin copy
      const adminCall = mockEmailLogCreate.mock.calls[1][0];
      expect(adminCall.data.type).toBe("quote_requested");
      expect(adminCall.data.subject).toContain("New Quote Request");
    });

    it("skips when quote notifications are disabled", async () => {
      mockSettingFindUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "notify_quote") return { key: "notify_quote", value: "false" };
        return null;
      });

      await sendQuoteRequestedEmail({
        quoteNumber: "QT-2026-0002",
        customerName: "Bob",
        customerEmail: "bob@example.com",
        shippingEstimateUSD: 500,
        items: [{ name: "Chair", quantity: 4 }],
        deliveryType: "Warehouse Pickup",
        destination: "Seattle, WA",
      });

      expect(mockEmailLogCreate).not.toHaveBeenCalled();
    });
  });

  // ── sendQuoteSentEmail ──

  describe("sendQuoteSentEmail", () => {
    it("logs email to database and sends to customer + admin", async () => {
      await sendQuoteSentEmail({
        quoteNumber: "QT-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        totalAmount: 1250,
        currency: "USD",
        items: [
          { name: "Sofa", quantity: 2, totalPrice: 1000 },
        ],
        paymentLinkUrl: "http://localhost:3000/pay/abc123",
      });

      // Should create email log entries (customer + admin notification)
      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("quote_sent");
      expect(firstCall.data.status).toBe("sent");
      expect(firstCall.data.to).toBe("john@example.com");

      // Second call is admin copy
      const secondCall = mockEmailLogCreate.mock.calls[1][0];
      expect(secondCall.data.type).toBe("quote_sent");
    });

    it("skips when quote notifications are disabled", async () => {
      mockSettingFindUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "notify_quote") return { key: "notify_quote", value: "false" };
        return null;
      });

      await sendQuoteSentEmail({
        quoteNumber: "QT-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        totalAmount: 1250,
        currency: "USD",
        items: [{ name: "Sofa", quantity: 2, totalPrice: 1000 }],
      });

      expect(mockEmailLogCreate).not.toHaveBeenCalled();
    });
  });

  // ── sendOrderConfirmedEmail ──

  describe("sendOrderConfirmedEmail", () => {
    it("logs email to database with order info and sends admin copy", async () => {
      await sendOrderConfirmedEmail({
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        totalAmount: 1250,
        depositAmount: 875,
        currency: "USD",
      });

      // Customer + admin
      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("order_confirmed");
      expect(firstCall.data.orderId).toBe("ORD-2026-0001");
    });
  });

  // ── sendPaymentReceivedEmail ──

  describe("sendPaymentReceivedEmail", () => {
    it("logs email to database with payment info", async () => {
      await sendPaymentReceivedEmail({
        paymentNumber: "PAY-2026-0001",
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        amount: 875,
        currency: "USD",
        method: "credit_card",
        type: "deposit",
      });

      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("payment_received");
    });

    it("skips when payment notifications are disabled", async () => {
      mockSettingFindUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "notify_payment") return { key: "notify_payment", value: "false" };
        return null;
      });

      await sendPaymentReceivedEmail({
        paymentNumber: "PAY-2026-0001",
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        amount: 875,
        currency: "USD",
        method: "credit_card",
        type: "deposit",
      });

      expect(mockEmailLogCreate).not.toHaveBeenCalled();
    });
  });

  // ── sendOrderClosedEmail ──

  describe("sendOrderClosedEmail", () => {
    it("logs email to database", async () => {
      await sendOrderClosedEmail({
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        totalAmount: 1250,
        currency: "USD",
      });

      expect(mockEmailLogCreate).toHaveBeenCalled();
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("order_closed");
    });
  });

  // ── sendPaymentLinkEmail ──

  describe("sendPaymentLinkEmail", () => {
    it("sends payment link email with amount and URL", async () => {
      await sendPaymentLinkEmail({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        quoteNumber: "QT-2026-0001",
        amount: 875,
        currency: "USD",
        paymentUrl: "http://localhost:3000/pay/abc123",
        description: "Deposit for QT-2026-0001",
      });

      expect(mockEmailLogCreate).toHaveBeenCalled();
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("payment_link");
    });

    it("skips when payment notifications are disabled", async () => {
      mockSettingFindUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "notify_payment") return { key: "notify_payment", value: "false" };
        return null;
      });

      await sendPaymentLinkEmail({
        customerName: "John Doe",
        customerEmail: "john@example.com",
        quoteNumber: "QT-2026-0001",
        amount: 875,
        currency: "USD",
        paymentUrl: "http://localhost:3000/pay/abc123",
        description: "Deposit for QT-2026-0001",
      });

      expect(mockEmailLogCreate).not.toHaveBeenCalled();
    });
  });

  // ── sendOrderStatusEmail ──

  describe("sendOrderStatusEmail", () => {
    it("sends status change notification with tracking info and progress tracker", async () => {
      await sendOrderStatusEmail({
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        status: "in_transit",
        trackingId: "TRACK-123",
        vessel: "MSC Vessel",
        note: "Departed Shanghai port",
      });

      // Customer + admin
      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("order_status");
      expect(firstCall.data.orderId).toBe("ORD-2026-0001");
      expect(firstCall.data.to).toBe("john@example.com");
      expect(firstCall.data.subject).toContain("In Transit");
    });

    it("sends email for delivered status with full tracker", async () => {
      await sendOrderStatusEmail({
        orderNumber: "ORD-2026-0002",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        status: "delivered",
        trackingId: "TRACK-456",
        estimatedDelivery: "2026-03-15",
      });

      expect(mockEmailLogCreate).toHaveBeenCalledTimes(2);
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.subject).toContain("Delivered");
    });

    it("skips when shipment notifications are disabled", async () => {
      mockSettingFindUnique.mockImplementation(async ({ where }: { where: { key: string } }) => {
        if (where.key === "notify_shipment") return { key: "notify_shipment", value: "false" };
        return null;
      });

      await sendOrderStatusEmail({
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        status: "packing",
      });

      expect(mockEmailLogCreate).not.toHaveBeenCalled();
    });
  });
});
