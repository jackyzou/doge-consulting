import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Catalog — Find It Cheaper from China",
  description: "Browse our AI-powered product catalog. Paste a US product link and get instant China-direct pricing (save 5-20%). Furniture room packages, electronics, home goods, and more.",
  openGraph: {
    title: "Product Catalog — Find It Cheaper from China | Doge Consulting",
    description: "AI Product Matcher: paste a link or upload a photo. Get instant China-direct pricing with 5-20% savings.",
    url: "https://doge-consulting.com/catalog",
  },
  alternates: { canonical: "https://doge-consulting.com/catalog" },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
