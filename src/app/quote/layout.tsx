import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Get a Shipping Quote — Free Estimate in 24 Hours",
  description: "Get a free shipping quote for products from China to the USA. LCL and FCL sea freight, door-to-door delivery, customs clearance included. Instant CBM and cost estimates.",
  openGraph: {
    title: "Get a Free Shipping Quote | Doge Consulting",
    description: "Free shipping quote from China to the USA. LCL/FCL, door-to-door, customs included.",
    url: "https://doge-consulting.com/quote",
  },
  alternates: { canonical: "https://doge-consulting.com/quote" },
};

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return (<><JsonLd data={breadcrumbSchema([{name:"Home",url:"https://doge-consulting.com"},{name:"Get Quote",url:"https://doge-consulting.com/quote"}])} />{children}</>);
}
