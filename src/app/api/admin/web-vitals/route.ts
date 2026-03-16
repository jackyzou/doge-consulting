import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET — retrieve web vital metrics for admin dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);
  const since = new Date(Date.now() - days * 86400000);

  const vitals = await prisma.webVital.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  // Aggregate by metric name
  const metrics: Record<string, { values: number[]; good: number; poor: number; total: number }> = {};
  for (const v of vitals) {
    if (!metrics[v.name]) metrics[v.name] = { values: [], good: 0, poor: 0, total: 0 };
    metrics[v.name].values.push(v.value);
    metrics[v.name].total++;
    if (v.rating === "good") metrics[v.name].good++;
    if (v.rating === "poor") metrics[v.name].poor++;
  }

  const summary = Object.entries(metrics).map(([name, data]) => {
    const sorted = [...data.values].sort((a, b) => a - b);
    const p75 = sorted[Math.floor(sorted.length * 0.75)] || 0;
    const median = sorted[Math.floor(sorted.length * 0.5)] || 0;
    return {
      name,
      p75: Math.round(p75 * 100) / 100,
      median: Math.round(median * 100) / 100,
      goodPct: Math.round((data.good / data.total) * 100),
      poorPct: Math.round((data.poor / data.total) * 100),
      total: data.total,
    };
  });

  // Aggregate by page path (top 20 slowest)
  const byPage: Record<string, { lcp: number[]; cls: number[]; inp: number[] }> = {};
  for (const v of vitals) {
    if (!["LCP", "CLS", "INP"].includes(v.name)) continue;
    if (!byPage[v.path]) byPage[v.path] = { lcp: [], cls: [], inp: [] };
    const key = v.name.toLowerCase() as "lcp" | "cls" | "inp";
    byPage[v.path][key].push(v.value);
  }

  const pages = Object.entries(byPage)
    .map(([path, data]) => ({
      path,
      lcpP75: Math.round((data.lcp.sort((a, b) => a - b)[Math.floor(data.lcp.length * 0.75)] || 0) * 100) / 100,
      clsP75: Math.round((data.cls.sort((a, b) => a - b)[Math.floor(data.cls.length * 0.75)] || 0) * 1000) / 1000,
      inpP75: Math.round((data.inp.sort((a, b) => a - b)[Math.floor(data.inp.length * 0.75)] || 0)),
      samples: data.lcp.length + data.cls.length + data.inp.length,
    }))
    .sort((a, b) => b.lcpP75 - a.lcpP75)
    .slice(0, 20);

  // Daily trend (last N days)
  const dailyMap: Record<string, Record<string, number[]>> = {};
  for (const v of vitals) {
    const day = v.createdAt.toISOString().slice(0, 10);
    if (!dailyMap[day]) dailyMap[day] = {};
    if (!dailyMap[day][v.name]) dailyMap[day][v.name] = [];
    dailyMap[day][v.name].push(v.value);
  }

  const daily = Object.entries(dailyMap)
    .map(([date, metrics]) => {
      const result: Record<string, number | string> = { date };
      for (const [name, values] of Object.entries(metrics)) {
        const sorted = values.sort((a, b) => a - b);
        result[name] = Math.round((sorted[Math.floor(sorted.length * 0.75)] || 0) * 100) / 100;
      }
      return result;
    })
    .sort((a, b) => (a.date as string).localeCompare(b.date as string));

  return NextResponse.json({ summary, pages, daily, totalSamples: vitals.length });
}
