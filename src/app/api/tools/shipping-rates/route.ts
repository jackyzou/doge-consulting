import { NextRequest, NextResponse } from "next/server";

// Origins and destinations with price multipliers
const ORIGINS = [
  { id: "shenzhen", label: "Shenzhen", multiplier: 1.0 },
  { id: "hongkong", label: "Hong Kong", multiplier: 1.08 },
  { id: "shanghai", label: "Shanghai", multiplier: 0.91 },
  { id: "suzhou", label: "Suzhou / Ningbo", multiplier: 0.94 },
];

const DESTINATIONS = [
  { id: "la", label: "Los Angeles", multiplier: 1.0 },
  { id: "sea", label: "Seattle", multiplier: 0.88 },
  { id: "pdx", label: "Portland", multiplier: 0.86 },
  { id: "oak", label: "Oakland", multiplier: 0.95 },
  { id: "van", label: "Vancouver", multiplier: 0.84 },
  { id: "mzn", label: "Manzanillo", multiplier: 0.68 },
  { id: "lzc", label: "Lazaro Cardenas", multiplier: 0.65 },
];

// Base rate (Shenzhen → LA) — latest data point
const CURRENT_BASE_RATE = 2950; // USD per FEU, as of March 2026 Week 4
const LAST_UPDATED = "2026-03-24";

// GET /api/tools/shipping-rates — Get current freight rates for a route
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = searchParams.get("origin") || "shenzhen";
  const destination = searchParams.get("destination") || "la";

  const orig = ORIGINS.find(o => o.id === origin);
  const dest = DESTINATIONS.find(d => d.id === destination);

  if (!orig) {
    return NextResponse.json({ error: `Unknown origin: ${origin}. Available: ${ORIGINS.map(o => o.id).join(", ")}` }, { status: 400 });
  }
  if (!dest) {
    return NextResponse.json({ error: `Unknown destination: ${destination}. Available: ${DESTINATIONS.map(d => d.id).join(", ")}` }, { status: 400 });
  }

  const rate = Math.round(CURRENT_BASE_RATE * orig.multiplier * dest.multiplier);

  return NextResponse.json({
    ok: true,
    route: { origin: orig.label, destination: dest.label },
    currentRate: {
      amount: rate,
      currency: "USD",
      unit: "FEU (40ft container)",
      lastUpdated: LAST_UPDATED,
    },
    sources: ["Freightos Baltic Index (FBX)", "Drewry World Container Index (WCI)", "Xeneta XSI"],
    note: "Rates are spot market averages updated weekly. Actual rates may vary by carrier and booking date.",
    allRoutes: ORIGINS.flatMap(o =>
      DESTINATIONS.map(d => ({
        origin: o.label,
        destination: d.label,
        rate: Math.round(CURRENT_BASE_RATE * o.multiplier * d.multiplier),
      }))
    ),
    _meta: {
      tool: "shipping-rates",
      version: "1.0",
      docs: "https://doge-consulting.com/skills/shipping-rates.md",
      ui: "https://doge-consulting.com/tools/shipping-tracker",
    },
  });
}
