// ─── Comprehensive Landed-Cost & Revenue Calculator Engine ────
// Pure functions — no side effects, fully testable
// Covers: source country, destination, product categories, duties,
// taxes, compliance fees, and potential savings via our service

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

export interface SourceCountry {
  id: string;
  label: string;
  flag: string;
  section301: boolean; // Subject to US Section 301 tariffs
  section301Rate: number;
  section122Rate: number; // 2026 IEEPA/Section 122 global tariff
}

export const SOURCE_COUNTRIES: SourceCountry[] = [
  { id: "cn", label: "China", flag: "🇨🇳", section301: true, section301Rate: 0.25, section122Rate: 0.145 },
  { id: "vn", label: "Vietnam", flag: "🇻🇳", section301: false, section301Rate: 0, section122Rate: 0.46 },
  { id: "in", label: "India", flag: "🇮🇳", section301: false, section301Rate: 0, section122Rate: 0.26 },
  { id: "tw", label: "Taiwan", flag: "🇹🇼", section301: false, section301Rate: 0, section122Rate: 0.32 },
  { id: "th", label: "Thailand", flag: "🇹🇭", section301: false, section301Rate: 0, section122Rate: 0.36 },
  { id: "mx", label: "Mexico", flag: "🇲🇽", section301: false, section301Rate: 0, section122Rate: 0.25 },
  { id: "tr", label: "Turkey", flag: "🇹🇷", section301: false, section301Rate: 0, section122Rate: 0.10 },
  { id: "id", label: "Indonesia", flag: "🇮🇩", section301: false, section301Rate: 0, section122Rate: 0.32 },
  { id: "bd", label: "Bangladesh", flag: "🇧🇩", section301: false, section301Rate: 0, section122Rate: 0.37 },
  { id: "kr", label: "South Korea", flag: "🇰🇷", section301: false, section301Rate: 0, section122Rate: 0.25 },
  { id: "de", label: "Germany", flag: "🇩🇪", section301: false, section301Rate: 0, section122Rate: 0.10 },
  { id: "it", label: "Italy", flag: "🇮🇹", section301: false, section301Rate: 0, section122Rate: 0.10 },
  { id: "other", label: "Other", flag: "🌍", section301: false, section301Rate: 0, section122Rate: 0.10 },
];

export interface Destination {
  id: string;
  label: string;
  flag: string;
  currency: string;
  vatGstRate: number;
  mpfRate: number;
  mpfMin: number;
  mpfMax: number;
  hmfRate: number;
  hmfOceanOnly: boolean;
  customsBondRequired: boolean;
  customsBondThreshold: number;
  isfRequired: boolean;
  isfPenalty: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "us", label: "United States", flag: "🇺🇸", currency: "USD",
    vatGstRate: 0, mpfRate: 0.003464, mpfMin: 32.71, mpfMax: 634.62,
    hmfRate: 0.00125, hmfOceanOnly: true,
    customsBondRequired: true, customsBondThreshold: 2500,
    isfRequired: true, isfPenalty: "$5,000–$10,000",
  },
  {
    id: "ca", label: "Canada", flag: "🇨🇦", currency: "CAD",
    vatGstRate: 0.05, mpfRate: 0, mpfMin: 0, mpfMax: 0,
    hmfRate: 0, hmfOceanOnly: false,
    customsBondRequired: false, customsBondThreshold: 0,
    isfRequired: false, isfPenalty: "",
  },
  {
    id: "gb", label: "United Kingdom", flag: "🇬🇧", currency: "GBP",
    vatGstRate: 0.20, mpfRate: 0, mpfMin: 0, mpfMax: 0,
    hmfRate: 0, hmfOceanOnly: false,
    customsBondRequired: false, customsBondThreshold: 0,
    isfRequired: false, isfPenalty: "",
  },
  {
    id: "eu", label: "EU (Germany)", flag: "🇪🇺", currency: "EUR",
    vatGstRate: 0.19, mpfRate: 0, mpfMin: 0, mpfMax: 0,
    hmfRate: 0, hmfOceanOnly: false,
    customsBondRequired: false, customsBondThreshold: 0,
    isfRequired: false, isfPenalty: "",
  },
  {
    id: "au", label: "Australia", flag: "🇦🇺", currency: "AUD",
    vatGstRate: 0.10, mpfRate: 0, mpfMin: 0, mpfMax: 0,
    hmfRate: 0, hmfOceanOnly: false,
    customsBondRequired: false, customsBondThreshold: 0,
    isfRequired: false, isfPenalty: "",
  },
];

