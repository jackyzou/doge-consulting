"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ship, Users, MapPin, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import GlobalPresenceMap from "@/components/home/GlobalPresenceMap";

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

  // Map pin positions: x/y as percentage coordinates mapped to SVG viewBox (1000x500)
  // x: 0-100 → 0-1000, y: 0-100 → 0-500
  const mapLocations = [
    { city: "Seattle", role: t("about.loc1Role"), flag: "🇺🇸", x: 15, y: 22 },
    { city: "Hong Kong", role: t("about.loc2Role"), flag: "🇭🇰", x: 79, y: 34 },
    { city: "Shenzhen", role: t("about.loc3Role"), flag: "🇨🇳", x: 72, y: 24 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-24 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("about.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("about.title")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200/95">
              {t("about.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
              <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p><span className="font-semibold text-foreground">{t("about.storyP1a")}</span>{t("about.storyP1b")}</p>
              <p>{t("about.storyP2")}</p>
              <p>{t("about.storyP3")}</p>
              <p>{t("about.storyP4")}</p>
              </div>
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

          {/* Global Presence Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <GlobalPresenceMap locations={mapLocations} />
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {locations.map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
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
