import type { NextRequest } from "next/server";
import { prisma } from "./db";

function normalizeAppUrl(candidate?: string | null): string | null {
  if (!candidate) return null;

  const trimmed = candidate.trim();
  if (!trimmed) return null;

  try {
    const normalized = trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

function getForwardedRequestUrl(request: NextRequest): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");

  if (!forwardedHost || !forwardedProto) return null;
  return normalizeAppUrl(`${forwardedProto}://${forwardedHost}`);
}

export async function resolveAppUrl(request?: NextRequest): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "app_url" } });
    const appUrlFromSetting = normalizeAppUrl(setting?.value);
    if (appUrlFromSetting) return appUrlFromSetting;
  } catch {
    // Database may not be ready during some test or bootstrap flows.
  }

  const envCandidates = [
    process.env.APP_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ];

  for (const candidate of envCandidates) {
    const appUrl = normalizeAppUrl(candidate);
    if (appUrl) return appUrl;
  }

  if (request) {
    const forwardedUrl = getForwardedRequestUrl(request);
    if (forwardedUrl) return forwardedUrl;

    const requestOrigin = normalizeAppUrl(request.nextUrl.origin);
    if (requestOrigin) return requestOrigin;
  }

  return "http://localhost:3000";
}