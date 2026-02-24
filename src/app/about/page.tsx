"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Ship, Users, MapPin, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Our Story</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">About Doge Consulting</h1>
            <p className="mt-4 text-lg text-slate-300">
              Bridging Foshan&apos;s world-class furniture manufacturing with North American homes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-8">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Doge Consulting</strong> was founded with a simple vision: make
                premium Chinese furniture accessible and affordable to homeowners in the Pacific Northwest.
              </p>
              <p>
                Based in <strong className="text-foreground">Hong Kong</strong> with operations in{" "}
                <strong className="text-foreground">Seattle</strong> and{" "}
                <strong className="text-foreground">Foshan</strong>, we leverage our unique geographical
                positioning and deep manufacturing relationships to deliver exceptional value.
              </p>
              <p>
                Foshan, in Guangdong Province, is the furniture capital of China — home to thousands of
                manufacturers producing everything from contemporary sofas to exquisite marble dining tables.
                Our team has cultivated relationships with the best factories, ensuring quality, reliability,
                and factory-direct pricing for every customer.
              </p>
              <p>
                Our Seattle-based team understands what American homeowners want. We bridge the gap between
                world-class Chinese manufacturing and North American design preferences, handling all logistics,
                customs, and delivery so you can focus on enjoying your new furniture.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="gradient-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Our <span className="text-teal">Values</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Trust & Transparency", desc: "Honest pricing, clear timelines, and no hidden fees. We show you exactly what you're paying for." },
              { icon: Users, title: "Customer First", desc: "Your satisfaction drives everything we do. Bilingual support ensures clear communication at every step." },
              { icon: Ship, title: "Reliable Logistics", desc: "We partner with established shipping lines and customs brokers with decades of experience." },
              { icon: MapPin, title: "Local Knowledge", desc: "With team members in Seattle, Hong Kong, and Foshan, we have boots on the ground at every stage." },
            ].map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal/10">
                      <val.icon className="h-7 w-7 text-teal" />
                    </div>
                    <h3 className="font-semibold">{val.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{val.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Our <span className="text-teal">Locations</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { city: "Seattle, WA", flag: "🇺🇸", role: "Customer Relations & Delivery", desc: "Our US operations hub. We handle customer support, local delivery, and warehouse operations in the greater Seattle area." },
              { city: "Hong Kong SAR", flag: "🇭🇰", role: "Headquarters & Shipping", desc: "Our registered headquarters. We manage contracts, international shipping, payments, and trade operations from Hong Kong." },
              { city: "Foshan, Guangdong", flag: "🇨🇳", role: "Sourcing & Quality Control", desc: "Our sourcing office in China's furniture capital. Direct relationships with leading manufacturers and quality inspection teams." },
            ].map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-border/50">
                  <CardContent className="pt-6 text-center">
                    <span className="text-5xl">{loc.flag}</span>
                    <h3 className="mt-4 text-lg font-semibold">{loc.city}</h3>
                    <p className="text-sm font-medium text-teal">{loc.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{loc.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
