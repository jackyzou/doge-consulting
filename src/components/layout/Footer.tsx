"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { DogeLogo } from "@/components/ui/doge-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();
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
        body: JSON.stringify({ email }),
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
          {/* Newsletter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold">{t("footer.newsletterTitle")}</h3>
              <p className="text-xs text-slate-400 mt-1">{t("footer.newsletterDesc")}</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full sm:w-auto">
              <Input
                type="email"
                placeholder={t("footer.newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 min-w-[220px]"
              />
              <Button type="submit" size="sm" className="bg-teal hover:bg-teal/90 shrink-0" disabled={subStatus === "loading"}>
                {subStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> :
                 subStatus === "success" ? <CheckCircle className="h-4 w-4" /> :
                 <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
          <div className="text-center text-sm text-slate-400">
            <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
