import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/track-view — internal page view tracking (called from middleware)
export async function POST(request: NextRequest) {
  // Only accept internal requests from middleware
  if (request.headers.get("x-internal") !== "1") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    // Don't track bot/crawler traffic
    const ua = (data.userAgent || "").toLowerCase();
    if (/bot|crawler|spider|scraper|lighthouse|pagespeed/i.test(ua)) {
      return NextResponse.json({ ok: true, tracked: false });
    }

    await prisma.pageView.create({
      data: {
        path: data.path || "/",
        referrer: data.referrer || null,
        userAgent: data.userAgent || null,
        country: data.country || null,
        region: data.region || null,
        city: data.city || null,
        language: data.language || null,
        sessionId: data.sessionId || null,
        userId: data.userId || null,
        deviceType: data.deviceType || null,
      },
    });

    return NextResponse.json({ ok: true, tracked: true });
  } catch (error) {
    // Never fail — tracking is non-critical
    console.error("Page view tracking error:", error);
    return NextResponse.json({ ok: true, tracked: false });
  }
}
