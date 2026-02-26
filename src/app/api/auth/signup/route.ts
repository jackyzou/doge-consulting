import { NextRequest, NextResponse } from "next/server";
import { createUser, createToken, COOKIE_OPTIONS } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/auth/signup — public customer self-registration
export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, company } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create user with "user" role (never admin via public signup)
    const user = await createUser({ email, password, name, role: "user", phone, company });

    // Link any existing quotes / orders submitted under this email
    await prisma.quote.updateMany({
      where: { customerEmail: email, customerId: null },
      data: { customerId: user.id },
    });
    await prisma.order.updateMany({
      where: { customerEmail: email, customerId: null },
      data: { customerId: user.id },
    });

    // Create session
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role as "admin" | "user" };
    const token = createToken(sessionUser);

    const response = NextResponse.json({ user: sessionUser }, { status: 201 });
    response.cookies.set(COOKIE_OPTIONS.name, token, {
      httpOnly: COOKIE_OPTIONS.httpOnly,
      secure: COOKIE_OPTIONS.secure,
      sameSite: COOKIE_OPTIONS.sameSite,
      path: COOKIE_OPTIONS.path,
      maxAge: COOKIE_OPTIONS.maxAge,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
