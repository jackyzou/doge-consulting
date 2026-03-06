import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getTransporter } from "@/lib/email-notifications";

async function notifyOnPublish(post: { published: boolean; title: string; slug: string; excerpt: string; emoji: string }, wasDraft: boolean) {
  if (!post.published || !wasDraft) return;
  try {
    const transporter = await getTransporter();
    if (!transporter) return;
    const subs = await prisma.subscriber.findMany();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dogeconsulting.com";
    const url = process.env.APP_URL || "https://doge-consulting.com";
    for (const s of subs) {
      transporter.sendMail({
        from: `"Doge Consulting Blog" <${from}>`, to: s.email,
        subject: `New Post: ${post.title}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#0d9488;">${post.emoji} New Blog Post</h2><h1>${post.title}</h1><p style="color:#6b7280;">${post.excerpt}</p><p style="margin:25px 0;"><a href="${url}/blog/${post.slug}" style="background:#0d9488;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Read Article →</a></p></div>`,
      }).catch(() => {});
    }
  } catch {}
}

// GET /api/admin/blog/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}

// PUT /api/admin/blog/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();
    const before = await prisma.blogPost.findUnique({ where: { id } });
    const post = await prisma.blogPost.update({ where: { id }, data });
    // Notify subscribers if transitioning from draft to published
    if (post.published && before && !before.published) {
      notifyOnPublish(post, true).catch(() => {});
    }
    return NextResponse.json(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
