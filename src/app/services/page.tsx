"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, Container, Search, FileCheck, Truck, Shield,
  ArrowRight, Check, Clock, DollarSign, Globe
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Search,
    title: "Product Sourcing",
    description: "We connect you directly with China's top manufacturers across Foshan, Shenzhen, Yiwu, and more. From furniture and electronics to home goods and industrial equipment, we source exactly what you need at factory-direct prices.",
    features: ["Factory-direct pricing", "Quality verification", "Photo/video updates", "Sample ordering available"],
    color: "text-navy", bg: "bg-navy/5",
  },
  {
    icon: Package,
    title: "LCL Sea Freight",
    description: "Share container space with other shipments and pay only for the cubic meters you use. Ideal for smaller orders under 15 CBM.",
    features: ["From $150/CBM", "25-35 day transit", "Consolidation service", "Flexible scheduling"],
    color: "text-teal", bg: "bg-teal/5",
  },
  {
    icon: Container,
    title: "FCL Sea Freight",
    description: "Dedicated containers for larger shipments. Choose from 20ft, 40ft, or 40ft High Cube containers. The most cost-effective option for large orders.",
    features: ["From $2,500/container", "20-30 day transit", "Exclusive container", "Priority handling"],
    color: "text-navy-light", bg: "bg-navy-light/5",
  },
  {
    icon: FileCheck,
    title: "Customs & Documentation",
    description: "We handle all the paperwork — export declarations, bills of lading, commercial invoices, packing lists, and US import clearance.",
    features: ["Export clearance (China)", "Import clearance (US)", "All documentation handled", "Duty optimization"],
    color: "text-gold", bg: "bg-gold/5",
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    description: "From Seattle/Tacoma port to your doorstep. We partner with local LTL carriers for white-glove delivery across the Puget Sound region.",
    features: ["Port pickup", "Seattle metro delivery", "Indoor placement", "Assembly available"],
    color: "text-teal", bg: "bg-teal/5",
  },
  {
    icon: Shield,
    title: "Cargo Insurance",
    description: "Comprehensive marine cargo insurance covering damage, loss, and delays during international transit. Optional but recommended for high-value items.",
    features: ["Full replacement value", "Door-to-door coverage", "Damage protection", "Easy claims process"],
    color: "text-navy", bg: "bg-navy/5",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">End-to-End Solutions</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">Our Services</h1>
            <p className="mt-4 text-lg text-slate-300">
              From sourcing to delivery, we handle every step of your shipping journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/50 transition-all hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-14 w-14 items-center justify-center rounded-xl ${service.bg}`}>
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-teal" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="gradient-mesh py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Why Choose <span className="text-teal">Doge Consulting</span>
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: DollarSign, title: "Save Up to 60%", desc: "Factory-direct pricing from China eliminates middlemen and retail markups." },
              { icon: Clock, title: "5-8 Week Delivery", desc: "Efficient logistics chain from factory to your door in the Seattle area." },
              { icon: Globe, title: "Bilingual Support", desc: "Our team speaks English and Chinese, bridging the gap between you and manufacturers." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal/10">
                  <item.icon className="h-8 w-8 text-teal" />
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-slate-300">Get a free quote tailored to your shipping needs.</p>
          <Link href="/quote">
            <Button size="lg" className="mt-6 bg-teal text-white hover:bg-teal/90">
              Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
