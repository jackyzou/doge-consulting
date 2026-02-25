import { NextRequest, NextResponse } from "next/server";
import { createUser, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    // Only admins can create users, OR allow first-ever user (bootstrap)
    const userCount = await prisma.user.count();
    if (userCount > 0 && (!session || session.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, password, name, role, phone, company } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // First user is always admin
    const finalRole = userCount === 0 ? "admin" : (role || "user");

    const user = await createUser({ email, password, name, role: finalRole, phone, company });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
