import type { Metadata } from "next";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description: "Answers to common questions about shipping from China to the USA: transit times, LCL vs FCL, customs duties, payment methods, freight rates, and the 2026 Iran crisis impact.",
  openGraph: {
    title: "FAQ — Shipping from China to USA | Doge Consulting",
    description: "Common questions about importing from China: shipping times, costs, customs, tariffs, and more.",
    url: "https://doge-consulting.com/faq",
  },
  alternates: { canonical: "https://doge-consulting.com/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqSchema([
        { question: "How long does shipping from China to the US take?", answer: "Sea freight takes 14-25 days depending on the route. Shenzhen to LA is typically 14-18 days. Air freight is 3-7 days but significantly more expensive." },
        { question: "What is LCL vs FCL shipping?", answer: "LCL (Less than Container Load) shares a container with other shippers — ideal for smaller shipments. FCL (Full Container Load) gives you the entire container — better for large volumes over 15 CBM." },
        { question: "How much are customs duties on Chinese goods?", answer: "Duty rates vary by product (HTS code). Most goods face 0-25% base duty plus potential Section 301 tariffs of 7.5-25%. Use our free duty calculator to check your specific product." },
        { question: "Do you handle customs clearance?", answer: "Yes. We handle all customs brokerage including HTS classification, ISF filing, duty payment, and delivery coordination. Our customs team processes clearances daily." },
        { question: "What is the minimum order for shipping from China?", answer: "There's no strict minimum. For sea freight LCL, we recommend at least 1-2 CBM (roughly $300-600 in freight). For smaller orders under 100kg, air freight or express may be more cost-effective." },
        { question: "How do I track my shipment?", answer: "Use our free Container Tracker tool — enter your container number to see real-time vessel position, ETA, and port calls. We also send proactive email updates at each milestone." },
      ])} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://doge-consulting.com" },
        { name: "FAQ", url: "https://doge-consulting.com/faq" },
      ])} />
      {children}
    </>
  );
}
