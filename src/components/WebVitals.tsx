"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function WebVitals() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    import("web-vitals").then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      const report = (metric: { name: string; value: number; rating: string }) => {
        const deviceType = window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
        navigator.sendBeacon(
          "/api/web-vitals",
          JSON.stringify({
            name: metric.name,
            value: Math.round(metric.value * 100) / 100,
            rating: metric.rating,
            path: pathname,
            deviceType,
          })
        );
      };

      onCLS(report);
      onFCP(report);
      onLCP(report);
      onTTFB(report);
      onINP(report);
    });
  }, [pathname]);

  return null;
}
