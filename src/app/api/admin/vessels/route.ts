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

// GET — list all vessels
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const vessels = await prisma.vessel.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { shipments: true } } },
  });

  return NextResponse.json({ vessels });
}

// POST — create vessel
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, imo, mmsi, flag, carrier, vesselType, callSign, lengthM, widthM, yearBuilt, photoUrl } = body;

  if (!name) {
    return NextResponse.json({ error: "Vessel name is required" }, { status: 400 });
  }

  const vessel = await prisma.vessel.create({
    data: {
      name,
      imo: imo || null,
      mmsi: mmsi || null,
      flag: flag || null,
      carrier: carrier || null,
      vesselType: vesselType || "container",
      callSign: callSign || null,
      lengthM: lengthM ? parseFloat(lengthM) : null,
      widthM: widthM ? parseFloat(widthM) : null,
      yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
      photoUrl: photoUrl || null,
    },
  });

  return NextResponse.json({ vessel }, { status: 201 });
}
