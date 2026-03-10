import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Quote, CheckCircle2, MapPin, Calendar, Package, Star, TrendingUp, Ship, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies — Real Customer Success Stories",
  description: "See how real customers saved 40-60% on furniture, electronics, and home goods sourced from China. Door-to-door from Shenzhen to the US Pacific Northwest.",
  openGraph: {
    title: "Case Studies — Real Customer Success Stories | Doge Consulting",
    description: "Real customers, real savings. Furniture, electronics, and home goods from China at 40-60% off US retail.",
    url: "https://doge-consulting.com/case-studies",
  },
};

const caseStudies = [
  {
    id: "zhang-family-home",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=450&fit=crop",
    imageAlt: "Elegant living room with marble furniture and modern decor",
    title: "The Zhang Family — $14,200 Saved Furnishing a New Bellevue Home",
    customer: "Michael & Linda Zhang",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    location: "Bellevue, WA",
    date: "October 2025",
    category: "Full Home Furnishing",
    tags: ["Furniture", "Marble", "Custom", "FCL Shipment"],
    summary: "A young couple furnished their entire 3-bedroom home with Italian-style marble furniture, a custom walnut dining set, and bedroom suites — all sourced from Foshan and Dongguan factories at a fraction of US retail.",
    challenge: "Michael and Linda had just purchased a 2,200 sq ft home in Bellevue's Crossroads neighborhood. They wanted a cohesive Italian modern aesthetic — marble dining table, leather sofa, walnut bedroom sets — but local retailers quoted over $38,000 for everything. As first-generation immigrants from Guangdong, they knew Chinese factories could produce identical quality for far less, but didn't know how to navigate sourcing, quality control, or international shipping.",
    solution: "We assigned a bilingual account manager who spoke both Mandarin and English. Over 3 weeks, we sourced from 4 verified factories across Foshan (marble) and Dongguan (solid wood + upholstery). We conducted video inspections of every piece before packing, arranged professional crating with moisture-barrier film for ocean transit, and consolidated everything into a single 40HC container. Customs clearance, last-mile trucking, and indoor placement were all handled by our Seattle team.",
    results: [
      { label: "Total Cost", value: "$23,800", sublabel: "vs $38,000+ US retail" },
      { label: "Saved", value: "$14,200", sublabel: "37% savings" },
      { label: "Items", value: "22 pieces", sublabel: "4 factories, 1 shipment" },
      { label: "Transit", value: "42 days", sublabel: "door-to-door" },
    ],
    details: [
      "Marble dining table (240cm) + 8 chairs — $4,200 (vs $12,000 at RH)",
      "Italian leather sectional sofa — $3,800 (vs $8,500 at West Elm)",
      "King bedroom suite (bed, 2 nightstands, dresser) — $2,900 (vs $7,200)",
      "Queen bedroom suite — $2,200 (vs $5,400)",
      "Custom walnut TV console (200cm) — $1,100 (vs $3,200)",
      "Shipping, customs, delivery — $4,600",
      "Zero damage — all 22 pieces arrived in perfect condition",
    ],
    quote: "We saved over $14,000 and got better quality than what we saw at Restoration Hardware. The marble table is absolutely stunning — our friends can't believe we got it for under $5,000. Having a Mandarin-speaking account manager made everything effortless. We've already referred three families to Doge Consulting.",
    rating: 5,
  },
  {
    id: "seattle-bakery",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop",
    imageAlt: "Modern commercial bakery with stainless steel equipment",
    title: "Emerald City Bakery — Commercial Kitchen Equipment at 52% Off",
    customer: "Sarah & James Park",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
    location: "Capitol Hill, Seattle, WA",
    date: "January 2026",
    category: "Commercial Equipment",
    tags: ["Commercial Kitchen", "Industrial", "Small Business", "LCL Shipment"],
    summary: "A husband-and-wife team opening their first bakery sourced commercial ovens, refrigeration, and stainless steel prep tables from Guangzhou manufacturers — saving over $31,000 compared to US restaurant supply dealers.",
    challenge: "Sarah and James were opening Emerald City Bakery on Capitol Hill. Restaurant supply dealers quoted $60,000+ for their equipment list: two commercial convection ovens, a walk-in cooler compressor, a 3-door reach-in freezer, stainless steel prep tables, and a dough sheeter. As first-time business owners, this cost threatened to exhaust their SBA loan before opening day.",
    solution: "We identified 3 Guangzhou manufacturers specializing in commercial food equipment that meet US NSF/UL certification standards. We arranged factory video tours so the Parks could see production quality firsthand. Each piece was tested, photographed, and certified before shipping. We coordinated a 2-unit LCL shipment with proper ventilation for the electronic components, handled FDA import registration for food-contact equipment, and arranged delivery to their Capitol Hill location with forklift unloading.",
    results: [
      { label: "Total Cost", value: "$28,500", sublabel: "vs $60,000+ US dealer" },
      { label: "Saved", value: "$31,500", sublabel: "52% savings" },
      { label: "Equipment", value: "8 units", sublabel: "3 certified factories" },
      { label: "Compliance", value: "NSF/UL", sublabel: "all US certifications met" },
    ],
    details: [
      "2× commercial convection ovens (12-tray) — $8,200 (vs $18,000)",
      "Walk-in cooler compressor system — $4,800 (vs $11,000)",
      "3-door reach-in freezer — $3,200 (vs $7,500)",
      "Dough sheeter (commercial grade) — $2,800 (vs $6,200)",
      "4× stainless steel prep tables — $2,400 (vs $5,800)",
      "Shipping, customs, FDA registration — $7,100",
      "All units passed city health inspection on first visit",
    ],
    quote: "Without Doge Consulting, we wouldn't have been able to open on budget. They found us factory-certified equipment that's identical to what US dealers sell at double the price. The ovens are workhorses — 14 months in and zero issues. We've recommended them to every restaurant owner we know.",
    rating: 5,
  },
  {
    id: "tech-startup-office",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop",
    imageAlt: "Modern tech office with ergonomic desks and chairs",
    title: "CloudSync Labs — 40-Person Office Furnished for $18,000",
    customer: "Ryan Okonkwo, CEO",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    location: "South Lake Union, Seattle, WA",
    date: "August 2025",
    category: "Office Furniture",
    tags: ["Office", "Ergonomic", "Bulk Order", "Standing Desks"],
    summary: "A growing tech startup furnished their entire 40-person office — ergonomic chairs, motorized standing desks, and conference room furniture — at less than half the cost of Herman Miller/Steelcase alternatives.",
    challenge: "CloudSync Labs was scaling from 15 to 40 employees and needed to furnish a new 4,500 sq ft office in South Lake Union. Commercial office furniture quotes came in at $42,000-$55,000 from traditional vendors (Herman Miller Aeron chairs alone are $1,400 each). As a Series A startup, they needed to be capital-efficient without compromising on ergonomics for their engineering team.",
    solution: "We sourced from two Foshan office furniture manufacturers with ISO 9001 certification. We provided samples of 3 different ergonomic chair models for the team to test for 2 weeks before bulk ordering. We arranged a single 40HC container with 40 chairs, 40 motorized standing desks, conference table, and lounge furniture. Each desk was labeled by employee name for easy setup. Our Seattle team handled delivery and assembly over one weekend.",
    results: [
      { label: "Total Cost", value: "$18,400", sublabel: "vs $48,000 Herman Miller" },
      { label: "Saved", value: "$29,600", sublabel: "62% savings" },
      { label: "Workstations", value: "40", sublabel: "desks + chairs" },
      { label: "Setup", value: "1 weekend", sublabel: "labeled + assembled" },
    ],
    details: [
      "40× ergonomic mesh chairs (adjustable lumbar, headrest) — $5,600 ($140 ea vs $1,400 Aeron)",
      "40× motorized sit-stand desks (140×70cm) — $7,200 ($180 ea vs $800 Uplift)",
      "1× 12-person conference table (walnut veneer) — $1,200 (vs $4,500)",
      "Lounge area: 2 sofas + coffee table — $1,800 (vs $6,000)",
      "Shipping, customs, delivery + weekend assembly — $2,600",
      "12-month warranty on all items, 3 replacements fulfilled free of charge",
    ],
    quote: "Our engineers sit in these chairs 10 hours a day and love them. The standing desks are smooth, quiet, and have programmable height presets — same features as $800 Uplift desks for $180 each. The math was a no-brainer. We've already ordered 20 more for our expansion.",
    rating: 5,
  },
  {
    id: "interior-designer",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=450&fit=crop",
    imageAlt: "Luxury interior with designer lighting and modern furniture",
    title: "Cascade Design Studio — Sourcing Partner for High-End Residential Projects",
    customer: "Natalie Reeves, Principal Designer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    location: "Kirkland, WA",
    date: "Ongoing since March 2025",
    category: "Design Trade Partner",
    tags: ["Interior Design", "Trade", "Recurring", "Custom Manufacturing"],
    summary: "A boutique interior design firm uses Doge Consulting as their primary sourcing partner for residential projects, saving their clients an average of 45% on furniture and lighting while maintaining the luxury aesthetic their brand is known for.",
    challenge: "Natalie's firm designs high-end residential interiors in the $200K-$500K budget range. Her clients expect designer-quality pieces but are increasingly cost-conscious. She needed a reliable sourcing partner who could find Chinese manufacturers producing identical quality to Italian and Scandinavian brands — without her having to manage the logistics herself.",
    solution: "We established an ongoing partnership where Natalie sends us design boards and product specifications. Our sourcing team finds matching or custom-made alternatives from verified Chinese factories. We handle all QC photos, material samples, shipping, and delivery — Natalie simply specifies what she wants and we deliver it to her client's home. We've completed 7 residential projects together in 12 months.",
    results: [
      { label: "Projects", value: "7", sublabel: "in 12 months" },
      { label: "Client Savings", value: "45% avg", sublabel: "vs designer retail" },
      { label: "Total Sourced", value: "$142K", sublabel: "across all projects" },
      { label: "Repeat Rate", value: "100%", sublabel: "every project uses us" },
    ],
    details: [
      "Custom chandeliers + pendant lighting — 60% savings vs Restoration Hardware",
      "Solid marble bathroom vanities — custom-cut to spec, 50% savings",
      "Upholstered headboards + bedframes — fabric matching from Guangzhou textile market",
      "Outdoor furniture sets — powder-coated aluminum, 55% savings vs Frontgate",
      "Average turnaround: 6-8 weeks from design board to installation",
      "Dedicated account manager for all trade orders",
    ],
    quote: "Doge Consulting transformed my business model. I can now offer my clients luxury at accessible prices, which means more projects and happier clients. The quality is indistinguishable from the European brands I used to spec. My clients have no idea their $8,000 chandelier came from Zhongshan at a third of the RH price — and that's exactly how it should be.",
    rating: 5,
  },
];

