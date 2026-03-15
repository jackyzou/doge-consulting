import type { Metadata } from "next";
import { JsonLd, softwareAppSchema, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "3D Room Visualizer — Furniture Layout Planner",
  description: "Free 3D room visualizer: drag and drop Chinese-sourced furniture into a virtual room. Plan layouts, check dimensions, and get a shipping quote — all in your browser.",
  openGraph: {
    title: "Free 3D Room Visualizer | Doge Consulting",
    description: "Plan your room layout with Chinese-sourced furniture in 3D. Get a shipping quote instantly.",
    url: "https://doge-consulting.com/tools/3d-visualizer",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/3d-visualizer" },
};

export default function VisualizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: "3D Room Visualizer — Furniture Layout Planner",
        description: "Free online 3D room visualizer for planning furniture layouts with Chinese-sourced products. Drag and drop, check dimensions, get instant shipping quotes.",
        url: "https://doge-consulting.com/tools/3d-visualizer",
      })} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://doge-consulting.com" },
        { name: "Tools", url: "https://doge-consulting.com/tools" },
        { name: "3D Visualizer", url: "https://doge-consulting.com/tools/3d-visualizer" },
      ])} />
      {children}
    </>
  );
}
