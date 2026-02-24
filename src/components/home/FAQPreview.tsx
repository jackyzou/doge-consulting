"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

export function FAQPreview() {
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("faqPreview.q1"),
      a: t("faqPreview.a1"),
    },
    {
      q: t("faqPreview.q2"),
      a: t("faqPreview.a2"),
    },
    {
      q: t("faqPreview.q3"),
      a: t("faqPreview.a3"),
    },
    {
      q: t("faqPreview.q4"),
      a: t("faqPreview.a4"),
    },
  ];

  return (
    <section className="gradient-mesh py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            {t("faqPreview.title")} <span className="text-teal">{t("faqPreview.titleHighlight")}</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-lg border bg-white px-6"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="/faq" className="text-sm font-medium text-teal hover:underline">
            {t("faqPreview.viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
