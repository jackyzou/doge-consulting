import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHITEPAPER_TOKEN_SECRET = process.env.WHITEPAPER_TOKEN_SECRET
  || process.env.JWT_SECRET
  || "doge-consulting-whitepaper-secret-change-in-production";
const WHITEPAPER_TOKEN_EXPIRY = (process.env.WHITEPAPER_TOKEN_EXPIRY || "7d") as SignOptions["expiresIn"];

export interface WhitepaperAccessPayload {
  email: string;
  type: "whitepaper-download";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email));
}

export function createWhitepaperDownloadToken(email: string): string {
  const normalizedEmail = normalizeEmail(email);

  return jwt.sign(
    { email: normalizedEmail, type: "whitepaper-download" },
    WHITEPAPER_TOKEN_SECRET,
    { expiresIn: WHITEPAPER_TOKEN_EXPIRY }
  );
}

export function verifyWhitepaperDownloadToken(token: string): WhitepaperAccessPayload | null {
  try {
    const decoded = jwt.verify(token, WHITEPAPER_TOKEN_SECRET) as JwtPayload & Partial<WhitepaperAccessPayload>;

    if (decoded.type !== "whitepaper-download" || typeof decoded.email !== "string") {
      return null;
    }

    const email = normalizeEmail(decoded.email);
    if (!isValidEmail(email)) {
      return null;
    }

    return { email, type: "whitepaper-download" };
  } catch {
    return null;
  }
}