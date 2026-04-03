import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import ProductMatcherPage from "./ProductMatcherPage";

export const metadata: Metadata = {
  title: "AI Product Matcher — Find China Factory-Direct Prices | Doge Consulting",
  description:
    "AI-powered product matching that finds any product at China factory-direct prices. Paste a link, upload a photo, or describe what you need. Get instant pricing with 30-70% savings.",
  openGraph: {
    title: "AI Product Matcher | Doge Consulting",
    description: "Find any product cheaper from China. AI-powered product matching with instant factory-direct pricing.",
    url: "https://doge-consulting.com/tools/product-matcher",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/product-matcher" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://doge-consulting.com" },
          { name: "Tools", url: "https://doge-consulting.com/tools" },
          { name: "AI Product Matcher", url: "https://doge-consulting.com/tools/product-matcher" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "AI Product Matcher",
          description: "AI-powered product matching to find China factory-direct products at 30-70% less than US retail.",
          url: "https://doge-consulting.com/tools/product-matcher",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          provider: { "@type": "Organization", name: "Doge Consulting Group Limited" },
        }}
      />
      <ProductMatcherPage />
    </>
  );
}
