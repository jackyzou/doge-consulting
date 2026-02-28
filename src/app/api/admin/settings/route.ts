import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { resetTransporter } from "@/lib/email-notifications";

// All known setting keys with their defaults
const SETTING_DEFAULTS: Record<string, string> = {
  // SMTP
  smtp_host: "smtp.gmail.com",
  smtp_port: "587",
  smtp_user: "",
  smtp_pass: "",
  // Notifications
  admin_email: "dogetech77@gmail.com",
  wechat_id: "",
  notify_quote: "true",
  notify_payment: "true",
  notify_shipment: "true",
  // Pricing
  lcl_rate_min: "150",
  lcl_rate_max: "250",
  fcl_20gp_rate: "2500",
  fcl_40gp_rate: "4200",
  export_clearance: "200",
  destination_fees: "700",
  last_mile: "400",
  customs_rate: "3",
  // Shipping
  transit_min_weeks: "5",
  transit_max_weeks: "8",
  insurance_rate: "2",
  deposit_percent: "70",
  auto_approve: "false",
  volume_discount: "true",
  // Payment
  airwallex_demo: "true",
};

// GET /api/admin/settings — return all settings merged with defaults
export async function GET() {
  try {
    await requireAdmin();

    const dbSettings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...SETTING_DEFAULTS };
    for (const s of dbSettings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/settings — update one or more settings
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    // body is { key: value, key: value, ... }
    const updates = Object.entries(body) as [string, string][];
    if (updates.length === 0) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });
    }

    // Upsert each setting
    for (const [key, value] of updates) {
      if (typeof key !== "string" || typeof value !== "string") continue;
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    // Clear cached transporter so SMTP changes take effect immediately
    resetTransporter();

    // Return updated settings
    const dbSettings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = { ...SETTING_DEFAULTS };
    for (const s of dbSettings) {
      settingsMap[s.key] = s.value;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    if ((error as Error).message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((error as Error).message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("PATCH settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
