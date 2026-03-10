import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTransporter } from "@/lib/email-notifications";

async function notifySubscribers(post: { title: string; slug: string; excerpt: string; emoji: string; content?: string; language?: string }) {
  try {
    const transporter = await getTransporter();
    if (!transporter) return;

    const subscribers = await prisma.subscriber.findMany();
    if (subscribers.length === 0) return;

    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dogeconsulting.com";
    const appUrl = process.env.APP_URL || "https://doge-consulting.com";

    // Extract cover image from markdown content
    const coverMatch = post.content?.match(/!\[[^\]]*\]\(([^)]+)\)/);
    const coverImage = coverMatch ? coverMatch[1] : null;

    // Create a clean 3-4 sentence snippet from excerpt
    const snippet = post.excerpt.length > 200 ? post.excerpt.slice(0, 200) + "..." : post.excerpt;

    for (const sub of subscribers) {
      try {
        await transporter.sendMail({
          from: `"Doge Consulting Blog" <${fromEmail}>`,
          to: sub.email,
          subject: `${post.emoji} New: ${post.title}`,
          html: `
            <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
              ${coverImage ? `<a href="${appUrl}/blog/${post.slug}" style="display:block;"><img src="${coverImage}" alt="${post.title}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px 12px 0 0;" /></a>` : ''}
              <div style="padding:24px;">
                <div style="margin-bottom:16px;">
                  <span style="background:#e6fffa;color:#0d9488;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">New Blog Post</span>
                </div>
                <h1 style="color:#0f2b46;font-size:22px;margin:0 0 12px;line-height:1.3;">${post.emoji} ${post.title}</h1>
                <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">${snippet}</p>
                <a href="${appUrl}/blog/${post.slug}" style="display:inline-block;background:#2ec4b6;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Read Full Article →</a>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0 16px;" />
                <p style="font-size:11px;color:#9ca3af;margin:0;">Doge Consulting · <a href="${appUrl}" style="color:#2ec4b6;">doge-consulting.com</a></p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error(`Failed to notify ${sub.email}:`, err);
      }
    }
    console.log(`Notified ${subscribers.length} subscribers about: ${post.title}`);
  } catch (err) {
    console.error("Blog notification error:", err);
  }
}

// GET /api/admin/blog — list all blog posts (admin)
export async function GET() {
  try {
    await requireAdmin();
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(posts);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 });
  }
}

// POST /api/admin/blog — create a new blog post
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const data = await request.json();
    const { title, slug, excerpt, content, category, emoji, published, readTime, language } = data;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Title, slug, and content are required" }, { status: 400 });
    }

    const validLangs = ["en", "zh-CN", "zh-TW", "es", "fr"];

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
        excerpt: excerpt || title,
        content,
        category: category || "General",
        emoji: emoji || "\uD83D\uDCE6",
        published: published ?? false,
        readTime: readTime || "5 min",
        language: validLangs.includes(language) ? language : "en",
      },
    });

    // Notify newsletter subscribers when publishing
    if (post.published) {
      notifySubscribers({ title: post.title, slug: post.slug, excerpt: post.excerpt, emoji: post.emoji, language: post.language }).catch(() => {});
    }

    return NextResponse.json(post, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" || msg === "Forbidden" ? 403 : 500 });
  }
}
