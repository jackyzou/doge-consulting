"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "@/lib/i18n";

export default function FAQPage() {
  const { t } = useTranslation();

  const faqCategories = [
    {
      title: t("faqPage.cat1Title"),
      faqs: [
        { q: t("faqPage.cat1Q1"), a: t("faqPage.cat1A1") },
        { q: t("faqPage.cat1Q2"), a: t("faqPage.cat1A2") },
        { q: t("faqPage.cat1Q3"), a: t("faqPage.cat1A3") },
        { q: t("faqPage.cat1Q4"), a: t("faqPage.cat1A4") },
        { q: t("faqPage.cat1Q5"), a: t("faqPage.cat1A5") },
      ],
    },
    {
      title: t("faqPage.cat2Title"),
      faqs: [
        { q: t("faqPage.cat2Q1"), a: t("faqPage.cat2A1") },
        { q: t("faqPage.cat2Q2"), a: t("faqPage.cat2A2") },
        { q: t("faqPage.cat2Q3"), a: t("faqPage.cat2A3") },
        { q: t("faqPage.cat2Q4"), a: t("faqPage.cat2A4") },
      ],
    },
    {
      title: t("faqPage.cat3Title"),
      faqs: [
        { q: t("faqPage.cat3Q1"), a: t("faqPage.cat3A1") },
        { q: t("faqPage.cat3Q2"), a: t("faqPage.cat3A2") },
        { q: t("faqPage.cat3Q3"), a: t("faqPage.cat3A3") },
        { q: t("faqPage.cat3Q4"), a: t("faqPage.cat3A4") },
      ],
    },
    {
      title: t("faqPage.cat4Title"),
      faqs: [
        { q: t("faqPage.cat4Q1"), a: t("faqPage.cat4A1") },
        { q: t("faqPage.cat4Q2"), a: t("faqPage.cat4A2") },
        { q: t("faqPage.cat4Q3"), a: t("faqPage.cat4A3") },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("faqPage.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("faqPage.title")}</h1>
            <p className="mt-4 text-lg text-slate-300">
              {t("faqPage.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {faqCategories.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.1 }}
              className="mb-12"
            >
              <h2 className="mb-6 text-xl font-bold text-foreground">{cat.title}</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {cat.faqs.map((faq, fi) => (
                  <AccordionItem
                    key={fi}
                    value={`${ci}-${fi}`}
                    className="rounded-lg border bg-white px-6"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
