import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTransporter } from "@/lib/email-notifications";
import { resolveAppUrl } from "@/lib/app-url";
import { createWhitepaperDownloadToken, normalizeEmail } from "@/lib/whitepaper-access";

// POST /api/newsletter — subscribe + send welcome email with coupon + playbook
export async function POST(request: NextRequest) {
  try {
    const { email, language } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const validLangs = ["en", "zh-CN", "zh-TW", "es", "fr"];
    const lang = validLangs.includes(language) ? language : "en";
    const normalized = normalizeEmail(email);

    // Upsert — don't error if already subscribed
    await prisma.subscriber.upsert({
      where: { email: normalized },
      update: { language: lang },
      create: { email: normalized, language: lang },
    });

    // Send welcome email with coupon + playbook (fire-and-forget)
    try {
      const transporter = await getTransporter();
      if (transporter) {
        const appUrl = await resolveAppUrl(request);
        const token = createWhitepaperDownloadToken(normalized);
        const downloadUrl = `${appUrl}/api/whitepaper/download?token=${encodeURIComponent(token)}`;
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dogeconsulting.com";

        await transporter.sendMail({
          from: `"Doge Consulting" <${fromEmail}>`,
          to: normalized,
          subject: "Welcome! Your 15% Off Coupon + Free Playbook \uD83C\uDF81",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h1 style="color:#0d9488;">Welcome to Doge Consulting! \uD83C\uDF89</h1>
              <p>Thanks for subscribing. Here's everything we promised:</p>

              <div style="background:#fffbeb;border:1px solid #f0a500;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
                <p style="margin:0 0 8px;font-size:16px;font-weight:bold;">\uD83C\uDF81 Your 15% Off Coupon</p>
                <div style="background:white;border:2px dashed #f0a500;border-radius:8px;padding:12px;margin:10px auto;max-width:200px;">
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#f0a500;letter-spacing:3px;">WELCOME15</p>
                </div>
                <p style="font-size:12px;color:#6b7280;">Apply at checkout on your first shipment. No minimum order.</p>
              </div>

              <div style="background:#f0fdf4;border:1px solid #14b8a6;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
                <p style="margin:0 0 12px;font-weight:bold;">\uD83D\uDCD8 Your Free China Sourcing Playbook</p>
                <a href="${downloadUrl}" style="background:#0d9488;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Download 50+ Page Guide</a>
                <p style="font-size:11px;color:#6b7280;margin-top:10px;">This link expires in 7 days.</p>
              </div>

              <div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 8px;font-weight:bold;">\uD83D\uDEE0\uFE0F Free Import Tools:</p>
                <p style="margin:4px 0;"><a href="${appUrl}/tools/revenue-calculator" style="color:#0d9488;">\uD83D\uDCB0 Revenue Calculator</a> \u2014 Import profit & ROI</p>
                <p style="margin:4px 0;"><a href="${appUrl}/tools/cbm-calculator" style="color:#0d9488;">\uD83D\uDCE6 CBM Calculator</a> \u2014 Freight volume & container fit</p>
                <p style="margin:4px 0;"><a href="${appUrl}/tools/3d-visualizer" style="color:#0d9488;">\uD83C\uDFD7\uFE0F 3D Container Planner</a> \u2014 Visualize cargo</p>
                <p style="margin:4px 0;"><a href="${appUrl}/tools/shipping-tracker" style="color:#0d9488;">\uD83D\uDEA2 Live Shipping Tracker</a> \u2014 Real-time vessel map</p>
                <p style="margin:4px 0;"><a href="${appUrl}/catalog" style="color:#0d9488;">\uD83D\uDED2 Product Catalog</a> \u2014 Browse products we source</p>
              </div>

              <div style="text-align:center;margin:25px 0;">
                <a href="${appUrl}/quote" style="background:#f0a500;color:#0f172a;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">Get Free Quote \u2192</a>
              </div>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:25px 0;" />
              <p style="font-size:11px;color:#9ca3af;">Doge Consulting Group Limited \u00B7 Seattle, WA \u00B7 Hong Kong SAR<br/><a href="${appUrl}" style="color:#0d9488;">doge-consulting.com</a></p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Newsletter welcome email error:", err);
      // Don't fail the subscribe if email fails
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
