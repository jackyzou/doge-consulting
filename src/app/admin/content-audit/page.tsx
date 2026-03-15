"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText, AlertTriangle, CheckCircle, TrendingUp,
  Loader2, ExternalLink, Link2, Image, Clock,
} from "lucide-react";

interface PostAudit {
  slug: string;
  title: string;
  category: string;
  wordCount: number;
  internalLinks: number;
  toolLinkCount: number;
  imageCount: number;
  viewCount: number;
  readTime: string;
  daysSincePublish: number;
  daysSinceUpdate: number;
  score: number;
  issues: string[];
}

interface AuditSummary {
  totalPosts: number;
  avgScore: number;
  postsNeedingAttention: number;
  totalToolLinks: number;
  postsWithoutToolLinks: number;
  avgWordCount: number;
}

export default function ContentAuditPage() {
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [posts, setPosts] = useState<PostAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"score" | "views" | "age">("score");

  useEffect(() => {
    fetch("/api/admin/content-audit")
      .then(r => r.json())
      .then(data => { setSummary(data.summary); setPosts(data.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>;

  const sorted = [...posts].sort((a, b) => {
    if (sort === "score") return a.score - b.score; // worst first
    if (sort === "views") return b.viewCount - a.viewCount;
    return b.daysSinceUpdate - a.daysSinceUpdate; // most stale first
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Content Audit</h1>
        <p className="text-muted-foreground text-sm">SEO health check for all {summary?.totalPosts} blog posts — refresh quarterly</p>
      </div>

      {summary && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${summary.avgScore >= 70 ? "bg-emerald-100" : summary.avgScore >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
                  <TrendingUp className={`h-4 w-4 ${summary.avgScore >= 70 ? "text-emerald-600" : summary.avgScore >= 50 ? "text-amber-600" : "text-red-600"}`} />
                </div>
                <div><p className="text-xl font-bold">{summary.avgScore}%</p><p className="text-[11px] text-muted-foreground">Avg Score</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-2"><AlertTriangle className="h-4 w-4 text-red-600" /></div>
                <div><p className="text-xl font-bold">{summary.postsNeedingAttention}</p><p className="text-[11px] text-muted-foreground">Need Attention</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2"><Link2 className="h-4 w-4 text-blue-600" /></div>
                <div><p className="text-xl font-bold">{summary.postsWithoutToolLinks}</p><p className="text-[11px] text-muted-foreground">No Tool Links</p></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal/10 p-2"><FileText className="h-4 w-4 text-teal" /></div>
                <div><p className="text-xl font-bold">{summary.avgWordCount}</p><p className="text-[11px] text-muted-foreground">Avg Words</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sort controls */}
      <div className="flex gap-2">
        {(["score", "views", "age"] as const).map(s => (
          <Button key={s} size="sm" variant={sort === s ? "default" : "outline"} onClick={() => setSort(s)} className="capitalize">{s === "age" ? "Stalest" : s === "score" ? "Worst First" : "Most Viewed"}</Button>
        ))}
      </div>

      {/* Posts table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold text-navy">Post</th>
                  <th className="text-center py-3 px-2 font-semibold text-navy">Score</th>
                  <th className="text-center py-3 px-2 font-semibold text-navy hidden sm:table-cell">Words</th>
                  <th className="text-center py-3 px-2 font-semibold text-navy hidden sm:table-cell">Tools</th>
                  <th className="text-center py-3 px-2 font-semibold text-navy hidden md:table-cell">Links</th>
                  <th className="text-center py-3 px-2 font-semibold text-navy hidden md:table-cell">Views</th>
                  <th className="text-left py-3 px-4 font-semibold text-navy">Issues</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(post => (
                  <tr key={post.slug} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-medium hover:text-teal transition-colors line-clamp-1 flex items-center gap-1">
                        {post.title}
                        <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px]">{post.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{post.readTime}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${post.score >= 70 ? "bg-emerald-100 text-emerald-700" : post.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                        {post.score}
                      </span>
                    </td>
                    <td className="text-center py-3 px-2 text-muted-foreground hidden sm:table-cell">{post.wordCount.toLocaleString()}</td>
                    <td className="text-center py-3 px-2 hidden sm:table-cell">
                      {post.toolLinkCount > 0 ? <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" /> : <AlertTriangle className="h-4 w-4 text-red-400 mx-auto" />}
                    </td>
                    <td className="text-center py-3 px-2 text-muted-foreground hidden md:table-cell">{post.internalLinks}</td>
                    <td className="text-center py-3 px-2 text-muted-foreground hidden md:table-cell">{post.viewCount}</td>
                    <td className="py-3 px-4">
                      {post.issues.length === 0 ? (
                        <span className="text-xs text-emerald-600">✓ Healthy</span>
                      ) : (
                        <div className="space-y-0.5">
                          {post.issues.slice(0, 2).map((issue, i) => (
                            <p key={i} className="text-[11px] text-red-600">{issue}</p>
                          ))}
                          {post.issues.length > 2 && <p className="text-[10px] text-muted-foreground">+{post.issues.length - 2} more</p>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
