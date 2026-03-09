import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFileSync } from "fs";

function getVersion(): string {
  try { return readFileSync("VERSION", "utf-8").trim(); } catch { return "dev"; }
}

export async function GET() {
  try {
    // Verify database connection
    await prisma.user.count();

    return NextResponse.json({
      status: "ok",
      version: getVersion(),
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
