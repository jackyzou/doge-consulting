"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function NewsletterSection() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: locale }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
    if (status !== "success") setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal/5 via-transparent to-teal/5" />
      <div className="mx-auto max-w-4xl px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-teal/15 bg-white p-8 sm:p-10 shadow-[0_8px_40px_rgba(46,196,182,0.08)] text-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-bold text-gold border border-gold/20">🎁 15% OFF First Shipment</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-bold text-teal border border-teal/20">📘 Free 50+ Page Playbook</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Save 40–60% on Your Next Import</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-2">
            Join 2,500+ importers who get weekly factory prices, tariff alerts, and duty-saving strategies. Plus get an exclusive 15% discount coupon on your first shipment.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-teal" /> Factory price alerts</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-teal" /> Tariff change updates</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-teal" /> Duty-saving tips</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-teal" /> New product sourcing</span>
          </div>

          {status === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-teal/5 border border-teal/20 rounded-xl p-6">
              <CheckCircle className="h-10 w-10 text-teal mx-auto mb-2" />
              <p className="font-bold text-lg">Welcome aboard! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">Check your inbox for your 15% coupon code and free China Sourcing Playbook.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 text-base"
                disabled={status === "loading"}
              />
              <Button type="submit" className="bg-gold text-navy hover:bg-gold/90 h-12 px-6 gap-2 font-bold text-base" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Get 15% Off <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground mt-4">
            No spam, ever. Unsubscribe anytime. By subscribing you agree to our <a href="/privacy" className="underline">privacy policy</a>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
