import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface LinkResult {
  url: string;
  source: string;           // blog slug or page path
  type: "internal" | "external";
  status: number | "error";
  ok: boolean;
  error?: string;
}

async function checkUrl(url: string): Promise<{ status: number | "error"; ok: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "DogeConsulting-LinkChecker/1.0" },
    });
    clearTimeout(timeout);
    return { status: res.status, ok: res.ok };
  } catch (err) {
    return { status: "error", ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// GET — scan all blog posts and check links
export async function GET() {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://doge-consulting.com";

  const posts = await prisma.blogPost.findMany({
    where: { published: true, language: "en" },
    select: { slug: true, content: true, title: true },
  });

  const linkRegex = /\]\(([^)]+)\)/g;
  const urlSet = new Map<string, string[]>(); // url -> source slugs

  for (const post of posts) {
    let match;
    while ((match = linkRegex.exec(post.content)) !== null) {
      let url = match[1].trim();
      if (url.startsWith("#") || url.startsWith("mailto:")) continue;
      if (url.startsWith("/")) url = BASE + url;
      if (!urlSet.has(url)) urlSet.set(url, []);
      urlSet.get(url)!.push(post.slug);
    }
  }

  // Check links in batches of 10
  const results: LinkResult[] = [];
  const entries = Array.from(urlSet.entries());

  for (let i = 0; i < entries.length; i += 10) {
    const batch = entries.slice(i, i + 10);
    const checks = await Promise.all(
      batch.map(async ([url, sources]) => {
        const isInternal = url.startsWith(BASE) || url.startsWith("/");
        const result = await checkUrl(url);
        return {
          url,
          source: sources.join(", "),
          type: (isInternal ? "internal" : "external") as "internal" | "external",
          ...result,
        };
      })
    );
    results.push(...checks);
  }

  const broken = results.filter((r) => !r.ok);
  const healthy = results.filter((r) => r.ok);

  return NextResponse.json({
    totalLinks: results.length,
    brokenCount: broken.length,
    healthyCount: healthy.length,
    broken,
    healthy: healthy.slice(0, 50), // limit healthy list
    checkedAt: new Date().toISOString(),
  });
}
