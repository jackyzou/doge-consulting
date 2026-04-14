/**
 * Seed Kevin Zhang LPDDR5 Quote to production database
 * Run during Docker entrypoint or manually: node scripts/seed-quote-kevin.mjs
 */
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const DB_PATH = process.env.DATABASE_PATH || process.env.DATABASE_URL?.replace("file:", "") || "dev.db";
const db = new Database(DB_PATH);

// Check if already exists
const existing = db.prepare("SELECT id FROM Quote WHERE customerName = ? AND subtotal > 500000").get("Kevin Zhang");
if (existing) {
  console.log("Kevin Zhang LPDDR5 quote already exists, skipping");
  db.close();
  process.exit(0);
}

// Get next quote number
let qn = "QT-2026-0010";
try {
  const last = db.prepare("SELECT quoteNumber FROM Quote ORDER BY createdAt DESC LIMIT 1").get();
  if (last?.quoteNumber) {
    const num = parseInt(last.quoteNumber.split("-").pop()) + 1;
    qn = `QT-2026-${String(num).padStart(4, "0")}`;
  }
} catch {}

const quoteId = randomUUID();
const now = new Date().toISOString();
const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

const items = [
  { name: "RS2G32LO5D4FDB-31BT (Rayson 8GB LPDDR5)", desc: "Rayson 8GB LPDDR5 6400Mbps. JEDEC JESD209-5C. 315-ball TFBGA. Cost-optimized mainstream option. Lead: 4-6 weeks.", qty: 10000, price: 5.50 },
  { name: "MT62F2G32D4DS-026 WT:B (Micron 8GB D8CTP)", desc: "Micron 8GB LPDDR5 6400Mbps. WT:B variant. Original Micron authentic. Lead: 6-8 weeks.", qty: 10000, price: 7.00 },
  { name: "MT62F2G32D4DS-026 WT:C (Micron 8GB D8DNF)", desc: "Micron 8GB LPDDR5 6400Mbps. WT:C variant. Original Micron authentic. Lead: 6-8 weeks.", qty: 10000, price: 7.00 },
  { name: "MT62F2G32D4DS-020 WT:F (Micron 8GB D8GBN)", desc: "Micron 8GB LPDDR5 6400Mbps. WT:F higher speed bin. Original Micron authentic. Lead: 6-8 weeks.", qty: 10000, price: 6.50 },
  { name: "K3LKCKC0BM-MG** (Samsung 8GB LPDDR5)", desc: "Samsung 8GB LPDDR5 6400Mbps. Original Samsung authentic. Lead: 6-8 weeks.", qty: 10000, price: 6.30 },
  { name: "K3KL9L90QM-MG** (Samsung 16GB LPDDR5X)", desc: "Samsung 16GB LPDDR5X 7500Mbps+. High-performance/AI. Via authorized distributor. Lead: 8-10 weeks.", qty: 10000, price: 12.80 },
  { name: "H9JCNNNFA5MLYR (SK Hynix 8GB LPDDR5)", desc: "SK Hynix 8GB LPDDR5 6400Mbps. Best quality-per-dollar. Via authorized channel. Lead: 6-8 weeks.", qty: 10000, price: 6.00 },
  { name: "H58G66CK8BX147N (SK Hynix 4GB LPDDR5)", desc: "SK Hynix 4GB LPDDR5 6400Mbps. Original authentic. Lead: 6-8 weeks.", qty: 10000, price: 3.30 },
];

const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
const shipping = 2500;
const s301 = subtotal * 0.25;
const ins = subtotal * 0.005;
const total = subtotal + shipping + s301 + ins;

const notes = `LPDDR5/LPDDR5X Memory Chip Bulk Sourcing Quote
Customer: Kevin Zhang — Hardware Startup, San Francisco
8 SKUs × 10,000 units = 80,000 total chips
Manufacturers: Rayson, Micron, Samsung, SK Hynix

Recommended Top 3 Strategy:
1. RS2G32LO5D4FDB-31BT (Rayson 8GB) — Cost-optimized mainstream ($5.50)
2. H9JCNNNFA5MLYR (SK Hynix 8GB) — Quality & compliance leader ($6.00)
3. K3KL9L90QM-MG (Samsung 16GB LPDDR5X) — High-end/AI ($12.80)

Hardware Specs: JEDEC JESD209-5C, 6400-7500 Mbps
Package: 315-ball TFBGA (12.4 × 15.0 × 1.1mm)
Op Temp: -25°C to +85°C | RoHS compliant

Tariff: HTS 8542.32 = 0% base + 25% Section 301
Freight: CNY 20/kg (air, actual weight)
Valid: 14 days from issue date`;

try {
  db.prepare(`INSERT INTO Quote (id,quoteNumber,status,customerName,customerEmail,customerPhone,customerCompany,
    subtotal,shippingCost,insuranceCost,customsDuty,discount,taxAmount,totalAmount,
    currency,depositPercent,shippingMethod,originCity,destinationCity,estimatedTransit,
    notes,validUntil,createdAt,updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    quoteId, qn, "draft", "Kevin Zhang", "", "", "Hardware Startup (San Francisco)",
    subtotal, shipping, ins, s301, 0, 0, total,
    "USD", 50, "Air Freight", "Shenzhen / Various China", "San Francisco, CA", "4-10 weeks",
    notes, validUntil, now, now
  );

  for (const i of items) {
    db.prepare(`INSERT INTO QuoteItem (id,quoteId,name,description,quantity,unitPrice,totalPrice,unit)
      VALUES (?,?,?,?,?,?,?,?)`).run(
      randomUUID(), quoteId, i.name, i.desc, i.qty, i.price, i.qty * i.price, "piece"
    );
  }

  console.log(`✅ Quote ${qn} created: Kevin Zhang LPDDR5 ($${total.toLocaleString()})`);
} catch (e) {
  console.error("Error:", e.message);
}

db.close();
