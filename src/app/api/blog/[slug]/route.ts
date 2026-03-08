import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/blog/[slug] — get a single published blog post
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const lang = req.nextUrl.searchParams.get("lang") || "en";

    // Try to find in requested language first
    let post = await prisma.blogPost.findFirst({
      where: { slug, language: lang, published: true },
    });

    // Fallback to English if not found in requested language
    if (!post && lang !== "en") {
      post = await prisma.blogPost.findFirst({
        where: { slug, language: "en", published: true },
      });
    }

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json(post);
  } catch (error) {
    console.error("Blog post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
