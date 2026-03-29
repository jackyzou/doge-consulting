"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, Search, FileCheck, Ship, Shield, Brain, Cpu, BarChart3,
  ArrowRight, Check, Globe, Zap, Bot, TrendingUp, Calculator,
  Sparkles, Code, LineChart, Rocket,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function ServicesPage() {
  const { t } = useTranslation();
  const coreServices = [
    {
      icon: Brain,
      title: "AI-Powered Sourcing Intelligence",
      description: "Our proprietary AI analyzes 50,000+ Chinese manufacturers to match you with the optimal supplier for your product, budget, and quality requirements — in minutes, not months.",
      features: ["AI supplier matching across 12 manufacturing hubs", "Automated price benchmarking against market rates", "Risk scoring and supplier vetting with NLP analysis", "Real-time factory capacity monitoring"],
      color: "text-teal", bg: "bg-teal/5",
    },
    {
      icon: Ship,
      title: "End-to-End Logistics & Freight",
      description: "LCL and FCL ocean freight from Shenzhen to US ports, with AI-optimized routing that saves 15–25% on shipping costs by dynamically selecting the best carrier and timing.",
      features: ["AI route optimization across 8 carrier partners", "Real-time vessel tracking with our Live Vessel Map", "LCL from $150/CBM · FCL from $2,500/container", "20–35 day transit with predictive ETA updates"],
      color: "text-navy", bg: "bg-navy/5",
    },
    {
      icon: FileCheck,
      title: "Customs & Tariff Optimization",
      description: "Navigate the complex 2026 tariff landscape (IEEPA + Section 301 + Section 122) with AI-driven duty classification that identifies legal savings most importers miss.",
      features: ["Automated HTS code classification (99.2% accuracy)", "Tariff engineering to minimize duty exposure", "Full export/import documentation handled", "De minimis strategy for qualifying shipments"],
      color: "text-gold", bg: "bg-gold/5",
    },
    {
      icon: Cpu,
      title: "Digital Supply Chain Platform",
      description: "One dashboard to manage your entire import operation — from purchase orders and factory communication to shipment tracking, payments, and analytics.",
      features: ["Real-time order tracking and milestone alerts", "Automated supplier communication in Mandarin", "Document management (PO, invoice, B/L, packing list)", "Cash flow and landed cost analytics"],
      color: "text-navy-light", bg: "bg-navy-light/5",
    },
    {
      icon: Bot,
      title: "AI Business Intelligence",
      description: "Our AI tools help you make smarter decisions — from product selection and market sizing to pricing strategy and demand forecasting. Turn data into profit.",
      features: ["Product trend detection from 1688/Alibaba data", "Revenue & margin modeling with our free calculators", "Competitor price monitoring and alerts", "Demand forecasting for reorder optimization"],
      color: "text-teal", bg: "bg-teal/5",
    },
    {
      icon: Code,
      title: "IT & AI Solutions for Scale",
      description: "Beyond logistics — we build custom AI and technology solutions to digitally transform your import business. From e-commerce automation to ERP integration, we're your tech partner.",
      features: ["E-commerce platform integration (Shopify, Amazon, WooCommerce)", "Custom AI chatbots for supplier negotiation", "ERP/inventory system setup and integration", "Business process automation and workflow design"],
      color: "text-navy", bg: "bg-navy/5",
    },
  ];

  const aiAdvantages = [
    {
      icon: Zap,
      stat: "10x Faster",
      title: "Supplier Discovery",
      desc: "AI scans and ranks thousands of factories in hours, not the weeks it takes with manual Alibaba searches.",
    },
    {
      icon: TrendingUp,
      stat: "15–25%",
      title: "Cost Savings",
      desc: "Dynamic freight optimization and tariff engineering consistently reduce total landed cost.",
    },
    {
      icon: LineChart,
      stat: "99.2%",
      title: "HTS Accuracy",
      desc: "AI classification matches products to the correct tariff codes, avoiding costly customs delays and penalties.",
    },
    {
      icon: Rocket,
      stat: "$3K",
      title: "Startup Capital",
      desc: "AI-guided product selection and supplier matching means anyone can start importing profitably with minimal capital.",
    },
  ];

  const freeTools = [
    { icon: Ship, name: "Live Vessel Map", href: "/tools/shipping-tracker", desc: "Real-time vessel tracking + freight rate charts" },
    { icon: Calculator, name: "Revenue Calculator", href: "/tools/revenue-calculator", desc: "Model your import profit margins and ROI" },
    { icon: Package, name: "CBM Calculator", href: "/tools/cbm-calculator", desc: "Calculate freight volume and container fit" },
    { icon: BarChart3, name: "Duty Calculator", href: "/tools/duty-calculator", desc: "Estimate 2026 import duties and tariffs" },
    { icon: Search, name: "Container Tracker", href: "/tools/vessel-tracker", desc: "Track containers and bills of lading live" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("servicesPage.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              {t("servicesPage.title")} <span className="text-teal">{t("servicesPage.titleHighlight")}</span>
              <br />{t("servicesPage.titleHighlight")}
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t("servicesPage.subtitle")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote">
                <Button size="lg" className="bg-teal text-white hover:bg-teal/90 px-8">
                  Get a Free Quote <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/tools/revenue-calculator">
                <Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 px-8">
                  <Calculator className="mr-2 h-5 w-5" /> Try Our Revenue Calculator
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Advantage Stats */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">The AI Advantage</p>
            <h2 className="mt-3 text-3xl font-bold">Why AI Changes Everything for Importers</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Traditional importing required connections, travel, and years of experience. Our AI levels the playing field
              — giving every business access to the same intelligence that only large corporations had before.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {aiAdvantages.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="text-center h-full border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal/10">
                      <item.icon className="h-6 w-6 text-teal" />
                    </div>
                    <p className="text-3xl font-bold text-teal">{item.stat}</p>
                    <p className="mt-1 font-semibold">{item.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">What We Do</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Full-Stack Import Services, <span className="text-teal">Supercharged by AI</span></h2>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl ${service.bg}`}>
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Model */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Simple Pricing</p>
            <h2 className="mt-3 text-3xl font-bold">Free to Start. Pay Only When We Ship.</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">No consulting fees. No setup costs. No minimum contracts. You only pay when we deliver results.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
              <Card className="h-full text-center border-teal/30 bg-teal/5">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10"><Globe className="h-7 w-7 text-teal" /></div>
                  <p className="text-3xl font-bold text-teal">Free</p>
                  <p className="font-semibold mt-1">Consultation & Quotes</p>
                  <ul className="mt-4 text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Expert sourcing consultation</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Detailed all-inclusive quote</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Supplier verification research</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> HS code & duty estimate</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> All AI tools — no signup needed</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card className="h-full text-center border-2 border-teal shadow-lg relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-teal text-white">Most Popular</Badge></div>
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10"><Ship className="h-7 w-7 text-teal" /></div>
                  <p className="text-3xl font-bold text-navy">All-Inclusive</p>
                  <p className="font-semibold mt-1">Sourcing + Shipping</p>
                  <ul className="mt-4 text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Factory sourcing & negotiation</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Quality inspection (free for &gt;$10K)</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Ocean freight (LCL or FCL)</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Customs clearance & duties</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Door-to-door delivery</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> 70/30 payment terms</li>
                  </ul>
                  <Link href="/quote"><Button className="mt-6 w-full bg-teal hover:bg-teal/90">Get a Quote <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card className="h-full text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-navy/10"><Cpu className="h-7 w-7 text-navy" /></div>
                  <p className="text-3xl font-bold text-navy">Custom</p>
                  <p className="font-semibold mt-1">Enterprise & IT Solutions</p>
                  <ul className="mt-4 text-sm text-muted-foreground space-y-2 text-left">
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> E-commerce integration</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Custom AI chatbot development</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> ERP / inventory setup</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Supply chain automation</li>
                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-teal mt-0.5 shrink-0" /> Dedicated account manager</li>
                  </ul>
                  <Link href="/contact"><Button variant="outline" className="mt-6 w-full">Contact Us</Button></Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Free Tools */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Free AI Tools</p>
            <h2 className="mt-3 text-3xl font-bold">Start Making Smarter Decisions Today</h2>
            <p className="mt-3 text-muted-foreground">No signup required. Use our professional-grade tools to plan your import business.</p>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {freeTools.map((tool, i) => (
              <motion.div key={tool.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={tool.href}>
                  <Card className="h-full text-center hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer border-border/50 group">
                    <CardContent className="pt-5 pb-4">
                      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 group-hover:bg-teal/20 transition-colors">
                        <tool.icon className="h-5 w-5 text-teal" />
                      </div>
                      <p className="font-semibold text-sm">{tool.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{tool.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agentware — API-Ready Tools */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <Badge className="mb-3 bg-navy/10 text-navy border-navy/20">New: Agentware</Badge>
            <h2 className="text-3xl font-bold">Agent-Ready Trade Intelligence</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Our tools aren&apos;t just for humans. Every calculator and data feed is available as a JSON API — ready for
              AI agents, automation workflows, and programmatic access. Build on top of our trade intelligence.
            </p>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-teal/20 hover:border-teal/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-teal/10 flex items-center justify-center">
                      <Code className="h-4 w-4 text-teal" />
                    </div>
                    <CardTitle className="text-base">JSON API Endpoints</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Every tool exposes a REST API. POST your parameters, get structured results back — no browser required.</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded block">POST /api/tools/revenue-calculator</code>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card className="h-full border-navy/20 hover:border-navy/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-navy/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-navy" />
                    </div>
                    <CardTitle className="text-base">SKILL.md for Agents</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Each tool comes with a SKILL.md file your AI agent can read to learn how to use it. Copilot, Claude, GPT — all compatible.</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded block">/skills/revenue-calculator.md</code>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card className="h-full border-gold/20 hover:border-gold/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-gold" />
                    </div>
                    <CardTitle className="text-base">Discovery Endpoint</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Agents discover all available tools via a single endpoint — like robots.txt, but for AI.</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded block">/.well-known/agent-tools.json</code>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className="text-center">
            <Link href="/.well-known/agent-tools.json">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Code className="h-3 w-3" /> View Agent Discovery Endpoint
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <Sparkles className="h-10 w-10 text-teal mx-auto mb-4" />
          <h2 className="text-3xl font-bold sm:text-4xl">{t("servicesPage.ctaTitle")}</h2>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            {t("servicesPage.ctaSubtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal text-white hover:bg-teal/90 px-8">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 px-8">
                Talk to a Strategist
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
