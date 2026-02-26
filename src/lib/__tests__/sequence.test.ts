/**
 * Unit tests for the sequence number generator.
 *
 * Tests the generateSequenceNumber function for all document
 * prefixes (QT, ORD, PAY, INV, REC, PO) with mocked Prisma.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    quote: { findFirst: vi.fn() },
    order: { findFirst: vi.fn() },
    payment: { findFirst: vi.fn() },
    document: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

import { generateSequenceNumber } from "../sequence";

describe("generateSequenceNumber", () => {
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates first QT number as QT-YYYY-0001", async () => {
    mockPrisma.quote.findFirst.mockResolvedValue(null);
    const result = await generateSequenceNumber("QT");
    expect(result).toBe(`QT-${currentYear}-0001`);
  });

  it("increments QT number from last existing", async () => {
    mockPrisma.quote.findFirst.mockResolvedValue({
      quoteNumber: `QT-${currentYear}-0042`,
    });
    const result = await generateSequenceNumber("QT");
    expect(result).toBe(`QT-${currentYear}-0043`);
  });

  it("generates first ORD number as ORD-YYYY-0001", async () => {
    mockPrisma.order.findFirst.mockResolvedValue(null);
    const result = await generateSequenceNumber("ORD");
    expect(result).toBe(`ORD-${currentYear}-0001`);
  });

  it("increments ORD number from last existing", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      orderNumber: `ORD-${currentYear}-0010`,
    });
    const result = await generateSequenceNumber("ORD");
    expect(result).toBe(`ORD-${currentYear}-0011`);
  });

  it("generates first PAY number", async () => {
    mockPrisma.payment.findFirst.mockResolvedValue(null);
    const result = await generateSequenceNumber("PAY");
    expect(result).toBe(`PAY-${currentYear}-0001`);
  });

  it("generates INV document number", async () => {
    mockPrisma.document.findFirst.mockResolvedValue(null);
    const result = await generateSequenceNumber("INV");
    expect(result).toBe(`INV-${currentYear}-0001`);
  });

  it("generates REC document number", async () => {
    mockPrisma.document.findFirst.mockResolvedValue({
      documentNumber: `REC-${currentYear}-0005`,
    });
    const result = await generateSequenceNumber("REC");
    expect(result).toBe(`REC-${currentYear}-0006`);
  });

  it("generates PO document number", async () => {
    mockPrisma.document.findFirst.mockResolvedValue(null);
    const result = await generateSequenceNumber("PO");
    expect(result).toBe(`PO-${currentYear}-0001`);
  });

  it("pads numbers to 4 digits", async () => {
    mockPrisma.quote.findFirst.mockResolvedValue({
      quoteNumber: `QT-${currentYear}-0009`,
    });
    const result = await generateSequenceNumber("QT");
    expect(result).toBe(`QT-${currentYear}-0010`);
    expect(result.split("-").pop()).toHaveLength(4);
  });

  it("handles large sequence numbers", async () => {
    mockPrisma.order.findFirst.mockResolvedValue({
      orderNumber: `ORD-${currentYear}-9999`,
    });
    const result = await generateSequenceNumber("ORD");
    expect(result).toBe(`ORD-${currentYear}-10000`);
  });
});
