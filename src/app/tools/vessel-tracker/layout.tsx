import type { Metadata } from "next";
import { JsonLd, softwareAppSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Container Tracker — Search by Container Number or Bill of Lading",
  description: "Free container tracking tool: search by container number or bill of lading. Live vessel positions, port call timelines, 8 major chokepoint views, and Shenzhen-Seattle route visualization.",
  openGraph: {
    title: "Free Container Tracker | Doge Consulting",
    description: "Track containers by number or B/L. Live vessel map with chokepoint zoom.",
    url: "https://doge-consulting.com/tools/vessel-tracker",
  },
  alternates: { canonical: "https://doge-consulting.com/tools/vessel-tracker" },
};

export default function VesselTrackerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={softwareAppSchema({
        name: "Container Tracker — Search by Container or B/L",
        description: "Free container tracking by number or bill of lading. Live vessel positions, port call timelines, and chokepoint views.",
        url: "https://doge-consulting.com/tools/vessel-tracker",
      })} />
      {children}
    </>
  );
}
