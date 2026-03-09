import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getTransporter } from "@/lib/email-notifications";
import { prisma } from "@/lib/db";

// ── Validation schema ──────────────────────────────────────────────
const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.email("Invalid email address"),
  phone: z.string().max(30).optional().default(""),
  countryCode: z.string().max(10).optional().default(""),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});

// ── Rate-limit (simple in-memory, per-IP, 3 req / 5 min) ──────────
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// ── Receiver email (from DB settings or env) ──────────────────────
async function getReceiverEmail(): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "admin_email" } });
    if (s?.value) return s.value;
  } catch { /* fallback */ }
  return process.env.CONTACT_RECEIVER_EMAIL ?? "dogetech77@gmail.com";
}

// ── POST handler ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // Rate-limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse & validate body
    const body = await request.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, phone, countryCode, subject, message } = result.data;
    const receiverEmail = await getReceiverEmail();
    const fullPhone = phone ? `${countryCode || ""} ${phone}`.trim() : "";

    // Save to CRM database
    try {
      await prisma.contactInquiry.create({
        data: {
          name,
          email,
          phone: phone || null,
          countryCode: countryCode || null,
          subject,
          message,
          source: "contact_form",
          ipAddress: ip,
        },
      });
    } catch (dbErr) {
      console.error("Failed to save contact to CRM:", dbErr);
      // Don't block the email — still try to send
    }

    // Build the notification email
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px;">
          New Contact Form Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #334155; width: 100px;">Name</td>
            <td style="padding: 8px 12px;">${escapeHtml(name)}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; font-weight: bold; color: #334155;">Email</td>
            <td style="padding: 8px 12px;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #334155;">Phone</td>
            <td style="padding: 8px 12px;">${fullPhone ? escapeHtml(fullPhone) : "—"}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; font-weight: bold; color: #334155;">Subject</td>
            <td style="padding: 8px 12px;">${escapeHtml(subject)}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f1f5f9; border-radius: 8px;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #334155;">Message</p>
          <p style="margin: 0; white-space: pre-wrap; color: #475569;">${escapeHtml(message)}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #94a3b8;">
          Sent from the Doge Consulting contact form • ${new Date().toISOString()}
        </p>
      </div>
    `;

    const transporter = await getTransporter();

    if (transporter) {
      // ── Send the email via SMTP ──
      const fromUser = process.env.SMTP_USER || "noreply@dogeconsulting.com";
      await transporter.sendMail({
        from: `"Doge Consulting Website" <${fromUser}>`,
        replyTo: `"${name}" <${email}>`,
        to: receiverEmail,
        subject: `[Contact Form] ${subject}`,
        html: htmlBody,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${fullPhone || "—"}\nSubject: ${subject}\n\n${message}`,
      });

      console.log(`✅ Contact email sent to ${receiverEmail} from ${email}`);
    } else {
      // ── SMTP not configured – log for development ──
      console.log("──────────────────────────────────────────");
      console.log("📬 CONTACT FORM SUBMISSION (SMTP not configured)");
      console.log(`   Name:    ${name}`);
      console.log(`   Email:   ${email}`);
      console.log(`   Phone:   ${phone || "—"}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Message: ${message}`);
      console.log("──────────────────────────────────────────");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}

// ── Helpers ────────────────────────────────────────────────────────
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
