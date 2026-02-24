"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function PricingOverview() {
  const { t } = useTranslation();

  const tiers = [
    {
      name: t("pricing.tier1Name"),
      subtitle: t("pricing.tier1Subtitle"),
      price: t("pricing.tier1Price"),
      unit: t("pricing.tier1Unit"),
      highlight: false,
      transit: t("pricing.tier1Transit"),
      features: [
        t("pricing.tier1F1"),
        t("pricing.tier1F2"),
        t("pricing.tier1F3"),
        t("pricing.tier1F4"),
        t("pricing.tier1F5"),
      ],
    },
    {
      name: t("pricing.tier2Name"),
      subtitle: t("pricing.tier2Subtitle"),
      price: t("pricing.tier2Price"),
      unit: t("pricing.tier2Unit"),
      highlight: true,
      badge: t("pricing.tier2Badge"),
      transit: t("pricing.tier2Transit"),
      features: [
        t("pricing.tier2F1"),
        t("pricing.tier2F2"),
        t("pricing.tier2F3"),
        t("pricing.tier2F4"),
        t("pricing.tier2F5"),
        t("pricing.tier2F6"),
      ],
    },
    {
      name: t("pricing.tier3Name"),
      subtitle: t("pricing.tier3Subtitle"),
      price: t("pricing.tier3Price"),
      unit: t("pricing.tier3Unit"),
      highlight: false,
      transit: t("pricing.tier3Transit"),
      features: [
        t("pricing.tier3F1"),
        t("pricing.tier3F2"),
        t("pricing.tier3F3"),
        t("pricing.tier3F4"),
        t("pricing.tier3F5"),
        t("pricing.tier3F6"),
      ],
    },
  ];

  return (
    <section className="gradient-mesh py-20" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("pricing.title")} <span className="text-teal">{t("pricing.titleHighlight")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className={`relative h-full ${
                  tier.highlight
                    ? "border-teal shadow-xl shadow-teal/10 scale-105"
                    : "border-border/50"
                }`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white">
                    {tier.badge}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">{tier.subtitle}</p>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{tier.unit}</span>
                  </div>
                  <p className="mt-2 text-sm text-teal font-medium">🕐 {tier.transit}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/quote" className="block">
                    <Button
                      className={`w-full ${
                        tier.highlight
                          ? "bg-teal text-white hover:bg-teal/90"
                          : "bg-navy text-white hover:bg-navy/90"
                      }`}
                    >
                      {t("pricing.getQuote")} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
