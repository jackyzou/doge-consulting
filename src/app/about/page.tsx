"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Shield, Sparkles, Users, Brain, Cpu, Globe, Target, Ship, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DogeLogo } from "@/components/ui/doge-logo";
import GlobalPresenceMap from "@/components/home/GlobalPresenceMap";
import { useTranslation } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useTranslation();
  const values = [
    { icon: Brain, title: "AI-First Thinking", desc: "We embed artificial intelligence into every step of the import process — from supplier discovery to tariff optimization — because the future of trade is algorithmic." },
    { icon: Shield, title: "Trust & Transparency", desc: "Honest pricing, clear timelines, and no hidden fees. Our digital platform gives you real-time visibility into every dollar and every milestone." },
    { icon: Users, title: "Customer Obsession", desc: "Your success is our business model. Bilingual support, dedicated account managers, and proactive communication at every step." },
    { icon: Globe, title: "Global-Local Execution", desc: "Teams in Seattle, Hong Kong, and Shenzhen operate as one unit — combining North American market insight with on-the-ground China manufacturing expertise." },
  ];

  const locations = [
    { city: "Seattle, WA", flag: "🇺🇸", role: "Customer Relations, AI/Tech & Delivery", desc: "Our US hub for customer success, technology development, last-mile logistics, and strategic consulting. Where AI meets American market needs." },
    { city: "Hong Kong SAR", flag: "🇭🇰", role: "Headquarters & Trade Operations", desc: "Registered HQ at China Resources Building, Wan Chai. International shipping, payments, contracts, and regulatory compliance." },
    { city: "Shenzhen, Guangdong", flag: "🇨🇳", role: "Sourcing, QC & Manufacturing", desc: "Deep in China's manufacturing heartland. Direct factory relationships, quality inspection teams, and production monitoring across 12 manufacturing hubs." },
  ];

  const timeline = [
    { year: "The Problem", desc: "Importing from China has always been complex — language barriers, unreliable suppliers, confusing tariffs, opaque pricing, and slow logistics. Small businesses were locked out of the $308B China-US trade corridor." },
    { year: "The Insight", desc: "We realized that AI and digital platforms could eliminate 80% of the friction in cross-border trade. The same intelligence that powers billion-dollar supply chains could be made accessible to everyone." },
    { year: "The Name", desc: "Why \"Doge\"? Like a loyal dog, we fetch what you need — reliably, tirelessly, and always coming back with exactly what you asked for. It's a nod to internet culture, but with a serious mission: we retrieve the best products from China's factories and deliver them to your door." },
    { year: "The Platform", desc: "DogeTech is our shipping technology platform built to digitally transform cross-border commerce. Sea freight sourcing is our first incubated product, but the platform powers AI supplier matching, real-time vessel tracking, customs optimization, and end-to-end supply chain visibility." },
  ];

  const mapLocations = [
    { city: "Seattle", role: "Customer Relations, AI/Tech & Delivery", flag: "🇺🇸", x: 15, y: 22 },
    { city: "Hong Kong", role: "Headquarters & Trade Operations", flag: "🇭🇰", x: 79, y: 34 },
    { city: "Shenzhen", role: "Sourcing, QC & Manufacturing", flag: "🇨🇳", x: 72, y: 24 },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)]">
      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden py-24 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(46,196,182,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <Badge className="mb-5 border-teal/30 bg-teal/15 text-teal-light">{t("about.badge")}</Badge>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-white/65">Doge Consulting Group Limited</p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                We&apos;re Building the <span className="text-teal">AI-Powered Future</span> of Global Trade
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200/95">
                Doge Consulting exists to make cross-border commerce as simple as local shopping.
                We combine deep China manufacturing expertise with artificial intelligence to help
                any business — from solo entrepreneurs to enterprises — build profitable, sustainable import operations.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/quote">
                  <Button size="lg" className="bg-teal px-7 text-white hover:bg-teal/90">
                    Get Quote <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-white/25 bg-white/10 px-7 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm hover:border-white/40 hover:bg-white/18">
                    Talk to our team
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid gap-4">
              {[
                { value: "AI + 15 Years Expertise", label: "Combining cutting-edge AI with deep China sourcing and logistics experience" },
                { value: "3 Countries, 1 Team", label: "Seattle, Hong Kong, and Shenzhen working as a single operating model" },
                { value: "$3K to Start", label: "AI-powered tools make profitable importing accessible to everyone" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-5 shadow-[0_18px_60px_rgba(15,43,70,0.22)] backdrop-blur-md">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/90">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Why We Exist</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">AI will fundamentally reshape how the world trades. We&apos;re making sure you&apos;re on the winning side.</h2>
              <p className="text-base leading-7 text-muted-foreground">The $308 billion China-to-US trade corridor has been dominated by large corporations with massive supply chain teams. We built Doge Consulting to change that — using AI to give every business the same competitive advantage.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[28px] border border-border/70 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-10">
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={item.year} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 text-teal font-bold text-sm shrink-0">
                        {i + 1}
                      </div>
                      {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-teal/20 mt-2" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-bold text-foreground text-lg">{item.year}</p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Doge Branding Story */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="rounded-[32px] border border-teal/15 bg-gradient-to-br from-teal/5 via-white to-teal/5 p-8 sm:p-12 shadow-sm">
              <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <DogeLogo size={120} className="mb-4 drop-shadow-lg" />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Meet Our Mascot</p>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Why <span className="text-teal">&ldquo;Doge&rdquo;</span>? Because We Fetch.
                  </h2>
                  <div className="space-y-3 text-base leading-7 text-muted-foreground">
                    <p>
                      Yes, we know the meme. But behind the playful name is a serious metaphor:
                      <strong className="text-foreground"> a Doge is loyal, reliable, and tireless</strong>. Tell it what you want,
                      and it fetches — no matter how far it has to go. That&apos;s exactly what we do: you tell us what product
                      you need, and we go to China&apos;s factories, source it, quality-check it, ship it, clear customs,
                      and deliver it to your door.
                    </p>
                    <p>
                      We chose this name deliberately to break from the stuffy, traditional image of freight forwarding.
                      <strong className="text-foreground"> Global trade should feel approachable, not intimidating.</strong> Our brand
                      is professional but invigorated with a new energy that makes cross-border commerce feel exciting — because it is.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[
                      { icon: Ship, label: "DogeTech Platform", desc: "Shipping tech that digitally transforms your supply chain" },
                      { icon: Brain, label: "AI-Powered", desc: "Smart sourcing, routing, and tariff optimization" },
                      { icon: Rocket, label: "Incubated Products", desc: "Sea freight is product #1 — more coming" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
                          <item.icon className="h-5 w-5 text-teal" />
                        </div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Strategic Advantage */}
      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-10 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-light">Our Strategic Advantage</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">AI + Human Expertise = Unfair Advantage</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                  Other freight forwarders move boxes. We build AI-powered systems that make your entire import business smarter, faster, and more profitable with every shipment.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { icon: Brain, title: "AI Supplier Intelligence", desc: "Machine learning analyzes 50K+ manufacturers on price, quality, reliability, and capacity to find your perfect match in minutes." },
                  { icon: Target, title: "Predictive Logistics", desc: "AI optimizes shipping routes, predicts delays, and dynamically selects carriers — saving 15–25% on freight costs." },
                  { icon: Cpu, title: "Digital Transformation", desc: "We don't just ship your products — we build the IT systems, automations, and AI tools that let you scale without scaling headcount." },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal/15 text-teal-light">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="gradient-mesh py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">What guides us</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("about.valuesTitle")} <span className="text-teal">{t("about.valuesHighlight")}</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">We believe AI should amplify human judgment, not replace it. Our values keep us grounded as we push the boundaries of what technology can do for global trade.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((val, i) => (
              <motion.div key={val.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border-border/50 bg-white/85 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10">
                      <val.icon className="h-7 w-7 text-teal" />
                    </div>
                    <h3 className="text-lg font-semibold">{val.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{val.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Our footprint</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("about.locationsTitle")} <span className="text-teal">{t("about.locationsHighlight")}</span>
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">We place teams where they can remove friction: close to customers in the US, close to trade infrastructure in Hong Kong, and close to factories in Shenzhen.</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-teal" />
                <p className="text-sm text-muted-foreground">AI + local expertise at every node in the supply chain.</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-16 overflow-hidden rounded-[30px] border border-border/70 bg-white p-3 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
            <GlobalPresenceMap locations={mapLocations} />
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {locations.map((loc, i) => (
              <motion.div key={loc.city} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="h-full border-border/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="pt-6 text-left">
                    <span className="text-5xl">{loc.flag}</span>
                    <div className="mt-5 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold">{loc.city}</h3>
                        <p className="mt-1 text-sm font-medium text-teal">{loc.role}</p>
                      </div>
                      <MapPin className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{loc.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-teal/15 bg-gradient-to-br from-navy via-navy to-navy-light px-8 py-12 text-white shadow-[0_24px_80px_rgba(15,43,70,0.22)] sm:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-light">Ready to accelerate?</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Let AI and Doge Consulting build your next competitive advantage.</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Whether you&apos;re launching your first product line, scaling an existing import business,
                  or digitally transforming your supply chain — we have the AI tools, the expertise,
                  and the on-the-ground teams to make it happen.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                <Link href="/quote">
                  <Button size="lg" className="w-full bg-teal text-white hover:bg-teal/90 lg:min-w-[220px]">
                    Get Quote <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full border-white/25 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm hover:border-white/40 hover:bg-white/18 lg:min-w-[220px]">
                    Contact our team
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
