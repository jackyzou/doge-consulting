import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/lib/auth";

// GET /api/auth/providers — return which OAuth providers are available
export async function GET() {
  return NextResponse.json({
    google: isGoogleOAuthConfigured(),
  });
}
