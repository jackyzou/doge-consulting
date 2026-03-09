import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — Get in Touch",
  description: "Contact Doge Consulting for product sourcing, shipping quotes, and import consulting. Offices in Seattle, Hong Kong, and Shenzhen. Bilingual English/Chinese support.",
  openGraph: {
    title: "Contact Doge Consulting",
    description: "Reach our multilingual team. Offices in Seattle, Hong Kong, and Shenzhen.",
    url: "https://doge-consulting.com/contact",
  },
  alternates: { canonical: "https://doge-consulting.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
