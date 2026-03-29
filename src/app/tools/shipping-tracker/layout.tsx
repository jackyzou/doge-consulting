import type { Metadata } from "next";
import { JsonLd, softwareAppSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Live Shipping Price Tracker — Container Freight Rates from China to USA (2026)",
  description: "Track live container shipping prices from China to US ports. Interactive freight rate chart with 2020-2026 history, FEU pricing per route, crisis annotations, and real-time vessel traffic map. Updated weekly.",
  keywords: ["shipping price tracker", "freight rates china to usa", "container shipping cost", "FEU rate", "Freightos FBX", "shipping cost from china", "ocean freight rates 2026", "Shenzhen to Los Angeles shipping"],
  openGraph: {
    title: "Live Shipping Price Tracker | Container Rates from China to USA",
    description: "Interactive freight rate chart from China to US ports. Track live shipping prices per FEU, updated weekly with real data from Freightos FBX and Drewry WCI.",
    url: "https://doge-consulting.com/tools/shipping-tracker",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/shipping-tracker" },
};

export default function ShippingTrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: "Live Shipping Price Tracker",
        description: "Track container shipping prices from China to USA. Interactive freight rate chart with FEU pricing, route comparison, and real-time vessel traffic. Updated weekly from Freightos FBX and Drewry WCI.",
        url: "https://doge-consulting.com/tools/shipping-tracker",
      })} />
      {children}
    </>
  );
}
