"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Container, Search, FileCheck, Truck, Shield } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function ServicesOverview() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Search,
      title: t("servicesOverview.s1Title"),
      description: t("servicesOverview.s1Desc"),
      color: "text-navy",
      bg: "bg-navy/5",
    },
    {
      icon: Package,
      title: t("servicesOverview.s2Title"),
      description: t("servicesOverview.s2Desc"),
      color: "text-teal",
      bg: "bg-teal/5",
    },
    {
      icon: Container,
      title: t("servicesOverview.s3Title"),
      description: t("servicesOverview.s3Desc"),
      color: "text-navy-light",
      bg: "bg-navy-light/5",
    },
    {
      icon: FileCheck,
      title: t("servicesOverview.s4Title"),
      description: t("servicesOverview.s4Desc"),
      color: "text-gold",
      bg: "bg-gold/5",
    },
    {
      icon: Truck,
      title: t("servicesOverview.s5Title"),
      description: t("servicesOverview.s5Desc"),
      color: "text-teal",
      bg: "bg-teal/5",
    },
    {
      icon: Shield,
      title: t("servicesOverview.s6Title"),
      description: t("servicesOverview.s6Desc"),
      color: "text-navy",
      bg: "bg-navy/5",
    },
  ];

  return (
    <section className="bg-white py-20" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("servicesOverview.title")} <span className="text-teal">{t("servicesOverview.titleHighlight")}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("servicesOverview.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/services">
                <Card className="group h-full cursor-pointer border-border/50 transition-all hover:border-teal/30 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg ${service.bg}`}>
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
