import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { BlogPostClient } from "./BlogPostClient";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, language: "en", published: true },
    select: { title: true, excerpt: true, content: true, authorName: true, createdAt: true },
  });

  if (!post) return { title: "Post Not Found" };

  const coverMatch = post.content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  const coverImage = coverMatch ? coverMatch[1] : undefined;

  return {
    title: `${post.title} | Doge Consulting Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://doge-consulting.com/blog/${slug}`,
      type: "article",
      publishedTime: new Date(post.createdAt).toISOString(),
      authors: [post.authorName],
      ...(coverImage && { images: [{ url: coverImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(coverImage && { images: [coverImage] }),
    },
    alternates: { canonical: `https://doge-consulting.com/blog/${slug}` },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const post = await prisma.blogPost.findFirst({
    where: { slug, language: "en", ...(isPreview ? {} : { published: true }) },
  });

  if (!post) notFound();

  // Only increment view count for published posts (not previews)
  if (post.published) {
    prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});
  }

  // Fetch related posts
  const related = await prisma.blogPost.findMany({
    where: { published: true, language: "en", slug: { not: slug } },
    select: { slug: true, title: true, emoji: true, category: true, readTime: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <>
      {isPreview && !post.published && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
          ⚠️ PREVIEW MODE — This post is not published yet. Only admins can see this page.
        </div>
      )}
      <BlogPostClient
        post={JSON.parse(JSON.stringify(post))}
        related={JSON.parse(JSON.stringify(related))}
        slug={slug}
      />
    </>
  );
}