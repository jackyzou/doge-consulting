import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Import Revenue Calculator — Free Profit & ROI Estimator",
  description: "Free import revenue calculator: estimate profit margins, landed costs, duties, ROI, and break-even for products imported from China. Model your import business economics.",
  openGraph: {
    title: "Free Import Revenue Calculator | Doge Consulting",
    description: "Model your import profit margins, landed costs, duties, and ROI.",
    url: "https://doge-consulting.com/tools/revenue-calculator",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/revenue-calculator" },
};

export default function RevenueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
