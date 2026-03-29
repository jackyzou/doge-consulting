import { NextRequest, NextResponse } from "next/server";

// Duty rates by product category (same data as the UI page)
const PRODUCT_CATEGORIES = [
  { id: "furniture-wood", name: "Wood Furniture", htsChapter: "94", dutyRate: 0.0 },
  { id: "furniture-metal", name: "Metal Furniture", htsChapter: "94", dutyRate: 0.0 },
  { id: "furniture-upholstered", name: "Upholstered Furniture", htsChapter: "94", dutyRate: 0.0 },
  { id: "lighting", name: "Lighting & Lamps", htsChapter: "94", dutyRate: 3.9 },
  { id: "ceramics", name: "Ceramics & Porcelain", htsChapter: "69", dutyRate: 9.8 },
  { id: "stone-marble", name: "Stone & Marble", htsChapter: "68", dutyRate: 4.9 },
  { id: "textiles", name: "Textiles & Fabrics", htsChapter: "52-63", dutyRate: 12.0 },
  { id: "electronics-consumer", name: "Consumer Electronics", htsChapter: "85", dutyRate: 0.0 },
  { id: "appliances", name: "Home Appliances", htsChapter: "84-85", dutyRate: 2.4 },
  { id: "tools", name: "Tools & Hardware", htsChapter: "82", dutyRate: 5.3 },
  { id: "plastics", name: "Plastic Products", htsChapter: "39", dutyRate: 5.3 },
  { id: "glass", name: "Glass & Glassware", htsChapter: "70", dutyRate: 6.6 },
  { id: "window-blinds", name: "Window Blinds & Coverings", htsChapter: "63/39", dutyRate: 6.5 },
  { id: "toys", name: "Toys & Games", htsChapter: "95", dutyRate: 0.0 },
  { id: "bags-luggage", name: "Bags & Luggage", htsChapter: "42", dutyRate: 8.0 },
  { id: "footwear", name: "Footwear", htsChapter: "64", dutyRate: 10.0 },
];

const SECTION_301_RATE = 25;

// POST /api/tools/duty-calculator — Calculate import duty for a shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const productCategory = body.productCategory || body.categoryId || "furniture-wood";
    const productValue = Number(body.productValue) || 0;
    const shippingCost = Number(body.shippingCost) || 0;
    const insuranceCost = Number(body.insuranceCost) || 0;
    const originCountry = (body.originCountry || "china").toLowerCase();
    const includeSection301 = body.includeSection301 ?? (originCountry === "china");

    if (productValue <= 0) {
      return NextResponse.json({ error: "productValue is required and must be > 0" }, { status: 400 });
    }

    const category = PRODUCT_CATEGORIES.find(c => c.id === productCategory);
    if (!category) {
      return NextResponse.json({ error: `Unknown productCategory: ${productCategory}. Use GET to see available categories.` }, { status: 400 });
    }

    const customsValue = productValue + shippingCost + insuranceCost;
    const baseDutyRate = category.dutyRate / 100;
    const baseDuty = customsValue * baseDutyRate;
    const section301Duty = includeSection301 ? customsValue * (SECTION_301_RATE / 100) : 0;
    const mpf = Math.min(Math.max(customsValue * 0.003464, 31.67), 634.62);
    const hmf = customsValue * 0.00125;
    const totalDuty = baseDuty + section301Duty + mpf + hmf;
    const effectiveRate = customsValue > 0 ? (totalDuty / customsValue) * 100 : 0;

    return NextResponse.json({
      ok: true,
      input: { productCategory, productValue, shippingCost, insuranceCost, originCountry, includeSection301 },
      result: {
        customsValue: Math.round(customsValue * 100) / 100,
        baseDutyRate: category.dutyRate,
        baseDuty: Math.round(baseDuty * 100) / 100,
        section301Rate: includeSection301 ? SECTION_301_RATE : 0,
        section301Duty: Math.round(section301Duty * 100) / 100,
        mpf: Math.round(mpf * 100) / 100,
        hmf: Math.round(hmf * 100) / 100,
        totalDuty: Math.round(totalDuty * 100) / 100,
        effectiveDutyRate: Math.round(effectiveRate * 100) / 100,
        htsChapter: category.htsChapter,
        categoryName: category.name,
      },
      _meta: {
        tool: "duty-calculator",
        version: "1.0",
        docs: "https://doge-consulting.com/skills/duty-calculator.md",
        ui: "https://doge-consulting.com/tools/duty-calculator",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Calculation error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// GET — Return available categories and usage info
export async function GET() {
  return NextResponse.json({
    tool: "duty-calculator",
    description: "Calculate US import duty for products from any origin country. Includes base duty, Section 301 tariff (China), MPF, and HMF.",
    version: "1.0",
    docs: "https://doge-consulting.com/skills/duty-calculator.md",
    ui: "https://doge-consulting.com/tools/duty-calculator",
    method: "POST",
    options: {
      productCategories: PRODUCT_CATEGORIES,
    },
    exampleRequest: {
      productCategory: "window-blinds",
      productValue: 9000,
      shippingCost: 1750,
      insuranceCost: 45,
      originCountry: "china",
      includeSection301: true,
    },
  });
}
