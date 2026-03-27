"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, Globe, Activity, Link2, Shield, AlertTriangle,
  CheckCircle, ExternalLink, RefreshCw, TrendingUp, TrendingDown, FileText,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────
interface VitalSummary {
  name: string;
  p75: number;
  median: number;
  goodPct: number;
  poorPct: number;
  total: number;
}

interface PageVital {
  path: string;
  lcpP75: number;
  clsP75: number;
  inpP75: number;
  samples: number;
}

interface LinkResult {
  url: string;
  source: string;
  type: "internal" | "external";
  status: number | "error";
  ok: boolean;
  error?: string;
}

interface LinkReport {
  totalLinks: number;
  brokenCount: number;
  healthyCount: number;
  broken: LinkResult[];
  checkedAt: string;
}

// ── Thresholds (Google CWV 2026) ──────────────────────────────
const THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms" },
  CLS: { good: 0.1, poor: 0.25, unit: "" },
  INP: { good: 200, poor: 500, unit: "ms" },
  TTFB: { good: 800, poor: 1800, unit: "ms" },
  FCP: { good: 1800, poor: 3000, unit: "ms" },
};

function ratingColor(name: string, value: number): string {
  const t = THRESHOLDS[name];
  if (!t) return "text-muted-foreground";
  if (value <= t.good) return "text-green-600";
  if (value <= t.poor) return "text-yellow-600";
  return "text-red-600";
}

function ratingBadge(name: string, value: number) {
  const t = THRESHOLDS[name];
  if (!t) return <Badge variant="secondary">N/A</Badge>;
  if (value <= t.good) return <Badge className="bg-green-100 text-green-700">Good</Badge>;
  if (value <= t.poor) return <Badge className="bg-yellow-100 text-yellow-700">Needs Work</Badge>;
  return <Badge className="bg-red-100 text-red-700">Poor</Badge>;
}

