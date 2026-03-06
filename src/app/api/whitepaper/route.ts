import { NextRequest, NextResponse } from "next/server";
import { getTransporter } from "@/lib/email-notifications";

// POST /api/whitepaper — subscribe + send whitepaper download link email
export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const origin = request.nextUrl.origin;
    const downloadUrl = `${origin}/api/whitepaper/download`;

    // Send email with download link
    try {
      const transporter = await getTransporter();
      if (transporter) {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dogeconsulting.com";
        await transporter.sendMail({
          from: `"Doge Consulting" <${fromEmail}>`,
          to: email,
          subject: "Your Free China Sourcing Playbook 📘",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
              <h1 style="color:#0d9488;">Your China Sourcing Playbook is Ready! 🎉</h1>
              <p>Hi ${name || "there"},</p>
              <p>Thank you for your interest in importing from China. Your comprehensive guide is ready for download.</p>
              <p style="margin:30px 0;">
                <a href="${downloadUrl}" style="background:#0d9488;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">
                  📘 Download Your Free Guide
                </a>
              </p>
              <h3 style="color:#0d9488;">What's Inside:</h3>
              <ul>
                <li>Why China? The $3.7 trillion manufacturing powerhouse</li>
                <li>3-6x markups: real factory prices vs US retail</li>
                <li>3 business models that generate $10K-$100K/month</li>
                <li>Complete logistics chain: factory to doorstep</li>
                <li>Customs duties, tariffs, and compliance simplified</li>
                <li>12+ manufacturing hub city guides</li>
              </ul>
              <p>Need help getting started? <a href="${origin}/quote" style="color:#0d9488;">Get a free quote</a> or <a href="${origin}/contact" style="color:#0d9488;">contact our team</a>.</p>
              <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;" />
              <p style="font-size:12px;color:#6b7280;">Doge Consulting Group Limited · Seattle, WA · Hong Kong SAR</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("Whitepaper email error:", err);
      // Don't fail the request if email fails — user still gets the download
    }

    return NextResponse.json({ success: true, downloadUrl: "/api/whitepaper/download" });
  } catch (error) {
    console.error("Whitepaper error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
