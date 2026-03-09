import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Vessel Map & Freight Rate Tracker",
  description: "Free live vessel tracking map and container shipping rate history from Shenzhen, Shanghai, Hong Kong to US ports. Interactive SVG freight rate chart 2020-2026 with crisis annotations.",
  openGraph: {
    title: "Live Vessel Map & Freight Rates | Doge Consulting",
    description: "Real-time vessel tracking + freight rate history from China to USA ports (2020-2026).",
    url: "https://doge-consulting.com/tools/shipping-tracker",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/shipping-tracker" },
};

export default function ShippingTrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
