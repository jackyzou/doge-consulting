"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { DogeLogo } from "@/components/ui/doge-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, language: locale }),
      });
      if (res.ok) {
        setSubStatus("success");
        setEmail("");
      } else {
        setSubStatus("error");
      }
    } catch {
      setSubStatus("error");
    }
    setTimeout(() => setSubStatus("idle"), 4000);
  };

  return (
    <footer className="border-t bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DogeLogo size={36} />
              <span className="text-xl font-bold">
                Doge<span className="text-teal">Consulting</span>
              </span>
            </div>
            <p className="text-sm text-slate-300">
              {t("footer.description")}
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              {t("footer.servicesTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/services" className="hover:text-white transition-colors">{t("footer.seaFreight")}</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">{t("footer.fullContainer")}</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">{t("footer.productSourcing")}</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">{t("footer.customsClearance")}</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">{t("footer.lastMile")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              {t("footer.companyTitle")}
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link href="/about" className="hover:text-white transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">{t("footer.faqLink")}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t("footer.contactLink")}</Link></li>
              <li><Link href="/quote" className="hover:text-white transition-colors">{t("footer.getQuote")}</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal">
              {t("footer.contactTitle")}
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-teal" />
                {t("footer.locationUS")}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                {t("footer.locationHK")}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal" />
                dogetech77@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-teal" />
                +1 (425) 223-0449
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-8">
          {/* Newsletter — incentive-driven */}
          <div className="rounded-xl border border-teal/20 bg-gradient-to-r from-slate-800/80 to-slate-800/40 p-6 mb-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <span className="text-xl">🎁</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gold">Exclusive Offer</span>
                </div>
                <h3 className="text-lg font-bold text-white">Get 15% Off Your First Shipment</h3>
                <p className="text-sm text-slate-300 mt-1">
                  Plus free access to our China Sourcing Playbook (50+ pages) and weekly import tips that save our subscribers $2K–$8K per shipment.
                </p>
                <p className="text-[11px] text-slate-500 mt-2 flex items-center justify-center lg:justify-start gap-1">
                  <CheckCircle className="h-3 w-3 text-teal" /> 2,500+ importers subscribe · No spam · Unsubscribe anytime
                </p>
              </div>
              <div className="w-full lg:w-auto shrink-0">
                {subStatus === "success" ? (
                  <div className="flex items-center gap-2 text-teal font-medium bg-teal/10 rounded-lg px-6 py-3">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-semibold">You&apos;re in! 🎉</p>
                      <p className="text-xs text-teal/80">Check your inbox for your 15% coupon + free playbook.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder={t("footer.newsletterPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-900/60 border-slate-600 text-white placeholder:text-slate-400 min-w-[220px] h-11"
                    />
                    <Button type="submit" className="bg-gold text-navy hover:bg-gold/90 font-bold h-11 px-5 shrink-0" disabled={subStatus === "loading"}>
                      {subStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Claim Offer <Send className="h-3.5 w-3.5 ml-1" /></>}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
          <div className="text-center text-sm text-slate-400">
            <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
