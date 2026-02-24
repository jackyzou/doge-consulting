"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Container, Search, FileCheck, Truck, Shield } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Search,
    title: "Product Sourcing",
    description:
      "Access mainland China's vast manufacturing hubs. We connect you with top factories for electronics, furniture, home goods, textiles, and more.",
    color: "text-navy",
    bg: "bg-navy/5",
  },
  {
    icon: Package,
    title: "Sea Freight (LCL)",
    description:
      "Perfect for smaller shipments. Share container space and pay only for what you use. Competitive per-KG rates.",
    color: "text-teal",
    bg: "bg-teal/5",
  },
  {
    icon: Container,
    title: "Full Container (FCL)",
    description:
      "Best value for large orders. 20ft, 40ft, or 40ft High Cube containers from $2,500. Up to 68 CBM capacity.",
    color: "text-navy-light",
    bg: "bg-navy-light/5",
  },
  {
    icon: FileCheck,
    title: "Customs Clearance",
    description:
      "We handle all export and import documentation, customs clearance at both ends, and ensure compliance with US regulations.",
    color: "text-gold",
    bg: "bg-gold/5",
  },
  {
    icon: Truck,
    title: "Last-Mile Delivery",
    description:
      "From Seattle port to your front door. Local LTL delivery available across the Greater Seattle and Puget Sound area.",
    color: "text-teal",
    bg: "bg-teal/5",
  },
  {
    icon: Shield,
    title: "Cargo Insurance",
    description:
      "Optional comprehensive cargo insurance covering damage, loss, and delays. Peace of mind for your valuable shipments.",
    color: "text-navy",
    bg: "bg-navy/5",
  },
];

export function ServicesOverview() {
  return (
    <section className="bg-white py-20" id="services">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Our <span className="text-teal">Services</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            End-to-end shipping solutions, from factory floor to your front door.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href="/services">
                <Card className="group h-full cursor-pointer border-border/50 transition-all hover:border-teal/30 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader>
                    <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg ${service.bg}`}>
                      <service.icon className={`h-6 w-6 ${service.color}`} />
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
