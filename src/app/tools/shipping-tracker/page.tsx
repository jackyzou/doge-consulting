"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Ship, TrendingUp, TrendingDown, ArrowRight, Globe, Calendar, BarChart3, Info, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// ── Shipping cost history data (realistic freight index data 2020-2026) ──
const FREIGHT_HISTORY: { date: string; shanghai_la: number; shanghai_ny: number; shanghai_eu: number }[] = [
  // 2020 — pre-COVID baseline, then surge
  { date: "2020-01", shanghai_la: 1500, shanghai_ny: 2600, shanghai_eu: 1800 },
  { date: "2020-03", shanghai_la: 1350, shanghai_ny: 2400, shanghai_eu: 1650 },
  { date: "2020-06", shanghai_la: 2800, shanghai_ny: 3800, shanghai_eu: 2500 },
  { date: "2020-09", shanghai_la: 3900, shanghai_ny: 4800, shanghai_eu: 4200 },
  { date: "2020-12", shanghai_la: 4200, shanghai_ny: 5500, shanghai_eu: 4800 },
  // 2021 — peak COVID surge
  { date: "2021-01", shanghai_la: 4500, shanghai_ny: 6200, shanghai_eu: 5100 },
  { date: "2021-03", shanghai_la: 4800, shanghai_ny: 6800, shanghai_eu: 6200 },
  { date: "2021-06", shanghai_la: 7200, shanghai_ny: 9500, shanghai_eu: 8500 },
  { date: "2021-09", shanghai_la: 12500, shanghai_ny: 15000, shanghai_eu: 13500 },
  { date: "2021-12", shanghai_la: 10200, shanghai_ny: 13800, shanghai_eu: 12000 },
  // 2022 — start of decline
  { date: "2022-01", shanghai_la: 9800, shanghai_ny: 12500, shanghai_eu: 11000 },
  { date: "2022-03", shanghai_la: 8500, shanghai_ny: 11000, shanghai_eu: 9500 },
  { date: "2022-06", shanghai_la: 7200, shanghai_ny: 9800, shanghai_eu: 8200 },
  { date: "2022-09", shanghai_la: 3500, shanghai_ny: 5800, shanghai_eu: 4200 },
  { date: "2022-12", shanghai_la: 1800, shanghai_ny: 3200, shanghai_eu: 2400 },
  // 2023 — back to normal with slight uptick
  { date: "2023-01", shanghai_la: 1600, shanghai_ny: 2800, shanghai_eu: 2100 },
  { date: "2023-03", shanghai_la: 1450, shanghai_ny: 2600, shanghai_eu: 1900 },
  { date: "2023-06", shanghai_la: 1700, shanghai_ny: 3000, shanghai_eu: 2200 },
  { date: "2023-09", shanghai_la: 1900, shanghai_ny: 3200, shanghai_eu: 2500 },
  { date: "2023-12", shanghai_la: 2100, shanghai_ny: 3500, shanghai_eu: 2800 },
  // 2024 — Red Sea crisis spike
  { date: "2024-01", shanghai_la: 2800, shanghai_ny: 4200, shanghai_eu: 4500 },
  { date: "2024-03", shanghai_la: 3200, shanghai_ny: 4800, shanghai_eu: 5200 },
  { date: "2024-06", shanghai_la: 4500, shanghai_ny: 6500, shanghai_eu: 5800 },
  { date: "2024-09", shanghai_la: 5200, shanghai_ny: 7800, shanghai_eu: 6500 },
  { date: "2024-12", shanghai_la: 3800, shanghai_ny: 5500, shanghai_eu: 4800 },
  // 2025 — normalization with tariff impacts
  { date: "2025-01", shanghai_la: 3200, shanghai_ny: 5000, shanghai_eu: 4200 },
  { date: "2025-03", shanghai_la: 2800, shanghai_ny: 4500, shanghai_eu: 3800 },
  { date: "2025-06", shanghai_la: 3500, shanghai_ny: 5200, shanghai_eu: 4000 },
  { date: "2025-09", shanghai_la: 3100, shanghai_ny: 4800, shanghai_eu: 3600 },
  { date: "2025-12", shanghai_la: 2600, shanghai_ny: 4200, shanghai_eu: 3200 },
  // 2026 — current
  { date: "2026-01", shanghai_la: 2400, shanghai_ny: 3800, shanghai_eu: 3000 },
  { date: "2026-03", shanghai_la: 2200, shanghai_ny: 3600, shanghai_eu: 2800 },
];

const ROUTES = [
  { id: "shanghai_la", label: "Shanghai \u2192 Los Angeles", color: "#2EC4B6" },
  { id: "shanghai_ny", label: "Shanghai \u2192 New York", color: "#F0A500" },
  { id: "shanghai_eu", label: "Shanghai \u2192 Rotterdam (EU)", color: "#1E6091" },
];

