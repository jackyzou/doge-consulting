import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Freight & Shipping Glossary — 60+ Trade Terms",
  description: "Comprehensive glossary of 60+ freight, shipping, customs, and international trade terms. Incoterms, HTS codes, CBM, FOB, and more.",
  openGraph: {
    title: "Freight & Shipping Glossary | Doge Consulting",
    description: "60+ essential terms for international shipping, customs, sourcing, and import/export.",
    url: "https://doge-consulting.com/glossary",
  },
  alternates: { canonical: "https://doge-consulting.com/glossary" },
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return (<><JsonLd data={breadcrumbSchema([{name:"Home",url:"https://doge-consulting.com"},{name:"Glossary",url:"https://doge-consulting.com/glossary"}])} />{children}</>);
}
