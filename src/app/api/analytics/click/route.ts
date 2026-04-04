import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/analytics/click — track CTA button clicks
// Called by onClick handlers on CTABanner, blog CTAs, tool pages, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, path, label, metadata } = body;

    if (!eventType || !path) {
      return NextResponse.json({ error: "eventType and path required" }, { status: 400 });
    }

    // Get session/user info from headers
    const userAgent = request.headers.get("user-agent") || undefined;
    const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || undefined;
    const sessionId = request.cookies.get("doge_session_id")?.value || undefined;

    // Detect device type
    const ua = (userAgent || "").toLowerCase();
    const deviceType = /mobile|android|iphone/.test(ua) ? "mobile" : /tablet|ipad/.test(ua) ? "tablet" : "desktop";

    await prisma.pageView.create({
      data: {
        path,
        referrer: label || eventType, // Store event type/label in referrer field
        userAgent: userAgent?.substring(0, 500),
        country,
        sessionId,
        deviceType,
        language: request.headers.get("accept-language")?.split(",")[0] || undefined,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
