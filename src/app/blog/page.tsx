import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { BlogListClient } from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog — Shipping & Import Insights | Doge Consulting",
  description: "Expert guides, tariff updates, sourcing tips, and business strategies for importing from China to the USA. Free tools, cost breakdowns, and industry analysis.",
  openGraph: {
    title: "Blog — Shipping & Import Insights | Doge Consulting",
    description: "Expert guides on importing from China. Tariff updates, sourcing tips, freight rate analysis.",
    url: "https://doge-consulting.com/blog",
  },
  alternates: { canonical: "https://doge-consulting.com/blog" },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true, language: "en" },
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
      viewCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <BlogListClient posts={JSON.parse(JSON.stringify(posts))} />;
}
