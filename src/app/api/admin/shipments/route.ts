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

// GET — list all shipments (admin only)
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const q = searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { containerNumber: { contains: q } },
      { billOfLading: { contains: q } },
      { voyageNumber: { contains: q } },
    ];
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      include: {
        vessel: true,
        events: { orderBy: { timestamp: "desc" }, take: 3 },
        order: { select: { orderNumber: true, customerName: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({ shipments, total, page, pages: Math.ceil(total / limit) });
}

// POST — create shipment
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    containerNumber, containerType, sealNumber,
    vesselId, voyageNumber, billOfLading,
    portOfLoading, portOfDischarge, placeOfReceipt, placeOfDelivery,
    etd, atd, eta, ata, status, grossWeightKg, volumeCbm,
    orderId, notes,
  } = body;

  // Optionally create vessel on the fly
  let finalVesselId = vesselId;
  if (!vesselId && body.vesselName) {
    const vessel = await prisma.vessel.create({
      data: {
        name: body.vesselName,
        imo: body.vesselImo || null,
        mmsi: body.vesselMmsi || null,
        flag: body.vesselFlag || null,
        carrier: body.vesselCarrier || null,
        vesselType: body.vesselType || "container",
      },
    });
    finalVesselId = vessel.id;
  }

  const shipment = await prisma.shipment.create({
    data: {
      containerNumber: containerNumber || null,
      containerType: containerType || "40HC",
      sealNumber: sealNumber || null,
      vesselId: finalVesselId || null,
      voyageNumber: voyageNumber || null,
      billOfLading: billOfLading || null,
      portOfLoading: portOfLoading || "Shenzhen (CNSZX)",
      portOfDischarge: portOfDischarge || "Seattle (USSEA)",
      placeOfReceipt: placeOfReceipt || null,
      placeOfDelivery: placeOfDelivery || null,
      etd: etd ? new Date(etd) : null,
      atd: atd ? new Date(atd) : null,
      eta: eta ? new Date(eta) : null,
      ata: ata ? new Date(ata) : null,
      status: status || "booked",
      grossWeightKg: grossWeightKg ? parseFloat(grossWeightKg) : null,
      volumeCbm: volumeCbm ? parseFloat(volumeCbm) : null,
      orderId: orderId || null,
      notes: notes || null,
    },
    include: { vessel: true, events: true },
  });

  // If the shipment is linked to an order, also add an initial event
  if (containerNumber) {
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        location: portOfLoading || "Shenzhen, China",
        status: "booked",
        description: `Shipment booked - Container ${containerNumber}`,
        timestamp: new Date(),
        source: "manual",
      },
    });
  }

  return NextResponse.json({ shipment }, { status: 201 });
}
