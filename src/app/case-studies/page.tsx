import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Quote, TrendingUp, Package, DollarSign, Clock, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies | Doge Consulting",
  description: "See how our customers saved 40-60% on premium products shipped from China to the USA.",
};

const caseStudies = [
  {
    id: "michael-living-room",
    icon: "🪑",
    title: "Complete Living Room Set — $8,000 Saved",
    customer: "Michael Zhang",
    location: "Seattle, WA",
    category: "Furniture",
    summary: "Shipped a marble dining table, custom sofa, and TV console from Shenzhen to Seattle.",
    challenge: "Michael wanted high-end Italian-style marble furniture for his new home, but local retailers quoted $15,000+ for the set. The pieces were heavy (over 500kg total) and fragile.",
    solution: "We sourced directly from a verified Foshan marble factory, conducted a video inspection of each piece, and arranged professional crating with custom foam inserts. Shipped via LCL sea freight to Seattle with door-to-door delivery.",
    results: [
      { label: "Total Cost", value: "$6,800", sublabel: "vs $15,000 local" },
      { label: "Saved", value: "$8,200", sublabel: "55% savings" },
      { label: "Transit", value: "6 weeks", sublabel: "door-to-door" },
      { label: "Damage", value: "Zero", sublabel: "professional packing" },
    ],
    quote: "The marble table is even more stunning than what I saw at the furniture showroom. And I saved over $8,000. The whole process was seamless — Doge handled everything from sourcing to delivery.",
  },
  {
    id: "emily-full-home",
    icon: "🏠",
    title: "Full Home Furnishing — 12 Pieces, One Shipment",
    customer: "Emily Wang",
    location: "Bellevue, WA",
    category: "Home Goods",
    summary: "Furnished an entire new home with 12 pieces sourced from multiple Chinese factories.",
    challenge: "As a first-time homeowner, Emily needed to furnish every room but faced overwhelming costs. She wanted a coordinated look across bedroom, living room, and dining room — from different manufacturers.",
    solution: "We coordinated sourcing from 4 different factories across Guangdong province, consolidated everything into one shipment at our Hong Kong hub, and delivered to her door in Bellevue.",
    results: [
      { label: "Pieces", value: "12", sublabel: "4 factories" },
      { label: "Total Cost", value: "$9,500", sublabel: "vs $22,000 local" },
      { label: "Saved", value: "$12,500", sublabel: "57% savings" },
      { label: "Transit", value: "7 weeks", sublabel: "consolidated" },
    ],
    quote: "Furnishing was overwhelming and expensive until I found Doge Consulting. They sourced everything from Shenzhen and delivered it to my door in Bellevue. Couldn't be happier!",
  },
  {
    id: "david-bedroom",
    icon: "🛏️",
    title: "Custom Wardrobe + Bedroom Set — Zero Damage",
    customer: "David Chen",
    location: "Redmond, WA",
    category: "Custom Furniture",
    summary: "Custom-built wardrobe with specific dimensions, plus a complete bedroom set.",
    challenge: "David needed a wardrobe built to exact specifications (247cm × 180cm × 60cm) to fit a specific alcove. No local retailer offered custom sizing at a reasonable price.",
    solution: "We connected David with a custom furniture manufacturer in Dongguan, facilitated design revisions via video calls, and arranged quality inspection photos at every stage. The wardrobe was packed in a custom wooden crate for safe ocean transit.",
    results: [
      { label: "Custom Pieces", value: "4", sublabel: "exact specs" },
      { label: "Total Cost", value: "$4,200", sublabel: "vs $9,800 local" },
      { label: "Saved", value: "$5,600", sublabel: "57% savings" },
      { label: "Quality", value: "A+", sublabel: "photo inspected" },
    ],
    quote: "The tracking system kept me updated every step of the way. When my wardrobe arrived, it was perfectly packed with zero damage. It fits the alcove perfectly — to the centimeter.",
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Success Stories</Badge>
          <h1 className="text-4xl font-bold mb-4">Customer Case Studies</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Real customers, real savings. See how businesses and homeowners save 40-60%
            on premium products shipped from China to the USA.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {caseStudies.map((study, i) => (
          <Card key={study.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-4xl">{study.icon}</span>
                  <div>
                    <Badge className="mb-2">{study.category}</Badge>
                    <h2 className="text-2xl font-bold">{study.title}</h2>
                    <p className="text-muted-foreground">{study.customer} · {study.location}</p>
                  </div>
                </div>

                <p className="text-lg text-muted-foreground mb-6">{study.summary}</p>

                {/* Challenge & Solution */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                    <h3 className="font-semibold text-red-800 mb-2">🔴 Challenge</h3>
                    <p className="text-sm text-red-700">{study.challenge}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Our Solution</h3>
                    <p className="text-sm text-green-700">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {study.results.map((r) => (
                    <div key={r.label} className="text-center p-4 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-teal">{r.value}</p>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.sublabel}</p>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="border-l-4 border-teal pl-4 italic text-muted-foreground">
                  <Quote className="h-5 w-5 text-teal mb-2" />
                  &ldquo;{study.quote}&rdquo;
                  <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                    — {study.customer}, {study.location}
                  </footer>
                </blockquote>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* CTA */}
        <div className="text-center p-12 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-3xl font-bold mb-4">Ready to Be Our Next Success Story?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join hundreds of happy customers who saved big on premium products from China.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal hover:bg-teal/90">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Talk to Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
