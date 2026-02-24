"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "LCL Sea Freight",
    subtitle: "Shared Container",
    price: "$150–250",
    unit: "per CBM",
    highlight: false,
    transit: "25–35 days",
    features: [
      "Pay only for your cargo space",
      "Ideal for < 15 CBM",
      "Shared with other shipments",
      "Full tracking included",
      "Customs clearance included",
    ],
  },
  {
    name: "FCL Sea Freight",
    subtitle: "Full Container",
    price: "$2,500",
    unit: "from / container",
    highlight: true,
    badge: "Best Value",
    transit: "20–30 days",
    features: [
      "Exclusive container for your cargo",
      "20ft, 40ft, or 40ft HC options",
      "Best per-unit cost for large orders",
      "Priority handling & faster transit",
      "Full tracking & customs included",
      "Insurance available",
    ],
  },
  {
    name: "Full Service",
    subtitle: "Door to Door",
    price: "Custom",
    unit: "quote",
    highlight: false,
    transit: "5–8 weeks total",
    features: [
      "Product sourcing from China",
      "Quality inspection & photos",
      "Professional packing & crating",
      "Ocean freight (LCL or FCL)",
      "US customs & delivery",
      "Dedicated project manager",
    ],
  },
];

export function PricingOverview() {
  return (
    <section className="gradient-mesh py-20" id="pricing">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Simple, Transparent <span className="text-teal">Pricing</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            No hidden fees. Get an instant estimate or request a detailed custom quote.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card
                className={`relative h-full ${
                  tier.highlight
                    ? "border-teal shadow-xl shadow-teal/10 scale-105"
                    : "border-border/50"
                }`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white">
                    {tier.badge}
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">{tier.subtitle}</p>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">{tier.unit}</span>
                  </div>
                  <p className="mt-2 text-sm text-teal font-medium">🕐 {tier.transit}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/quote" className="block">
                    <Button
                      className={`w-full ${
                        tier.highlight
                          ? "bg-teal text-white hover:bg-teal/90"
                          : "bg-navy text-white hover:bg-navy/90"
                      }`}
                    >
                      Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
