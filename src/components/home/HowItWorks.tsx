"use client";

import { motion } from "framer-motion";
import { Search, PackageCheck, Ship, Truck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      emoji: "🔍",
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
      color: "bg-navy text-white",
    },
    {
      icon: PackageCheck,
      emoji: "✅",
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
      color: "bg-teal text-white",
    },
    {
      icon: Ship,
      emoji: "🚢",
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
      color: "bg-navy-light text-white",
    },
    {
      icon: Truck,
      emoji: "🏠",
      title: t("howItWorks.step4Title"),
      description: t("howItWorks.step4Desc"),
      color: "bg-gold text-navy",
    },
  ];

  return (
    <section className="gradient-mesh py-20" id="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("howItWorks.title")} <span className="text-teal">{t("howItWorks.titleHighlight")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("howItWorks.subtitle")}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-1/2 hidden w-full border-t-2 border-dashed border-teal/30 md:block" />
              )}

              {/* Step number */}
              <div className="relative mx-auto mb-4">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${step.color} shadow-lg`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy">
                  {i + 1}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
