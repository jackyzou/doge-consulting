"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ship, Users, MapPin, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    { icon: Shield, title: t("about.val1Title"), desc: t("about.val1Desc") },
    { icon: Users, title: t("about.val2Title"), desc: t("about.val2Desc") },
    { icon: Ship, title: t("about.val3Title"), desc: t("about.val3Desc") },
    { icon: MapPin, title: t("about.val4Title"), desc: t("about.val4Desc") },
  ];

  const locations = [
    { city: t("about.loc1City"), flag: "🇺🇸", role: t("about.loc1Role"), desc: t("about.loc1Desc") },
    { city: t("about.loc2City"), flag: "🇭🇰", role: t("about.loc2Role"), desc: t("about.loc2Desc") },
    { city: t("about.loc3City"), flag: "🇨🇳", role: t("about.loc3Role"), desc: t("about.loc3Desc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("about.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("about.title")}</h1>
            <p className="mt-4 text-lg text-slate-300">
              {t("about.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("about.story1")}</p>
              <p>{t("about.story2")}</p>
              <p>{t("about.story3")}</p>
              <p>{t("about.story4")}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="gradient-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t("about.valuesTitle")} <span className="text-teal">{t("about.valuesHighlight")}</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal/10">
                      <val.icon className="h-7 w-7 text-teal" />
                    </div>
                    <h3 className="font-semibold">{val.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{val.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t("about.locationsTitle")} <span className="text-teal">{t("about.locationsHighlight")}</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border/50">
                  <CardContent className="pt-6 text-center">
                    <span className="text-5xl">{loc.flag}</span>
                    <h3 className="mt-4 text-lg font-semibold">{loc.city}</h3>
                    <p className="text-sm font-medium text-teal">{loc.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{loc.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
