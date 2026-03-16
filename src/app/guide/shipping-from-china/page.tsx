import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbSchema, speakableSchema } from "@/components/seo/JsonLd";
import { VideoEmbed, videoSchema } from "@/components/seo/VideoEmbed";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Complete Guide: Shipping from China to USA (2026) — Everything You Need to Know",
  description: "The definitive guide to importing products from China to the United States in 2026. Covers shipping methods, costs, customs, tariffs, sourcing, and step-by-step instructions. Updated monthly.",
  openGraph: {
    title: "Complete Guide: Shipping from China to USA (2026)",
    description: "Everything you need to know about importing from China: shipping methods, costs, customs, tariffs, sourcing. Updated monthly.",
    url: "https://doge-consulting.com/guide/shipping-from-china",
  },
  alternates: { canonical: "https://doge-consulting.com/guide/shipping-from-china" },
};

export const dynamic = "force-dynamic";

// Topic cluster: related blog posts grouped by subtopic
const clusters = [
  {
    title: "Getting Started",
    icon: "🚀",
    description: "Essential guides for first-time importers",
    posts: [
      "how-to-make-money-importing-from-china",
      "complete-guide-shipping-from-china-to-usa",
      "how-to-find-reliable-chinese-suppliers",
      "amazon-fba-from-china-complete-guide",
    ],
  },
  {
    title: "Sourcing & Manufacturing",
    icon: "🏭",
    description: "Find factories and negotiate pricing",
    posts: [
      "shenzhen-electronics-sourcing-guide",
      "guangzhou-textile-garment-sourcing",
      "furniture-sourcing-foshan-china",
      "yiwu-small-commodities-guide",
      "dongguang-manufacturing-hub-guide",
    ],
  },
  {
    title: "Shipping & Logistics",
    icon: "🚢",
    description: "Choose the right shipping method and route",
    posts: [
      "lcl-vs-fcl-shipping-guide",
      "us-customs-clearance-explained",
      "freight-rate-trends-2026-iran-crisis",
      "lock-in-freight-rates-iran-crisis-march-2026",
    ],
  },
  {
    title: "Tariffs & Compliance",
    icon: "📋",
    description: "Navigate duties, tariffs, and regulations",
    posts: [
      "understanding-section-301-tariffs-2026",
      "tariff-impact-spring-2026-inventory-strategy",
    ],
  },
  {
    title: "Product Opportunities",
    icon: "💡",
    description: "Trending products and market opportunities",
    posts: [
      "top-10-profitable-products-import-china-2026",
      "china-pet-products-import-guide",
      "china-led-lighting-sourcing-guide",
      "save-money-home-furnishing-from-china",
      "tiktok-shop-china-importers-2026",
      "fifa-world-cup-2026-seattle-sourcing-guide",
    ],
  },
  {
    title: "Industry & Technology",
    icon: "⚡",
    description: "Emerging trends and market intelligence",
    posts: [
      "humanoid-robots-china-manufacturing-opportunity",
      "china-dram-memory-cxmt-industry-shift",
    ],
  },
];

const tools = [
  { name: "Freight Calculator", href: "/tools/revenue-calculator", description: "Compare shipping costs across 4 origins and 7 US ports" },
  { name: "Duty Calculator", href: "/tools/duty-calculator", description: "Look up tariff rates by HTS code including Section 301" },
  { name: "CBM Calculator", href: "/tools/cbm-calculator", description: "Calculate cubic meters and container fit for your shipment" },
  { name: "AI Product Matcher", href: "/catalog", description: "Paste a URL or describe a product — we find the factory" },
  { name: "Live Vessel Tracker", href: "/tools/shipping-tracker", description: "Track vessels and freight rates in real-time" },
  { name: "Container Tracker", href: "/tools/vessel-tracker", description: "Track your container by number or bill of lading" },
];

