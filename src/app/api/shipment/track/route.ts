import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Public: search shipments by container number or bill of lading
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toUpperCase();

  if (!q || q.length < 4) {
    return NextResponse.json({ error: "Query must be at least 4 characters" }, { status: 400 });
  }

  const shipments = await prisma.shipment.findMany({
    where: {
      OR: [
        { containerNumber: { contains: q } },
        { billOfLading: { contains: q } },
      ],
    },
    include: {
      vessel: true,
      events: { orderBy: { timestamp: "desc" } },
      order: {
        select: {
          orderNumber: true,
          customerName: true,
          status: true,
        },
      },
    },
    take: 10,
  });

  // Sanitize — don't expose customer info to public
  const results = shipments.map((s) => ({
    id: s.id,
    containerNumber: s.containerNumber,
    containerType: s.containerType,
    billOfLading: s.billOfLading,
    voyageNumber: s.voyageNumber,
    portOfLoading: s.portOfLoading,
    portOfDischarge: s.portOfDischarge,
    placeOfReceipt: s.placeOfReceipt,
    placeOfDelivery: s.placeOfDelivery,
    etd: s.etd,
    atd: s.atd,
    eta: s.eta,
    ata: s.ata,
    status: s.status,
    grossWeightKg: s.grossWeightKg,
    volumeCbm: s.volumeCbm,
    vessel: s.vessel ? {
      name: s.vessel.name,
      imo: s.vessel.imo,
      mmsi: s.vessel.mmsi,
      flag: s.vessel.flag,
      carrier: s.vessel.carrier,
      vesselType: s.vessel.vesselType,
    } : null,
    events: s.events.map((e) => ({
      id: e.id,
      location: e.location,
      status: e.status,
      description: e.description,
      timestamp: e.timestamp,
    })),
    orderNumber: s.order?.orderNumber ?? null,
  }));

  return NextResponse.json({ shipments: results });
}
