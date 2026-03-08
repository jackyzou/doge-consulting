import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGoogleCode,
  loginOrCreateGoogleUser,
  isGoogleOAuthConfigured,
  COOKIE_OPTIONS,
} from "@/lib/auth";

// GET /api/auth/google/callback — handle Google's OAuth redirect
export async function GET(request: NextRequest) {
  // Compute public-facing origin once (used for all redirects)
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : (process.env.APP_URL || request.nextUrl.origin);

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", origin));
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const state = request.nextUrl.searchParams.get("state");

  // User denied access or Google returned an error
  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${error || "no_code"}`, origin)
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/google/callback`;

    // Exchange the code for user info
    const googleUser = await exchangeGoogleCode(code, redirectUri);

    if (!googleUser.email_verified) {
      return NextResponse.redirect(
        new URL("/login?error=email_not_verified", request.url)
      );
    }

    // Login or create the user
    const result = await loginOrCreateGoogleUser(googleUser);

    // Determine redirect destination
    let redirectTo = "/account";
    if (state) {
      const decoded = decodeURIComponent(state);
      if (decoded.startsWith("/") && !decoded.startsWith("//")) {
        redirectTo = decoded;
      }
    }
    // Admins go to /admin by default
    if (result.user.role === "admin" && redirectTo === "/") {
      redirectTo = "/admin";
    }

    // Set session cookie and redirect
    const response = NextResponse.redirect(new URL(redirectTo, origin));
    response.cookies.set(COOKIE_OPTIONS.name, result.token, {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
      path: COOKIE_OPTIONS.path,
      maxAge: COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", origin)
    );
  }
}
