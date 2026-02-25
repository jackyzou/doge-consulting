import { prisma } from "./db";

/**
 * Generate sequential document numbers like QT-2026-0001, ORD-2026-0001, etc.
 */
export async function generateSequenceNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  // Find highest existing number with this prefix-year pattern
  let lastNumber = 0;

  if (prefix === "QT") {
    const last = await prisma.quote.findFirst({
      where: { quoteNumber: { startsWith: pattern } },
      orderBy: { quoteNumber: "desc" },
    });
    if (last) lastNumber = parseInt(last.quoteNumber.split("-").pop() || "0");
  } else if (prefix === "ORD") {
    const last = await prisma.order.findFirst({
      where: { orderNumber: { startsWith: pattern } },
      orderBy: { orderNumber: "desc" },
    });
    if (last) lastNumber = parseInt(last.orderNumber.split("-").pop() || "0");
  } else if (prefix === "PAY") {
    const last = await prisma.payment.findFirst({
      where: { paymentNumber: { startsWith: pattern } },
      orderBy: { paymentNumber: "desc" },
    });
    if (last) lastNumber = parseInt(last.paymentNumber.split("-").pop() || "0");
  } else if (prefix === "INV" || prefix === "REC" || prefix === "PO") {
    const last = await prisma.document.findFirst({
      where: { documentNumber: { startsWith: pattern } },
      orderBy: { documentNumber: "desc" },
    });
    if (last) lastNumber = parseInt(last.documentNumber.split("-").pop() || "0");
  }

  const next = String(lastNumber + 1).padStart(4, "0");
  return `${pattern}${next}`;
}
