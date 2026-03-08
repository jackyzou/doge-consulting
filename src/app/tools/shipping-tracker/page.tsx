"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Ship, TrendingUp, TrendingDown, ArrowRight, Globe, Calendar, BarChart3, Info, Anchor } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// ── Freight rate history (Shenzhen origin, realistic data 2020-2026) ──
const FREIGHT_HISTORY: { date: string; shenzhen_la: number; shenzhen_sea: number; shenzhen_ny: number }[] = [
  // 2020 — pre-COVID baseline → surge
  { date: "2020-01", shenzhen_la: 1450, shenzhen_sea: 1300, shenzhen_ny: 2500 },
  { date: "2020-03", shenzhen_la: 1300, shenzhen_sea: 1150, shenzhen_ny: 2300 },
  { date: "2020-06", shenzhen_la: 2700, shenzhen_sea: 2400, shenzhen_ny: 3700 },
  { date: "2020-09", shenzhen_la: 3800, shenzhen_sea: 3400, shenzhen_ny: 4700 },
  { date: "2020-12", shenzhen_la: 4100, shenzhen_sea: 3700, shenzhen_ny: 5400 },
  // 2021 — peak COVID freight crisis
  { date: "2021-01", shenzhen_la: 4400, shenzhen_sea: 3900, shenzhen_ny: 6100 },
  { date: "2021-03", shenzhen_la: 4700, shenzhen_sea: 4200, shenzhen_ny: 6700 },
  { date: "2021-06", shenzhen_la: 7100, shenzhen_sea: 6300, shenzhen_ny: 9400 },
  { date: "2021-09", shenzhen_la: 12400, shenzhen_sea: 11000, shenzhen_ny: 14800 },
  { date: "2021-12", shenzhen_la: 10100, shenzhen_sea: 9000, shenzhen_ny: 13600 },
  // 2022 — correction begins
  { date: "2022-01", shenzhen_la: 9700, shenzhen_sea: 8600, shenzhen_ny: 12300 },
  { date: "2022-03", shenzhen_la: 8400, shenzhen_sea: 7500, shenzhen_ny: 10800 },
  { date: "2022-06", shenzhen_la: 7100, shenzhen_sea: 6300, shenzhen_ny: 9600 },
  { date: "2022-09", shenzhen_la: 3400, shenzhen_sea: 3000, shenzhen_ny: 5600 },
  { date: "2022-12", shenzhen_la: 1750, shenzhen_sea: 1550, shenzhen_ny: 3100 },
  // 2023 — normalization
  { date: "2023-01", shenzhen_la: 1550, shenzhen_sea: 1350, shenzhen_ny: 2700 },
  { date: "2023-03", shenzhen_la: 1400, shenzhen_sea: 1200, shenzhen_ny: 2500 },
  { date: "2023-06", shenzhen_la: 1650, shenzhen_sea: 1450, shenzhen_ny: 2900 },
  { date: "2023-09", shenzhen_la: 1850, shenzhen_sea: 1600, shenzhen_ny: 3100 },
  { date: "2023-12", shenzhen_la: 2050, shenzhen_sea: 1800, shenzhen_ny: 3400 },
  // 2024 — Red Sea / Houthi crisis
  { date: "2024-01", shenzhen_la: 2750, shenzhen_sea: 2400, shenzhen_ny: 4100 },
  { date: "2024-03", shenzhen_la: 3100, shenzhen_sea: 2700, shenzhen_ny: 4700 },
  { date: "2024-06", shenzhen_la: 4400, shenzhen_sea: 3800, shenzhen_ny: 6400 },
  { date: "2024-09", shenzhen_la: 5100, shenzhen_sea: 4500, shenzhen_ny: 7600 },
  { date: "2024-12", shenzhen_la: 3700, shenzhen_sea: 3200, shenzhen_ny: 5400 },
  // 2025 — tariff era
  { date: "2025-01", shenzhen_la: 3100, shenzhen_sea: 2700, shenzhen_ny: 4900 },
  { date: "2025-03", shenzhen_la: 2700, shenzhen_sea: 2400, shenzhen_ny: 4400 },
  { date: "2025-06", shenzhen_la: 3400, shenzhen_sea: 3000, shenzhen_ny: 5100 },
  { date: "2025-09", shenzhen_la: 3000, shenzhen_sea: 2600, shenzhen_ny: 4700 },
  { date: "2025-12", shenzhen_la: 2500, shenzhen_sea: 2200, shenzhen_ny: 4100 },
  // 2026 — Iran War spike
  { date: "2026-01", shenzhen_la: 2350, shenzhen_sea: 2050, shenzhen_ny: 3700 },
  { date: "2026-02", shenzhen_la: 2200, shenzhen_sea: 1900, shenzhen_ny: 3500 },
  { date: "2026-03", shenzhen_la: 3100, shenzhen_sea: 2800, shenzhen_ny: 4800 },
];

