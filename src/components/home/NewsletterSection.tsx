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
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10">
              <Mail className="h-5 w-5 text-teal" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t("footer.newsletterTitle")}</h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-6">
            {t("footer.newsletterDesc")}
          </p>

          {status === "success" ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 text-teal font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Subscribed! Check your inbox.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-11"
                disabled={status === "loading"}
              />
              <Button type="submit" className="bg-teal hover:bg-teal/90 h-11 px-6 gap-2" disabled={status === "loading"}>
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Subscribe
              </Button>
            </form>
          )}

          <p className="text-[11px] text-muted-foreground mt-4">
            Free shipping tips, rate updates, and exclusive offers. No spam, unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
