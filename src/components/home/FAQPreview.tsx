"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqs = [
  {
    q: "How long does shipping take from China to Seattle?",
    a: "Sea freight typically takes 20-35 days depending on the shipping method. With sourcing, inspection, packing, and last-mile delivery, the total door-to-door timeline is approximately 5-8 weeks.",
  },
  {
    q: "What products can you source from China?",
    a: "China is the world's manufacturing powerhouse. We can source furniture, electronics, home goods, textiles, industrial equipment, and custom products. From Foshan furniture to Shenzhen electronics and Yiwu small commodities.",
  },
  {
    q: "How much can I save compared to buying locally?",
    a: "Most customers save 40-60% compared to US retail prices, even after shipping costs. For example, a marble dining table set that costs $5,000+ in the US can be sourced and shipped for around $2,000-$2,500 total.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit/debit cards (Visa, Mastercard, Amex) and bank transfers through our secure Airwallex payment system. For large orders, we also accept wire transfers with lower processing fees.",
  },
];

export function FAQPreview() {
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
            Frequently Asked <span className="text-teal">Questions</span>
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
            View all frequently asked questions →
          </Link>
        </div>
      </div>
    </section>
  );
}