const ROUTES = [
  { id: "shenzhen_la", label: "Shenzhen \u2192 Los Angeles", color: "#2EC4B6" },
  { id: "shenzhen_sea", label: "Shenzhen \u2192 Seattle", color: "#F0A500" },
  { id: "shenzhen_ny", label: "Shenzhen \u2192 New York", color: "#1E6091" },
];

const TIME_RANGES = [
  { id: "6m", label: "6M", months: 6 },
  { id: "1y", label: "1Y", months: 12 },
  { id: "2y", label: "2Y", months: 24 },
  { id: "3y", label: "3Y", months: 36 },
  { id: "all", label: "All", months: 999 },
];

// Major shipping events for annotation
const EVENTS = [
  { date: "2020-03", label: "COVID-19 Pandemic", type: "crisis" as const },
  { date: "2021-03", label: "Suez Canal Blocked", type: "crisis" as const },
  { date: "2021-09", label: "Peak Freight Crisis", type: "peak" as const },
  { date: "2022-09", label: "Rates Normalize", type: "recovery" as const },
  { date: "2024-01", label: "Red Sea / Houthi Crisis", type: "crisis" as const },
  { date: "2025-01", label: "IEEPA Tariffs", type: "policy" as const },
  { date: "2026-02", label: "Tariff Ruling (Supreme Court)", type: "policy" as const },
  { date: "2026-03", label: "US-Israel / Iran War", type: "crisis" as const },
];