export interface ProductCategory {
  id: string;
  label: string;
  emoji: string;
  htsChapter: string;
  htsNote: string;
  dutyRates: Record<string, number>; // destination ID → rate as decimal
  section301Eligible: boolean;
  complianceProfileId: string;
  retailMarkupRange: string; // "3-5x" for savings comparison
  avgRetailMultiplier: number;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: "furniture-wood", label: "Wood Furniture", emoji: "🪑", htsChapter: "94", htsNote: "Chairs, tables, cabinets — most 0% base duty", dutyRates: { us: 0, ca: 0.08, gb: 0.02, eu: 0.02, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "furniture-metal", label: "Metal Furniture", emoji: "🗄️", htsChapter: "94", htsNote: "Office furniture, shelving — most 0% base duty", dutyRates: { us: 0, ca: 0.08, gb: 0.02, eu: 0.02, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "furniture-upholstered", label: "Upholstered Furniture", emoji: "🛋️", htsChapter: "94", htsNote: "Sofas, mattresses — most 0% base duty", dutyRates: { us: 0, ca: 0.08, gb: 0.027, eu: 0.027, au: 0.05 }, section301Eligible: true, complianceProfileId: "flammability", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "lighting", label: "Lighting & Lamps", emoji: "💡", htsChapter: "94", htsNote: "Average 3.9% duty", dutyRates: { us: 0.039, ca: 0.08, gb: 0.04, eu: 0.037, au: 0.05 }, section301Eligible: true, complianceProfileId: "electronics-ul", retailMarkupRange: "4–8×", avgRetailMultiplier: 6 },
  { id: "ceramics", label: "Ceramics & Tableware", emoji: "🍽️", htsChapter: "69", htsNote: "Tableware ~9.8%, tiles ~8.5%", dutyRates: { us: 0.098, ca: 0.07, gb: 0.12, eu: 0.12, au: 0.05 }, section301Eligible: true, complianceProfileId: "food-contact", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "stone-marble", label: "Stone & Marble", emoji: "🪨", htsChapter: "68", htsNote: "Marble slabs/tiles ~4.9%", dutyRates: { us: 0.049, ca: 0.0, gb: 0.0, eu: 0.0, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "textiles", label: "Textiles & Fabrics", emoji: "🧵", htsChapter: "52–63", htsNote: "Average ~12%, ranges 5–32%", dutyRates: { us: 0.12, ca: 0.16, gb: 0.12, eu: 0.12, au: 0.05 }, section301Eligible: true, complianceProfileId: "textiles-cpsc", retailMarkupRange: "4–8×", avgRetailMultiplier: 6 },
  { id: "electronics", label: "Consumer Electronics", emoji: "📱", htsChapter: "85", htsNote: "Most consumer electronics 0% base duty", dutyRates: { us: 0, ca: 0, gb: 0, eu: 0, au: 0 }, section301Eligible: true, complianceProfileId: "electronics-fcc", retailMarkupRange: "2–4×", avgRetailMultiplier: 3 },
  { id: "components", label: "Electronic Components", emoji: "🔌", htsChapter: "85", htsNote: "Most components 0% base duty", dutyRates: { us: 0, ca: 0, gb: 0, eu: 0, au: 0 }, section301Eligible: true, complianceProfileId: "electronics-fcc", retailMarkupRange: "2–4×", avgRetailMultiplier: 3 },
  { id: "appliances", label: "Home Appliances", emoji: "🏠", htsChapter: "84–85", htsNote: "Ranges 0–3.9%", dutyRates: { us: 0.024, ca: 0.08, gb: 0.02, eu: 0.022, au: 0.05 }, section301Eligible: true, complianceProfileId: "electronics-fcc", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "tools", label: "Tools & Hardware", emoji: "🔧", htsChapter: "82", htsNote: "Average ~5.3%", dutyRates: { us: 0.053, ca: 0.08, gb: 0.027, eu: 0.027, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "plastics", label: "Plastic Products", emoji: "♻️", htsChapter: "39", htsNote: "Average ~5.3%", dutyRates: { us: 0.053, ca: 0.065, gb: 0.06, eu: 0.065, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "glass", label: "Glass & Glassware", emoji: "🥃", htsChapter: "70", htsNote: "Average ~6.6%", dutyRates: { us: 0.066, ca: 0.08, gb: 0.05, eu: 0.05, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "rubber", label: "Rubber Products", emoji: "🔲", htsChapter: "40", htsNote: "Average ~4.2%", dutyRates: { us: 0.042, ca: 0.065, gb: 0.04, eu: 0.04, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–5×", avgRetailMultiplier: 4 },
  { id: "auto-parts", label: "Auto Parts", emoji: "🚗", htsChapter: "87", htsNote: "Average ~2.5%", dutyRates: { us: 0.025, ca: 0.065, gb: 0.045, eu: 0.045, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "2–4×", avgRetailMultiplier: 3 },
  { id: "toys", label: "Toys & Games", emoji: "🧸", htsChapter: "95", htsNote: "Most toys 0% duty", dutyRates: { us: 0, ca: 0, gb: 0, eu: 0, au: 0 }, section301Eligible: true, complianceProfileId: "children-cpsc", retailMarkupRange: "3–8×", avgRetailMultiplier: 5 },
  { id: "sporting", label: "Sporting Goods", emoji: "⚽", htsChapter: "95", htsNote: "Ranges 0–5.5%", dutyRates: { us: 0.04, ca: 0.08, gb: 0.027, eu: 0.027, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "bags", label: "Bags & Luggage", emoji: "🧳", htsChapter: "42", htsNote: "Ranges 3.3–20%", dutyRates: { us: 0.08, ca: 0.17, gb: 0.08, eu: 0.09, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "4–8×", avgRetailMultiplier: 6 },
  { id: "footwear", label: "Footwear", emoji: "👟", htsChapter: "64", htsNote: "Ranges 6–48% by material", dutyRates: { us: 0.10, ca: 0.18, gb: 0.08, eu: 0.10, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "4–10×", avgRetailMultiplier: 7 },
  { id: "cosmetics", label: "Cosmetics & Beauty", emoji: "💄", htsChapter: "33", htsNote: "Ranges 0–5%", dutyRates: { us: 0.02, ca: 0.065, gb: 0.0, eu: 0.0, au: 0.05 }, section301Eligible: true, complianceProfileId: "fda-cosmetics", retailMarkupRange: "5–15×", avgRetailMultiplier: 10 },
  { id: "pet", label: "Pet Products", emoji: "🐕", htsChapter: "42/63/95", htsNote: "Varies 0–12%", dutyRates: { us: 0.04, ca: 0.08, gb: 0.04, eu: 0.04, au: 0.05 }, section301Eligible: true, complianceProfileId: "standard", retailMarkupRange: "3–8×", avgRetailMultiplier: 5 },
  { id: "kitchen", label: "Kitchenware", emoji: "🍳", htsChapter: "73/76", htsNote: "Ranges 0–8%", dutyRates: { us: 0.05, ca: 0.08, gb: 0.04, eu: 0.04, au: 0.05 }, section301Eligible: true, complianceProfileId: "food-contact", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
  { id: "medical", label: "Medical Devices", emoji: "🏥", htsChapter: "90", htsNote: "Most 0% duty, strict compliance", dutyRates: { us: 0, ca: 0, gb: 0, eu: 0, au: 0 }, section301Eligible: true, complianceProfileId: "fda-medical", retailMarkupRange: "5–20×", avgRetailMultiplier: 10 },
  { id: "window-blinds", label: "Window Blinds & Coverings", emoji: "🪟", htsChapter: "63/39", htsNote: "Textile blinds ~6.5% (HTS 6303), plastic ~5.3% (HTS 3925), aluminum ~5.7%", dutyRates: { us: 0.065, ca: 0.08, gb: 0.065, eu: 0.065, au: 0.05 }, section301Eligible: true, complianceProfileId: "textiles-cpsc", retailMarkupRange: "3–6×", avgRetailMultiplier: 4.5 },
];

export interface ComplianceProfile {
  id: string;
  label: string;
  description: string;
  flatFeeUsd: number;
  perSkuFeeUsd: number;
  perUnitFeeUsd: number;
  certifications: string[];
  leadTimeDays: string;
}

export const COMPLIANCE_PROFILES: ComplianceProfile[] = [
  { id: "standard", label: "Standard Commercial Import", description: "Basic documentation, ISF filing, customs broker", flatFeeUsd: 85, perSkuFeeUsd: 0, perUnitFeeUsd: 0, certifications: ["Commercial Invoice", "Packing List", "Bill of Lading"], leadTimeDays: "1–3 days" },
  { id: "food-contact", label: "Food Contact / FDA", description: "FDA prior notice, food facility registration, lab testing", flatFeeUsd: 280, perSkuFeeUsd: 45, perUnitFeeUsd: 0, certifications: ["FDA Prior Notice", "Food Facility Reg.", "Lab Test Report"], leadTimeDays: "5–10 days" },
  { id: "electronics-fcc", label: "Electronics / FCC", description: "FCC DoC, UL listing, EMC testing", flatFeeUsd: 350, perSkuFeeUsd: 65, perUnitFeeUsd: 0, certifications: ["FCC Declaration", "UL Certificate", "EMC Test Report"], leadTimeDays: "7–14 days" },
  { id: "electronics-ul", label: "Lighting / UL Safety", description: "UL/ETL safety certification, electrical testing", flatFeeUsd: 420, perSkuFeeUsd: 80, perUnitFeeUsd: 0, certifications: ["UL/ETL Listing", "Safety Test Report"], leadTimeDays: "10–21 days" },
  { id: "children-cpsc", label: "Children's Products / CPSIA", description: "CPSC testing, lead/phthalate certification, CPC", flatFeeUsd: 500, perSkuFeeUsd: 75, perUnitFeeUsd: 0.03, certifications: ["CPC Certificate", "CPSC Test Report", "Tracking Label"], leadTimeDays: "10–21 days" },
  { id: "textiles-cpsc", label: "Textiles / Flammability", description: "Textile fiber content, flammability testing, labeling", flatFeeUsd: 200, perSkuFeeUsd: 40, perUnitFeeUsd: 0.01, certifications: ["Fiber Content Label", "Flammability Test", "Care Labels"], leadTimeDays: "5–10 days" },
  { id: "flammability", label: "Upholstered / CA TB117", description: "California TB117 flame retardant testing", flatFeeUsd: 300, perSkuFeeUsd: 55, perUnitFeeUsd: 0, certifications: ["TB117 Certificate", "Flammability Report"], leadTimeDays: "7–14 days" },
  { id: "fda-cosmetics", label: "Cosmetics / FDA", description: "FDA cosmetic registration, ingredient review, labeling", flatFeeUsd: 350, perSkuFeeUsd: 50, perUnitFeeUsd: 0, certifications: ["FDA Registration", "Ingredient Review", "INCI Labels"], leadTimeDays: "7–14 days" },
  { id: "fda-medical", label: "Medical Device / FDA 510(k)", description: "FDA 510(k) clearance, quality system requirements", flatFeeUsd: 2500, perSkuFeeUsd: 500, perUnitFeeUsd: 0, certifications: ["510(k) Clearance", "QSR Compliance", "MDR Filing"], leadTimeDays: "30–90 days" },
];

export type FreightMode = "ocean-lcl" | "ocean-fcl" | "air" | "express";

export interface FreightModeInfo {
  id: FreightMode;
  label: string;
  icon: string;
  isOcean: boolean;
  transitDays: string;
}

export const FREIGHT_MODES: FreightModeInfo[] = [
  { id: "ocean-lcl", label: "Ocean LCL", icon: "🚢", isOcean: true, transitDays: "25–45 days" },
  { id: "ocean-fcl", label: "Ocean FCL", icon: "📦", isOcean: true, transitDays: "20–35 days" },
  { id: "air", label: "Air Freight", icon: "✈️", isOcean: false, transitDays: "5–10 days" },
  { id: "express", label: "Express Courier", icon: "🚀", isOcean: false, transitDays: "3–7 days" },
];

export type IncotermCode = "EXW" | "FOB" | "CIF" | "DDP";

export interface Incoterm {
  code: IncotermCode;
  label: string;
  description: string;
  includesOrigin: boolean;
  includesFreight: boolean;
  includesInsurance: boolean;
}

export const INCOTERMS: Incoterm[] = [
  { code: "EXW", label: "Ex Works", description: "Buyer pays all transport from factory", includesOrigin: false, includesFreight: false, includesInsurance: false },
  { code: "FOB", label: "Free On Board", description: "Seller loads onto vessel; buyer pays freight", includesOrigin: true, includesFreight: false, includesInsurance: false },
  { code: "CIF", label: "Cost, Insurance & Freight", description: "Seller pays freight + insurance to destination port", includesOrigin: true, includesFreight: true, includesInsurance: true },
  { code: "DDP", label: "Delivered Duty Paid", description: "Seller handles everything to buyer's door", includesOrigin: true, includesFreight: true, includesInsurance: true },
];

// ═══════════════════════════════════════════════════════════════
// CALCULATOR ENGINE
// ═══════════════════════════════════════════════════════════════

export interface RevenueCalcInput {
  sourceCountryId: string;
  destinationId: string;
  categoryId: string;
  complianceProfileId: string;
  freightMode: FreightMode;
  incotermCode: IncotermCode;

  // Costs
  productCostPerUnit: number;
  quantity: number;
  skuCount: number;
  freightCostTotal: number;
  insuranceCostTotal: number;
  originChargesTotal: number;

  // Toggles
  includeSection301: boolean;
  includeSection122: boolean;
  includeCustomsBond: boolean;

  // Revenue
  sellingPricePerUnit: number;
  otherCostsPerUnit: number;

  // Optional benchmark
  benchmarkRetailPricePerUnit?: number;
}

export interface CostLineItem {
  key: string;
  label: string;
  total: number;
  perUnit: number;
  rate?: number;
  note?: string;
  category: "product" | "freight" | "duty" | "tax" | "compliance" | "other";
}

export interface RevenueCalcOutput {
  // Cost breakdown
  lines: CostLineItem[];

  // Aggregates
  customsValue: number;
  totalDutiesAndFees: number;
  totalComplianceFees: number;
  totalLandedCost: number;
  landedCostPerUnit: number;

  // Revenue & profit
  totalRevenue: number;
  revenuePerUnit: number;
  grossProfit: number;
  grossProfitPerUnit: number;
  grossMarginPct: number;
  roiPct: number;

  // Effective rates
  effectiveDutyRate: number;
  effectiveTotalTaxRate: number;

  // Savings comparison
  savingsVsRetail: number;
  savingsVsRetailPct: number;
  dogeServiceSavingsEstimate: number;

  // Warnings
  warnings: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function r2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateRevenue(input: RevenueCalcInput): RevenueCalcOutput {
  const source = SOURCE_COUNTRIES.find((c) => c.id === input.sourceCountryId) || SOURCE_COUNTRIES[0];
  const dest = DESTINATIONS.find((d) => d.id === input.destinationId) || DESTINATIONS[0];
  const category = PRODUCT_CATEGORIES.find((c) => c.id === input.categoryId) || PRODUCT_CATEGORIES[0];
  const compliance = COMPLIANCE_PROFILES.find((c) => c.id === input.complianceProfileId) || COMPLIANCE_PROFILES[0];
  const incoterm = INCOTERMS.find((i) => i.code === input.incotermCode) || INCOTERMS[1];
  const freightMode = FREIGHT_MODES.find((f) => f.id === input.freightMode) || FREIGHT_MODES[0];

  const qty = Math.max(input.quantity || 1, 1);
  const skus = Math.max(input.skuCount || 1, 1);
  const costPerUnit = input.productCostPerUnit || 0;
  const productTotal = r2(costPerUnit * qty);

  // Freight components (adjusted for incoterm)
  const freightTotal = incoterm.includesFreight ? 0 : (input.freightCostTotal || 0);
  const insuranceTotal = incoterm.includesInsurance ? 0 : (input.insuranceCostTotal || 0);
  const originTotal = incoterm.includesOrigin ? 0 : (input.originChargesTotal || 0);

  // Customs value = goods + freight + insurance (CIF basis for most countries)
  const customsValue = r2(productTotal + freightTotal + insuranceTotal + originTotal);

  const lines: CostLineItem[] = [];
  const warnings: string[] = [];

  // ── Product cost ────────────────────────────────────────────
  lines.push({ key: "product", label: "Product Cost", total: productTotal, perUnit: costPerUnit, category: "product" });

  // ── Origin charges ──────────────────────────────────────────
  if (originTotal > 0) {
    lines.push({ key: "origin", label: "Origin / Inland Charges", total: originTotal, perUnit: r2(originTotal / qty), category: "freight" });
  }

  // ── Freight ─────────────────────────────────────────────────
  if (freightTotal > 0) {
    lines.push({ key: "freight", label: `Freight (${freightMode.label})`, total: freightTotal, perUnit: r2(freightTotal / qty), category: "freight" });
  }

  // ── Insurance ───────────────────────────────────────────────
  if (insuranceTotal > 0) {
    lines.push({ key: "insurance", label: "Cargo Insurance", total: insuranceTotal, perUnit: r2(insuranceTotal / qty), category: "freight" });
  }

  // ── Base duty ───────────────────────────────────────────────
  const baseDutyRate = category.dutyRates[dest.id] ?? 0;
  const baseDuty = r2(customsValue * baseDutyRate);
  lines.push({ key: "base-duty", label: "Base Import Duty", total: baseDuty, perUnit: r2(baseDuty / qty), rate: baseDutyRate, note: `HTS Ch. ${category.htsChapter}`, category: "duty" });

  // ── Section 301 (China → US) ────────────────────────────────
  let section301 = 0;
  if (input.includeSection301 && source.section301 && dest.id === "us" && category.section301Eligible) {
    section301 = r2(customsValue * source.section301Rate);
    lines.push({ key: "section-301", label: "Section 301 Tariff", total: section301, perUnit: r2(section301 / qty), rate: source.section301Rate, note: "China-specific additional tariff", category: "duty" });
  }

  // ── Section 122 / IEEPA reciprocal tariff ───────────────────
  let section122 = 0;
  if (input.includeSection122 && source.section122Rate > 0 && dest.id === "us") {
    section122 = r2(customsValue * source.section122Rate);
    lines.push({ key: "section-122", label: "Reciprocal Tariff (2026)", total: section122, perUnit: r2(section122 / qty), rate: source.section122Rate, note: "IEEPA/Section 122 global tariff", category: "duty" });
    warnings.push("IEEPA reciprocal tariffs are subject to Supreme Court review and may change.");
  }

  // ── MPF ─────────────────────────────────────────────────────
  let mpf = 0;
  if (dest.mpfRate > 0 && customsValue > 0) {
    mpf = r2(clamp(customsValue * dest.mpfRate, dest.mpfMin, dest.mpfMax));
    lines.push({ key: "mpf", label: "Merchandise Processing Fee", total: mpf, perUnit: r2(mpf / qty), rate: dest.mpfRate, note: `Min ${dest.currency} ${dest.mpfMin}, Max ${dest.currency} ${dest.mpfMax}`, category: "tax" });
  }

  // ── HMF ─────────────────────────────────────────────────────
  let hmf = 0;
  if (dest.hmfRate > 0 && customsValue > 0 && (!dest.hmfOceanOnly || freightMode.isOcean)) {
    hmf = r2(customsValue * dest.hmfRate);
    lines.push({ key: "hmf", label: "Harbor Maintenance Fee", total: hmf, perUnit: r2(hmf / qty), rate: dest.hmfRate, note: "Ocean shipments only", category: "tax" });
  }

  // ── Customs bond ────────────────────────────────────────────
  let bondFee = 0;
  if (input.includeCustomsBond && dest.customsBondRequired && customsValue > dest.customsBondThreshold) {
    bondFee = r2(Math.max(customsValue * 0.005, 50)); // ~0.5% or $50 min for continuous bond annual
    lines.push({ key: "bond", label: "Customs Bond", total: bondFee, perUnit: r2(bondFee / qty), note: `Required for imports > $${dest.customsBondThreshold}`, category: "tax" });
  }

  // ── VAT / GST ───────────────────────────────────────────────
  let vatGst = 0;
  if (dest.vatGstRate > 0) {
    const vatBase = customsValue + baseDuty + section301 + section122;
    vatGst = r2(vatBase * dest.vatGstRate);
    lines.push({ key: "vat-gst", label: dest.id === "gb" ? "UK VAT" : dest.id === "au" ? "GST" : "VAT / GST", total: vatGst, perUnit: r2(vatGst / qty), rate: dest.vatGstRate, category: "tax" });
  }

  // ── Compliance fees ─────────────────────────────────────────
  const complianceFees = r2(compliance.flatFeeUsd + compliance.perSkuFeeUsd * skus + compliance.perUnitFeeUsd * qty);
  lines.push({ key: "compliance", label: `Compliance (${compliance.label})`, total: complianceFees, perUnit: r2(complianceFees / qty), note: compliance.certifications.join(", "), category: "compliance" });

  // ── Other costs per unit ────────────────────────────────────
  const otherTotal = r2((input.otherCostsPerUnit || 0) * qty);
  if (otherTotal > 0) {
    lines.push({ key: "other", label: "Other Costs", total: otherTotal, perUnit: input.otherCostsPerUnit, category: "other" });
  }

  // ── Aggregates ──────────────────────────────────────────────
  const totalDutiesAndFees = r2(baseDuty + section301 + section122 + mpf + hmf + bondFee + vatGst);
  const totalComplianceFees = complianceFees;
  const totalLandedCost = r2(productTotal + originTotal + freightTotal + insuranceTotal + totalDutiesAndFees + complianceFees + otherTotal);
  const landedCostPerUnit = r2(totalLandedCost / qty);

  // ── Revenue & Profit ────────────────────────────────────────
  const sellingPrice = input.sellingPricePerUnit || 0;
  const totalRevenue = r2(sellingPrice * qty);
  const grossProfit = r2(totalRevenue - totalLandedCost);
  const grossProfitPerUnit = r2(grossProfit / qty);
  const grossMarginPct = totalRevenue > 0 ? r2((grossProfit / totalRevenue) * 100) : 0;
  const roiPct = totalLandedCost > 0 ? r2((grossProfit / totalLandedCost) * 100) : 0;

  // ── Effective rates ─────────────────────────────────────────
  const effectiveDutyRate = customsValue > 0 ? r2(((baseDuty + section301 + section122) / customsValue) * 100) : 0;
  const effectiveTotalTaxRate = customsValue > 0 ? r2((totalDutiesAndFees / customsValue) * 100) : 0;

  // ── Savings comparison ──────────────────────────────────────
  const benchmarkRetail = input.benchmarkRetailPricePerUnit || (costPerUnit * category.avgRetailMultiplier);
  const savingsPerUnit = r2(benchmarkRetail - landedCostPerUnit);
  const savingsVsRetail = r2(savingsPerUnit * qty);
  const savingsVsRetailPct = benchmarkRetail > 0 ? r2((savingsPerUnit / benchmarkRetail) * 100) : 0;

  // Doge service savings estimate (we typically save 5-15% vs self-managed import)
  const dogeServiceSavingsEstimate = r2(totalLandedCost * 0.08); // conservative 8% savings

  // ── Warnings ────────────────────────────────────────────────
  if (baseDutyRate >= 0.10) warnings.push(`High base duty rate (${(baseDutyRate * 100).toFixed(1)}%) — consider HTS classification review.`);
  if (totalDutiesAndFees / customsValue > 0.30 && customsValue > 0) warnings.push("Effective tax rate exceeds 30% — tariff engineering may reduce costs.");
  if (grossMarginPct < 15 && grossMarginPct > 0) warnings.push("Gross margin below 15% — review pricing or sourcing costs.");
  if (grossMarginPct < 0) warnings.push("⚠️ This import is unprofitable at the current selling price.");

  return {
    lines,
    customsValue,
    totalDutiesAndFees,
    totalComplianceFees,
    totalLandedCost,
    landedCostPerUnit,
    totalRevenue,
    revenuePerUnit: sellingPrice,
    grossProfit,
    grossProfitPerUnit,
    grossMarginPct,
    roiPct,
    effectiveDutyRate,
    effectiveTotalTaxRate,
    savingsVsRetail,
    savingsVsRetailPct,
    dogeServiceSavingsEstimate,
    warnings,
  };
}
