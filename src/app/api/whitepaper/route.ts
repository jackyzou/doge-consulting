import { NextRequest, NextResponse } from "next/server";
import { getTransporter } from "@/lib/email-notifications";
import { prisma } from "@/lib/db";
import { resolveAppUrl } from "@/lib/app-url";
import { createWhitepaperDownloadToken, isValidEmail, normalizeEmail } from "@/lib/whitepaper-access";

// POST /api/whitepaper — subscribe + send whitepaper download link email
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    await prisma.subscriber.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail },
    });

    const appUrl = await resolveAppUrl(request);
    const token = createWhitepaperDownloadToken(normalizedEmail);
    const downloadUrl = `${appUrl}/api/whitepaper/download?token=${encodeURIComponent(token)}`;
    const recipientName = typeof name === "string" && name.trim() ? name.trim() : "there";

    // Send email with download link
    try {
      const transporter = await getTransporter();
      if (transporter) {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dogeconsulting.com";
        await transporter.sendMail({
          from: `"Doge Consulting" <${fromEmail}>`,
          to: normalizedEmail,
          subject: "Your Free China Sourcing Playbook + 15% Off Coupon 📘🎁",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h1 style="color:#0d9488;">Your China Sourcing Playbook is Ready! 🎉</h1>
              <p>Hi ${recipientName},</p>
              <p>Thank you for joining 2,500+ importers who save 40–60% on products from China. Here's everything we promised:</p>

              <div style="background:#f0fdf4;border:1px solid #14b8a6;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
                <p style="margin:0 0 12px;font-size:14px;color:#0f172a;font-weight:bold;">📘 Download Your Free Playbook</p>
                <a href="${downloadUrl}" style="background:#0d9488;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
                  Download 50+ Page Guide
                </a>
                <p style="font-size:11px;color:#6b7280;margin-top:10px;">This link is tied to ${normalizedEmail} and expires in 7 days.</p>
              </div>

              <div style="background:#fffbeb;border:1px solid #f0a500;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
                <p style="margin:0 0 4px;font-size:18px;">🎁</p>
                <p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#0f172a;">Your Exclusive 15% Off Coupon</p>
                <div style="background:white;border:2px dashed #f0a500;border-radius:8px;padding:12px;margin:10px auto;max-width:200px;">
                  <p style="margin:0;font-size:24px;font-weight:bold;color:#f0a500;letter-spacing:3px;">WELCOME15</p>
                </div>
                <p style="font-size:12px;color:#6b7280;margin:8px 0 0;">Apply at checkout on your first shipment. No minimum order.</p>
              </div>

              <h3 style="color:#0d9488;margin-top:30px;">What's Inside the Playbook:</h3>
              <ul style="color:#374151;line-height:1.8;">
                <li>Why China? The $3.7 trillion manufacturing powerhouse</li>
                <li>3-6x markups: real factory prices vs US retail</li>
                <li>3 business models that generate $10K-$100K/month</li>
                <li>Complete logistics chain: factory to doorstep</li>
                <li>Customs duties, tariffs, and compliance simplified</li>
                <li>12+ manufacturing hub city guides</li>
                <li>90-day action plan to launch your import business</li>
              </ul>

              <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:25px 0;">
                <p style="margin:0 0 12px;font-weight:bold;color:#0f172a;">🛠️ Free Tools to Help You Get Started:</p>
                <table style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;"><a href="${appUrl}/tools/revenue-calculator" style="color:#0d9488;font-weight:600;text-decoration:none;">💰 Revenue Calculator</a></td>
                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Calculate import profit, duties & ROI</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;"><a href="${appUrl}/tools/cbm-calculator" style="color:#0d9488;font-weight:600;text-decoration:none;">📦 CBM Calculator</a></td>
                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Freight volume & container fit</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;"><a href="${appUrl}/tools/3d-visualizer" style="color:#0d9488;font-weight:600;text-decoration:none;">🏗️ 3D Container Planner</a></td>
                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Visualize cargo in containers</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;"><a href="${appUrl}/tools/duty-calculator" style="color:#0d9488;font-weight:600;text-decoration:none;">🧮 Duty Calculator</a></td>
                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Estimate import duties & tariffs</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;"><a href="${appUrl}/catalog" style="color:#0d9488;font-weight:600;text-decoration:none;">🛒 Product Catalog</a></td>
                    <td style="padding:8px 0;color:#6b7280;font-size:13px;">Browse products we source</td>
                  </tr>
                </table>
              </div>

              <div style="text-align:center;margin:30px 0;">
                <p style="margin:0 0 12px;font-weight:bold;color:#0f172a;">Ready to ship? Get a free, no-obligation quote:</p>
                <a href="${appUrl}/quote" style="background:#f0a500;color:#0f172a;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
                  Get Free Quote →
                </a>
              </div>

              <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="font-size:12px;color:#6b7280;">
                Doge Consulting Group Limited · Seattle, WA · Hong Kong SAR<br/>
                <a href="${appUrl}" style="color:#0d9488;">doge-consulting.com</a> ·
                <a href="${appUrl}/blog" style="color:#0d9488;">Blog</a> ·
                <a href="${appUrl}/glossary" style="color:#0d9488;">Glossary</a> ·
                <a href="${appUrl}/contact" style="color:#0d9488;">Contact Us</a>
              </p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Whitepaper email error:", err);
      // Don't fail the request if email fails — user still gets the download
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Whitepaper error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
