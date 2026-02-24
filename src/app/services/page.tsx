"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, Container, Search, FileCheck, Truck, Shield,
  ArrowRight, Check, Clock, DollarSign, Globe
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export default function ServicesPage() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Search,
      title: t("servicesPage.s1Title"),
      description: t("servicesPage.s1Desc"),
      features: [t("servicesPage.s1F1"), t("servicesPage.s1F2"), t("servicesPage.s1F3"), t("servicesPage.s1F4")],
      color: "text-navy", bg: "bg-navy/5",
    },
    {
      icon: Package,
      title: t("servicesPage.s2Title"),
      description: t("servicesPage.s2Desc"),
      features: [t("servicesPage.s2F1"), t("servicesPage.s2F2"), t("servicesPage.s2F3"), t("servicesPage.s2F4")],
      color: "text-teal", bg: "bg-teal/5",
    },
    {
      icon: Container,
      title: t("servicesPage.s3Title"),
      description: t("servicesPage.s3Desc"),
      features: [t("servicesPage.s3F1"), t("servicesPage.s3F2"), t("servicesPage.s3F3"), t("servicesPage.s3F4")],
      color: "text-navy-light", bg: "bg-navy-light/5",
    },
    {
      icon: FileCheck,
      title: t("servicesPage.s4Title"),
      description: t("servicesPage.s4Desc"),
      features: [t("servicesPage.s4F1"), t("servicesPage.s4F2"), t("servicesPage.s4F3"), t("servicesPage.s4F4")],
      color: "text-gold", bg: "bg-gold/5",
    },
    {
      icon: Truck,
      title: t("servicesPage.s5Title"),
      description: t("servicesPage.s5Desc"),
      features: [t("servicesPage.s5F1"), t("servicesPage.s5F2"), t("servicesPage.s5F3"), t("servicesPage.s5F4")],
      color: "text-teal", bg: "bg-teal/5",
    },
    {
      icon: Shield,
      title: t("servicesPage.s6Title"),
      description: t("servicesPage.s6Desc"),
      features: [t("servicesPage.s6F1"), t("servicesPage.s6F2"), t("servicesPage.s6F3"), t("servicesPage.s6F4")],
      color: "text-navy", bg: "bg-navy/5",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("servicesPage.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("servicesPage.title")}</h1>
            <p className="mt-4 text-lg text-slate-300">
              {t("servicesPage.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl ${service.bg}`}>
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-teal" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="gradient-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {t("servicesPage.whyTitle")} <span className="text-teal">{t("servicesPage.whyHighlight")}</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: DollarSign, title: t("servicesPage.why1Title"), desc: t("servicesPage.why1Desc") },
              { icon: Clock, title: t("servicesPage.why2Title"), desc: t("servicesPage.why2Desc") },
              { icon: Globe, title: t("servicesPage.why3Title"), desc: t("servicesPage.why3Desc") },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10">
                  <item.icon className="h-8 w-8 text-teal" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">{t("servicesPage.ctaTitle")}</h2>
          <p className="mt-4 text-slate-300">{t("servicesPage.ctaSubtitle")}</p>
          <Link href="/quote">
            <Button size="lg" className="mt-6 bg-teal text-white hover:bg-teal/90">
              {t("servicesPage.ctaCta")} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
