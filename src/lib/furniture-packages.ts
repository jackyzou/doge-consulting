// Furniture package configuration data
// Each style × home size = a complete furniture set that fits in one container

export interface FurnitureItem {
  name: string;
  qty: number;
  priceUsd: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
}

export interface FurniturePackage {
  style: string;
  homeSize: string;
  items: FurnitureItem[];
  totalPrice: number;
  totalCbm: number;
  totalWeight: number;
  containerType: string; // "40HC" or "20GP"
}

export const STYLES = [
  { id: "modern", label: "Modern", emoji: "🏢", desc: "Clean lines, neutral tones, functional elegance", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
  { id: "scandinavian", label: "Scandinavian", emoji: "🇸🇪", desc: "Light wood, minimalist, hygge comfort", image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop" },
  { id: "minimalist", label: "Minimalist", emoji: "◻️", desc: "Less is more — essential pieces only", image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400&h=300&fit=crop" },
  { id: "italian", label: "Italian Luxury", emoji: "🇮🇹", desc: "Marble, leather, bold statement pieces", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=300&fit=crop" },
  { id: "french", label: "French Provincial", emoji: "🇫🇷", desc: "Carved wood, soft fabrics, romantic charm", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&h=300&fit=crop" },
  { id: "farmhouse", label: "Farmhouse", emoji: "🏡", desc: "Rustic wood, warm textures, country living", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop" },
  { id: "contemporary", label: "Contemporary", emoji: "✨", desc: "Trendy, mixed materials, current design", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop" },
  { id: "midcentury", label: "Mid-Century Modern", emoji: "🪑", desc: "Tapered legs, organic shapes, retro cool", image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=300&fit=crop" },
  { id: "industrial", label: "Industrial", emoji: "🏭", desc: "Metal accents, raw wood, urban loft", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=300&fit=crop" },
  { id: "coastal", label: "Coastal", emoji: "🌊", desc: "White & blue, natural textures, beach vibe", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop" },
];

export const HOME_SIZES = [
  { id: "1b1b", label: "1 Bed / 1 Bath Apartment", rooms: "1B/1B", sqft: "~600 sqft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" },
  { id: "2b", label: "2 Bedroom Apartment", rooms: "2B", sqft: "~900 sqft", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop" },
  { id: "3b", label: "3 Bed Single Family", rooms: "3B", sqft: "~1,500 sqft", image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=400&h=300&fit=crop" },
  { id: "4b", label: "4 Bed Single Family", rooms: "4B", sqft: "~2,200 sqft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop" },
  { id: "5b", label: "5+ Bed Estate", rooms: "5B+", sqft: "~3,500+ sqft", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop" },
];

// Base items per room that scale with home size
const LIVING_ROOM: FurnitureItem[] = [
  { name: "Sofa (3-Seater)", qty: 1, priceUsd: 450, lengthCm: 210, widthCm: 90, heightCm: 85, weightKg: 55 },
  { name: "Coffee Table", qty: 1, priceUsd: 120, lengthCm: 120, widthCm: 60, heightCm: 45, weightKg: 25 },
  { name: "TV Stand / Console", qty: 1, priceUsd: 180, lengthCm: 160, widthCm: 45, heightCm: 55, weightKg: 35 },
  { name: "Side Table", qty: 1, priceUsd: 55, lengthCm: 50, widthCm: 50, heightCm: 55, weightKg: 8 },
  { name: "Floor Lamp", qty: 1, priceUsd: 45, lengthCm: 40, widthCm: 40, heightCm: 160, weightKg: 5 },
  { name: "Area Rug (8×10ft)", qty: 1, priceUsd: 85, lengthCm: 240, widthCm: 300, heightCm: 2, weightKg: 12 },
];

const DINING: FurnitureItem[] = [
  { name: "Dining Table", qty: 1, priceUsd: 280, lengthCm: 160, widthCm: 90, heightCm: 75, weightKg: 45 },
  { name: "Dining Chair", qty: 4, priceUsd: 55, lengthCm: 45, widthCm: 45, heightCm: 90, weightKg: 6 },
];

const BEDROOM_MASTER: FurnitureItem[] = [
  { name: "Queen Bed Frame", qty: 1, priceUsd: 320, lengthCm: 200, widthCm: 160, heightCm: 110, weightKg: 50 },
  { name: "Queen Mattress", qty: 1, priceUsd: 250, lengthCm: 200, widthCm: 160, heightCm: 25, weightKg: 35 },
  { name: "Nightstand", qty: 2, priceUsd: 65, lengthCm: 50, widthCm: 40, heightCm: 55, weightKg: 12 },
  { name: "Dresser (6-Drawer)", qty: 1, priceUsd: 220, lengthCm: 140, widthCm: 50, heightCm: 80, weightKg: 45 },
  { name: "Table Lamp", qty: 2, priceUsd: 25, lengthCm: 30, widthCm: 30, heightCm: 50, weightKg: 3 },
];

const BEDROOM_SECONDARY: FurnitureItem[] = [
  { name: "Full/Double Bed Frame", qty: 1, priceUsd: 240, lengthCm: 195, widthCm: 140, heightCm: 100, weightKg: 40 },
  { name: "Full Mattress", qty: 1, priceUsd: 180, lengthCm: 195, widthCm: 140, heightCm: 22, weightKg: 28 },
  { name: "Nightstand", qty: 1, priceUsd: 65, lengthCm: 50, widthCm: 40, heightCm: 55, weightKg: 12 },
  { name: "Wardrobe / Closet", qty: 1, priceUsd: 280, lengthCm: 120, widthCm: 60, heightCm: 200, weightKg: 60 },
];

const OFFICE: FurnitureItem[] = [
  { name: "Desk", qty: 1, priceUsd: 150, lengthCm: 140, widthCm: 65, heightCm: 75, weightKg: 25 },
  { name: "Office Chair", qty: 1, priceUsd: 120, lengthCm: 65, widthCm: 65, heightCm: 110, weightKg: 15 },
  { name: "Bookshelf", qty: 1, priceUsd: 110, lengthCm: 80, widthCm: 35, heightCm: 180, weightKg: 30 },
];

const ENTRYWAY: FurnitureItem[] = [
  { name: "Console / Entry Table", qty: 1, priceUsd: 95, lengthCm: 120, widthCm: 35, heightCm: 80, weightKg: 15 },
  { name: "Mirror", qty: 1, priceUsd: 45, lengthCm: 60, widthCm: 5, heightCm: 90, weightKg: 8 },
  { name: "Shoe Cabinet", qty: 1, priceUsd: 85, lengthCm: 100, widthCm: 35, heightCm: 90, weightKg: 20 },
];

// Price multipliers per style (Italian Luxury is premium, Minimalist is affordable)
const STYLE_MULTIPLIERS: Record<string, number> = {
  modern: 1.0,
  scandinavian: 0.95,
  minimalist: 0.85,
  italian: 1.65,
  french: 1.4,
  farmhouse: 0.9,
  contemporary: 1.1,
  midcentury: 1.15,
  industrial: 0.95,
  coastal: 0.9,
};

function calcCbm(item: FurnitureItem): number {
  return (item.lengthCm * item.widthCm * item.heightCm * item.qty) / 1_000_000;
}

export function generatePackage(styleId: string, homeSizeId: string): FurniturePackage {
  const mult = STYLE_MULTIPLIERS[styleId] || 1.0;
  let items: FurnitureItem[] = [];

  // Build room list based on home size
  switch (homeSizeId) {
    case "1b1b":
      items = [...LIVING_ROOM, ...DINING.map(i => i.name === "Dining Chair" ? { ...i, qty: 2 } : i), ...BEDROOM_MASTER];
      break;
    case "2b":
      items = [...LIVING_ROOM, ...DINING, ...BEDROOM_MASTER, ...BEDROOM_SECONDARY, ...OFFICE];
      break;
    case "3b":
      items = [...LIVING_ROOM, ...DINING.map(i => i.name === "Dining Chair" ? { ...i, qty: 6 } : i), ...BEDROOM_MASTER, ...BEDROOM_SECONDARY, ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (3rd BR)" })), ...OFFICE, ...ENTRYWAY];
      break;
    case "4b":
      items = [
        ...LIVING_ROOM,
        { name: "Accent Chair", qty: 2, priceUsd: 180, lengthCm: 75, widthCm: 80, heightCm: 85, weightKg: 18 },
        ...DINING.map(i => i.name === "Dining Chair" ? { ...i, qty: 8 } : { ...i, lengthCm: 200 }),
        ...BEDROOM_MASTER,
        ...BEDROOM_SECONDARY,
        ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (3rd BR)" })),
        ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (4th BR)" })),
        ...OFFICE,
        ...ENTRYWAY,
        { name: "Bathroom Vanity", qty: 2, priceUsd: 350, lengthCm: 120, widthCm: 55, heightCm: 85, weightKg: 40 },
      ];
      break;
    case "5b":
      items = [
        ...LIVING_ROOM,
        { name: "Sectional Sofa (L-Shape)", qty: 1, priceUsd: 850, lengthCm: 300, widthCm: 200, heightCm: 85, weightKg: 85 },
        { name: "Accent Chair", qty: 2, priceUsd: 180, lengthCm: 75, widthCm: 80, heightCm: 85, weightKg: 18 },
        ...DINING.map(i => i.name === "Dining Chair" ? { ...i, qty: 10 } : { ...i, priceUsd: 450, lengthCm: 240, widthCm: 110 }),
        { name: "Bar Cart / Credenza", qty: 1, priceUsd: 180, lengthCm: 100, widthCm: 45, heightCm: 85, weightKg: 25 },
        ...BEDROOM_MASTER.map(i => i.name.includes("Queen") ? { ...i, name: i.name.replace("Queen", "King"), priceUsd: Math.round(i.priceUsd * 1.3), lengthCm: 200, widthCm: 195 } : i),
        ...BEDROOM_SECONDARY,
        ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (3rd BR)" })),
        ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (4th BR)" })),
        ...BEDROOM_SECONDARY.map(i => ({ ...i, name: i.name + " (5th BR)" })),
        ...OFFICE,
        { name: "Library Bookcase (Large)", qty: 1, priceUsd: 220, lengthCm: 180, widthCm: 40, heightCm: 200, weightKg: 55 },
        ...ENTRYWAY,
        { name: "Bathroom Vanity", qty: 3, priceUsd: 350, lengthCm: 120, widthCm: 55, heightCm: 85, weightKg: 40 },
        { name: "Outdoor Dining Set", qty: 1, priceUsd: 380, lengthCm: 180, widthCm: 100, heightCm: 75, weightKg: 45 },
      ];
      break;
  }

  // Apply style price multiplier
  items = items.map(item => ({
    ...item,
    priceUsd: Math.round(item.priceUsd * mult),
  }));

  const totalPrice = items.reduce((s, i) => s + i.priceUsd * i.qty, 0);
  const totalCbm = items.reduce((s, i) => s + calcCbm(i), 0);
  const totalWeight = items.reduce((s, i) => s + i.weightKg * i.qty, 0);
  const containerType = totalCbm > 33 ? "40HC" : "20GP";

  const style = STYLES.find(s => s.id === styleId)?.label || styleId;
  const homeSize = HOME_SIZES.find(h => h.id === homeSizeId)?.label || homeSizeId;

  return { style, homeSize, items, totalPrice, totalCbm: Math.round(totalCbm * 100) / 100, totalWeight: Math.round(totalWeight), containerType };
}
