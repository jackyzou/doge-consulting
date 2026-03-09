import type { Metadata } from "next";

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
  return children;
}
