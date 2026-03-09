import type { Metadata } from "next";

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
  return children;
}
