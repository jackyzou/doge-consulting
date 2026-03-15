import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/content-audit — content health metrics for SEO CI/CD
export async function GET() {
  try {
    await requireAdmin();

    const posts = await prisma.blogPost.findMany({
      where: { published: true, language: "en" },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        category: true,
        viewCount: true,
        readTime: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const toolLinks = ["/tools/", "/catalog", "/quote", "/contact"];
    const now = new Date();

    const audit = posts.map(post => {
      const wordCount = post.content.split(/\s+/).length;
      const internalLinks = (post.content.match(/\]\(\//g) || []).length;
      const toolLinkCount = toolLinks.reduce((count, link) => count + (post.content.includes(link) ? 1 : 0), 0);
      const externalLinks = (post.content.match(/\]\(https?:\/\//g) || []).length;
      const hasImage = /!\[.*?\]\(.*?\)/.test(post.content);
      const imageCount = (post.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
      const daysSincePublish = Math.floor((now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const daysSinceUpdate = Math.floor((now.getTime() - new Date(post.updatedAt).getTime()) / (1000 * 60 * 60 * 24));

      // Health score: 0-100
      let score = 50;
      if (wordCount >= 1500) score += 10; else if (wordCount < 500) score -= 10;
      if (toolLinkCount >= 2) score += 10; else if (toolLinkCount === 0) score -= 15;
      if (internalLinks >= 3) score += 10; else if (internalLinks === 0) score -= 10;
      if (hasImage) score += 5;
      if (post.viewCount > 10) score += 5;
      if (post.viewCount > 50) score += 5;
      if (daysSinceUpdate > 90) score -= 10; // Stale content
      if (daysSinceUpdate > 180) score -= 10;
      score = Math.max(0, Math.min(100, score));

      const issues: string[] = [];
      if (toolLinkCount === 0) issues.push("No tool links — add links to calculators/tools");
      if (internalLinks < 2) issues.push("Low internal linking — add 2+ links to other posts");
      if (wordCount < 1000) issues.push("Thin content — expand to 1500+ words");
      if (!hasImage) issues.push("No images — add cover image or inline visuals");
      if (daysSinceUpdate > 90) issues.push("Stale — refresh stats and data");

      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        category: post.category,
        wordCount,
        internalLinks,
        toolLinkCount,
        externalLinks,
        imageCount,
        viewCount: post.viewCount,
        readTime: post.readTime,
        daysSincePublish,
        daysSinceUpdate,
        score,
        issues,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    const avgScore = Math.round(audit.reduce((s, a) => s + a.score, 0) / audit.length);
    const postsNeedingAttention = audit.filter(a => a.score < 60).length;
    const totalToolLinks = audit.reduce((s, a) => s + a.toolLinkCount, 0);
    const postsWithoutToolLinks = audit.filter(a => a.toolLinkCount === 0).length;

    return NextResponse.json({
      summary: {
        totalPosts: audit.length,
        avgScore,
        postsNeedingAttention,
        totalToolLinks,
        postsWithoutToolLinks,
        avgWordCount: Math.round(audit.reduce((s, a) => s + a.wordCount, 0) / audit.length),
      },
      posts: audit,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