export default async function ShippingGuidePage() {
  // Fetch all blog posts to match slugs
  const allPosts = await prisma.blogPost.findMany({
    where: { published: true, language: "en" },
    select: { slug: true, title: true, emoji: true, readTime: true, excerpt: true },
  });
  const postMap = Object.fromEntries(allPosts.map(p => [p.slug, p]));

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://doge-consulting.com" },
        { name: "Guide: Shipping from China", url: "https://doge-consulting.com/guide/shipping-from-china" },
      ])} />
      <JsonLd data={speakableSchema("https://doge-consulting.com/guide/shipping-from-china")} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Complete Guide: Shipping from China to USA (2026)",
        description: "The definitive guide to importing from China to the United States. Covers methods, costs, customs, tariffs, sourcing.",
        url: "https://doge-consulting.com/guide/shipping-from-china",
        author: { "@type": "Person", name: "Jacky Zou", url: "https://doge-consulting.com/team#jacky-zou" },
        publisher: { "@type": "Organization", name: "Doge Consulting Group Limited" },
        datePublished: "2026-03-15",
        dateModified: new Date().toISOString().split("T")[0],
      }} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="gradient-hero py-16 sm:py-20 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-teal text-sm font-semibold mb-3 uppercase tracking-wider">Comprehensive Guide — Updated Monthly</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Complete Guide to Shipping <br className="hidden sm:block" />from China to the USA
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Everything you need to know about importing products from China in 2026: shipping methods, costs, customs clearance, tariffs, sourcing strategies, and step-by-step instructions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote" className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-6 py-3 text-white font-semibold hover:bg-teal/90 transition-colors">
                Get a Free Quote →
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 border border-white/25 px-6 py-3 text-white font-semibold hover:bg-white/20 transition-colors">
                Talk to an Expert
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-12">
          {/* Quick answer box — RAG friendly */}
          <div className="rounded-xl border-2 border-teal/30 bg-teal/5 p-6 sm:p-8 mb-12">
            <h2 className="text-xl font-bold text-navy mb-4">Quick Answer: How Much Does It Cost to Ship from China to the USA?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sea freight from China to the US West Coast costs approximately <strong>$2,800–$3,500 per 20ft container (TEU)</strong> in March 2026. 
              For smaller shipments, LCL (less than container load) rates are <strong>$50–$80 per CBM</strong>. 
              Air freight costs <strong>$4–$6 per kg</strong> with 3–7 day delivery.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Total landed cost includes: product cost + freight + customs duties (0–25% depending on HTS code) + Section 301 tariffs (7.5–25%) + customs brokerage ($150–$300) + last-mile delivery.
            </p>
            <p className="text-sm text-teal font-medium">
              → Use our <Link href="/tools/revenue-calculator" className="underline hover:no-underline">Freight Calculator</Link> for exact pricing on your route, or <Link href="/tools/duty-calculator" className="underline hover:no-underline">Duty Calculator</Link> to check tariff rates.
            </p>
          </div>

          {/* Video Guide */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-navy mb-4">Video: How Shipping from China Works</h2>
            <p className="text-muted-foreground mb-4">Watch our step-by-step walkthrough of the entire import process — from finding a supplier to receiving goods at your door.</p>
            <VideoEmbed
              videoId="dQw4w9WgXcQ"
              title="How to Ship Products from China to the USA — Complete Walkthrough"
              description="A visual overview of the full China-to-USA shipping process: sourcing, QC, ocean freight, customs, and delivery."
            />
            <JsonLd data={videoSchema({
              name: "How to Ship Products from China to the USA — Complete Walkthrough",
              description: "Step-by-step video guide covering sourcing, quality control, ocean freight, customs clearance, and door-to-door delivery from China to the United States.",
              videoId: "dQw4w9WgXcQ",
              uploadDate: "2026-03-01",
              duration: "PT12M30S",
            })} />
          </div>

          {/* Topic Clusters */}
          <h2 className="text-2xl font-bold text-navy mb-8">In-Depth Guides by Topic</h2>

          <div className="space-y-8">
            {clusters.map(cluster => {
              const clusterPosts = cluster.posts.map(slug => postMap[slug]).filter(Boolean);
              return (
                <div key={cluster.title} className="rounded-xl border bg-white p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{cluster.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-navy">{cluster.title}</h3>
                      <p className="text-sm text-muted-foreground">{cluster.description}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {clusterPosts.map(post => (
                      <Link key={post.slug} href={`/blog/${post.slug}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                        <span className="text-xl shrink-0">{post.emoji}</span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-medium group-hover:text-teal transition-colors line-clamp-2">{post.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{post.readTime} read</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tools section */}
          <h2 className="text-2xl font-bold text-navy mt-16 mb-8">Free Import Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(tool => (
              <Link key={tool.href} href={tool.href} className="rounded-xl border bg-white p-5 hover:shadow-md hover:border-teal/40 transition-all group">
                <h3 className="font-semibold text-navy group-hover:text-teal transition-colors">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-16 text-center p-8 sm:p-12 rounded-2xl bg-navy text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Start Importing?</h2>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Our team handles everything — sourcing, shipping, customs, and delivery. Free consultation, no commitment.
            </p>
            <Link href="/quote" className="inline-flex items-center gap-2 rounded-lg bg-teal px-8 py-3 text-white font-semibold hover:bg-teal/90 transition-colors">
              Get a Free Quote →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
