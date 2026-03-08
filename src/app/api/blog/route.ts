import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/blog — public blog listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category");
    const lang = searchParams.get("lang") || "en";

    // Try to find posts in the requested language
    let posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        language: lang,
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
        language: true,
        authorName: true,
        readTime: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If no posts in requested language, fallback to English
    if (posts.length === 0 && lang !== "en") {
      posts = await prisma.blogPost.findMany({
        where: {
          published: true,
          language: "en",
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
          language: true,
          authorName: true,
          readTime: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
