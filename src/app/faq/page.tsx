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
import { JsonLd, faqSchema } from "@/components/seo/JsonLd";

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
    {
      title: t("faqPage.cat5Title"),
      faqs: [
        { q: t("faqPage.cat5Q1"), a: t("faqPage.cat5A1") },
        { q: t("faqPage.cat5Q2"), a: t("faqPage.cat5A2") },
        { q: t("faqPage.cat5Q3"), a: t("faqPage.cat5A3") },
        { q: t("faqPage.cat5Q4"), a: t("faqPage.cat5A4") },
      ],
    },
    {
      title: t("faqPage.cat6Title"),
      faqs: [
        { q: t("faqPage.cat6Q1"), a: t("faqPage.cat6A1") },
        { q: t("faqPage.cat6Q2"), a: t("faqPage.cat6A2") },
        { q: t("faqPage.cat6Q3"), a: t("faqPage.cat6A3") },
        { q: t("faqPage.cat6Q4"), a: t("faqPage.cat6A4") },
        { q: t("faqPage.cat6Q5"), a: t("faqPage.cat6A5") },
      ],
    },
    {
      title: t("faqPage.cat7Title"),
      faqs: [
        { q: t("faqPage.cat7Q1"), a: t("faqPage.cat7A1") },
        { q: t("faqPage.cat7Q2"), a: t("faqPage.cat7A2") },
        { q: t("faqPage.cat7Q3"), a: t("faqPage.cat7A3") },
        { q: t("faqPage.cat7Q4"), a: t("faqPage.cat7A4") },
        { q: t("faqPage.cat7Q5"), a: t("faqPage.cat7A5") },
      ],
    },
    {
      title: t("faqPage.cat8Title"),
      faqs: [
        { q: t("faqPage.cat8Q1"), a: t("faqPage.cat8A1") },
        { q: t("faqPage.cat8Q2"), a: t("faqPage.cat8A2") },
        { q: t("faqPage.cat8Q3"), a: t("faqPage.cat8A3") },
        { q: t("faqPage.cat8Q4"), a: t("faqPage.cat8A4") },
      ],
    },
    {
      title: t("faqPage.cat9Title"),
      faqs: [
        { q: t("faqPage.cat9Q1"), a: t("faqPage.cat9A1") },
        { q: t("faqPage.cat9Q2"), a: t("faqPage.cat9A2") },
        { q: t("faqPage.cat9Q3"), a: t("faqPage.cat9A3") },
        { q: t("faqPage.cat9Q4"), a: t("faqPage.cat9A4") },
        { q: t("faqPage.cat9Q5"), a: t("faqPage.cat9A5") },
      ],
    },
    {
      title: t("faqPage.cat10Title"),
      faqs: [
        { q: t("faqPage.cat10Q1"), a: t("faqPage.cat10A1") },
        { q: t("faqPage.cat10Q2"), a: t("faqPage.cat10A2") },
        { q: t("faqPage.cat10Q3"), a: t("faqPage.cat10A3") },
        { q: t("faqPage.cat10Q4"), a: t("faqPage.cat10A4") },
        { q: t("faqPage.cat10Q5"), a: t("faqPage.cat10A5") },
        { q: t("faqPage.cat10Q6"), a: t("faqPage.cat10A6") },
      ],
    },
  ];

  // Flatten all FAQs for schema markup
  const allFaqs = faqCategories.flatMap(cat => cat.faqs.map(f => ({ question: f.q, answer: f.a })));

  return (
    <div className="min-h-screen">
      <JsonLd data={faqSchema(allFaqs)} />
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("faqPage.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("faqPage.title")}</h1>
            <p className="mt-4 text-lg text-slate-300">
              {t("faqPage.subtitle")} ({allFaqs.length} questions across {faqCategories.length} topics)
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
