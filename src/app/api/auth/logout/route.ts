import { NextResponse } from "next/server";
import { COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_OPTIONS.name, "", {
    httpOnly: true,
    secure: COOKIE_OPTIONS.secure,
    sameSite: COOKIE_OPTIONS.sameSite,
    path: "/",
    maxAge: 0,
  });
  return response;
}
