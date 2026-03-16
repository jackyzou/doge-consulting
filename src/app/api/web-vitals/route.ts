import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST — collect a web vital metric from the client
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, value, rating, path, deviceType } = body;

    if (!name || typeof value !== "number" || !rating || !path) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const validNames = ["LCP", "CLS", "INP", "TTFB", "FCP"];
    const validRatings = ["good", "needs-improvement", "poor"];
    if (!validNames.includes(name) || !validRatings.includes(rating)) {
      return NextResponse.json({ error: "Invalid metric" }, { status: 400 });
    }

    await prisma.webVital.create({
      data: { name, value, rating, path, deviceType: deviceType || null },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
