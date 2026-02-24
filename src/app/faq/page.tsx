"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqCategories = [
  {
    title: "Shipping & Logistics",
    faqs: [
      { q: "How long does shipping take from China to Seattle?", a: "Sea freight typically takes 20-35 days depending on the shipping method (LCL vs FCL). With sourcing, inspection, packing, and last-mile delivery, the total door-to-door timeline is approximately 5-8 weeks." },
      { q: "What is the difference between LCL and FCL?", a: "LCL (Less than Container Load) means your cargo shares a container with other shipments — you pay per cubic meter. FCL (Full Container Load) means you get a dedicated container. FCL is more cost-effective for larger shipments (generally above 15 CBM)." },
      { q: "What container sizes are available?", a: "We offer 20ft containers (~28 CBM), 40ft containers (~58 CBM), and 40ft High Cube containers (~68 CBM). Our team will recommend the best option based on your furniture list." },
      { q: "Can you ship to cities other than Seattle?", a: "Currently, our primary service area is the Greater Seattle/Puget Sound region (Seattle, Bellevue, Redmond, Tacoma, Kirkland, etc.). We're expanding to Vancouver, BC and Portland, OR in 2026." },
      { q: "Do you provide tracking?", a: "Yes! Every shipment receives a unique tracking ID. You can track your shipment's progress through our website, from factory to your front door, with milestone updates at every stage." },
    ],
  },
  {
    title: "Furniture & Sourcing",
    faqs: [
      { q: "What furniture can you source from Foshan?", a: "Foshan is China's largest furniture manufacturing hub. We can source sofas, dining tables (including marble and stone tops), bed frames, wardrobes, TV consoles, office furniture, bookshelves, and custom pieces. From modern minimalist to traditional styles." },
      { q: "How much can I save compared to buying locally?", a: "Most customers save 40-60% compared to US retail prices, even after shipping costs. For example, a marble dining table set that costs $5,000+ in the US can be sourced and shipped for around $2,000-$2,500 total." },
      { q: "Can I see the furniture before it ships?", a: "Yes! Our Foshan team provides detailed photos and videos of your furniture during quality inspection, before it's packed. We'll send these to you for approval before shipping." },
      { q: "What if I receive damaged furniture?", a: "All shipments are professionally packed for ocean transport. If damage occurs, our cargo insurance (optional but recommended) covers full replacement value. We also work with manufacturers on warranty claims." },
    ],
  },
  {
    title: "Payment & Pricing",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept major credit/debit cards (Visa, Mastercard, Amex) and bank transfers through our secure Airwallex payment system. For large orders (>$5,000), we also accept wire transfers with lower processing fees." },
      { q: "Do I need to pay everything upfront?", a: "For first-time customers, we typically require 70% deposit when placing the order, with the remaining 30% due before delivery. For returning customers, we offer more flexible terms." },
      { q: "Are there any hidden fees?", a: "No. Our quotes are all-inclusive, covering furniture cost, packing, freight, customs clearance, and delivery. The only potential additions are cargo insurance (optional) and any unusual customs duties." },
      { q: "What currency do you charge in?", a: "All prices are quoted and charged in US Dollars (USD). Our Hong Kong-based payment system handles currency conversion seamlessly." },
    ],
  },
  {
    title: "Customs & Regulations",
    faqs: [
      { q: "Do I need to handle customs myself?", a: "No! We handle all customs clearance on both the China export and US import side. Our experienced customs brokers ensure smooth clearance at both ports." },
      { q: "Are there import duties on furniture?", a: "Furniture imports to the US typically incur duties of 0-5% depending on the material and type. Our team will provide a duty estimate as part of your quote. We optimize documentation to ensure the lowest applicable rates." },
      { q: "Is there anything that can't be shipped?", a: "Most furniture ships without issue. Items with protected woods (certain rosewood species) may require CITES permits. We'll advise you during the quoting process if any restrictions apply." },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Help Center</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-slate-300">
              Everything you need to know about shipping furniture from China to the US.
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
