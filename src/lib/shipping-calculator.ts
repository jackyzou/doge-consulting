// Shipping rate calculator based on real partner rate card
// Rates are in RMB per KG, door-to-door from mainland China to USA

// ─── Exchange rate ───
export const RMB_TO_USD = 7.2; // Approximate CNY→USD

// ─── Destination zones (door-to-door, by US zip prefix) ───
export interface ZoneInfo {
  id: string;
  label: string;
  labelZh: string;
  zipPrefixes: string[];
  transitDays: string;
  lastMileSurchargeRMB: number; // per-shipment surcharge (¥)
}

export const ZONES: ZoneInfo[] = [
  {
    id: "west-1",
    label: "West Coast A (CA 90-92)",
    labelZh: "西海岸A区",
    zipPrefixes: ["90", "91", "92"],
    transitDays: "25-35 days",
    lastMileSurchargeRMB: 500,
  },
  {
    id: "west-2",
    label: "West Coast B (CA 93-96, WA, OR)",
    labelZh: "西海岸B区",
    zipPrefixes: ["93", "94", "95", "96", "97", "98"],
    transitDays: "25-40 days",
    lastMileSurchargeRMB: 500,
  },
  {
    id: "mountain",
    label: "Mountain (AZ, NV, CO, UT)",
    labelZh: "山区",
    zipPrefixes: ["85", "86", "87", "88", "89", "80", "81", "84"],
    transitDays: "30-40 days",
    lastMileSurchargeRMB: 500,
  },
  {
    id: "south",
    label: "South (TX, GA, FL)",
    labelZh: "南部",
    zipPrefixes: ["75", "76", "77", "78", "79", "30", "31", "32", "33"],
    transitDays: "30-45 days",
    lastMileSurchargeRMB: 500,
  },
  {
    id: "midwest",
    label: "Midwest (IL, OH, MI, MN)",
    labelZh: "中西部",
    zipPrefixes: ["60", "61", "43", "44", "48", "55"],
    transitDays: "35-45 days",
    lastMileSurchargeRMB: 2500,
  },
  {
    id: "northeast-1",
    label: "Northeast A (NY, NJ, PA)",
    labelZh: "东北A区",
    zipPrefixes: ["10", "07", "08", "19"],
    transitDays: "35-50 days",
    lastMileSurchargeRMB: 2500,
  },
  {
    id: "northeast-2",
    label: "Northeast B (MA, CT, MD)",
    labelZh: "东北B区",
    zipPrefixes: ["02", "06", "21"],
    transitDays: "35-50 days",
    lastMileSurchargeRMB: 2500,
  },
  {
    id: "other",
    label: "Other US Regions",
    labelZh: "其他地区",
    zipPrefixes: [],
    transitDays: "40-55 days",
    lastMileSurchargeRMB: 2500,
  },
];

// ─── Door-to-door rates per zone (RMB / KG) by weight tier ───
export interface RateTier {
  minKG: number;
  label: string;
  rates: Record<string, number>; // zoneId → RMB/KG
}

export const DOOR_TO_DOOR_TIERS: RateTier[] = [
  {
    minKG: 100,
    label: "100+ KG",
    rates: {
      "west-1": 14,
      "west-2": 15,
      mountain: 16,
      south: 16,
      midwest: 18,
      "northeast-1": 18,
      "northeast-2": 19,
      other: 20,
    },
  },
  {
    minKG: 500,
    label: "500+ KG",
    rates: {
      "west-1": 12,
      "west-2": 13,
      mountain: 14,
      south: 14,
      midwest: 15,
      "northeast-1": 16,
      "northeast-2": 16,
      other: 17,
    },
  },
  {
    minKG: 1000,
    label: "1,000+ KG",
    rates: {
      "west-1": 11,
      "west-2": 11.5,
      mountain: 12,
      south: 12,
      midwest: 13,
      "northeast-1": 13.5,
      "northeast-2": 14,
      other: 15,
    },
  },
  {
    minKG: 3500,
    label: "3,500+ KG",
    rates: {
      "west-1": 9,
      "west-2": 9.5,
      mountain: 10,
      south: 10,
      midwest: 11,
      "northeast-1": 11,
      "northeast-2": 11.5,
      other: 12,
    },
  },
];

// ─── Warehouse pickup rates (US warehouse cities, RMB / KG) ───
export interface WarehouseCity {
  id: string;
  label: string;
  labelZh: string;
}

export const WAREHOUSE_CITIES: WarehouseCity[] = [
  { id: "la", label: "Los Angeles, CA", labelZh: "洛杉矶" },
  { id: "oakland", label: "Oakland, CA", labelZh: "奥克兰" },
  { id: "houston", label: "Houston, TX", labelZh: "休斯顿" },
  { id: "chicago", label: "Chicago, IL", labelZh: "芝加哥" },
  { id: "njny", label: "NJ / New York", labelZh: "新泽西/纽约" },
];

export const WAREHOUSE_PICKUP_TIERS: RateTier[] = [
  {
    minKG: 100,
    label: "100+ KG",
    rates: { la: 10, oakland: 11, houston: 14, chicago: 15, njny: 15 },
  },
  {
    minKG: 500,
    label: "500+ KG",
    rates: { la: 8.5, oakland: 9, houston: 12, chicago: 13, njny: 13 },
  },
  {
    minKG: 1000,
    label: "1,000+ KG",
    rates: { la: 7.5, oakland: 8, houston: 10.5, chicago: 11, njny: 11.5 },
  },
  {
    minKG: 3500,
    label: "3,500+ KG",
    rates: { la: 6, oakland: 6.5, houston: 8.5, chicago: 9, njny: 9.5 },
  },
];

