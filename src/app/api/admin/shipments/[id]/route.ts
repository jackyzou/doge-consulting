import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

// GET — single shipment detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      vessel: true,
      events: { orderBy: { timestamp: "desc" } },
      order: { select: { orderNumber: true, customerName: true, customerEmail: true, status: true } },
    },
  });

  if (!shipment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ shipment });
}

// PATCH — update shipment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  const fields = [
    "containerNumber", "containerType", "sealNumber",
    "vesselId", "voyageNumber", "billOfLading",
    "portOfLoading", "portOfDischarge", "placeOfReceipt", "placeOfDelivery",
    "status", "notes", "orderId",
  ];
  for (const f of fields) {
    if (f in body) data[f] = body[f] || null;
  }
  // Handle numeric fields
  if ("grossWeightKg" in body) data.grossWeightKg = body.grossWeightKg ? parseFloat(body.grossWeightKg) : null;
  if ("volumeCbm" in body) data.volumeCbm = body.volumeCbm ? parseFloat(body.volumeCbm) : null;
  // Handle date fields
  for (const d of ["etd", "atd", "eta", "ata"]) {
    if (d in body) data[d] = body[d] ? new Date(body[d]) : null;
  }

  const shipment = await prisma.shipment.update({
    where: { id },
    data,
    include: { vessel: true, events: { orderBy: { timestamp: "desc" } } },
  });

  return NextResponse.json({ shipment });
}

// DELETE — remove shipment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.shipment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
