import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/blog — public blog listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");

    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        category: true,
        emoji: true,
        authorName: true,
        readTime: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