// ─── Helpers ───

/** Calculate volumetric weight from dimensions in CM */
export function calculateVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number
): number {
  return (lengthCm * widthCm * heightCm) / 6000;
}

/** Chargeable weight = max(actual, volumetric) */
export function getChargeableWeight(
  actualKG: number,
  volumetricKG: number
): number {
  return Math.max(actualKG, volumetricKG);
}

/** Find the applicable rate tier for a given weight */
function findTier(tiers: RateTier[], weightKG: number): RateTier {
  let applicable = tiers[0];
  for (const tier of tiers) {
    if (weightKG >= tier.minKG) {
      applicable = tier;
    }
  }
  return applicable;
}

// ─── Quote interfaces ───

export type DeliveryType = "door-to-door" | "warehouse-pickup";

export interface ShippingQuote {
  deliveryType: DeliveryType;
  destinationId: string;
  destinationLabel: string;
  chargeableWeightKG: number;
  actualWeightKG: number;
  volumetricWeightKG: number;
  ratePerKG_RMB: number;
  tierLabel: string;
  freightRMB: number;
  lastMileSurchargeRMB: number;
  totalRMB: number;
  totalUSD: number;
  transitDays: string;
}

/** Calculate a shipping quote (door-to-door) */
export function calculateDoorToDoorQuote(
  zoneId: string,
  actualWeightKG: number,
  volumetricWeightKG: number
): ShippingQuote {
  const zone = ZONES.find((z) => z.id === zoneId) || ZONES[ZONES.length - 1];
  const chargeableKG = getChargeableWeight(actualWeightKG, volumetricWeightKG);
  const tier = findTier(DOOR_TO_DOOR_TIERS, chargeableKG);
  const rate = tier.rates[zone.id] ?? tier.rates["other"] ?? 20;
  const freight = chargeableKG * rate;
  const surcharge = zone.lastMileSurchargeRMB;
  const total = freight + surcharge;

  return {
    deliveryType: "door-to-door",
    destinationId: zone.id,
    destinationLabel: zone.label,
    chargeableWeightKG: Math.round(chargeableKG * 10) / 10,
    actualWeightKG: Math.round(actualWeightKG * 10) / 10,
    volumetricWeightKG: Math.round(volumetricWeightKG * 10) / 10,
    ratePerKG_RMB: rate,
    tierLabel: tier.label,
    freightRMB: Math.round(freight),
    lastMileSurchargeRMB: surcharge,
    totalRMB: Math.round(total),
    totalUSD: Math.round((total / RMB_TO_USD) * 100) / 100,
    transitDays: zone.transitDays,
  };
}

/** Calculate a shipping quote (warehouse pickup) */
export function calculateWarehousePickupQuote(
  cityId: string,
  actualWeightKG: number,
  volumetricWeightKG: number
): ShippingQuote {
  const city =
    WAREHOUSE_CITIES.find((c) => c.id === cityId) || WAREHOUSE_CITIES[0];
  const chargeableKG = getChargeableWeight(actualWeightKG, volumetricWeightKG);
  const tier = findTier(WAREHOUSE_PICKUP_TIERS, chargeableKG);
  const rate = tier.rates[city.id] ?? 15;
  const freight = chargeableKG * rate;

  return {
    deliveryType: "warehouse-pickup",
    destinationId: city.id,
    destinationLabel: city.label,
    chargeableWeightKG: Math.round(chargeableKG * 10) / 10,
    actualWeightKG: Math.round(actualWeightKG * 10) / 10,
    volumetricWeightKG: Math.round(volumetricWeightKG * 10) / 10,
    ratePerKG_RMB: rate,
    tierLabel: tier.label,
    freightRMB: Math.round(freight),
    lastMileSurchargeRMB: 0,
    totalRMB: Math.round(freight),
    totalUSD: Math.round((freight / RMB_TO_USD) * 100) / 100,
    transitDays: "25-45 days",
  };
}

// Common product presets (expanded beyond furniture)
export const PRODUCT_PRESETS = [
  { name: "Sofa (3-seater)", cbm: 1.8, weightKG: 60, icon: "🛋️" },
  { name: "Dining Table (6P)", cbm: 1.2, weightKG: 45, icon: "🪑" },
  { name: "King Bed Frame", cbm: 2.0, weightKG: 80, icon: "🛏️" },
  { name: "Wardrobe (large)", cbm: 2.5, weightKG: 90, icon: "🗄️" },
  { name: "TV Console", cbm: 0.8, weightKG: 35, icon: "📺" },
  { name: "Electronics Box", cbm: 0.3, weightKG: 15, icon: "📱" },
  { name: "Coffee Table", cbm: 0.4, weightKG: 20, icon: "☕" },
  { name: "Office Desk", cbm: 0.9, weightKG: 40, icon: "💼" },
  { name: "Home Goods Box", cbm: 0.5, weightKG: 25, icon: "🏠" },
  { name: "Textile Bale", cbm: 0.6, weightKG: 35, icon: "🧵" },
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