// ── Component ─────────────────────────────────────────────────
export default function SeoMonitorPage() {
  const [tab, setTab] = useState<"gsc" | "vitals" | "links" | "schema" | "audit">("gsc");
  const [vitals, setVitals] = useState<VitalSummary[]>([]);
  const [pages, setPages] = useState<PageVital[]>([]);
  const [totalSamples, setTotalSamples] = useState(0);
  const [vitalsLoading, setVitalsLoading] = useState(false);
  const [linkReport, setLinkReport] = useState<LinkReport | null>(null);
  const [linksLoading, setLinksLoading] = useState(false);
  const [days, setDays] = useState(7);

  // Content audit state
  interface PostAudit { slug: string; title: string; category: string; wordCount: number; internalLinks: number; toolLinkCount: number; imageCount: number; viewCount: number; readTime: string; daysSincePublish: number; daysSinceUpdate: number; score: number; issues: string[]; }
  const [auditPosts, setAuditPosts] = useState<PostAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadVitals = () => {
    setVitalsLoading(true);
    fetch(`/api/admin/web-vitals?days=${days}`)
      .then((r) => r.json())
      .then((data) => {
        setVitals(data.summary || []);
        setPages(data.pages || []);
        setTotalSamples(data.totalSamples || 0);
        setVitalsLoading(false);
      })
      .catch(() => setVitalsLoading(false));
  };

  const loadLinks = () => {
    setLinksLoading(true);
    fetch("/api/admin/link-checker")
      .then((r) => r.json())
      .then((data) => { setLinkReport(data); setLinksLoading(false); })
      .catch(() => setLinksLoading(false));
  };

  useEffect(() => {
    if (tab === "vitals") loadVitals();
    if (tab === "audit" && auditPosts.length === 0) {
      setAuditLoading(true);
      fetch("/api/admin/content-audit")
        .then(r => r.json())
        .then(data => { setAuditPosts(data.posts || []); setAuditLoading(false); })
        .catch(() => setAuditLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, days]);

  const tabs = [
    { id: "gsc" as const, label: "Search Console", icon: Globe },
    { id: "vitals" as const, label: "Web Vitals", icon: Activity },
    { id: "links" as const, label: "Link Health", icon: Link2 },
    { id: "schema" as const, label: "Schema", icon: Shield },
    { id: "audit" as const, label: "Content Audit", icon: FileText },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">SEO</h1>
        <p className="text-sm text-muted-foreground mt-1">Search performance, content audit, link health, and structured data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GSC Tab ───────────────────────────── */}
      {tab === "gsc" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-teal" /> Google Search Console Setup</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h3 className="font-semibold text-sm">1. Verify Site Ownership</h3>
                <p className="text-sm text-muted-foreground">
                  Add your Google Search Console verification code to the <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env</code> file:
                </p>
                <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">GOOGLE_SITE_VERIFICATION=your-verification-code-here</pre>
                <p className="text-xs text-muted-foreground">This will add a <code className="bg-muted px-1.5 py-0.5 rounded">&lt;meta name=&quot;google-site-verification&quot;&gt;</code> tag to all pages.</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h3 className="font-semibold text-sm">2. Submit Sitemap</h3>
                <p className="text-sm text-muted-foreground">Submit your sitemap in Google Search Console:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-slate-900 text-green-400 px-3 py-2 rounded text-xs flex-1">https://doge-consulting.com/sitemap.xml</code>
                  <a href="https://search.google.com/search-console/sitemaps" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1"><ExternalLink className="h-3 w-3" /> Open GSC</Button>
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <h3 className="font-semibold text-sm">3. Current SEO Assets</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Sitemap", url: "/sitemap.xml", status: "Active" },
                    { label: "Robots.txt", url: "/robots.txt", status: "Active" },
                    { label: "RSS Feed", url: "/feed.xml", status: "Active" },
                    { label: "JSON-LD Schema", url: "All pages", status: "Active" },
                  ].map((asset) => (
                    <div key={asset.label} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="text-sm font-medium">{asset.label}</span>
                        <p className="text-xs text-muted-foreground">{asset.url}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">{asset.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-teal/5 border border-teal/20 space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-teal" /> Monitor Impressions</h3>
                <p className="text-sm text-muted-foreground">
                  Check your site&apos;s search performance in Google Search Console. Track impressions, clicks, CTR, and average position for your target keywords.
                </p>
                <a href="https://search.google.com/search-console/performance/search-analytics" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" className="bg-teal hover:bg-teal/90 mt-2 gap-1"><ExternalLink className="h-3 w-3" /> View Performance</Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Web Vitals Tab ────────────────────── */}
      {tab === "vitals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[7, 14, 30].map((d) => (
                <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
                  {d}d
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{totalSamples} samples</span>
              <Button size="sm" variant="ghost" onClick={loadVitals}><RefreshCw className="h-3 w-3" /></Button>
            </div>
          </div>

          {vitalsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
          ) : vitals.length === 0 ? (
            <Card><CardContent className="p-8 text-center"><Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No Web Vitals data yet. Metrics will appear after visitors interact with your site.</p></CardContent></Card>
          ) : (
            <>
              {/* Metric cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vitals.map((v) => (
                  <Card key={v.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{v.name}</span>
                        {ratingBadge(v.name, v.p75)}
                      </div>
                      <p className={`text-3xl font-bold ${ratingColor(v.name, v.p75)}`}>
                        {v.name === "CLS" ? v.p75.toFixed(3) : Math.round(v.p75)}
                        <span className="text-sm font-normal text-muted-foreground ml-1">{THRESHOLDS[v.name]?.unit} (p75)</span>
                      </p>
                      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                        <span>Median: {v.name === "CLS" ? v.median.toFixed(3) : Math.round(v.median)}</span>
                        <span className="text-green-600">{v.goodPct}% good</span>
                        {v.poorPct > 0 && <span className="text-red-600">{v.poorPct}% poor</span>}
                      </div>
                      {/* Visual bar */}
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: `${v.goodPct}%` }} />
                        <div className="bg-yellow-500 h-full" style={{ width: `${100 - v.goodPct - v.poorPct}%` }} />
                        <div className="bg-red-500 h-full" style={{ width: `${v.poorPct}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Per-page breakdown */}
              {pages.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Page-Level Metrics (p75)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="py-2 pr-4 font-medium">Page</th>
                            <th className="py-2 px-3 font-medium">LCP</th>
                            <th className="py-2 px-3 font-medium">CLS</th>
                            <th className="py-2 px-3 font-medium">INP</th>
                            <th className="py-2 pl-3 font-medium">Samples</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pages.map((p) => (
                            <tr key={p.path} className="border-b last:border-0">
                              <td className="py-2 pr-4 text-xs font-mono truncate max-w-[200px]">{p.path}</td>
                              <td className={`py-2 px-3 ${ratingColor("LCP", p.lcpP75)}`}>{Math.round(p.lcpP75)}ms</td>
                              <td className={`py-2 px-3 ${ratingColor("CLS", p.clsP75)}`}>{p.clsP75.toFixed(3)}</td>
                              <td className={`py-2 px-3 ${ratingColor("INP", p.inpP75)}`}>{p.inpP75}ms</td>
                              <td className="py-2 pl-3 text-muted-foreground">{p.samples}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Link Health Tab ───────────────────── */}
      {tab === "links" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Scans all blog post content for internal and external links.</p>
            <Button onClick={loadLinks} disabled={linksLoading} size="sm" className="gap-1">
              {linksLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              {linksLoading ? "Scanning..." : "Run Scan"}
            </Button>
          </div>

          {linksLoading && (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
          )}

          {linkReport && !linksLoading && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{linkReport.totalLinks}</p><p className="text-xs text-muted-foreground">Total Links</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-green-600">{linkReport.healthyCount}</p><p className="text-xs text-muted-foreground">Healthy</p></CardContent></Card>
                <Card><CardContent className="p-4 text-center"><p className={`text-3xl font-bold ${linkReport.brokenCount > 0 ? "text-red-600" : "text-green-600"}`}>{linkReport.brokenCount}</p><p className="text-xs text-muted-foreground">Broken</p></CardContent></Card>
              </div>

              {linkReport.broken.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Broken Links ({linkReport.broken.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {linkReport.broken.map((link, i) => (
                        <div key={i} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-mono truncate text-red-700">{link.url}</p>
                            <p className="text-xs text-muted-foreground mt-1">Found in: {link.source}</p>
                          </div>
                          <Badge variant="destructive" className="ml-2 shrink-0">
                            {link.status === "error" ? link.error?.slice(0, 20) : `HTTP ${link.status}`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {linkReport.brokenCount === 0 && (
                <Card><CardContent className="p-8 text-center"><CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" /><p className="font-semibold text-green-700">All links are healthy!</p><p className="text-xs text-muted-foreground mt-1">Checked at {new Date(linkReport.checkedAt).toLocaleString()}</p></CardContent></Card>
              )}
            </>
          )}

          {!linkReport && !linksLoading && (
            <Card><CardContent className="p-8 text-center"><Link2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Click &quot;Run Scan&quot; to check all links in your blog content.</p></CardContent></Card>
          )}
        </div>
      )}

      {/* ── Schema Validation Tab ─────────────── */}
      {tab === "schema" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-teal" /> Structured Data Coverage</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "Organization", pages: "All pages (root layout)", status: "active" },
                  { type: "WebSite + SearchAction", pages: "All pages (root layout)", status: "active" },
                  { type: "BlogPosting", pages: "24 blog posts", status: "active" },
                  { type: "FAQPage", pages: "/faq", status: "active" },
                  { type: "WebApplication", pages: "6 tools pages", status: "active" },
                  { type: "Service", pages: "/services", status: "active" },
                  { type: "BreadcrumbList", pages: "Blog posts, guides", status: "active" },
                  { type: "HowTo", pages: "/guide/shipping-from-china", status: "active" },
                  { type: "SpeakableSpecification", pages: "Key content pages", status: "active" },
                  { type: "Person", pages: "/team (6 members)", status: "active" },
                ].map((s) => (
                  <div key={s.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{s.type}</p>
                      <p className="text-xs text-muted-foreground">{s.pages}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm">CI Validation</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Schema validation runs as part of the test suite:</p>
              <pre className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">npx vitest run src/lib/__tests__/schema-validation.test.ts</pre>
              <p className="text-xs text-muted-foreground">This validates all JSON-LD schema generators have required fields, proper @context/@type, and produce valid JSON.</p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-xs font-semibold mb-2">External Validation Tools</h4>
                <div className="flex gap-2 flex-wrap">
                  <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" /> Rich Results Test</Button></a>
                  <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline" className="gap-1 text-xs"><ExternalLink className="h-3 w-3" /> Schema.org Validator</Button></a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Content Audit Tab ─────────────── */}
      {tab === "audit" && (
        <div className="space-y-4">
          {auditLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-teal" /></div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{auditPosts.length}</p><p className="text-xs text-muted-foreground">Total Posts</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{auditPosts.filter(p => p.score >= 80).length}</p><p className="text-xs text-muted-foreground text-emerald-600">Score 80+</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{auditPosts.filter(p => p.issues.length > 0).length}</p><p className="text-xs text-muted-foreground text-amber-600">Need Attention</p></CardContent></Card>
                <Card><CardContent className="py-4 text-center"><p className="text-2xl font-bold">{Math.round(auditPosts.reduce((s, p) => s + p.wordCount, 0) / Math.max(auditPosts.length, 1))}</p><p className="text-xs text-muted-foreground">Avg Words</p></CardContent></Card>
              </div>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal" /> Blog Post Quality Audit</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-2 px-2">Post</th>
                          <th className="py-2 px-2 text-right">Words</th>
                          <th className="py-2 px-2 text-right">Links</th>
                          <th className="py-2 px-2 text-right">Tools</th>
                          <th className="py-2 px-2 text-right">Views</th>
                          <th className="py-2 px-2 text-right">Score</th>
                          <th className="py-2 px-2">Issues</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditPosts.sort((a, b) => a.score - b.score).map(post => (
                          <tr key={post.slug} className="border-b hover:bg-muted/30">
                            <td className="py-2 px-2">
                              <Link href={`/blog/${post.slug}`} className="text-teal hover:underline text-xs font-medium" target="_blank">{post.title.substring(0, 50)}{post.title.length > 50 ? "..." : ""}</Link>
                              <p className="text-[10px] text-muted-foreground">{post.category} · {post.readTime}</p>
                            </td>
                            <td className="py-2 px-2 text-right text-xs">{post.wordCount.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right text-xs">{post.internalLinks}</td>
                            <td className="py-2 px-2 text-right text-xs">{post.toolLinkCount}</td>
                            <td className="py-2 px-2 text-right text-xs">{post.viewCount.toLocaleString()}</td>
                            <td className="py-2 px-2 text-right">
                              <Badge variant="secondary" className={post.score >= 80 ? "bg-emerald-100 text-emerald-700" : post.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                                {post.score}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-xs text-muted-foreground">
                              {post.issues.length > 0 ? post.issues.slice(0, 2).join(", ") : <span className="text-emerald-600">✓ OK</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
