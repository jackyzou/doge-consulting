"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Loader2, List, Share2 } from "lucide-react";

interface Post { title: string; content: string; category: string; emoji: string; authorName: string; readTime: string; createdAt: string; }
interface RelatedPost { slug: string; title: string; emoji: string; category: string; readTime: string; }

function renderMarkdown(md: string): string {
  return md
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-8"><img src="$2" alt="$1" class="rounded-xl w-full object-cover max-h-[420px] shadow-md" loading="lazy" /><figcaption class="text-xs text-center text-muted-foreground mt-2 italic">$1</figcaption></figure>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal underline hover:text-teal/80" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-teal pl-4 py-2 my-5 bg-teal/5 rounded-r-lg"><p class="text-sm text-muted-foreground italic leading-relaxed">$1</p></blockquote>')
    .replace(/^---$/gm, '<hr class="my-10 border-t-2 border-border/50" />')
    .replace(/^(💡|⚠️|📝|🔑|✅|📊|🚢|🏭|💰|🎯) (TIP|WARNING|NOTE|KEY TAKEAWAY|PRO TIP|INSIGHT|DID YOU KNOW|EXAMPLE|ACTION STEP):? (.+)$/gm, '<div class="my-5 p-4 rounded-xl border-l-4 border-teal bg-muted/40"><div class="flex items-start gap-2"><span class="text-lg">$1</span><div><span class="font-bold text-xs uppercase tracking-wide text-teal">$2</span><p class="text-sm text-muted-foreground mt-1 leading-relaxed">$3</p></div></div></div>')
    .replace(/^### (.+)$/gm, '<h3 id="$1" class="text-lg font-semibold mt-8 mb-3 text-foreground scroll-mt-24">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-2xl font-bold mt-12 mb-5 text-foreground scroll-mt-24 pb-2 border-b border-border/50"><span class="text-teal mr-2">|</span>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-muted-foreground leading-relaxed py-0.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-muted-foreground leading-relaxed py-0.5">$1</li>')
    .replace(/\n\n(?!<[hulfbdoi])/g, '</p><p class="mb-5 text-muted-foreground leading-relaxed text-[15px]">')
    .replace(/\|(.+)\|/gm, (match: string) => {
      const cells = match.split("|").filter(Boolean).map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-:]+$/.test(c))) return "";
      return '<tr class="border-b hover:bg-muted/30">' + cells.map((c: string) => '<td class="border-x px-4 py-3 text-sm">' + c + "</td>").join("") + "</tr>";
    });
}

