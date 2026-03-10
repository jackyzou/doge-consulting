import type { Metadata } from "next";

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
  return children;
}
