import type { Metadata } from "next";
import { JsonLd, serviceSchema, howToSchema, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Our Services — AI-Powered Import Solutions",
  description: "End-to-end import services from China: AI-powered sourcing, ocean freight (LCL & FCL), customs clearance, tariff optimization, and door-to-door delivery. Save 40-60% vs US retail.",
  openGraph: {
    title: "Our Services — AI-Powered Import Solutions | Doge Consulting",
    description: "End-to-end import services from China: AI-powered sourcing, ocean freight, customs clearance, and door-to-door delivery.",
    url: "https://doge-consulting.com/services",
  },
  alternates: { canonical: "https://doge-consulting.com/services" },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={serviceSchema({ name: "China-to-USA Product Sourcing & Shipping", description: "End-to-end import services: AI-powered product sourcing, factory QC, ocean freight, customs clearance, and door-to-door delivery from China to the USA.", url: "https://doge-consulting.com/services" })} />
      <JsonLd data={howToSchema({ name: "How to Import Products from China to the USA", description: "Step-by-step process for importing goods from China with Doge Consulting.", steps: [
        { name: "Tell Us What You Need", text: "Describe your product or share a URL. Our AI product matcher identifies the manufacturer and gets factory pricing." },
        { name: "We Source & Inspect", text: "Our Shenzhen team visits factories, negotiates pricing, and performs quality inspection before shipping." },
        { name: "Ship & Clear Customs", text: "We handle ocean freight, customs brokerage, HTS classification, duty payment, and ISF filing." },
        { name: "Delivered to Your Door", text: "Last-mile delivery to your warehouse, FBA center, or business address anywhere in the USA." },
      ] })} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://doge-consulting.com" },
        { name: "Services", url: "https://doge-consulting.com/services" },
      ])} />
      {children}
    </>
  );
}
