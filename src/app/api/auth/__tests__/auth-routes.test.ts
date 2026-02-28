/**
 * API contract tests for auth routes: login and me.
 *
 * Validates login sets httpOnly cookie, returns user object;
 * me route returns session or 401.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ─── Mock login & getSession from auth lib ──────────────────────
const mockLogin = vi.fn();
const mockGetSession = vi.fn();
const mockUserFindUnique = vi.fn();
vi.mock("@/lib/auth", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
  getSession: () => mockGetSession(),
  COOKIE_OPTIONS: {
    name: "auth-token",
    httpOnly: true,
    secure: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  },
}));

import { POST as loginHandler } from "@/app/api/auth/login/route";
import { GET as meHandler } from "@/app/api/auth/me/route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user data on successful login", async () => {
    const user = { id: "u1", name: "Admin", email: "admin@test.com", role: "admin" };
    mockLogin.mockResolvedValue({ user, token: "jwt-token-123" });

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe("admin@test.com");
  });

  it("sets httpOnly auth cookie on success", async () => {
    const user = { id: "u1", name: "Admin", email: "admin@test.com", role: "admin" };
    mockLogin.mockResolvedValue({ user, token: "jwt-token-123" });

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const setCookie = response.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("auth-token");
  });

  it("returns 401 on invalid credentials", async () => {
    mockLogin.mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "bad@test.com", password: "wrong" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain("Invalid");
  });

  it("returns 400 when email is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    expect(response.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFindUnique.mockResolvedValue({ language: "en" });
  });

  it("returns user when session is valid", async () => {
    const session = { id: "u1", name: "Admin", email: "admin@test.com", role: "admin" };
    mockGetSession.mockResolvedValue(session);

    const response = await meHandler();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toEqual({ ...session, language: "en" });
  });

  it("returns 401 with null user when no session", async () => {
    mockGetSession.mockResolvedValue(null);

    const response = await meHandler();
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.user).toBeNull();
  });
});
