"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Filter, Eye } from "lucide-react";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  authorName: string;
  readTime: string;
  viewCount?: number;
  createdAt: string;
}

function getCoverImage(content: string): string | null {
  const match = content?.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return match ? match[1] : null;
}

export function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(posts.map((p) => p.category))].sort();
  const filtered = selectedCategory ? posts.filter((p) => p.category === selectedCategory) : posts;
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Blog</Badge>
          <h1 className="text-4xl font-bold mb-4">Shipping & Import Insights</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Expert guides, tariff updates, sourcing tips, and business strategies for importing from China.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            <Button size="sm" variant={!selectedCategory ? "default" : "outline"} onClick={() => setSelectedCategory(null)}
              className={!selectedCategory ? "bg-teal hover:bg-teal/90" : ""}>
              <Filter className="h-3 w-3 mr-1" /> All
            </Button>
            {categories.map((cat) => (
              <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-teal hover:bg-teal/90" : ""}>
                {cat}
              </Button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">📝</p>
            <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">Blog posts are being prepared. Check back soon!</p>
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <Card className="mb-10 overflow-hidden hover:shadow-lg transition-shadow group">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2">
                      <div className="h-64 md:h-auto bg-gradient-to-br from-teal/10 to-gold/10 flex items-center justify-center text-8xl overflow-hidden">
                        {getCoverImage(featured.content) ? <img src={getCoverImage(featured.content)!} alt={featured.title} className="h-full w-full object-cover" /> : featured.emoji}
                      </div>
                      <div className="p-8 flex flex-col justify-center">
                        <Badge className="w-fit mb-3">{featured.category}</Badge>
                        <h2 className="text-2xl font-bold mb-3 group-hover:text-teal transition-colors">{featured.title}</h2>
                        <p className="text-muted-foreground mb-4">{featured.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime}</span>
                          {featured.viewCount !== undefined && featured.viewCount > 0 && (
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{featured.viewCount.toLocaleString()} views</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-5xl rounded-t-lg overflow-hidden">
                        {getCoverImage(post.content) ? <img src={getCoverImage(post.content)!} alt={post.title} className="h-full w-full object-cover" /> : post.emoji}
                      </div>
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-teal transition-colors">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                          {post.viewCount !== undefined && post.viewCount > 0 && (
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount.toLocaleString()}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}

        <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Ready to Start Importing?</h2>
          <p className="text-muted-foreground mb-6">Put these insights into action — get a free quote and let us handle the logistics.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote"><Button size="lg" className="bg-teal hover:bg-teal/90">Get Free Quote <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            <Link href="/whitepaper"><Button size="lg" variant="outline">Download Free Guide 📘</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
