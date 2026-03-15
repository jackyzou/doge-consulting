import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "About Us — Why Doge? Because We Fetch.",
  description: "Doge Consulting bridges China's factories with American businesses using AI. Teams in Seattle, Hong Kong, and Shenzhen. DogeTech platform for digital supply chain transformation.",
  openGraph: {
    title: "About Doge Consulting — AI-Powered Global Trade",
    description: "Teams in Seattle, Hong Kong, and Shenzhen. AI-powered sourcing and shipping technology platform.",
    url: "https://doge-consulting.com/about",
  },
  alternates: { canonical: "https://doge-consulting.com/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (<><JsonLd data={breadcrumbSchema([{name:"Home",url:"https://doge-consulting.com"},{name:"About",url:"https://doge-consulting.com/about"}])} />{children}</>);
}
