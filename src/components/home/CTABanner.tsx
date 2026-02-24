"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function CTABanner() {
  const { t } = useTranslation();

  return (
    <section className="gradient-hero py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal text-white hover:bg-teal/90 text-base px-8">
                {t("cta.cta1")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 text-base">
                {t("cta.cta2")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
