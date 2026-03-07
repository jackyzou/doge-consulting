"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Shield, Ship, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import GlobalPresenceMap from "@/components/home/GlobalPresenceMap";

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    { icon: Shield, title: t("about.val1Title"), desc: t("about.val1Desc") },
    { icon: Users, title: t("about.val2Title"), desc: t("about.val2Desc") },
    { icon: Ship, title: t("about.val3Title"), desc: t("about.val3Desc") },
    { icon: MapPin, title: t("about.val4Title"), desc: t("about.val4Desc") },
  ];

  const locations = [
    { city: t("about.loc1City"), flag: "🇺🇸", role: t("about.loc1Role"), desc: t("about.loc1Desc") },
    { city: t("about.loc2City"), flag: "🇭🇰", role: t("about.loc2Role"), desc: t("about.loc2Desc") },
    { city: t("about.loc3City"), flag: "🇨🇳", role: t("about.loc3Role"), desc: t("about.loc3Desc") },
  ];

  const highlights = [
    { value: "Globally operated", label: "Across the US, Hong Kong, and Southern China" },
    { value: "End-to-end", label: "Execution from sourcing and quality control through customs and last-mile delivery" },
    { value: "Factory-direct", label: "Supplier relationships built around transparency, speed, and dependable communication" },
  ];

  const differentiators = [
    {
      title: "Cross-border coordination",
      desc: "Our Seattle, Hong Kong, and Shenzhen teams work as one operating model so decisions move quickly and customers always know the next step.",
    },
    {
      title: "Operational visibility",
      desc: "We simplify factory communication, production follow-up, freight planning, customs clearance, and local delivery into one clear customer experience.",
    },
    {
      title: "Quality with accountability",
      desc: "We combine on-the-ground sourcing relationships with practical US-market expectations, helping customers buy with more confidence and fewer surprises.",
    },
  ];

  const mapLocations = [
    { city: "Seattle", role: t("about.loc1Role"), flag: "🇺🇸", x: 15, y: 22 },
    { city: "Hong Kong", role: t("about.loc2Role"), flag: "🇭🇰", x: 79, y: 34 },
    { city: "Shenzhen", role: t("about.loc3Role"), flag: "🇨🇳", x: 72, y: 24 },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_28%,#f8fafc_100%)]">
      <section className="gradient-hero relative overflow-hidden py-24 text-white lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(46,196,182,0.18),transparent_28%)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
              <Badge className="mb-5 border-teal/30 bg-teal/15 text-teal-light">{t("about.badge")}</Badge>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-white/65">Doge Consulting Group Limited</p>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{t("about.title")}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200/95">{t("about.subtitle")}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/quote">
                  <Button size="lg" className="bg-teal px-7 text-white hover:bg-teal/90">
                    Get Quote
                    <ArrowRight className="h-5 w-5" />
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
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/12 bg-white/10 p-5 shadow-[0_18px_60px_rgba(15,43,70,0.22)] backdrop-blur-md">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200/90">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Who we are</p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">A cross-border sourcing and shipping partner built for execution.</h2>
              <p className="text-base leading-7 text-muted-foreground">We combine local market understanding in North America with on-the-ground execution in Greater China, helping customers move from idea to delivery with fewer handoffs and more visibility.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[28px] border border-border/70 bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)] sm:p-10">
              <div className="space-y-5 text-base leading-8 text-muted-foreground">
                <p><span className="font-semibold text-foreground">{t("about.storyP1a")}</span>{t("about.storyP1b")}</p>
                <p>{t("about.storyP2")}</p>
                <p>{t("about.storyP3")}</p>
                <p>{t("about.storyP4")}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-slate-950 px-6 py-10 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:px-10 lg:px-12">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-light">How we work</p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">One operating model across sourcing, freight, customs, and delivery.</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">This layout takes cues from premium consulting-firm overview pages: stronger hierarchy, stat-led framing, and cleaner capability storytelling without losing Doge Consulting’s operational focus.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {differentiators.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal/15 text-teal-light">
                      <CheckCircle2 className="h-5 w-5" />
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

      <section className="gradient-mesh py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">What guides us</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t("about.valuesTitle")} <span className="text-teal">{t("about.valuesHighlight")}</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">Clear values make cross-border operations more dependable. We use them to shape communication, decision making, and customer experience from the first inquiry through final delivery.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
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
                <p className="text-sm text-muted-foreground">Built to bridge manufacturing insight with North American execution.</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 overflow-hidden rounded-[30px] border border-border/70 bg-white p-3 shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
          >
            <GlobalPresenceMap locations={mapLocations} />
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
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

      <section className="pb-24 pt-4">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-teal/15 bg-gradient-to-br from-navy via-navy to-navy-light px-8 py-12 text-white shadow-[0_24px_80px_rgba(15,43,70,0.22)] sm:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-light">Let’s build your supply chain advantage</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">If you need a partner who can source, coordinate, and deliver, we’re ready.</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Whether you are furnishing a home, launching a product line, or scaling repeat imports, Doge Consulting can help you move faster with more confidence.</p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
                <Link href="/quote">
                  <Button size="lg" className="w-full bg-teal text-white hover:bg-teal/90 lg:min-w-[220px]">
                    Get Quote
                    <ArrowRight className="h-5 w-5" />
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
