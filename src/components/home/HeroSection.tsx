"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Ship, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden gradient-hero text-white">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-teal/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-40 right-1/4 text-4xl animate-float opacity-20">📦</div>
        <div className="absolute bottom-32 left-1/4 text-3xl animate-float opacity-20" style={{ animationDelay: "1s" }}>🚢</div>
        <div className="absolute top-60 left-1/2 text-3xl animate-float opacity-20" style={{ animationDelay: "2s" }}>🏠</div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
              {t("hero.badge")}
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title1")}{" "}
              <span className="text-teal">{t("hero.titleShipped")}</span>{" "}
              <span className="text-gold">{t("hero.titleDirect")}</span>{" "}
              {t("hero.title2")}
            </h1>

            <p className="max-w-lg text-lg text-slate-300">
              {t("hero.subtitle")}{" "}
              <strong className="text-white">{t("hero.subtitleBold")}</strong>{" "}
              {t("hero.subtitleEnd")}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/quote">
                <Button
                  size="lg"
                  className="bg-teal text-white hover:bg-teal/90 text-base px-8"
                >
                  {t("hero.cta1")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 text-base"
                >
                  {t("hero.cta2")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              {/* Stylized shipping route visualization */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Route visualization */}
                  <div className="flex items-center justify-between text-center">
                    <div className="space-y-2">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-3xl">
                        🏭
                      </div>
                      <p className="text-sm font-medium">{t("hero.china")}</p>
                      <p className="text-xs text-slate-400">{t("hero.chinaDesc")}</p>
                    </div>
                    <div className="flex-1 border-t border-dashed border-teal/50 mx-4 relative">
                      <Ship className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-teal" />
                    </div>
                    <div className="space-y-2">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 text-3xl">
                        🇭🇰
                      </div>
                      <p className="text-sm font-medium">{t("hero.hk")}</p>
                      <p className="text-xs text-slate-400">{t("hero.hkDesc")}</p>
                    </div>
                    <div className="flex-1 border-t border-dashed border-teal/50 mx-4 relative">
                      <Package className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-gold" />
                    </div>
                    <div className="space-y-2">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal/20 text-3xl">
                        🏠
                      </div>
                      <p className="text-sm font-medium">{t("hero.usa")}</p>
                      <p className="text-xs text-slate-400">{t("hero.usaDesc")}</p>
                    </div>
                  </div>

                  {/* Feature tags */}
                  <div className="grid grid-cols-3 gap-3 pt-4">
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-2xl font-bold text-teal">{t("hero.weeksValue")}</p>
                      <p className="text-xs text-slate-400">{t("hero.weeksLabel")}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <p className="text-2xl font-bold text-gold">{t("hero.savingsValue")}</p>
                      <p className="text-xs text-slate-400">{t("hero.savingsLabel")}</p>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <div className="flex justify-center">
                        <Shield className="h-6 w-6 text-teal" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{t("hero.insuredLabel")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
