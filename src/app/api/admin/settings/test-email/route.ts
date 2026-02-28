import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getTransporter, resetTransporter, sendEmail } from "@/lib/email-notifications";
import { prisma } from "@/lib/db";

// POST /api/admin/settings/test-email — send a test email with current SMTP config
export async function POST() {
  try {
    const admin = await requireAdmin();

    // Force transporter refresh so it picks up any just-saved SMTP settings
    resetTransporter();

    const transporter = await getTransporter();
    if (!transporter) {
      return NextResponse.json(
        { error: "SMTP not configured. Please enter SMTP host, user, and password in Settings first." },
        { status: 400 }
      );
    }

    // Determine recipient — admin's own email or the admin_email setting
    let recipientEmail = admin.email;
    try {
      const s = await prisma.setting.findUnique({ where: { key: "admin_email" } });
      if (s?.value) recipientEmail = s.value;
    } catch { /* use admin session email */ }

    const success = await sendEmail({
      to: recipientEmail,
      subject: "✅ Doge Consulting — Test Email",
      type: "test_email",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #14b8a6;">
            <h2 style="color: #0f172a; margin: 0;">🐕 Doge Consulting Group</h2>
          </div>
          <div style="padding: 24px 0;">
            <h3 style="color:#0f172a;">Test Email Successful! ✅</h3>
            <p>This is a test email from your Doge Consulting admin panel.</p>
            <p>If you received this, your SMTP settings are configured correctly.</p>
            <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #22c55e;">
              <p style="margin:0;"><strong>Sent at:</strong> ${new Date().toISOString()}</p>
              <p style="margin:4px 0 0;"><strong>Sent by:</strong> ${admin.name} (${admin.email})</p>
            </div>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Doge Consulting Group Limited · Hong Kong</p>
          </div>
        </div>
      `,
    });

    if (success) {
      return NextResponse.json({ message: `Test email sent to ${recipientEmail}` });
    } else {
      return NextResponse.json({ error: "Email failed — check SMTP credentials and try again." }, { status: 500 });
    }
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("Test email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
