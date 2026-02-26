import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateSequenceNumber } from "@/lib/sequence";
import { generatePDFBuffer, type DocumentData } from "@/lib/pdf";

// POST /api/admin/documents — generate invoice, receipt, or PO PDF
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const order = await prisma.order.findUnique({
      where: { id: body.orderId },
      include: { items: true, payments: true, quote: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const type = body.type as "invoice" | "receipt" | "purchase_order" | "proforma";
    const prefix = type === "invoice" ? "INV" : type === "receipt" ? "REC" : "PO";
    const documentNumber = await generateSequenceNumber(prefix);

    const items = order.items.map((i) => ({
      name: i.name,
      description: i.description || undefined,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      totalPrice: i.totalPrice,
      unit: i.unit,
    }));

    const totalPaid = order.payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    const docData: DocumentData = {
      documentNumber,
      type,
      date: new Date().toISOString().split("T")[0],
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone || undefined,
      orderNumber: order.orderNumber,
      quoteNumber: order.quote?.quoteNumber,
      items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      insuranceCost: order.insuranceCost,
      customsDuty: order.customsDuty,
      discount: order.discount,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      amountPaid: type === "receipt" ? totalPaid : undefined,
      paymentMethod: type === "receipt" ? (order.payments.find((p) => p.status === "completed")?.method || "N/A") : undefined,
      notes: body.notes || order.notes || undefined,
    };

    // Generate PDF buffer
    const pdfBuffer = generatePDFBuffer(docData);

    // Save document record
    const document = await prisma.document.create({
      data: {
        documentNumber,
        type,
        orderId: order.id,
        data: JSON.stringify(docData),
      },
    });

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${documentNumber}.pdf"`,
        "X-Document-Id": document.id,
        "X-Document-Number": documentNumber,
      },
    });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("POST document error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/admin/documents — list documents for an order
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    const where: Record<string, unknown> = {};
    if (orderId) where.orderId = orderId;

    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        documentNumber: true,
        type: true,
        orderId: true,
        issuedAt: true,
        createdAt: true,
        order: {
          select: {
            orderNumber: true,
            customerName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
