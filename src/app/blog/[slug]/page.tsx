"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Loader2 } from "lucide-react";

interface Post {
  title: string;
  content: string;
  category: string;
  authorName: string;
  readTime: string;
  createdAt: string;
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-muted-foreground leading-relaxed">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-muted-foreground leading-relaxed">$1</li>')
    .replace(/\n\n(?!<[hulo])/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
    .replace(/\|(.+)\|/gm, (match: string) => {
      const cells = match.split("|").filter(Boolean).map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-:]+$/.test(c))) return "";
      return "<tr>" + cells.map((c: string) => '<td class="border px-3 py-2 text-sm">' + c + "</td>").join("") + "</tr>";
    });
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch("/api/blog/" + slug)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setPost(data); setLoading(false); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">📝</p>
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">This blog post doesn&apos;t exist yet.</p>
          <Link href="/blog">
            <Button className="bg-teal hover:bg-teal/90">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/blog" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog
          </Link>
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">{post.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.authorName}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime} read</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardContent className="p-8 sm:p-12">
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
          </CardContent>
        </Card>

        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Need Help With Your Import?</h2>
          <p className="text-muted-foreground mb-6">Our team handles everything — sourcing, shipping, customs, and delivery.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal hover:bg-teal/90">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/whitepaper">
              <Button size="lg" variant="outline">Download Free Guide 📘</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
