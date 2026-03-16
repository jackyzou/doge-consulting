import { prisma } from "@/lib/db";

const BASE_URL = "https://doge-consulting.com";

export async function GET() {
  let posts: { slug: string; title: string; excerpt: string; authorName: string; createdAt: Date; updatedAt: Date; category: string }[] = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true, language: "en" },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { slug: true, title: true, excerpt: true, authorName: true, createdAt: true, updatedAt: true, category: true },
    });
  } catch {
    // DB may not be available during build
  }

  const escapeXml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

  const items = posts.map(
    (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${escapeXml(post.slug)}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <author>team@doge-consulting.com (${escapeXml(post.authorName)})</author>
      <category>${escapeXml(post.category)}</category>
      <pubDate>${post.createdAt.toUTCString()}</pubDate>
    </item>`
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Doge Consulting Blog — China-to-USA Shipping &amp; Sourcing</title>
    <link>${BASE_URL}/blog</link>
    <description>Expert guides on importing from China to the USA: shipping, sourcing, customs, tariffs, and logistics.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/doge-logo.png</url>
      <title>Doge Consulting</title>
      <link>${BASE_URL}</link>
    </image>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
