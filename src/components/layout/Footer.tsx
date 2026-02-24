"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { DogeLogo } from "@/components/ui/doge-logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const { t } = useTranslation();

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

        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
          <p>{t("footer.copyright").replace("{year}", new Date().getFullYear().toString())}</p>
        </div>
      </div>
    </footer>
  );
}
