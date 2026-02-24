// Shipping rate calculator based on business plan data

export interface ShippingQuote {
  method: "lcl" | "fcl-20" | "fcl-40" | "fcl-40hq";
  totalCBM: number;
  totalWeight: number;
  baseFreight: number;
  exportClearance: number;
  destinationFees: number;
  customs: number;
  lastMile: number;
  insurance: number;
  total: number;
  transitDays: string;
}

// Rates from the business plan
const RATES = {
  lcl: {
    perCBM: { min: 150, max: 250 }, // USD per CBM
    perKG: { economy: 10.5, standard: 11 }, // USD per KG
    transitDays: "25-35 days",
  },
  "fcl-20": {
    flat: { min: 2500, max: 4000 },
    capacityCBM: 28,
    capacityKG: 18000,
    transitDays: "20-30 days",
  },
  "fcl-40": {
    flat: { min: 4000, max: 6500 },
    capacityCBM: 58,
    capacityKG: 26000,
    transitDays: "20-30 days",
  },
  "fcl-40hq": {
    flat: { min: 4500, max: 7000 },
    capacityCBM: 68,
    capacityKG: 26500,
    transitDays: "20-30 days",
  },
};

const EXPORT_CLEARANCE = 200; // USD
const DESTINATION_PORT_FEES = 700; // USD
const CUSTOMS_RATE = 0.03; // 3% average for furniture
const LAST_MILE_LOCAL = 400; // USD for Seattle local
const INSURANCE_RATE = 0.02; // 2% of cargo value

export function calculateShippingQuote(
  method: ShippingQuote["method"],
  cbm: number,
  weightKG: number,
  cargoValueUSD: number,
  includeInsurance: boolean = false,
  includeLastMile: boolean = true
): ShippingQuote {
  let baseFreight = 0;
  let transitDays = "";

  switch (method) {
    case "lcl":
      // LCL charges by whichever is greater: CBM or weight-based
      const byCBM = cbm * ((RATES.lcl.perCBM.min + RATES.lcl.perCBM.max) / 2);
      const byWeight = weightKG * RATES.lcl.perKG.economy;
      baseFreight = Math.max(byCBM, byWeight);
      transitDays = RATES.lcl.transitDays;
      break;
    case "fcl-20":
      baseFreight = (RATES["fcl-20"].flat.min + RATES["fcl-20"].flat.max) / 2;
      transitDays = RATES["fcl-20"].transitDays;
      break;
    case "fcl-40":
      baseFreight = (RATES["fcl-40"].flat.min + RATES["fcl-40"].flat.max) / 2;
      transitDays = RATES["fcl-40"].transitDays;
      break;
    case "fcl-40hq":
      baseFreight =
        (RATES["fcl-40hq"].flat.min + RATES["fcl-40hq"].flat.max) / 2;
      transitDays = RATES["fcl-40hq"].transitDays;
      break;
  }

  const exportClearance = EXPORT_CLEARANCE;
  const destinationFees = DESTINATION_PORT_FEES;
  const customs = cargoValueUSD * CUSTOMS_RATE;
  const lastMile = includeLastMile ? LAST_MILE_LOCAL : 0;
  const insurance = includeInsurance ? cargoValueUSD * INSURANCE_RATE : 0;

  const total =
    baseFreight +
    exportClearance +
    destinationFees +
    customs +
    lastMile +
    insurance;

  return {
    method,
    totalCBM: cbm,
    totalWeight: weightKG,
    baseFreight: Math.round(baseFreight),
    exportClearance,
    destinationFees,
    customs: Math.round(customs),
    lastMile,
    insurance: Math.round(insurance),
    total: Math.round(total),
    transitDays,
  };
}

// Common furniture dimensions for the "Not sure?" helper
export const FURNITURE_PRESETS = [
  { name: "Sofa (3-seater)", cbm: 1.8, weightKG: 60, icon: "🛋️" },
  { name: "Dining Table (6-person)", cbm: 1.2, weightKG: 45, icon: "🪑" },
  { name: "King Bed Frame", cbm: 2.0, weightKG: 80, icon: "🛏️" },
  { name: "Wardrobe (large)", cbm: 2.5, weightKG: 90, icon: "🗄️" },
  { name: "TV Console", cbm: 0.8, weightKG: 35, icon: "📺" },
  { name: "Bookshelf", cbm: 0.6, weightKG: 30, icon: "📚" },
  { name: "Coffee Table", cbm: 0.4, weightKG: 20, icon: "☕" },
  { name: "Office Desk", cbm: 0.9, weightKG: 40, icon: "💼" },
  { name: "Marble Dining Table", cbm: 1.5, weightKG: 120, icon: "🪨" },
  { name: "Cabinet / Sideboard", cbm: 1.0, weightKG: 50, icon: "🗃️" },
];

export const CONTAINER_INFO = [
  {
    type: "fcl-20" as const,
    label: "20ft Container (20GP)",
    cbm: 28,
    maxKG: 18000,
    priceRange: "$2,500 - $4,000",
  },
  {
    type: "fcl-40" as const,
    label: "40ft Container (40GP)",
    cbm: 58,
    maxKG: 26000,
    priceRange: "$4,000 - $6,500",
  },
  {
    type: "fcl-40hq" as const,
    label: "40ft High Cube (40HQ)",
    cbm: 68,
    maxKG: 26500,
    priceRange: "$4,500 - $7,000",
  },
];
