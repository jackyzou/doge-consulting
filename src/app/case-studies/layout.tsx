import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Case Studies — Real Customer Success Stories",
  description: "See how real customers saved 40-60% on furniture, electronics, and home goods sourced from China. Door-to-door from Shenzhen to the US Pacific Northwest.",
  openGraph: {
    title: "Case Studies — Real Customer Success Stories | Doge Consulting",
    description: "Real customers, real savings. Furniture, electronics, and home goods from China at 40-60% off US retail.",
    url: "https://doge-consulting.com/case-studies",
  },
  alternates: { canonical: "https://doge-consulting.com/case-studies" },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{name:"Home",url:"https://doge-consulting.com"},{name:"Case Studies",url:"https://doge-consulting.com/case-studies"}])} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Doge Consulting Group Limited",
        url: "https://doge-consulting.com",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "10",
          reviewCount: "10",
        },
        review: [
          { "@type": "Review", author: { "@type": "Person", name: "Michael & Linda Zhang" }, reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 }, reviewBody: "We saved over $14,000 and got better quality than Restoration Hardware.", datePublished: "2025-10-15" },
          { "@type": "Review", author: { "@type": "Person", name: "Sarah & James Park" }, reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 }, reviewBody: "Without Doge Consulting, we wouldn't have been able to open on budget.", datePublished: "2026-01-20" },
          { "@type": "Review", author: { "@type": "Person", name: "Ryan Okonkwo" }, reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 }, reviewBody: "Everything was labeled by employee name. Easiest office move ever.", datePublished: "2025-08-10" },
        ],
      }} />
      {children}
    </>
  );
}
