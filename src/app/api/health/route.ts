import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Verify database connection
    await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      node: process.version,
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Database unreachable" },
      { status: 503 }
    );
  }
}
