"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, List, Share2, Eye } from "lucide-react";
import { JsonLd, articleSchema } from "@/components/seo/JsonLd";

interface Post { id: string; title: string; content: string; category: string; emoji: string; authorName: string; readTime: string; viewCount?: number; createdAt: string; }
interface RelatedPost { slug: string; title: string; emoji: string; category: string; readTime: string; }

function renderMarkdown(md: string, stripFirstImage = false): string {
  let content = md;
  if (stripFirstImage) content = content.replace(/!\[[^\]]*\]\([^)]+\)/, "");
  const tableRegex = /(?:^\|.+\|$\n?)+/gm;
  const withTables = content.replace(tableRegex, (tableBlock: string) => {
    const rows = tableBlock.trim().split("\n").filter(Boolean);
    if (rows.length < 2) return tableBlock;
    let html = '<div class="overflow-x-auto my-6 -mx-3 px-3"><table class="w-full text-sm border-collapse min-w-[400px]">';
    rows.forEach((row: string, idx: number) => {
      const cells = row.split("|").filter(Boolean).map((c: string) => c.trim());
      if (cells.every((c: string) => /^[-:]+$/.test(c))) return;
      if (idx === 0) {
        html += '<thead><tr class="border-b-2 border-border">' + cells.map((c: string) => `<th class="px-4 py-3 text-left font-semibold text-foreground">${c}</th>`).join("") + '</tr></thead><tbody>';
      } else {
        html += '<tr class="border-b hover:bg-muted/30">' + cells.map((c: string) => `<td class="px-4 py-3">${c}</td>`).join("") + '</tr>';
      }
    });
    html += '</tbody></table></div>';
    return html;
  });

  return withTables
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure class="my-8"><img src="$2" alt="$1" class="rounded-xl w-full object-cover max-h-[420px] shadow-md" loading="lazy" /><figcaption class="text-xs text-center text-muted-foreground mt-2 italic">$1</figcaption></figure>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-teal underline hover:text-teal/80">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-teal pl-4 py-2 my-5 bg-teal/5 rounded-r-lg"><p class="text-sm text-muted-foreground italic leading-relaxed">$1</p></blockquote>')
    .replace(/^---$/gm, '<hr class="my-10 border-t-2 border-border/50" />')
    .replace(/^(💡|⚠️|📝|🔑|✅|📊|🚢|🏭|💰|🎯) (TIP|WARNING|NOTE|KEY TAKEAWAY|PRO TIP|INSIGHT|DID YOU KNOW|EXAMPLE|ACTION STEP):? (.+)$/gm, '<div class="my-5 p-4 rounded-xl border-l-4 border-teal bg-muted/40"><div class="flex items-start gap-2"><span class="text-lg">$1</span><div><span class="font-bold text-xs uppercase tracking-wide text-teal">$2</span><p class="text-sm text-muted-foreground mt-1 leading-relaxed">$3</p></div></div></div>')
    .replace(/^### (.+)$/gm, '<h3 id="$1" class="text-lg font-semibold mt-8 mb-3 text-foreground scroll-mt-24">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 id="$1" class="text-2xl font-bold mt-12 mb-5 text-foreground scroll-mt-24 pb-2 border-b border-border/50"><span class="text-teal mr-2">|</span>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground font-semibold'>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-muted-foreground leading-relaxed py-0.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-6 list-decimal text-muted-foreground leading-relaxed py-0.5">$1</li>')
    .replace(/\n\n(?!<[hulfbdoi])/g, '</p><p class="mb-5 text-muted-foreground leading-relaxed text-[15px]">');
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

export function BlogPostClient({ post, related, slug }: { post: Post; related: RelatedPost[]; slug: string }) {
  const [tocOpen, setTocOpen] = useState(true);
  const headings = extractHeadings(post.content);
  const coverImage = extractCoverImage(post.content);
  const shareUrl = encodeURIComponent("https://doge-consulting.com/blog/" + slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-10 sm:py-16 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <Link href="/blog" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-4 sm:mb-6 transition-colors"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Blog</Link>
          <Badge className="mb-3 sm:mb-4 bg-teal/20 text-teal-200 border-teal/30">{post.category}</Badge>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300 flex-wrap">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.authorName}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(post.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime} read</span>
            {post.viewCount !== undefined && post.viewCount > 0 && (
              <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.viewCount.toLocaleString()} views</span>
            )}
          </div>
        </div>
      </section>

      {coverImage && (<div className="mx-auto max-w-5xl px-4 -mt-8"><img src={coverImage} alt={post.title} className="w-full h-64 sm:h-80 object-cover rounded-xl shadow-lg" /></div>)}

      <JsonLd data={articleSchema({
        title: post.title,
        description: post.content.substring(0, 200).replace(/[#*!\[\]()]/g, "").trim(),
        url: `https://doge-consulting.com/blog/${slug}`,
        imageUrl: coverImage || undefined,
        datePublished: post.createdAt,
        authorName: post.authorName,
      })} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 overflow-hidden">
        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 space-y-4">
              {headings.length > 3 && (<Card><CardContent className="p-4"><button onClick={() => setTocOpen(!tocOpen)} className="flex items-center gap-2 font-semibold text-sm w-full text-left"><List className="h-4 w-4 text-teal" /> Contents</button><nav className={`mt-3 space-y-1.5 ${tocOpen ? "" : "hidden lg:block"}`}>{headings.map((h, i) => (<a key={i} href={"#" + h.id} className={`block text-xs hover:text-teal transition-colors leading-snug ${h.level === 3 ? "pl-3 text-muted-foreground" : "font-medium text-foreground"}`}>{h.text}</a>))}</nav></CardContent></Card>)}
              <Card><CardContent className="p-4"><p className="flex items-center gap-2 font-semibold text-sm mb-3"><Share2 className="h-4 w-4 text-teal" /> Share</p><div className="flex gap-2 flex-wrap"><a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(post.title) + "&url=" + shareUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">𝕏 Twitter</a><a href={"https://www.linkedin.com/sharing/share-offsite/?url=" + shareUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">LinkedIn</a><a href={"mailto:?subject=" + encodeURIComponent(post.title) + "&body=" + shareUrl} className="px-3 py-1.5 rounded-full bg-muted text-xs hover:bg-teal/10 hover:text-teal transition-colors">Email</a></div></CardContent></Card>
              <Card className="border-teal/20 bg-gradient-to-br from-teal/5 to-teal/10"><CardContent className="p-4 text-center"><p className="font-semibold text-sm mb-1">📘 Free Sourcing Guide</p><p className="text-xs text-muted-foreground mb-3">50+ page playbook with factory prices</p><Link href="/whitepaper"><Button size="sm" className="w-full bg-teal hover:bg-teal/90 text-xs">Download Free</Button></Link></CardContent></Card>
              <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-gold/10"><CardContent className="p-4 text-center"><p className="font-semibold text-sm mb-1">💰 Get a Quote</p><p className="text-xs text-muted-foreground mb-3">Free shipping estimate in 24h</p><Link href="/quote"><Button size="sm" variant="outline" className="w-full text-xs">Free Quote →</Button></Link></CardContent></Card>
            </div>
          </aside>

          <div className="lg:col-span-3 order-1 lg:order-2 min-w-0">
            <Card className="overflow-hidden"><CardContent className="p-3 sm:p-6 lg:p-10"><div className="prose prose-slate max-w-none break-words [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-sm [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_figure]:my-6 [&_blockquote]:my-6 [&_h2]:text-xl [&_h2]:sm:text-2xl [&_h3]:text-base [&_h3]:sm:text-lg [&_p]:text-sm [&_p]:sm:text-[15px] [&_li]:text-sm [&_li]:sm:text-[15px] overflow-x-auto" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content, !!coverImage) }} /></CardContent></Card>

            <Card className="mt-6"><CardContent className="p-6 flex items-start gap-4"><img src="/team/seto-nakamura.svg" alt={post.authorName} className="h-16 w-16 rounded-full object-cover shrink-0 shadow-md border-2 border-teal" /><div><p className="font-bold text-base">{post.authorName}</p><p className="text-xs text-teal font-medium mb-2">Sourcing &amp; Logistics Experts · <a href="/team" className="text-teal hover:underline">Meet the Team</a></p><p className="text-sm text-muted-foreground leading-relaxed">Our team has helped hundreds of businesses import goods from China. We specialize in door-to-door shipping, customs clearance, and product sourcing from China&apos;s manufacturing regions.</p></div></CardContent></Card>

            <div className="mt-8 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
              <h2 className="text-2xl font-bold mb-3">Ready to Start Importing?</h2>
              <p className="text-muted-foreground mb-6">Our team handles everything — sourcing, shipping, customs, and delivery.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/quote"><Button size="lg" className="bg-teal hover:bg-teal/90">Get Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                <Link href="/whitepaper"><Button size="lg" variant="outline">Download Free Guide 📘</Button></Link>
              </div>
            </div>

            {related.length > 0 && (<div className="mt-12"><h2 className="text-xl font-bold mb-6">Related Articles</h2><div className="grid sm:grid-cols-2 gap-4">{related.map(r => (<Link key={r.slug} href={"/blog/" + r.slug}><Card className="h-full hover:shadow-md transition-all group hover:border-teal/30"><CardContent className="p-4 flex items-start gap-3"><span className="text-3xl shrink-0">{r.emoji}</span><div><Badge variant="secondary" className="text-[10px] mb-1">{r.category}</Badge><h3 className="font-medium text-sm group-hover:text-teal transition-colors line-clamp-2">{r.title}</h3><p className="text-xs text-muted-foreground mt-1">{r.readTime} read</p></div></CardContent></Card></Link>))}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
