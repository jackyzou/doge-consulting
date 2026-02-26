/**
 * Unit tests for PDF generation.
 *
 * Tests that generatePDFBuffer and generatePDFBase64 produce
 * valid output for all document types without throwing.
 */
import { describe, it, expect } from "vitest";
import {
  generatePDFBuffer,
  generatePDFBase64,
  type DocumentData,
} from "../pdf";

function createTestDocData(type: DocumentData["type"]): DocumentData {
  return {
    documentNumber: `TEST-2026-0001`,
    type,
    date: "2026-01-15",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "+1234567890",
    customerCompany: "Acme Inc",
    orderNumber: "ORD-2026-0001",
    quoteNumber: "QT-2026-0001",
    items: [
      {
        name: "Test Sofa",
        description: "Leather 3-seater sofa",
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        unit: "piece",
      },
      {
        name: "Coffee Table",
        quantity: 1,
        unitPrice: 150,
        totalPrice: 150,
        unit: "piece",
      },
    ],
    subtotal: 1150,
    shippingCost: 200,
    insuranceCost: 50,
    customsDuty: 30,
    discount: 0,
    taxAmount: 0,
    totalAmount: 1430,
    currency: "USD",
    notes: "Handle with care. Fragile items.",
  };
}

describe("pdf", () => {
  describe("generatePDFBuffer", () => {
    it("generates a valid PDF buffer for invoice", () => {
      const data = createTestDocData("invoice");
      const buffer = generatePDFBuffer(data);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it("generates a valid PDF buffer for receipt", () => {
      const data = createTestDocData("receipt");
      data.amountPaid = 1000;
      data.paymentMethod = "credit_card";
      const buffer = generatePDFBuffer(data);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it("generates a valid PDF buffer for purchase_order", () => {
      const data = createTestDocData("purchase_order");
      const buffer = generatePDFBuffer(data);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it("generates a valid PDF buffer for proforma", () => {
      const data = createTestDocData("proforma");
      const buffer = generatePDFBuffer(data);
      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it("handles items without descriptions", () => {
      const data = createTestDocData("invoice");
      data.items = [
        { name: "Widget", quantity: 10, unitPrice: 25, totalPrice: 250 },
      ];
      const buffer = generatePDFBuffer(data);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    it("handles zero-value cost fields", () => {
      const data = createTestDocData("invoice");
      data.shippingCost = 0;
      data.insuranceCost = 0;
      data.customsDuty = 0;
      data.discount = 0;
      data.taxAmount = 0;
      const buffer = generatePDFBuffer(data);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });
  });

  describe("generatePDFBase64", () => {
    it("returns a data URI string for invoice", () => {
      const data = createTestDocData("invoice");
      const base64 = generatePDFBase64(data);
      expect(typeof base64).toBe("string");
      expect(base64).toContain("data:");
    });
  });
});
