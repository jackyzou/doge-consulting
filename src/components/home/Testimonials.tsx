"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function Testimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: t("testimonials.t1Name"),
      location: t("testimonials.t1Location"),
      rating: 5,
      text: t("testimonials.t1Text"),
      items: t("testimonials.t1Items"),
    },
    {
      name: t("testimonials.t2Name"),
      location: t("testimonials.t2Location"),
      rating: 5,
      text: t("testimonials.t2Text"),
      items: t("testimonials.t2Items"),
    },
    {
      name: t("testimonials.t3Name"),
      location: t("testimonials.t3Location"),
      rating: 5,
      text: t("testimonials.t3Text"),
      items: t("testimonials.t3Items"),
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("testimonials.title")} <span className="text-teal">{t("testimonials.titleHighlight")}</span> {t("testimonials.titleEnd")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("testimonials.subtitle")}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="h-full border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: item.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="mt-6 border-t pt-4">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                    <p className="mt-1 text-xs text-teal font-medium">{item.items}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
