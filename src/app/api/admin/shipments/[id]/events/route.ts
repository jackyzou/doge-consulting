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

// POST — add event to a shipment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { location, status, description, timestamp } = body;

  if (!location || !status) {
    return NextResponse.json({ error: "location and status are required" }, { status: 400 });
  }

  const event = await prisma.shipmentEvent.create({
    data: {
      shipmentId: id,
      location,
      status,
      description: description || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      source: "manual",
    },
  });

  // Also update shipment status to match latest event
  await prisma.shipment.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ event }, { status: 201 });
}