function extractHeadings(md: string): { id: string; text: string; level: number }[] {
  const h: { id: string; text: string; level: number }[] = [];
  for (const line of md.split("\n")) {
    const m2 = line.match(/^## (.+)$/); const m3 = line.match(/^### (.+)$/);
    if (m2) h.push({ id: m2[1], text: m2[1], level: 2 });
    else if (m3) h.push({ id: m3[1], text: m3[1], level: 3 });
  }
  return h;
}

function extractCoverImage(md: string): string | null {
  const match = md.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tocOpen, setTocOpen] = useState(true);

  useEffect(() => {
    fetch("/api/blog/" + slug)
      .then((r) => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then((data) => { if (data) { setPost(data); setLoading(false); fetch("/api/blog").then(r => r.json()).then((all: RelatedPost[]) => { setRelated((Array.isArray(all) ? all : []).filter((p: RelatedPost) => p.slug !== slug).slice(0, 4)); }).catch(() => {}); } })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;
  if (notFound || !post) return (<div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-6xl mb-4">📝</p><h1 className="text-2xl font-bold mb-2">Post Not Found</h1><p className="text-muted-foreground mb-6">This blog post doesn&apos;t exist yet.</p><Link href="/blog"><Button className="bg-teal hover:bg-teal/90"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Blog</Button></Link></div></div>);

  const headings = extractHeadings(post.content);
  const coverImage = extractCoverImage(post.content);
  const shareUrl = encodeURIComponent("https://doge-consulting.com/blog/" + slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/blog" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-6 transition-colors"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog</Link>
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">{post.category}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-300 flex-wrap">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.authorName}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime} read</span>
          </div>
        </div>
      </section>

      {coverImage && (<div className="mx-auto max-w-5xl px-4 -mt-8"><img src={coverImage} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-lg" /></div>)}

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">
              {headings.length > 3 && (<Card><CardContent className="p-4"><button onClick={() => setTocOpen(!tocOpen)} className="flex items-center gap-2 font-semibold text-sm w-full text-left"><List className="h-4 w-4 text-teal" /> Contents</button><nav className={`mt-3 space-y-1.5 ${tocOpen ? "" : "hidden lg:block"}`}>{headings.map((h, i) => (<a key={i} href={"#" + h.id} className={`block text-xs hover:text-teal transition-colors leading-snug ${h.level === 3 ? "pl-3 text-muted-foreground" : "font-medium text-foreground"}`}>{h.text}</a>))}</nav></CardContent></Card>)}
              <Card><CardContent className="p-4"><p className="flex items-center gap-2 font-semibold text-sm mb-3"><Share2 className="h-4 w-4 text-teal" /> Share</p><div className="flex gap-2 flex-wrap"><a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(post.title) + "&url=" + shareUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">𝕏 Twitter</a><a href={"https://www.linkedin.com/sharing/share-offsite/?url=" + shareUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">LinkedIn</a><a href={"mailto:?subject=" + encodeURIComponent(post.title) + "&body=" + shareUrl} className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">Email</a></div></CardContent></Card>
              <Card className="border-teal/20 bg-gradient-to-br from-teal/5 to-teal/10"><CardContent className="p-4 text-center"><p className="font-semibold text-sm mb-1">📘 Free Sourcing Guide</p><p className="text-xs text-muted-foreground mb-3">50+ page playbook with factory prices</p><Link href="/whitepaper"><Button size="sm" className="w-full bg-teal hover:bg-teal/90 text-xs">Download Free</Button></Link></CardContent></Card>
              <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-gold/10"><CardContent className="p-4 text-center"><p className="font-semibold text-sm mb-1">💰 Get a Quote</p><p className="text-xs text-muted-foreground mb-3">Free shipping estimate in 24h</p><Link href="/quote"><Button size="sm" variant="outline" className="w-full text-xs">Free Quote →</Button></Link></CardContent></Card>
            </div>
          </aside>

          {/* Main */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="overflow-hidden"><CardContent className="p-6 sm:p-10 lg:p-12"><div className="prose prose-slate max-w-none [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_img]:rounded-xl [&_img]:shadow-md [&_figure]:my-8 [&_blockquote]:my-6" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} /></CardContent></Card>

            {/* Author */}
            <Card className="mt-6"><CardContent className="p-6 flex items-start gap-4"><div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal/20 to-gold/20 flex items-center justify-center text-3xl shrink-0 shadow-sm">🐕</div><div><p className="font-bold text-base">{post.authorName}</p><p className="text-xs text-teal font-medium mb-2">Sourcing & Logistics Experts</p><p className="text-sm text-muted-foreground leading-relaxed">Our team has helped hundreds of businesses and consumers import goods from China. We specialize in door-to-door shipping, customs clearance, and product sourcing from the Pearl River Delta and Yangtze River Delta manufacturing regions.</p></div></CardContent></Card>

            {/* CTA */}
            <div className="mt-8 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
              <h2 className="text-2xl font-bold mb-3">Ready to Start Importing?</h2>
              <p className="text-muted-foreground mb-6">Our team handles everything — sourcing, shipping, customs, and delivery.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quote"><Button size="lg" className="bg-teal hover:bg-teal/90">Get Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/whitepaper"><Button size="lg" variant="outline">Download Free Guide 📘</Button></Link>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (<div className="mt-12"><h2 className="text-xl font-bold mb-6">Related Articles</h2><div className="grid sm:grid-cols-2 gap-4">{related.map(r => (<Link key={r.slug} href={"/blog/" + r.slug}><Card className="h-full hover:shadow-md transition-all group hover:border-teal/30"><CardContent className="p-4 flex items-start gap-3"><span className="text-3xl shrink-0">{r.emoji}</span><div><Badge variant="secondary" className="text-[10px] mb-1">{r.category}</Badge><h3 className="font-medium text-sm group-hover:text-teal transition-colors line-clamp-2">{r.title}</h3><p className="text-xs text-muted-foreground mt-1">{r.readTime} read</p></div></CardContent></Card></Link>))}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