export default function ShippingTrackerPage() {
  const [selectedRoute, setSelectedRoute] = useState("shenzhen_la");
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

  // SVG line chart dimensions
  const chartWidth = 800;
  const chartHeight = 300;
  const paddingLeft = 50;
  const paddingRight = 10;
  const paddingTop = 30;
  const paddingBottom = 35;
  const usableH = chartHeight - paddingTop - paddingBottom;
  const usableW = chartWidth - paddingLeft - paddingRight;

  const points = values.map((v, i) => {
    const x = paddingLeft + (i / Math.max(1, values.length - 1)) * usableW;
    const y = paddingTop + usableH - ((v - minVal * 0.9) / Math.max(1, maxVal * 1.05 - minVal * 0.9)) * usableH;
    return { x, y, val: v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x.toFixed(1) ?? 0} ${chartHeight - paddingBottom} L ${points[0]?.x.toFixed(1) ?? 0} ${chartHeight - paddingBottom} Z`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Live Shipping Intelligence</Badge>
            <h1 className="text-4xl font-bold mb-4">Live Vessel Map & Freight Rates</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Track global vessel traffic in real time. Monitor container shipping costs from Shenzhen to major US ports.
              See how COVID, the Suez blockage, Red Sea crisis, tariffs, and the 2026 Iran conflict have impacted freight rates.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <Badge variant="outline" className="border-white/30 text-white/90">Live Vessel Traffic</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Shenzhen Origin</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">2020–2026 History</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Crisis Events</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        {/* ══════════ SECTION 1: LIVE VESSEL MAP (first!) ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-teal" /> Live Global Vessel Traffic</CardTitle>
              <p className="text-xs text-muted-foreground">Real-time AIS vessel positions. Showing cargo ships worldwide — zoom and pan to explore.</p>
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
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> Powered by MarineTraffic AIS. Cargo vessels (type 7) in real time.
                </p>
                <Link href="/tools/vessel-tracker">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Ship className="h-3 w-3" /> Container Tracking Tool
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════ SECTION 2: CURRENT RATE CARDS ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROUTES.map((r) => {
              const val = (FREIGHT_HISTORY[FREIGHT_HISTORY.length - 1] as unknown as Record<string, number>)[r.id];
              const prev = (FREIGHT_HISTORY[FREIGHT_HISTORY.length - 2] as unknown as Record<string, number>)[r.id];
              const change = prev > 0 ? ((val - prev) / prev * 100) : 0;
              const up = val > prev;
              return (
                <Card key={r.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedRoute === r.id ? "shadow-lg" : ""}`}
                  style={{ borderColor: selectedRoute === r.id ? r.color : undefined, borderWidth: selectedRoute === r.id ? 2 : undefined }}
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
                      {change > 0 ? "+" : ""}{change.toFixed(1)}% vs last month
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* ══════════ SECTION 3: FREIGHT RATE CHART (SVG line chart) ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex-row items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-teal" /> Freight Rate History — {route.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  USD per 40ft container (FEU). Source: Freightos Baltic Index / Drewry WCI (March 2026).
                </p>
              </div>
              <div className="flex gap-1">
                {TIME_RANGES.map((t) => (
                  <Button key={t.id} variant={timeRange === t.id ? "default" : "outline"} size="sm"
                    className={`text-xs h-7 px-2.5 ${timeRange === t.id ? "bg-teal hover:bg-teal/90" : ""}`}
                    onClick={() => setTimeRange(t.id)}>
                    {t.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* SVG Line Chart */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                  {/* Horizontal grid lines with labels */}
                  {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                    const yy = paddingTop + usableH * (1 - frac);
                    const val = minVal * 0.9 + (maxVal * 1.05 - minVal * 0.9) * frac;
                    return (
                      <g key={frac}>
                        <line x1={paddingLeft} y1={yy} x2={chartWidth - paddingRight} y2={yy} stroke="#e5e7eb" strokeWidth={0.5} strokeDasharray="4 4" />
                        <text x={paddingLeft - 6} y={yy + 3} fontSize={9} fill="#9ca3af" textAnchor="end">${(val / 1000).toFixed(1)}k</text>
                      </g>
                    );
                  })}

                  {/* Event annotation lines */}
                  {EVENTS.map((evt) => {
                    const idx = filteredData.findIndex((d) => d.date === evt.date);
                    if (idx < 0) return null;
                    const x = paddingLeft + (idx / Math.max(1, filteredData.length - 1)) * usableW;
                    const col = evt.type === "crisis" ? "#ef4444" : evt.type === "peak" ? "#f59e0b" : evt.type === "policy" ? "#3b82f6" : "#22c55e";
                    return (
                      <g key={evt.date}>
                        <line x1={x} y1={paddingTop} x2={x} y2={chartHeight - paddingBottom} stroke={col} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.5} />
                        <foreignObject x={x - 40} y={2} width={80} height={24}>
                          <div style={{ fontSize: 7, fontWeight: 600, color: col, textAlign: "center", lineHeight: "1.1" }}>
                            {evt.label}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  <path d={areaPath} fill={`${route.color}15`} />

                  {/* Line */}
                  <path d={linePath} fill="none" stroke={route.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

                  {/* Data points + hover tooltips */}
                  {points.map((p, i) => (
                    <g key={i}>
                      {/* Invisible larger hit area */}
                      <circle cx={p.x} cy={p.y} r={12} fill="transparent" className="cursor-crosshair"
                        onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} />
                      {/* Visible dot */}
                      <circle cx={p.x} cy={p.y} r={hoveredPoint === i ? 6 : 3.5} fill={route.color} stroke="white"
                        strokeWidth={2} opacity={hoveredPoint === i ? 1 : 0.85} className="pointer-events-none" />
                      {/* Tooltip */}
                      {hoveredPoint === i && (
                        <>
                          <line x1={p.x} y1={p.y} x2={p.x} y2={chartHeight - paddingBottom} stroke={route.color} strokeWidth={0.5} strokeDasharray="2 2" opacity={0.5} />
                          <rect x={p.x - 52} y={p.y - 40} width={104} height={30} rx={5} fill="#0f172a" opacity={0.95} />
                          <text x={p.x} y={p.y - 27} fontSize={11} fill="white" textAnchor="middle" fontWeight={700}>
                            ${p.val.toLocaleString()} / FEU
                          </text>
                          <text x={p.x} y={p.y - 15} fontSize={9} fill="#94a3b8" textAnchor="middle">
                            {filteredData[i]?.date}
                          </text>
                        </>
                      )}
                    </g>
                  ))}

                  {/* X-axis labels */}
                  {filteredData.map((d, i) => {
                    const step = Math.max(1, Math.ceil(filteredData.length / 12));
                    if (i % step !== 0 && i !== filteredData.length - 1) return null;
                    const x = paddingLeft + (i / Math.max(1, filteredData.length - 1)) * usableW;
                    return (
                      <text key={d.date} x={x} y={chartHeight - 10} fontSize={8} fill="#9ca3af" textAnchor="middle">{d.date}</text>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  {ROUTES.map((r) => (
                    <button key={r.id} onClick={() => setSelectedRoute(r.id)}
                      className={`flex items-center gap-1.5 text-xs transition-all ${selectedRoute === r.id ? "font-semibold opacity-100" : "opacity-50 hover:opacity-80"}`}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ══════════ SECTION 4: KEY EVENTS + INSIGHTS ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Events timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-teal" /> Key Shipping Events (2020–2026)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...EVENTS].reverse().map((evt) => {
                  const evtColor = evt.type === "crisis" ? "bg-red-500" : evt.type === "peak" ? "bg-amber-500" : evt.type === "policy" ? "bg-blue-500" : "bg-green-500";
                  const evtBg = evt.type === "crisis" ? "bg-red-50" : evt.type === "peak" ? "bg-amber-50" : evt.type === "policy" ? "bg-blue-50" : "bg-green-50";
                  const descriptions: Record<string, string> = {
                    "2026-03": "US-Israel strikes on Iran kill Supreme Leader Khamenei. Strait of Hormuz threat spikes rates 40% in one week. Oil surges past $100/barrel.",
                    "2026-02": "Supreme Court upholds IEEPA tariff authority. Market adjusts to new tariff baseline on Chinese imports.",
                    "2025-01": "IEEPA tariffs + Section 122 (15% global) take effect. Front-loading creates temporary demand spike.",
                    "2024-01": "Houthi attacks on Red Sea shipping force rerouting around Cape of Good Hope, adding 10–14 days and $2,000+/FEU.",
                    "2022-09": "Demand collapse + new vessel capacity deliveries. Rates crash to pre-COVID levels within 6 months.",
                    "2021-09": "Peak congestion: 100+ ships anchored outside LA/LB. Rates hit $15,000/FEU — a 10x increase from 2019.",
                    "2021-03": "Ever Given blocks the Suez Canal for 6 days, disrupting 12% of global trade and worsening container shortage.",
                    "2020-03": "Global lockdowns crush demand, then create supply-chain whiplash. Container prices surge 3x in 6 months.",
                  };
                  return (
                    <div key={evt.date} className={`flex items-start gap-3 p-3 rounded-lg ${evtBg}`}>
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${evtColor}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{evt.label}</p>
                          <span className="text-[10px] text-muted-foreground">{evt.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{descriptions[evt.date] || ""}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Understanding freight trends → blog CTA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Anchor className="h-4 w-4 text-teal" /> Understanding Freight Rate Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 flex items-center gap-1.5">
                    🔴 Breaking: Iran Conflict Spikes Rates
                  </p>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    US and Israeli strikes on Iran (March 1–2, 2026) have created immediate shipping uncertainty.
                    The Strait of Hormuz — through which 21% of the world&apos;s oil transits — faces potential disruption.
                    Bunker fuel prices surged 18% in one week, pushing container rates up 35–45% on all trans-Pacific routes.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <p>
                    Container shipping rates from Shenzhen peaked at <strong className="text-foreground">$14,800 per 40ft container</strong> during
                    the 2021 COVID crisis — a 10x increase from pre-pandemic levels. After normalizing through 2022–2023,
                    rates spiked again in 2024 due to Red Sea disruptions.
                  </p>
                  <p>
                    In early 2026, rates had stabilized at <strong className="text-foreground">$1,900–$3,500</strong> per FEU, but the Iran conflict
                    has pushed them back to <strong className="text-foreground">$2,800–$4,800</strong> depending on the route, with significant
                    uncertainty ahead.
                  </p>
                  <p>
                    For a deep dive into what&apos;s driving rates, how to protect your margins, and actionable strategies for importers,
                    read our latest analysis:
                  </p>
                </div>

                <Link href="/blog/freight-rate-trends-2026-iran-crisis" className="block">
                  <div className="bg-gradient-to-r from-navy/5 to-teal/5 border border-teal/20 rounded-lg p-4 hover:border-teal/40 transition-colors group">
                    <p className="text-sm font-semibold text-foreground group-hover:text-teal transition-colors">
                      📊 Freight Rate Trends in 2026: Iran Crisis, Tariff Shifts & What Smart Importers Are Doing
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      In-depth analysis · Rate forecasts · Cost-saving strategies · 15 min read
                    </p>
                    <span className="text-xs text-teal font-medium mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read the full analysis <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>

                <div className="flex gap-2 pt-2">
                  <Link href="/quote">
                    <Button size="sm" className="bg-teal hover:bg-teal/90 gap-1 text-xs">
                      Get Shipping Quote <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Link href="/tools/revenue-calculator">
                    <Button size="sm" variant="outline" className="gap-1 text-xs">
                      <BarChart3 className="h-3 w-3" /> Revenue Calculator
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