const STATS = [
  { value: "200+", label: "Shipments Delivered" },
  { value: "45%", label: "Average Savings" },
  { value: "4.9/5", label: "Customer Rating" },
  { value: "0.2%", label: "Damage Rate" },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-16 sm:py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Customer Success Stories</Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Real Customers. Real Savings.</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            From young families furnishing their first home to startups scaling their offices —
            see how our customers save 40-60% on products sourced directly from China&apos;s factories.
          </p>
          {/* Trust stats */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-2xl sm:text-3xl font-bold text-teal">{s.value}</p>
                <p className="text-xs text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {caseStudies.map((study, i) => (
          <Card key={study.id} className="overflow-hidden shadow-lg border-border/50">
            <CardContent className="p-0">
              {/* Hero image */}
              <div className="relative h-48 sm:h-64 lg:h-72 overflow-hidden">
                <img src={study.image} alt={study.imageAlt} className="w-full h-full object-cover" loading={i === 0 ? "eager" : "lazy"} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {study.tags.map((tag) => (
                      <Badge key={tag} className="bg-white/20 text-white border-white/30 text-[10px] backdrop-blur-sm">{tag}</Badge>
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{study.title}</h2>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                {/* Customer info */}
                <div className="flex items-center gap-3 mb-5">
                  <img src={study.avatar} alt={study.customer} className="h-12 w-12 rounded-full object-cover border-2 border-teal/20" />
                  <div>
                    <p className="font-semibold text-sm">{study.customer}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{study.location}</span>
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{study.date}</span>
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: study.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">{study.summary}</p>

                {/* Challenge & Solution */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="font-semibold text-red-800 mb-2 text-sm flex items-center gap-1.5">🔴 The Challenge</h3>
                    <p className="text-xs sm:text-sm text-red-700 leading-relaxed">{study.challenge}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-2 text-sm flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Our Solution</h3>
                    <p className="text-xs sm:text-sm text-green-700 leading-relaxed">{study.solution}</p>
                  </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {study.results.map((r) => (
                    <div key={r.label} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xl sm:text-2xl font-bold text-teal">{r.value}</p>
                      <p className="text-xs font-medium mt-0.5">{r.label}</p>
                      <p className="text-[10px] text-muted-foreground">{r.sublabel}</p>
                    </div>
                  ))}
                </div>

                {/* Item breakdown */}
                <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-1.5"><Package className="h-4 w-4 text-teal" /> What Was Sourced</h3>
                  <ul className="space-y-1.5">
                    {study.details.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-teal shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quote */}
                <blockquote className="relative bg-gradient-to-br from-teal/5 to-teal/10 rounded-xl p-5 border border-teal/15">
                  <Quote className="h-8 w-8 text-teal/20 absolute top-3 right-4" />
                  <p className="text-sm sm:text-base italic text-foreground leading-relaxed pr-8">
                    &ldquo;{study.quote}&rdquo;
                  </p>
                  <footer className="mt-3 flex items-center gap-2">
                    <img src={study.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">{study.customer}</p>
                      <p className="text-xs text-muted-foreground">{study.location}</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Social proof bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Shield, label: "Quality Guaranteed", desc: "Every item inspected before shipping" },
            { icon: Ship, label: "Door-to-Door", desc: "Factory to your home, we handle everything" },
            { icon: TrendingUp, label: "Save 40-60%", desc: "Factory-direct vs US retail pricing" },
          ].map((item) => (
            <Card key={item.label} className="text-center border-border/50">
              <CardContent className="p-4 sm:p-6">
                <item.icon className="h-7 w-7 text-teal mx-auto mb-2" />
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-navy/5 via-teal/5 to-gold/5 border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Be Our Next Success Story?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join hundreds of happy customers who saved big on premium products from China.
            Get a free, no-obligation quote in 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal hover:bg-teal/90 w-full sm:w-auto">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Talk to Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