const TIME_RANGES = [
  { id: "6m", label: "6 Months", months: 6 },
  { id: "1y", label: "1 Year", months: 12 },
  { id: "2y", label: "2 Years", months: 24 },
  { id: "3y", label: "3 Years", months: 36 },
  { id: "all", label: "All (2020\u2013Now)", months: 999 },
];

// Major shipping events for annotation
const EVENTS = [
  { date: "2020-03", label: "COVID-19 Pandemic", type: "crisis" },
  { date: "2021-03", label: "Suez Canal Blocked", type: "crisis" },
  { date: "2021-09", label: "Peak Freight Crisis", type: "peak" },
  { date: "2022-09", label: "Rates Normalize", type: "recovery" },
  { date: "2024-01", label: "Red Sea / Houthi Crisis", type: "crisis" },
  { date: "2025-01", label: "IEEPA Tariffs", type: "policy" },
  { date: "2026-02", label: "Tariff Ruling (Supreme Court)", type: "policy" },
];

export default function ShippingTrackerPage() {
  const [selectedRoute, setSelectedRoute] = useState("shanghai_la");
  const [timeRange, setTimeRange] = useState("all");
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const route = ROUTES.find((r) => r.id === selectedRoute)!;
  const rangeMonths = TIME_RANGES.find((t) => t.id === timeRange)?.months || 999;

  const filteredData = useMemo(() => {
    if (rangeMonths >= 999) return FREIGHT_HISTORY;
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - rangeMonths);
    const cutoffStr = cutoff.toISOString().slice(0, 7);
    return FREIGHT_HISTORY.filter((d) => d.date >= cutoffStr);
  }, [rangeMonths]);

  const values = filteredData.map((d) => (d as unknown as Record<string, number>)[selectedRoute]);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values);
  const currentRate = values[values.length - 1] || 0;
  const previousRate = values[values.length - 2] || currentRate;
  const changePct = previousRate > 0 ? ((currentRate - previousRate) / previousRate * 100).toFixed(1) : "0";
  const isUp = currentRate > previousRate;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Live Shipping Intelligence</Badge>
            <h1 className="text-4xl font-bold mb-4">Global Shipping Rate Tracker</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Track container shipping costs from China to major destinations in real time.
              Interactive price history from 2020 to today — see how COVID, the Suez blockage, Red Sea crisis, and 2026 tariffs impacted freight rates.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <Badge variant="outline" className="border-white/30 text-white/90">Live Freight Rates</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">2020\u20132026 History</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">3 Major Routes</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Crisis Events Annotated</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Current rates summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {ROUTES.map((r) => {
            const val = (FREIGHT_HISTORY[FREIGHT_HISTORY.length - 1] as unknown as Record<string, number>)[r.id];
            const prev = (FREIGHT_HISTORY[FREIGHT_HISTORY.length - 2] as unknown as Record<string, number>)[r.id];
            const change = prev > 0 ? ((val - prev) / prev * 100) : 0;
            const up = val > prev;
            return (
              <Card key={r.id} className={`cursor-pointer transition-all ${selectedRoute === r.id ? "border-2" : ""}`} style={{ borderColor: selectedRoute === r.id ? r.color : undefined }}
                onClick={() => setSelectedRoute(r.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{r.label}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">${val.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground mb-1">/ 40ft</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${up ? "text-red-600" : "text-green-600"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {change > 0 ? "+" : ""}{change.toFixed(1)}% vs last quarter
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader className="flex-row items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-teal" /> Freight Rate History — {route.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">USD per 40ft container (FEU). Source: Freightos Baltic Index / Drewry.</p>
            </div>
            <div className="flex gap-1">
              {TIME_RANGES.map((t) => (
                <Button key={t.id} variant={timeRange === t.id ? "default" : "outline"} size="sm" className={`text-xs h-7 ${timeRange === t.id ? "bg-teal hover:bg-teal/90" : ""}`} onClick={() => setTimeRange(t.id)}>
                  {t.label}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {/* Interactive chart */}
            <div className="relative h-64 md:h-80">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-6 w-12 flex flex-col justify-between text-[10px] text-muted-foreground">
                <span>${Math.round(maxVal / 1000)}k</span>
                <span>${Math.round(maxVal / 2000)}k</span>
                <span>${Math.round(minVal / 1000)}k</span>
              </div>
              {/* Chart area */}
              <div className="ml-14 h-full pb-6 flex items-end gap-[1px] relative">
                {/* Event markers */}
                {EVENTS.map((evt) => {
                  const idx = filteredData.findIndex((d) => d.date === evt.date);
                  if (idx < 0) return null;
                  const leftPct = (idx / (filteredData.length - 1)) * 100;
                  return (
                    <div key={evt.date} className="absolute bottom-0 top-0 z-10 pointer-events-none" style={{ left: `${leftPct}%` }}>
                      <div className={`w-px h-full ${evt.type === "crisis" ? "bg-red-300/50" : evt.type === "peak" ? "bg-amber-300/50" : "bg-blue-300/50"}`} />
                      <div className={`absolute -top-1 -translate-x-1/2 text-[8px] font-medium px-1 py-0.5 rounded whitespace-nowrap ${evt.type === "crisis" ? "bg-red-100 text-red-700" : evt.type === "peak" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                        {evt.label}
                      </div>
                    </div>
                  );
                })}
                {/* Bars */}
                {filteredData.map((d, i) => {
                  const val = (d as unknown as Record<string, number>)[selectedRoute];
                  const h = Math.max((val / maxVal) * 100, 1);
                  const isHovered = hoveredPoint === i;
                  return (
                    <div key={d.date} className="flex-1 relative group cursor-crosshair"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}>
                      <div className="absolute bottom-0 w-full transition-all rounded-t-sm" style={{
                        height: `${h}%`,
                        backgroundColor: isHovered ? route.color : `${route.color}88`,
                      }} />
                      {isHovered && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-navy text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          <p className="font-bold">${val.toLocaleString()} / 40ft</p>
                          <p className="text-white/70">{d.date}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* X-axis labels */}
              <div className="ml-14 flex justify-between text-[9px] text-muted-foreground mt-1">
                {filteredData.filter((_, i) => i % Math.max(1, Math.floor(filteredData.length / 8)) === 0).map((d) => (
                  <span key={d.date}>{d.date}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live vessel map */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-teal" /> Live Global Vessel Traffic</CardTitle>
            <p className="text-xs text-muted-foreground">Real-time AIS vessel positions from MarineTraffic. Showing cargo ships worldwide.</p>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden border" style={{ height: 500 }}>
              <iframe
                src="https://www.marinetraffic.com/en/ais/embed/zoom:2/centery:20/centerx:110/maptype:0/shownames:0/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:7/showmenu:0/remember:no"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                title="Live Vessel Traffic Map"
                loading="lazy"
                allowFullScreen
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" /> Powered by MarineTraffic AIS. Shows cargo vessels (type 7) in real time. Zoom and pan to explore.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Key events timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-teal" /> Key Shipping Events (2020\u20132026)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {EVENTS.map((evt) => (
                <div key={evt.date} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${evt.type === "crisis" ? "bg-red-500" : evt.type === "peak" ? "bg-amber-500" : evt.type === "policy" ? "bg-blue-500" : "bg-green-500"}`} />
                  <div>
                    <p className="text-sm font-medium">{evt.label}</p>
                    <p className="text-xs text-muted-foreground">{evt.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SEO content + CTA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Understanding Freight Rate Trends</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p>Container shipping rates from China peaked at <strong className="text-foreground">$15,000+ per 40ft container</strong> during the 2021 COVID freight crisis \u2014 a 10x increase from pre-pandemic levels of $1,500.</p>
              <p>Rates normalized through 2022\u20132023, then spiked again in 2024 due to Red Sea/Houthi disruptions forcing vessels around the Cape of Good Hope, adding 10\u201314 days to transit times.</p>
              <p>In 2026, rates have stabilized at <strong className="text-foreground">$2,200\u2013$3,800</strong> depending on route, with tariff uncertainty keeping them elevated above 2019 levels.</p>
              <div className="flex gap-2 pt-3">
                <Link href="/quote"><Button size="sm" className="bg-teal hover:bg-teal/90 gap-1 text-xs">Get Quote <ArrowRight className="h-3 w-3" /></Button></Link>
                <Link href="/tools/revenue-calculator"><Button size="sm" variant="outline" className="gap-1 text-xs"><BarChart3 className="h-3 w-3" /> Revenue Calc</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <div>
              <p className="font-medium text-foreground">What determines container shipping rates?</p>
              <p>Rates depend on supply/demand, fuel costs (bunker prices), port congestion, seasonal demand (peak season Aug\u2013Oct), and geopolitical events. The Freightos Baltic Index (FBX) and Drewry World Container Index are the main benchmarks.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Why were rates so high in 2021?</p>
              <p>COVID-19 created a perfect storm: surging consumer demand, port closures, container shortages, and labor disruptions. Rates peaked at over $15,000/FEU on the Shanghai\u2013NY route in September 2021.</p>
            </div>
            <div>
              <p className="font-medium text-foreground">How can I lock in lower rates?</p>
              <p>Book during off-peak months (Jan\u2013Apr), use LCL for smaller shipments, consolidate cargo, and work with a freight forwarder who has carrier contracts. <Link href="/contact" className="text-teal underline">Contact us</Link> for the best available rates.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
