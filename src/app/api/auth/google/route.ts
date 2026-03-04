import { NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/auth";

// GET /api/auth/google — redirect user to Google's OAuth consent screen
export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.json(
      { error: "Google OAuth is not configured" },
      { status: 503 }
    );
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Pass the "from" query param as state so we can redirect back after login
  const from = request.nextUrl.searchParams.get("from") || "/";
  const state = encodeURIComponent(from);

  const authUrl = getGoogleAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
