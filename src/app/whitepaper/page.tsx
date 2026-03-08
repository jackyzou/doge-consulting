"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Download, Lock, CheckCircle, ArrowRight, BookOpen, DollarSign, Globe, Ship, TrendingUp, Users, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const CHAPTERS = [
  { icon: Globe, title: "Why China? The $3.7 Trillion Manufacturing Powerhouse", desc: "China produces 28% of global manufactured goods. Learn why the cost advantage persists and how to leverage it." },
  { icon: DollarSign, title: "The Money: 3-6x Markups From Factory to Retail", desc: "Real price comparisons across 15 product categories. Factory costs vs US retail — the margins will surprise you." },
  { icon: TrendingUp, title: "3 Business Models That Generate $10K-$100K/Month", desc: "Amazon FBA, direct-to-consumer, and wholesale distribution. Startup costs, expected margins, and scaling roadmaps." },
  { icon: Ship, title: "The Complete Logistics Chain: Factory to Doorstep", desc: "12-step journey from Chinese factory to US consumer. Shipping methods, timelines, and cost breakdowns." },
  { icon: BookOpen, title: "Customs Demystified: Duties, Tariffs, and Compliance", desc: "HTS codes, Section 301 tariffs, ISF filing, customs bonds — everything explained in plain English." },
  { icon: Users, title: "Manufacturing Hub Directory: Which City Makes What", desc: "Shenzhen (electronics), Foshan (furniture), Yiwu (small goods), Dongguan (OEM/ODM), and 10 more cities mapped." },
];

export default function WhitepaperPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "unlocked" | "error">("idle");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user) {
        setEmail((currentEmail) => currentEmail || data.user.email || "");
        setName((currentName) => currentName || data.user.name || "");
      }
    }).catch(() => {});
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const whitepaperRes = await fetch("/api/whitepaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!whitepaperRes.ok) {
        throw new Error("Failed to unlock whitepaper");
      }

      // Try to create account if name provided
      if (name) {
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password: Math.random().toString(36).slice(2) + "Aa1!", name }),
        });
        if (signupRes.ok) {
          window.dispatchEvent(new Event("auth-changed"));
        }
      }

      setStatus("unlocked");
    } catch {
      setDownloadUrl("");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Badge className="mb-4 bg-gold/20 text-gold border-gold/30">{t("whitepaperPage.badge")}</Badge>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {t("whitepaperPage.title")}
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                {t("whitepaperPage.desc")}
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                {["Factory prices revealed", "3 business models", "15 product categories", "City-by-city guide", "Customs walkthrough", "Profit calculators"].map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1">
                    <CheckCircle className="h-3 w-3 text-teal" /> {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-white text-foreground shadow-2xl">
                <CardContent className="p-6">
                  {status === "unlocked" ? (
                    <div className="text-center py-6">
                      <CheckCircle className="h-16 w-16 text-teal mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">{t("whitepaperPage.unlocked")} 🎉</h3>
                      <p className="text-muted-foreground mb-4">We&apos;ve sent your free China Sourcing Playbook and a <strong className="text-gold">15% off coupon</strong> to your email.</p>
                      <div className="bg-teal/5 border border-teal/15 rounded-xl p-4 space-y-2 text-sm text-left">
                        <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal shrink-0" /> 50+ page playbook download link in your inbox</p>
                        <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal shrink-0" /> Exclusive 15% off coupon code: <strong className="text-gold">WELCOME15</strong></p>
                        <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-teal shrink-0" /> Links to our free import tools & calculators</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">Check your inbox (and spam folder). The email contains everything you need to get started.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5 text-gold" />
                        <h3 className="font-bold">{t("whitepaperPage.getAccess")}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {t("whitepaperPage.enterEmail")}
                      </p>
                      <form onSubmit={handleUnlock} className="space-y-3">
                        <div>
                          <Label className="text-xs">{t("whitepaperPage.fullName")}</Label>
                          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">{t("whitepaperPage.emailAddress")} *</Label>
                          <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
                        </div>
                        <Button type="submit" className="w-full bg-teal hover:bg-teal/90 gap-2" disabled={status === "loading"}>
                          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          {status === "loading" ? t("whitepaperPage.unlocking") : t("whitepaperPage.downloadFreeGuide")}
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center">
                          {t("whitepaperPage.noSpam")} {t("whitepaperPage.privacyAgree")} <Link href="/privacy" className="underline">{t("whitepaperPage.privacyPolicy")}</Link>.
                        </p>
                        {status === "error" ? (
                          <p className="text-xs text-center text-red-600">{t("whitepaperPage.errorMsg")}</p>
                        ) : null}
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What's Inside */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("whitepaperPage.whatsInside")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("whitepaperPage.whatsInsideDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CHAPTERS.map((ch, i) => (
              <motion.div key={ch.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <ch.icon className="h-8 w-8 text-teal mb-3" />
                    <h3 className="font-semibold mb-2">Chapter {i + 1}: {ch.title}</h3>
                    <p className="text-sm text-muted-foreground">{ch.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">{t("whitepaperPage.opportunityTitle")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "$3.7T", label: "China manufacturing output" },
              { value: "3-6x", label: "Factory to retail markup" },
              { value: "$3K", label: "Minimum to start" },
              { value: "40-60%", label: "Typical savings vs retail" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-teal">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Content Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">{t("whitepaperPage.sampleTitle")}</h2>
          <Card>
            <CardContent className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Factory (China)</th>
                    <th className="text-right py-3 px-4">US Retail</th>
                    <th className="text-right py-3 px-4">Your Markup</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Office Chair", "$30-$60", "$150-$350", "3-5x"],
                    ["Bluetooth Earbuds", "$3-$8", "$25-$60", "4-6x"],
                    ["Marble Dining Table", "$400-$800", "$2,000-$4,000", "3-5x"],
                    ["LED Strip Lights (5m)", "$1-$3", "$12-$25", "5-8x"],
                    ["Dog Bed (Medium)", "$3-$8", "$25-$60", "3-5x"],
                    ["Standing Desk", "$80-$150", "$350-$800", "3-4x"],
                    ["Phone Case", "$0.30-$1.50", "$10-$25", "8-12x"],
                    ["Yoga Mat", "$2-$5", "$20-$45", "5-8x"],
                  ].map(([product, factory, retail, markup]) => (
                    <tr key={product} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{product}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{factory}</td>
                      <td className="py-3 px-4 text-right">{retail}</td>
                      <td className="py-3 px-4 text-right font-bold text-teal">{markup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-4 text-center italic">
                This is just a preview. The full guide includes 15 categories with detailed landed cost calculations.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 gradient-hero text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("whitepaperPage.readyToStart")}</h2>
          <p className="text-lg text-slate-300 mb-8">
            {t("whitepaperPage.readyToStartDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#top"><Button size="lg" className="bg-gold text-navy hover:bg-gold/90 font-bold">{t("whitepaperPage.downloadPlaybook")} <Download className="ml-2 h-5 w-5" /></Button></a>
            <Link href="/quote"><Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm hover:bg-white/18 hover:border-white/40">{t("whitepaperPage.getShippingQuote")} <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
