import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";

// Blog post content (in production, this would come from a CMS or MDX)
const POSTS: Record<string, { title: string; category: string; date: string; readTime: string; emoji: string; content: string }> = {
  "complete-guide-shipping-from-china-to-usa": {
    title: "The Complete Guide to Shipping Products from China to the USA in 2026",
    category: "Import Guide",
    date: "2026-03-01",
    readTime: "12 min",
    emoji: "🚢",
    content: `
## Why Ship from China?

China remains the world's largest manufacturing economy, producing everything from furniture and electronics to textiles and industrial equipment. For US businesses and consumers, importing directly from Chinese manufacturers can mean **40-60% savings** compared to buying from domestic retailers or distributors.

## Step 1: Find Your Supplier

The first step is identifying reliable manufacturers. Key sourcing hubs include:

- **Shenzhen & Dongguan** — Electronics, furniture, hardware
- **Foshan** — Ceramics, marble, high-end furniture
- **Yiwu** — Small commodities, household goods
- **Guangzhou** — Textiles, fashion, general merchandise

We recommend working with a sourcing agent (like Doge Consulting) who can vet factories, negotiate pricing, and conduct quality inspections on your behalf.

## Step 2: Choose Your Shipping Method

### LCL (Less than Container Load)
Best for: Shipments under 15 CBM (~300-500 kg minimum)
- Share container space with other shippers
- Pay per CBM or weight (whichever is greater)
- Typical cost: $80-$200 per CBM
- Transit: 25-40 days ocean

### FCL (Full Container Load)
Best for: Large shipments filling at least half a container
- 20ft container: ~33 CBM, ~28,000 kg max
- 40ft container: ~67 CBM, ~28,000 kg max
- Typical cost: $2,000-$5,000 per container
- Transit: 20-35 days ocean

## Step 3: Understand Customs & Duties

Every import into the US requires customs clearance. Key components:

1. **ISF Filing** — Must be submitted 24 hours before vessel departure
2. **HTS Classification** — Determines your duty rate
3. **Base Duty** — Varies by product (0% for most furniture and electronics, up to 32% for textiles)
4. **Section 301 Tariffs** — Additional 25% on most Chinese goods
5. **MPF** — 0.3464% of value ($31.67 minimum, $614.35 maximum)
6. **Harbor Maintenance Tax** — 0.125% of value

## Step 4: Track Your Shipment

Modern freight tracking provides visibility at every stage:
- Factory pickup and warehouse receipt
- Port of departure and vessel loading
- Transshipment (if applicable)
- Arrival at US port
- Customs clearance
- Last-mile delivery to your door

## Step 5: Receive & Inspect

Upon delivery, inspect all items immediately:
- Check for damage (photograph everything)
- Verify quantities match your order
- File any claims within the specified window

## Need Help?

At Doge Consulting, we handle every step of this process — from sourcing to delivery. Get a free quote and let us do the heavy lifting.
    `,
  },
  "lcl-vs-fcl-which-to-choose": {
    title: "LCL vs FCL: Which Shipping Method Should You Choose?",
    category: "Shipping Tips",
    date: "2026-02-25",
    readTime: "8 min",
    emoji: "📦",
    content: `
## The Two Main Shipping Methods

When shipping goods from China via ocean freight, you have two primary options: **LCL** (Less than Container Load) and **FCL** (Full Container Load).

## LCL — Share a Container

**Best for:** Small to medium shipments (1-15 CBM)

With LCL, your cargo is consolidated with shipments from other importers in a shared container. You only pay for the space you use.

### Pros:
- Lower minimum commitment
- Pay only for your space
- Good for testing new products
- Suitable for regular small orders

### Cons:
- Higher per-CBM rate
- Longer handling time (consolidation/deconsolidation)
- More handling = slightly higher damage risk
- Potential delays from other shippers

**Typical cost:** $80-$200 per CBM (depending on destination zone)

## FCL — Your Own Container

**Best for:** Large shipments (15+ CBM or heavy cargo)

With FCL, you rent an entire container. Common sizes:

| Container | Volume | Max Weight | Typical Cost |
|-----------|--------|------------|--------------|
| 20ft | 33 CBM | 28,000 kg | $2,000-$3,500 |
| 40ft | 67 CBM | 28,000 kg | $3,000-$5,000 |
| 40ft HC | 76 CBM | 28,000 kg | $3,500-$5,500 |

### Pros:
- Lower per-CBM cost
- Faster transit (no consolidation)
- Less handling = lower damage risk
- You control the packing arrangement

### Cons:
- Higher minimum cost
- You pay for the full container even if not full
- Need sufficient volume to justify

## The Breakeven Point

Generally, **FCL becomes cheaper than LCL at around 15 CBM** (about half a 20ft container). Here's a rough comparison:

| Volume | LCL Cost | FCL 20ft Cost | Winner |
|--------|----------|---------------|--------|
| 5 CBM | $750 | $2,500 | LCL |
| 10 CBM | $1,500 | $2,500 | LCL |
| 15 CBM | $2,250 | $2,500 | Roughly equal |
| 20 CBM | $3,000 | $2,500 | FCL |
| 30 CBM | $4,500 | $2,500 | FCL |

## Our Recommendation

If you're unsure, start with LCL for your first shipment to test the process. Once you're importing regularly or have enough volume, switch to FCL for better economics.

At Doge Consulting, we offer both options and will recommend the most cost-effective method for your specific shipment.
    `,
  },
};

// Generate static params for known slugs
export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Doge Consulting Blog`,
    description: post.content.slice(0, 160).replace(/[#*\n]/g, " ").trim(),
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) notFound();

  // Simple markdown-to-HTML (tables, headers, bold, lists)
  const html = post.content
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '<p class="mb-4 text-muted-foreground leading-relaxed">')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => c.match(/^[-]+$/))) return "";
      const tag = cells.length > 0 ? "td" : "td";
      return `<tr>${cells.map((c) => `<${tag} class="border px-3 py-2 text-sm">${c}</${tag}>`).join("")}</tr>`;
    });

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
            <span className="flex items-center gap-1"><User className="h-4 w-4" />Doge Consulting Team</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime} read</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12">
        <Card>
          <CardContent className="p-8 sm:p-12">
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Need Help With Your Import?</h2>
          <p className="text-muted-foreground mb-6">
            Our team handles everything — sourcing, shipping, customs, and delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal hover:bg-teal/90">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/tools/duty-calculator">
              <Button size="lg" variant="outline">
                Try Duty Calculator
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
