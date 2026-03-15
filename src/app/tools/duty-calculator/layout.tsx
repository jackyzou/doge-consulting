import type { Metadata } from "next";
import { JsonLd, softwareAppSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Import Duty Calculator — 2026 US Tariff Estimator",
  description: "Free import duty calculator for 2026: estimate US customs duties including IEEPA tariffs, Section 301 (25%), Section 122 (15%), MPF, and HMT. Updated for the latest trade policy.",
  openGraph: {
    title: "Free 2026 Import Duty Calculator | Doge Consulting",
    description: "Estimate US import duties: IEEPA, Section 301, Section 122, MPF, HMT. Updated March 2026.",
    url: "https://doge-consulting.com/tools/duty-calculator",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/duty-calculator" },
};

export default function DutyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: "Import Duty Calculator — 2026 US Tariff Estimator",
        description: "Free online import duty calculator. Estimate US customs duties including IEEPA, Section 301, Section 122, MPF, and HMT.",
        url: "https://doge-consulting.com/tools/duty-calculator",
      })} />
      {children}
    </>
  );
}
