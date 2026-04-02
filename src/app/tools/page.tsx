import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Package, Ship, Globe, Box, DollarSign, Search, Container, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Import & Shipping Tools | Doge Consulting",
  description: "Free tools for importers: AI Product Matcher, Freight Rate Calculator, CBM Calculator, Duty Calculator, Revenue Calculator, 3D Room Visualizer, Live Vessel Tracker, Container Tracker, and Shipping Tracker. No signup required.",
  openGraph: {
    title: "Free Import & Shipping Tools | Doge Consulting",
    description: "8 free tools to help you import from China to the USA. Calculate costs, track shipments, and visualize products — all without signing up.",
    url: "https://doge-consulting.com/tools",
  },
  alternates: { canonical: "https://doge-consulting.com/tools" },
};

const tools = [
  {
    name: "AI Product Matcher",
    description: "Find any product at China factory-direct prices with AI. Paste a link, upload a photo, or describe what you need.",
    href: "/tools/product-matcher",
    icon: Sparkles,
    color: "bg-teal/10 text-teal",
    tag: "AI Powered",
  },
  {
    name: "Freight Rate Calculator",
    description: "Compare real-time freight rates from Shenzhen, Shanghai, Guangzhou, and Hong Kong to 7 US ports. Sea freight, air freight, and express shipping.",
    href: "/tools/revenue-calculator",
    icon: DollarSign,
    color: "bg-teal/10 text-teal",
    tag: "Most Popular",
  },
  {
    name: "CBM Calculator",
    description: "Calculate cubic meter volume for your shipments. Supports multiple packages, different units, and tells you if you need LCL or FCL shipping.",
    href: "/tools/cbm-calculator",
    icon: Box,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    name: "Duty & Tariff Calculator",
    description: "Look up US import duty rates by HTS code or product description. Includes Section 301 surcharges and de minimis thresholds.",
    href: "/tools/duty-calculator",
    icon: Calculator,
    color: "bg-gold/10 text-gold",
  },
  {
    name: "Revenue Calculator",
    description: "Project your import business revenue. Input product costs, shipping, duties, and selling price to see margins and break-even quantities.",
    href: "/tools/revenue-calculator",
    icon: DollarSign,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    name: "3D Room Visualizer",
    description: "See furniture in your space before you order. Drag and drop Chinese-sourced furniture into a 3D room to plan layouts and confirm dimensions.",
    href: "/tools/3d-visualizer",
    icon: Package,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    name: "Live Vessel Tracker",
    description: "Track cargo vessels in real time on a global map. See vessel positions, routes, ETAs, and port calls for ships carrying your goods.",
    href: "/tools/vessel-tracker",
    icon: Ship,
    color: "bg-navy-light/10 text-navy-light",
    tag: "Live Data",
  },
  {
    name: "Container Tracker",
    description: "Enter your container number to see exactly where your shipment is. Real-time tracking with vessel name, current port, and estimated arrival.",
    href: "/tools/shipping-tracker",
    icon: Container,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    name: "Shipping Route Tracker",
    description: "Track shipping routes and transit times from China to the USA. Compare different ports and see estimated delivery windows.",
    href: "/track",
    icon: Globe,
    color: "bg-indigo-500/10 text-indigo-500",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white py-16 sm:py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
            9 Free Tools · No Signup Required
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Free Import & Shipping <span className="text-teal">Tools</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Calculate shipping costs, look up tariff rates, track your containers, and visualize products — 
            all free, all instant, no account needed.
          </p>
        </div>
      </section>

      {/* Tool Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href + tool.name}
              href={tool.href}
              className="group relative rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-teal/40 hover:-translate-y-1"
            >
              {tool.tag && (
                <span className="absolute top-4 right-4 rounded-full bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">
                  {tool.tag}
                </span>
              )}
              <div className={`inline-flex items-center justify-center rounded-lg p-3 ${tool.color} mb-4`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-navy mb-2 group-hover:text-teal transition-colors">
                {tool.name}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
              <div className="mt-4 text-sm font-medium text-teal opacity-0 group-hover:opacity-100 transition-opacity">
                Try it free →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16 text-center">
        <div className="rounded-2xl bg-navy p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-white mb-3">Need a Custom Quote?</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Our tools give you estimates. For an exact landed cost with real carrier rates, customs duties, and door-to-door delivery — get a free quote from our team.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 text-white font-semibold hover:bg-teal/90 transition-colors"
          >
            Get a Free Quote
            <Search className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
