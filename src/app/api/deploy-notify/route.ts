import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-notifications";

// POST /api/deploy-notify — send deployment notification email
// Called by the auto-deploy script after successful/failed deployments
export async function POST(request: NextRequest) {
  try {
    // Security: accept from localhost OR with internal deploy key
    const forwarded = request.headers.get("x-forwarded-for") || "";
    const host = request.headers.get("host") || "";
    const deployKey = request.headers.get("x-deploy-key") || "";
    const expectedKey = process.env.JWT_SECRET || "dev-secret-change-me";
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || forwarded.startsWith("127.") || forwarded === "::1";
    const hasKey = deployKey === expectedKey;

    if (!isLocal && !hasKey) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "to, subject, and html are required" }, { status: 400 });
    }

    const sent = await sendEmail({
      to,
      subject,
      html,
      type: "deployment",
    });

    return NextResponse.json({ ok: true, sent });
  } catch (error) {
    console.error("Deploy notify error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
