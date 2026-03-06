import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/newsletter — subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Upsert — don't error if already subscribed
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
