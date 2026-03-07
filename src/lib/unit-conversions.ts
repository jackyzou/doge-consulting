// ─── Unit Conversion Helpers ─────────────────────────────────
// Used across CBM calculator, 3D visualizer, and revenue calculator

// ─── Length conversions (to/from centimeters) ─────────────────
export type LengthUnit = "cm" | "mm" | "in" | "ft" | "m";

const CM_FACTORS: Record<LengthUnit, number> = {
  cm: 1,
  mm: 10,
  in: 1 / 2.54,
  ft: 1 / 30.48,
  m: 1 / 100,
};

/** Convert from any length unit to centimeters */
export function toCm(value: number, unit: LengthUnit): number {
  return value / CM_FACTORS[unit];
}

/** Convert from centimeters to any length unit */
export function fromCm(cm: number, unit: LengthUnit): number {
  return cm * CM_FACTORS[unit];
}

// ─── Volume conversions (from cubic meters) ───────────────────
export function cbmToCubicFeet(cbm: number): number {
  return cbm * 35.3147;
}

export function cbmToLiters(cbm: number): number {
  return cbm * 1000;
}

export function cbmToUsGallons(cbm: number): number {
  return cbm * 264.172;
}

export function cbmToImperialGallons(cbm: number): number {
  return cbm * 219.969;
}

export function cbmToCubicInches(cbm: number): number {
  return cbm * 61023.7;
}

// ─── Weight conversions ───────────────────────────────────────
export type WeightUnit = "kg" | "lb" | "oz" | "ton" | "metricTon";

const KG_FACTORS: Record<WeightUnit, number> = {
  kg: 1,
  lb: 2.20462,
  oz: 35.274,
  ton: 0.00110231, // US short ton
  metricTon: 0.001,
};

export function toKg(value: number, unit: WeightUnit): number {
  return value / KG_FACTORS[unit];
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return kg * KG_FACTORS[unit];
}

// ─── CBM helpers ──────────────────────────────────────────────

/** Calculate CBM from dimensions in the given unit */
export function calculateCBM(l: number, w: number, h: number, unit: LengthUnit = "cm"): number {
  const lm = toCm(l, unit) / 100;
  const wm = toCm(w, unit) / 100;
  const hm = toCm(h, unit) / 100;
  return lm * wm * hm;
}

/** Calculate volumetric weight (kg) for sea/air freight */
export function volumetricWeight(l: number, w: number, h: number, unit: LengthUnit = "cm", divisor = 6000): number {
  const lcm = toCm(l, unit);
  const wcm = toCm(w, unit);
  const hcm = toCm(h, unit);
  return (lcm * wcm * hcm) / divisor;
}

/** Chargeable weight = max(actual, volumetric) */
export function chargeableWeight(actualKg: number, volumetricKg: number): number {
  return Math.max(actualKg, volumetricKg);
}

// ─── Container internal dimensions (meters) ───────────────────
export interface ContainerSpec {
  type: string;
  label: string;
  internalM: { l: number; w: number; h: number };
  cbm: number;
  maxKg: number;
  tareKg: number;
  doorM: { w: number; h: number };
  priceRange: string;
}

export const CONTAINERS: ContainerSpec[] = [
  {
    type: "20gp",
    label: "20ft Standard (20GP)",
    internalM: { l: 5.9, w: 2.35, h: 2.39 },
    cbm: 33.2,
    maxKg: 21770,
    tareKg: 2230,
    doorM: { w: 2.34, h: 2.28 },
    priceRange: "$2,500 – $4,000",
  },
  {
    type: "40gp",
    label: "40ft Standard (40GP)",
    internalM: { l: 12.03, w: 2.35, h: 2.39 },
    cbm: 67.7,
    maxKg: 26780,
    tareKg: 3740,
    doorM: { w: 2.34, h: 2.28 },
    priceRange: "$4,000 – $6,500",
  },
  {
    type: "40hc",
    label: "40ft High Cube (40HC)",
    internalM: { l: 12.03, w: 2.35, h: 2.69 },
    cbm: 76.3,
    maxKg: 26580,
    tareKg: 3940,
    doorM: { w: 2.34, h: 2.58 },
    priceRange: "$4,500 – $7,000",
  },
];

/** Calculate how many units of a given CBM fit in a container (with 85% packing efficiency) */
export function unitsFit(itemCbm: number, containerCbm: number, efficiency = 0.85): number {
  if (itemCbm <= 0) return 0;
  return Math.floor((containerCbm * efficiency) / itemCbm);
}

/** Calculate volume utilization % */
export function volumeUtilization(cargoCbm: number, containerCbm: number): number {
  if (containerCbm <= 0) return 0;
  return Math.min((cargoCbm / containerCbm) * 100, 100);
}

/** Calculate weight utilization % */
export function weightUtilization(cargoKg: number, containerMaxKg: number): number {
  if (containerMaxKg <= 0) return 0;
  return Math.min((cargoKg / containerMaxKg) * 100, 100);
}

// ─── Currency helpers ─────────────────────────────────────────
export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  rateToUsd: number; // 1 unit of this currency = X USD
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", label: "US Dollar", rateToUsd: 1 },
  { code: "EUR", symbol: "€", label: "Euro", rateToUsd: 1.08 },
  { code: "GBP", symbol: "£", label: "British Pound", rateToUsd: 1.27 },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", rateToUsd: 0.74 },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", rateToUsd: 0.65 },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", rateToUsd: 0.139 },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", rateToUsd: 0.0067 },
  { code: "INR", symbol: "₹", label: "Indian Rupee", rateToUsd: 0.012 },
  { code: "MXN", symbol: "MX$", label: "Mexican Peso", rateToUsd: 0.058 },
];

export function convertCurrency(amount: number, fromCode: string, toCode: string): number {
  const from = CURRENCIES.find((c) => c.code === fromCode);
  const to = CURRENCIES.find((c) => c.code === toCode);
  if (!from || !to) return amount;
  const usd = amount * from.rateToUsd;
  return usd / to.rateToUsd;
}

/** Format a number with currency symbol */
export function fmtCurrency(amount: number, currencyCode: string = "USD"): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Format a percentage */
export function fmtPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/** Round to N decimal places */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
