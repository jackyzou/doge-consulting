"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Package, Clock, ThumbsUp, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplay(value);
      return;
    }

    const target = parseFloat(numericMatch[0]);
    const prefix = value.slice(0, value.indexOf(numericMatch[0]));
    const suffixPart = value.slice(value.indexOf(numericMatch[0]) + numericMatch[0].length);
    const isFloat = numericMatch[0].includes(".");
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      const current = target * eased;

      if (isFloat) {
        setDisplay(`${prefix}${current.toFixed(1)}${suffixPart}`);
      } else {
        setDisplay(`${prefix}${Math.round(current)}${suffixPart}`);
      }

      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{display}</span>;
}

export function StatsBar() {
  const { t } = useTranslation();

  const stats = [
    { icon: Package, value: t("stats.itemsValue"), label: t("stats.itemsLabel"), color: "text-teal" },
    { icon: Clock, value: t("stats.weeksValue"), label: t("stats.weeksLabel"), color: "text-gold" },
    { icon: ThumbsUp, value: t("stats.satisfactionValue"), label: t("stats.satisfactionLabel"), color: "text-teal" },
    { icon: MapPin, value: t("stats.doorValue"), label: t("stats.doorLabel"), color: "text-gold" },
  ];

  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  <AnimatedNumber value={stat.value} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
