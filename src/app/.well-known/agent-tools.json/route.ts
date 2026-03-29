import { NextResponse } from "next/server";

// GET /.well-known/agent-tools.json — Agent tool discovery endpoint
// This allows AI agents to discover available tools on this site
export async function GET() {
  return NextResponse.json({
    schema_version: "1.0",
    name: "Doge Consulting Trade Tools",
    description: "AI-agent-ready import/export calculation tools. Calculate profitability, duties, shipping costs, and freight rates for China-to-US trade.",
    homepage: "https://doge-consulting.com",
    contact: "dogetech77@gmail.com",
    tools: [
      {
        name: "revenue-calculator",
        description: "Calculate full import profitability including landed cost, duties (Section 301, Section 122), compliance fees, and ROI. Supports 24 product categories, 13 source countries, 5 destinations.",
        endpoint: "https://doge-consulting.com/api/tools/revenue-calculator",
        method: "POST",
        skill: "https://doge-consulting.com/skills/revenue-calculator.md",
        ui: "https://doge-consulting.com/tools/revenue-calculator",
      },
      {
        name: "duty-calculator",
        description: "Calculate US import duty by product category and origin country. Returns base duty, Section 301 tariff, MPF, HMF, and effective rate.",
        endpoint: "https://doge-consulting.com/api/tools/duty-calculator",
        method: "POST",
        skill: "https://doge-consulting.com/skills/duty-calculator.md",
        ui: "https://doge-consulting.com/tools/duty-calculator",
      },
      {
        name: "cbm-calculator",
        description: "Calculate CBM (cubic meters), volumetric weight, and container fit for shipping items. Supports multiple units (cm, mm, in, ft, m).",
        endpoint: "https://doge-consulting.com/api/tools/cbm-calculator",
        method: "POST",
        skill: "https://doge-consulting.com/skills/cbm-calculator.md",
        ui: "https://doge-consulting.com/tools/cbm-calculator",
      },
      {
        name: "shipping-rates",
        description: "Get current container shipping rates (per FEU) between China ports and US/Canada/Mexico ports. Updated weekly from Freightos FBX and Drewry WCI.",
        endpoint: "https://doge-consulting.com/api/tools/shipping-rates",
        method: "GET",
        skill: "https://doge-consulting.com/skills/shipping-rates.md",
        ui: "https://doge-consulting.com/tools/shipping-tracker",
      },
    ],
    authentication: "none",
    rateLimit: "60 requests per minute per IP",
    license: "Free for non-commercial use. Commercial use requires attribution.",
  });
}
