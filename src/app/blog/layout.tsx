import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Import Guides, Shipping News & China Sourcing Tips",
  description: "Expert guides on importing from China: product sourcing, freight rates, tariff strategy, factory tours, and AI-powered tools. Updated weekly with market analysis.",
  openGraph: {
    title: "Blog — China Import Guides & Shipping News | Doge Consulting",
    description: "Expert guides on importing from China: sourcing, freight, tariffs, and AI tools.",
    url: "https://doge-consulting.com/blog",
  },
  alternates: { canonical: "https://doge-consulting.com/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
