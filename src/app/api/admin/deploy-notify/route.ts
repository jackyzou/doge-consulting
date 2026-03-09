import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-notifications";

// POST /api/admin/deploy-notify — send deployment notification email
// Called by the auto-deploy script after successful/failed deployments
export async function POST(request: NextRequest) {
  try {
    // Only accept requests from localhost (internal deploy script)
    const forwarded = request.headers.get("x-forwarded-for") || "";
    const host = request.headers.get("host") || "";
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || forwarded.startsWith("127.") || forwarded === "::1";

    if (!isLocal) {
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
