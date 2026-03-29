import { NextRequest, NextResponse } from "next/server";
import {
  calculateRevenue,
  PRODUCT_CATEGORIES,
  SOURCE_COUNTRIES,
  DESTINATIONS,
  COMPLIANCE_PROFILES,
  FREIGHT_MODES,
  INCOTERMS,
  type RevenueCalcInput,
} from "@/lib/landed-cost-calculator";

// POST /api/tools/revenue-calculator — Calculate import profitability
// Public API — no auth required. For AI agents and programmatic access.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const input: RevenueCalcInput = {
      sourceCountryId: body.sourceCountry || body.sourceCountryId || "china",
      destinationId: body.destination || body.destinationId || "us",
      categoryId: body.productCategory || body.categoryId || "furniture-wood",
      complianceProfileId: body.complianceProfile || body.complianceProfileId || "standard",
      freightMode: body.freightMode || "ocean-lcl",
      incotermCode: body.incoterm || body.incotermCode || "FOB",
      productCostPerUnit: Number(body.productCostPerUnit) || 0,
      quantity: Number(body.quantity) || 1,
      skuCount: Number(body.skuCount) || 1,
      freightCostTotal: Number(body.freightCostTotal) || 0,
      insuranceCostTotal: Number(body.insuranceCostTotal) || 0,
      originChargesTotal: Number(body.originChargesTotal) || 0,
      includeSection301: body.includeSection301 ?? true,
      includeSection122: body.includeSection122 ?? false,
      includeCustomsBond: body.includeCustomsBond ?? false,
      sellingPricePerUnit: Number(body.sellingPricePerUnit) || 0,
      otherCostsPerUnit: Number(body.otherCostsPerUnit) || 0,
    };

    if (input.productCostPerUnit <= 0 || input.quantity <= 0) {
      return NextResponse.json(
        { error: "productCostPerUnit and quantity are required and must be > 0" },
        { status: 400 }
      );
    }

    const result = calculateRevenue(input);

    return NextResponse.json({
      ok: true,
      input: { ...input },
      result,
      _meta: {
        tool: "revenue-calculator",
        version: "1.0",
        docs: "https://doge-consulting.com/skills/revenue-calculator.md",
        ui: "https://doge-consulting.com/tools/revenue-calculator",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Calculation error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// GET /api/tools/revenue-calculator — Return available options (categories, countries, etc.)
export async function GET() {
  return NextResponse.json({
    tool: "revenue-calculator",
    description: "Calculate import profitability including duties, tariffs, Section 301/122, compliance costs, and landed cost breakdown.",
    version: "1.0",
    docs: "https://doge-consulting.com/skills/revenue-calculator.md",
    ui: "https://doge-consulting.com/tools/revenue-calculator",
    method: "POST",
    options: {
      sourceCountries: SOURCE_COUNTRIES.map(c => ({ id: c.id, label: c.label })),
      destinations: DESTINATIONS.map(d => ({ id: d.id, label: d.label })),
      productCategories: PRODUCT_CATEGORIES.map(c => ({ id: c.id, label: c.label, htsChapter: c.htsChapter, dutyRate: c.dutyRates.us })),
      complianceProfiles: COMPLIANCE_PROFILES.map(p => ({ id: p.id, label: p.label })),
      freightModes: FREIGHT_MODES.map(m => ({ id: m.id, label: m.label })),
      incoterms: INCOTERMS.map(i => ({ code: i.code, label: i.label })),
    },
    exampleRequest: {
      sourceCountry: "china",
      destination: "us",
      productCategory: "window-blinds",
      productCostPerUnit: 18,
      quantity: 500,
      freightCostTotal: 1750,
      sellingPricePerUnit: 79,
      includeSection301: true,
      includeSection122: true,
    },
  });
}
