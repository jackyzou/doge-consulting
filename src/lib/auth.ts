import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "doge-consulting-secret-key-change-in-production";
const TOKEN_EXPIRY = "7d";
const COOKIE_NAME = "doge_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: SessionUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "admin") throw new Error("Forbidden");
  return session;
}

export async function login(email: string, password: string): Promise<{ user: SessionUser; token: string } | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  // Google-only users have no password — can't login with password
  if (!user.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "user",
  };

  const token = createToken(sessionUser);
  return { user: sessionUser, token };
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role?: "admin" | "user";
  phone?: string;
  company?: string;
  language?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || "user",
      phone: data.phone,
      company: data.company,
      language: data.language || "en",
    },
  });
}

export const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// ─── Google OAuth 2.0 ────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export function getGoogleAuthUrl(redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    ...(state ? { state } : {}),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;       // Google unique ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleUserInfo> {
  // Exchange authorization code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const tokens: GoogleTokenResponse = await tokenRes.json();

  // Get user info from Google
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  return userRes.json();
}

export async function loginOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<{ user: SessionUser; token: string }> {
  // 1. Try to find by googleId
  let user = await prisma.user.findUnique({ where: { googleId: googleUser.sub } });

  if (!user) {
    // 2. Try to find by email (existing password-based user linking their Google account)
    user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      // Link Google to existing account
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl: googleUser.picture || user.avatarUrl,
        },
      });
    } else {
      // 3. Create new user from Google profile
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          avatarUrl: googleUser.picture,
          passwordHash: "", // no password for Google-only users
          role: "user",
          language: "en",
        },
      });

      // Link any existing quotes / orders submitted under this email
      await prisma.quote.updateMany({
        where: { customerEmail: googleUser.email, customerId: null },
        data: { customerId: user.id },
      });
      await prisma.order.updateMany({
        where: { customerEmail: googleUser.email, customerId: null },
        data: { customerId: user.id },
      });
    }
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "user",
  };

  const token = createToken(sessionUser);
  return { user: sessionUser, token };
}

export function isGoogleOAuthConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}
