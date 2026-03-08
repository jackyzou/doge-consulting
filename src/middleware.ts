import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "doge_session";
const SESSION_COOKIE = "doge_vid"; // anonymous visitor ID

// ── JWT parsing (no verification — just for fast route guard) ──
function parseJwtPayload(token: string): { id: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ── Device type from User-Agent ───────────────────────────────
function getDeviceType(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|iphone|android.*mobile/i.test(ua)) return "mobile";
  return "desktop";
}

// ── Generate visitor ID ───────────────────────────────────────
function generateVisitorId(): string {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip static assets, API routes, _next ────────────────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".") // static files (.css, .js, .png, etc.)
  ) {
    // Still apply auth guard for API routes
    if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/customer")) {
      return handleAuth(request, pathname);
    }
    return NextResponse.next();
  }

  // ── Auth guard for protected pages ────────────────────────
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/account");
  if (isProtected) {
    const authResponse = handleAuth(request, pathname);
    if (authResponse.status !== 200) return authResponse;
  }

  // ── Track page view (fire-and-forget) ─────────────────────
  const response = NextResponse.next();

  // Get or set anonymous session cookie
  let sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = generateVisitorId();
    response.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // Get user ID if logged in
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? parseJwtPayload(token) : null;

  // Extract geo info from headers (Cloudflare provides these)
  const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || null;
  const region = request.headers.get("x-vercel-ip-country-region") || null;
  const city = request.headers.get("x-vercel-ip-city") || null;

  const ua = request.headers.get("user-agent") || "";
  const referrer = request.headers.get("referer") || null;
  const language = request.headers.get("accept-language")?.split(",")[0]?.trim() || null;

  // Fire-and-forget: POST to internal tracking API
  const origin = request.nextUrl.origin;
  try {
    fetch(`${origin}/api/track-view`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-internal": "1" },
      body: JSON.stringify({
        path: pathname,
        referrer,
        userAgent: ua.substring(0, 500),
        country,
        region,
        city,
        language,
        sessionId,
        userId: session?.id || null,
        deviceType: getDeviceType(ua),
      }),
    }).catch(() => {}); // truly fire-and-forget
  } catch {
    // Never block the response for tracking failures
  }

  return response;
}

// ── Auth guard logic ──────────────────────────────────────────
function handleAuth(request: NextRequest, pathname: string): NextResponse {
  const isAPI = pathname.startsWith("/api/");
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Compute public origin for redirects
  const fwdHost = request.headers.get("x-forwarded-host");
  const fwdProto = request.headers.get("x-forwarded-proto") || "https";
  const publicOrigin = fwdHost ? `${fwdProto}://${fwdHost}` : (process.env.APP_URL || request.nextUrl.origin);

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isAPI) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/login", publicOrigin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = parseJwtPayload(token);
  if (!session) {
    if (isAPI) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/login", publicOrigin);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && session.role !== "admin") {
    if (isAPI) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.redirect(new URL("/account", publicOrigin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pages (not API, not static)
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
