import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CBM Calculator — Free Cubic Meter & Freight Volume Tool",
  description: "Free CBM calculator: calculate cubic meters, volumetric weight, and container fit for shipping. Supports cm, inches, feet, meters. Includes 20ft, 40ft, and 40HC containers.",
  openGraph: {
    title: "Free CBM Calculator | Doge Consulting",
    description: "Calculate freight volume (CBM), volumetric weight, and container fit. Supports all units.",
    url: "https://doge-consulting.com/tools/cbm-calculator",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/cbm-calculator" },
};

export default function CbmLayout({ children }: { children: React.ReactNode }) {
  return children;
}
