import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Doge Consulting",
  description: "Shipping tips, import guides, tariff updates, and insights for importing from China to the USA.",
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  emoji: string;
}

const posts: BlogPost[] = [
  {
    slug: "complete-guide-shipping-from-china-to-usa",
    title: "The Complete Guide to Shipping Products from China to the USA in 2026",
    excerpt: "Everything you need to know about importing goods from China — from finding suppliers to customs clearance, shipping methods, and landed cost calculation.",
    category: "Import Guide",
    author: "Doge Consulting Team",
    date: "2026-03-01",
    readTime: "12 min",
    emoji: "🚢",
  },
  {
    slug: "lcl-vs-fcl-which-to-choose",
    title: "LCL vs FCL: Which Shipping Method Should You Choose?",
    excerpt: "A detailed comparison of Less-than-Container Load and Full Container Load shipping. Learn when each method makes sense based on volume, cost, and timeline.",
    category: "Shipping Tips",
    author: "Doge Consulting Team",
    date: "2026-02-25",
    readTime: "8 min",
    emoji: "📦",
  },
  {
    slug: "understanding-section-301-tariffs",
    title: "Understanding Section 301 Tariffs on Chinese Goods (2026 Update)",
    excerpt: "A breakdown of the current Section 301 tariff rates, which products are affected, and strategies to minimize duty costs when importing from China.",
    category: "Tariff Updates",
    author: "Doge Consulting Team",
    date: "2026-02-20",
    readTime: "10 min",
    emoji: "📊",
  },
  {
    slug: "how-to-find-reliable-chinese-suppliers",
    title: "How to Find Reliable Chinese Suppliers: A Step-by-Step Guide",
    excerpt: "Learn how to vet manufacturers, avoid scams, negotiate pricing, and build long-term supplier relationships for your import business.",
    category: "Sourcing",
    author: "Doge Consulting Team",
    date: "2026-02-15",
    readTime: "9 min",
    emoji: "🔍",
  },
  {
    slug: "us-customs-clearance-explained",
    title: "US Customs Clearance Explained: ISF, Duties, and What to Expect",
    excerpt: "Demystifying US customs for first-time importers. Understand ISF filings, duty calculation, customs bonds, and how to avoid delays and penalties.",
    category: "Customs",
    author: "Doge Consulting Team",
    date: "2026-02-10",
    readTime: "11 min",
    emoji: "🛂",
  },
  {
    slug: "furniture-sourcing-from-china",
    title: "Furniture Sourcing from China: Save 40-60% on Premium Pieces",
    excerpt: "How to source marble tables, sofas, wardrobes, and custom furniture from Foshan and Dongguan — the world's furniture capitals. Quality tips and cost breakdown.",
    category: "Sourcing",
    author: "Doge Consulting Team",
    date: "2026-02-05",
    readTime: "7 min",
    emoji: "🪑",
  },
];

export default function BlogPage() {
  const categories = [...new Set(posts.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Blog</Badge>
          <h1 className="text-4xl font-bold mb-4">Shipping & Import Insights</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Expert guides, tariff updates, and sourcing tips to help you import smarter from China.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Featured Post */}
        <Link href={`/blog/${posts[0].slug}`}>
          <Card className="mb-10 overflow-hidden hover:shadow-lg transition-shadow group">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto bg-gradient-to-br from-teal/10 to-gold/10 flex items-center justify-center text-8xl">
                  {posts[0].emoji}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-3">{posts[0].category}</Badge>
                  <h2 className="text-2xl font-bold mb-3 group-hover:text-teal transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-4">{posts[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{posts[0].date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{posts[0].readTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.slice(1).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow group">
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-5xl rounded-t-lg">
                  {post.emoji}
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-teal transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Importing?</h2>
          <p className="text-muted-foreground mb-6">
            Put these insights into action — get a free quote and let us handle the logistics.
          </p>
          <Link href="/quote">
            <Button size="lg" className="bg-teal hover:bg-teal/90">
              Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
