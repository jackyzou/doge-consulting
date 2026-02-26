import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "doge_session";

interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  exp?: number;
}

/**
 * Parse JWT payload without verifying signature.
 * The actual signature verification happens server-side in requireAdmin().
 * This proxy layer is a fast first-pass guard to redirect unauthenticated users.
 */
function parseJwtPayload(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Classify the route
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminAPI = pathname.startsWith("/api/admin");
  const isAccountPage = pathname.startsWith("/account");
  const isCustomerAPI = pathname.startsWith("/api/customer");

  const isProtected = isAdminPage || isAdminAPI || isAccountPage || isCustomerAPI;
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminAPI || isCustomerAPI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Redirect to login for protected pages
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = parseJwtPayload(token);

  if (!session) {
    // Invalid/expired token
    if (isAdminAPI || isCustomerAPI) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require admin role
  if (isAdminPage || isAdminAPI) {
    if (session.role !== "admin") {
      if (isAdminAPI) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Account / customer routes — any authenticated user is fine
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/account/:path*", "/api/customer/:path*"],
};
