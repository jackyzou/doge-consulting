/**
 * Unit tests for email notification module.
 *
 * Mocks nodemailer and prisma to verify email construction
 * and logging without sending real emails.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mocks are available when vi.mock factories run
const { mockSendMail, mockEmailLogCreate } = vi.hoisted(() => ({
  mockSendMail: vi.fn().mockResolvedValue({ messageId: "test-123" }),
  mockEmailLogCreate: vi.fn().mockResolvedValue({ id: "log-1" }),
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
  },
}));

import {
  sendQuoteSentEmail,
  sendOrderConfirmedEmail,
  sendPaymentReceivedEmail,
  sendOrderClosedEmail,
  sendPaymentLinkEmail,
} from "../email-notifications";

describe("email-notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendQuoteSentEmail", () => {
    it("logs email to database", async () => {
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
      expect(mockEmailLogCreate).toHaveBeenCalled();
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("quote_sent");
      expect(firstCall.data.status).toBe("sent");
    });
  });

  describe("sendOrderConfirmedEmail", () => {
    it("logs email to database with order info", async () => {
      await sendOrderConfirmedEmail({
        orderNumber: "ORD-2026-0001",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        totalAmount: 1250,
        depositAmount: 875,
        currency: "USD",
      });

      expect(mockEmailLogCreate).toHaveBeenCalled();
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("order_confirmed");
    });
  });

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

      expect(mockEmailLogCreate).toHaveBeenCalled();
      const firstCall = mockEmailLogCreate.mock.calls[0][0];
      expect(firstCall.data.type).toBe("payment_received");
    });
  });

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

  describe("sendPaymentLinkEmail", () => {
    it("logs email to database with payment link", async () => {
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
  });
});
