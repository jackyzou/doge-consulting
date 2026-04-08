import { NextResponse } from "next/server";

// GET /api/admin/exchange-rate — fetch live USD/CNY exchange rate
export async function GET() {
  try {
    // Try multiple free exchange rate APIs
    const apis = [
      { url: "https://open.er-api.com/v6/latest/USD", parse: (d: Record<string, unknown>) => (d.rates as Record<string, number>)?.CNY },
      { url: "https://api.exchangerate-api.com/v4/latest/USD", parse: (d: Record<string, unknown>) => (d.rates as Record<string, number>)?.CNY },
    ];

    for (const api of apis) {
      try {
        const res = await fetch(api.url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const rate = api.parse(data);
          if (rate && rate > 0) {
            return NextResponse.json({ rate, source: api.url, timestamp: new Date().toISOString() });
          }
        }
      } catch { /* try next */ }
    }

    // Fallback to approximate rate
    return NextResponse.json({ rate: 7.25, source: "fallback", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ rate: 7.25, source: "fallback", timestamp: new Date().toISOString() });
  }
}
