import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface CompanyInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  registration: string;
}

const COMPANY: CompanyInfo = {
  name: "Doge Consulting Group Limited",
  address: "Rm 5, 27/F, China Resources Bldg, 26 Harbour Rd, Wan Chai, Hong Kong",
  email: "dogetech77@gmail.com",
  phone: "+852-XXXX-XXXX",
  registration: "HK Reg. No. 78922296-000-10-25-2",
};

interface LineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit?: string;
}

interface DocumentData {
  documentNumber: string;
  type: "invoice" | "receipt" | "purchase_order" | "proforma";
  date: string;
  dueDate?: string;

  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;

  // Order ref
  orderNumber?: string;
  quoteNumber?: string;

  // Items
  items: LineItem[];

  // Totals
  subtotal: number;
  shippingCost: number;
  insuranceCost: number;
  customsDuty: number;
  discount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;

  // Payment info (for receipts)
  paymentMethod?: string;
  paymentDate?: string;
  amountPaid?: number;

  notes?: string;
}

function formatMoney(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function getTitle(type: string): string {
  switch (type) {
    case "invoice": return "INVOICE";
    case "receipt": return "RECEIPT";
    case "purchase_order": return "PURCHASE ORDER";
    case "proforma": return "PROFORMA INVOICE";
    default: return "DOCUMENT";
  }
}

export function generatePDF(data: DocumentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DOGE CONSULTING", 14, 20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(COMPANY.address, 14, 26);
  doc.text(`${COMPANY.email} | ${COMPANY.phone}`, 14, 30);
  doc.text(COMPANY.registration, 14, 34);

  // ── Document title (right side) ──
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 184, 166); // teal
  doc.text(getTitle(data.type), pageWidth - 14, 22, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(`No: ${data.documentNumber}`, pageWidth - 14, 30, { align: "right" });
  doc.text(`Date: ${data.date}`, pageWidth - 14, 35, { align: "right" });
  if (data.dueDate) {
    doc.text(`Due: ${data.dueDate}`, pageWidth - 14, 40, { align: "right" });
  }

  // ── Divider ──
  doc.setDrawColor(20, 184, 166);
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // ── Bill To ──
  let y = 50;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100);
  doc.text("BILL TO", 14, y);

  if (data.orderNumber) {
    doc.text("REFERENCE", pageWidth - 80, y);
  }

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40);
  doc.setFontSize(10);
  doc.text(data.customerName, 14, y);
  if (data.customerCompany) {
    y += 5;
    doc.text(data.customerCompany, 14, y);
  }
  y += 5;
  doc.text(data.customerEmail, 14, y);
  if (data.customerPhone) {
    y += 5;
    doc.text(data.customerPhone, 14, y);
  }

  // Reference column
  let refY = 55;
  if (data.orderNumber) {
    doc.text(`Order: ${data.orderNumber}`, pageWidth - 80, refY);
    refY += 5;
  }
  if (data.quoteNumber) {
    doc.text(`Quote: ${data.quoteNumber}`, pageWidth - 80, refY);
    refY += 5;
  }
  if (data.paymentMethod) {
    doc.text(`Payment: ${data.paymentMethod.replace("_", " ")}`, pageWidth - 80, refY);
    refY += 5;
  }

  // ── Items Table ──
  y = Math.max(y, refY) + 10;

  const tableBody = data.items.map((item) => [
    item.name + (item.description ? `\n${item.description}` : ""),
    item.quantity.toString(),
    item.unit || "piece",
    formatMoney(item.unitPrice, data.currency),
    formatMoney(item.totalPrice, data.currency),
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Item", "Qty", "Unit", "Unit Price", "Total"]],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [20, 184, 166],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 25 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 30 },
    },
  });

  // ── Totals ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  const totals: [string, string][] = [
    ["Subtotal", formatMoney(data.subtotal, data.currency)],
  ];
  if (data.shippingCost > 0) totals.push(["Shipping", formatMoney(data.shippingCost, data.currency)]);
  if (data.insuranceCost > 0) totals.push(["Insurance", formatMoney(data.insuranceCost, data.currency)]);
  if (data.customsDuty > 0) totals.push(["Customs Duty", formatMoney(data.customsDuty, data.currency)]);
  if (data.discount > 0) totals.push(["Discount", `-${formatMoney(data.discount, data.currency)}`]);
  if (data.taxAmount > 0) totals.push(["Tax", formatMoney(data.taxAmount, data.currency)]);

  const totalsX = pageWidth - 90;
  doc.setFontSize(9);

  for (const [label, value] of totals) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(label, totalsX, y);
    doc.text(value, pageWidth - 14, y, { align: "right" });
    y += 6;
  }

  // Total line
  doc.setDrawColor(20, 184, 166);
  doc.line(totalsX, y, pageWidth - 14, y);
  y += 7;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 184, 166);
  doc.text("TOTAL", totalsX, y);
  doc.text(formatMoney(data.totalAmount, data.currency), pageWidth - 14, y, { align: "right" });

  // Amount paid (for receipts)
  if (data.amountPaid !== undefined) {
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text("Amount Paid", totalsX, y);
    doc.text(formatMoney(data.amountPaid, data.currency), pageWidth - 14, y, { align: "right" });

    if (data.totalAmount - data.amountPaid > 0) {
      y += 6;
      doc.setTextColor(239, 68, 68);
      doc.text("Balance Due", totalsX, y);
      doc.text(formatMoney(data.totalAmount - data.amountPaid, data.currency), pageWidth - 14, y, { align: "right" });
    }
  }

  // ── Notes ──
  if (data.notes) {
    y += 14;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100);
    doc.text("NOTES", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const lines = doc.splitTextToSize(data.notes, pageWidth - 28);
    doc.text(lines, 14, y);
  }

  // ── Footer ──
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(
    `${COMPANY.name} | ${COMPANY.registration} | Generated ${new Date().toISOString().split("T")[0]}`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "This document is computer-generated and valid without signature.",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  return doc;
}

/** Get a base64 data URI for the PDF */
export function generatePDFBase64(data: DocumentData): string {
  const doc = generatePDF(data);
  return doc.output("datauristring");
}

/** Get raw PDF buffer for downloads */
export function generatePDFBuffer(data: DocumentData): ArrayBuffer {
  const doc = generatePDF(data);
  return doc.output("arraybuffer");
}

export type { DocumentData, LineItem };
