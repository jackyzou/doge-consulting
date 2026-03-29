import { NextRequest, NextResponse } from "next/server";

// POST /api/tools/cbm-calculator — Calculate CBM, volumetric weight, and container fit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const results = items.map((item: Record<string, unknown>, idx: number) => {
      const unit = (item.unit as string || "cm").toLowerCase();
      let l = Number(item.length || item.l) || 0;
      let w = Number(item.width || item.w) || 0;
      let h = Number(item.height || item.h) || 0;
      const qty = Number(item.quantity || item.qty) || 1;
      const weight = Number(item.weight || item.wt) || 0;

      // Convert to cm
      const toCm: Record<string, number> = { cm: 1, mm: 0.1, in: 2.54, ft: 30.48, m: 100 };
      const factor = toCm[unit] || 1;
      l *= factor; w *= factor; h *= factor;

      const cbmPerUnit = (l / 100) * (w / 100) * (h / 100);
      const totalCbm = cbmPerUnit * qty;
      const volWeightPerUnit = cbmPerUnit * 167; // 1 CBM = 167kg for ocean
      const chargeableWeight = Math.max(weight, volWeightPerUnit);

      // Container fit
      const container20ft = 33.2; // CBM capacity
      const container40ft = 67.7;
      const unitsPer20ft = cbmPerUnit > 0 ? Math.floor(container20ft / cbmPerUnit) : 0;
      const unitsPer40ft = cbmPerUnit > 0 ? Math.floor(container40ft / cbmPerUnit) : 0;

      return {
        item: idx + 1,
        name: item.name || `Item ${idx + 1}`,
        dimensions: { length: l, width: w, height: h, unit: "cm" },
        quantity: qty,
        cbmPerUnit: Math.round(cbmPerUnit * 10000) / 10000,
        totalCbm: Math.round(totalCbm * 10000) / 10000,
        volumetricWeightKg: Math.round(volWeightPerUnit * 100) / 100,
        actualWeightKg: weight,
        chargeableWeightKg: Math.round(chargeableWeight * 100) / 100,
        containerFit: {
          unitsPer20ft,
          unitsPer40ft,
          containers20ftNeeded: totalCbm > 0 ? Math.ceil(totalCbm / container20ft) : 0,
          containers40ftNeeded: totalCbm > 0 ? Math.ceil(totalCbm / container40ft) : 0,
        },
      };
    });

    const totalCbm = results.reduce((sum: number, r: { totalCbm: number }) => sum + r.totalCbm, 0);

    return NextResponse.json({
      ok: true,
      items: results,
      summary: {
        totalItems: results.length,
        totalCbm: Math.round(totalCbm * 10000) / 10000,
        containers20ftNeeded: Math.ceil(totalCbm / 33.2),
        containers40ftNeeded: Math.ceil(totalCbm / 67.7),
      },
      _meta: {
        tool: "cbm-calculator",
        version: "1.0",
        docs: "https://doge-consulting.com/skills/cbm-calculator.md",
        ui: "https://doge-consulting.com/tools/cbm-calculator",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Calculation error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// GET — Usage info and presets
export async function GET() {
  return NextResponse.json({
    tool: "cbm-calculator",
    description: "Calculate CBM (cubic meters), volumetric weight, chargeable weight, and container fit for shipping items.",
    version: "1.0",
    docs: "https://doge-consulting.com/skills/cbm-calculator.md",
    ui: "https://doge-consulting.com/tools/cbm-calculator",
    method: "POST",
    presets: [
      { name: "Roller Blind (boxed)", l: 180, w: 12, h: 12, wt: 3 },
      { name: "Venetian Blind (boxed)", l: 190, w: 15, h: 15, wt: 5 },
      { name: "Sofa (3-seater)", l: 220, w: 90, h: 85, wt: 60 },
      { name: "Dining Table (6P)", l: 180, w: 90, h: 76, wt: 45 },
      { name: "Standard Carton", l: 60, w: 40, h: 40, wt: 15 },
    ],
    exampleRequest: {
      items: [
        { name: "Roller Blind", length: 180, width: 12, height: 12, weight: 3, quantity: 500, unit: "cm" },
      ],
    },
  });
}
