import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  // Enrich session with language from DB
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { language: true },
    });
    return NextResponse.json({ user: { ...session, language: dbUser?.language || "en" } });
  } catch {
    return NextResponse.json({ user: { ...session, language: "en" } });
  }
}
