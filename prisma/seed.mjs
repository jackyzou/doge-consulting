/**
 * Database seed script — uses better-sqlite3 directly to avoid
 * Prisma 7 ESM / client-initialisation issues outside Next.js.
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// helper
const cuid = () => randomUUID().replace(/-/g, "").slice(0, 25);

console.log("🌱 Seeding database …");

// ── Admin user ──────────────────────────────────────────────
const adminId = cuid();
const adminHash = bcrypt.hashSync("admin123", 12);
db.prepare(`INSERT OR IGNORE INTO User (id, email, passwordHash, name, role, phone, company, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
  .run(adminId, "admin@dogeconsulting.com", adminHash, "Jacky Zou", "admin", "+1-425-223-0449", "Doge Consulting Group Limited");
console.log("✅  Admin user: admin@dogeconsulting.com / admin123");

// ── Demo customer ───────────────────────────────────────────
const custId = cuid();
const custHash = bcrypt.hashSync("user123", 12);
db.prepare(`INSERT OR IGNORE INTO User (id, email, passwordHash, name, role, phone, company, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`)
  .run(custId, "sarah@example.com", custHash, "Sarah Mitchell", "user", "+1-206-555-0101", "Mitchell Interiors");
console.log("✅  Customer user: sarah@example.com / user123");

// Fetch actual IDs (in case rows already existed)
const adminRow = db.prepare("SELECT id FROM User WHERE email = ?").get("admin@dogeconsulting.com");
const custRow = db.prepare("SELECT id FROM User WHERE email = ?").get("sarah@example.com");
const realAdminId = adminRow.id;
const realCustId = custRow.id;

// ── Products ────────────────────────────────────────────────
const products = [
  { name: "Marble Dining Table", description: "Italian marble top, solid wood base. Seats 6.", category: "furniture", sku: "FUR-MDT-001", unitPrice: 1200, unit: "piece", lengthCm: 180, widthCm: 90, heightCm: 76, weightKg: 85 },
  { name: "Dining Chair (Set of 6)", description: "Upholstered seats, solid wood frame. Matching dining set.", category: "furniture", sku: "FUR-DC6-001", unitPrice: 600, unit: "set", lengthCm: 45, widthCm: 45, heightCm: 95, weightKg: 36 },
  { name: "Sectional Sofa (L-Shape)", description: "Premium fabric, high-density foam. Configurable.", category: "furniture", sku: "FUR-SSL-001", unitPrice: 1800, unit: "piece", lengthCm: 280, widthCm: 180, heightCm: 85, weightKg: 120 },
  { name: "TV Console", description: "Walnut finish, cable management, fits up to 75\" TV.", category: "furniture", sku: "FUR-TVC-001", unitPrice: 450, unit: "piece", lengthCm: 180, widthCm: 45, heightCm: 55, weightKg: 45 },
  { name: "King Bed Frame", description: "Solid wood, upholstered headboard, slat base.", category: "furniture", sku: "FUR-KBF-001", unitPrice: 800, unit: "piece", lengthCm: 210, widthCm: 190, heightCm: 110, weightKg: 75 },
  { name: "Wardrobe (Large)", description: "3-door, mirrored, with drawers and shelves.", category: "furniture", sku: "FUR-WDL-001", unitPrice: 950, unit: "piece", lengthCm: 180, widthCm: 60, heightCm: 220, weightKg: 110 },
  { name: "Coffee Table", description: "Tempered glass top, stainless steel legs.", category: "furniture", sku: "FUR-CFT-001", unitPrice: 280, unit: "piece", lengthCm: 120, widthCm: 60, heightCm: 45, weightKg: 25 },
  { name: "Standing Desk", description: "Electric height-adjustable, bamboo top.", category: "furniture", sku: "FUR-STD-001", unitPrice: 350, unit: "piece", lengthCm: 140, widthCm: 70, heightCm: 120, weightKg: 30 },
  { name: "Bookshelf (5-Tier)", description: "Solid wood, open shelving design.", category: "furniture", sku: "FUR-BSH-001", unitPrice: 220, unit: "piece", lengthCm: 80, widthCm: 30, heightCm: 180, weightKg: 22 },
  { name: "Nightstand Pair", description: "Matching set of 2, solid wood with drawer.", category: "furniture", sku: "FUR-NSP-001", unitPrice: 180, unit: "set", lengthCm: 50, widthCm: 40, heightCm: 55, weightKg: 14 },
  { name: "Robot Vacuum", description: "Smart mapping, auto-empty dock, HEPA filter.", category: "electronics", sku: "ELE-RVA-001", unitPrice: 180, unit: "piece", lengthCm: 35, widthCm: 35, heightCm: 10, weightKg: 4 },
  { name: "Ceramic Dinnerware Set", description: "24-piece set, microwave-safe, minimalist design.", category: "home-goods", sku: "HOM-CDS-001", unitPrice: 85, unit: "set", lengthCm: 40, widthCm: 40, heightCm: 30, weightKg: 8 },
];

const insertProduct = db.prepare(`INSERT OR IGNORE INTO Product
  (id, name, description, category, sku, unitPrice, unit, lengthCm, widthCm, heightCm, weightKg, isActive, isCatalog, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, datetime('now'), datetime('now'))`);

for (const p of products) {
  insertProduct.run(cuid(), p.name, p.description, p.category, p.sku, p.unitPrice, p.unit, p.lengthCm, p.widthCm, p.heightCm, p.weightKg);
}
console.log(`✅  ${products.length} products seeded`);

// ── Sample quote ────────────────────────────────────────────
const existingQuote = db.prepare("SELECT id FROM Quote WHERE quoteNumber = ?").get("QT-2026-0001");
if (!existingQuote) {
  const quoteId = cuid();
  db.prepare(`INSERT INTO Quote
    (id, quoteNumber, status, customerId, customerName, customerEmail, customerPhone, customerCompany,
     subtotal, shippingCost, insuranceCost, customsDuty, discount, taxAmount, totalAmount, currency, depositPercent,
     shippingMethod, originCity, destinationCity, estimatedTransit, validUntil, sentAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 0, 0, ?, 'USD', 70,
            ?, 'Shenzhen', 'Seattle, WA', ?, datetime('now','+30 days'), datetime('now'), datetime('now'), datetime('now'))`)
    .run(quoteId, "QT-2026-0001", "sent", realCustId, "Sarah Mitchell", "sarah@example.com", "+1-206-555-0101", "Mitchell Interiors",
         2250, 800, 60, 150, 3260,
         "LCL", "5-8 weeks");

  const insertQI = db.prepare(`INSERT INTO QuoteItem
    (id, quoteId, name, quantity, unitPrice, totalPrice, unit) VALUES (?, ?, ?, ?, ?, ?, 'piece')`);
  insertQI.run(cuid(), quoteId, "Marble Dining Table", 1, 1200, 1200);
  insertQI.run(cuid(), quoteId, "Dining Chair (Set of 6)", 1, 600, 600);
  insertQI.run(cuid(), quoteId, "TV Console", 1, 450, 450);
  console.log("✅  Sample quote: QT-2026-0001");
}

// ── Sample order ────────────────────────────────────────────
const existingOrder = db.prepare("SELECT id FROM [Order] WHERE orderNumber = ?").get("ORD-2026-0001");
if (!existingOrder) {
  const orderId = cuid();
  db.prepare(`INSERT INTO [Order]
    (id, orderNumber, status, customerId, customerName, customerEmail, customerPhone,
     subtotal, shippingCost, insuranceCost, customsDuty, discount, taxAmount, totalAmount, depositAmount, balanceDue, currency,
     shippingMethod, originCity, destinationCity, trackingId, vessel, estimatedDelivery, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 0, 0, ?, ?, ?, 'USD',
            ?, 'Shenzhen', 'Seattle, WA', ?, ?, datetime('2026-03-15'), datetime('now'), datetime('now'))`)
    .run(orderId, "ORD-2026-0001", "in_transit", realCustId, "Sarah Mitchell", "sarah@example.com", "+1-206-555-0101",
         2250, 800, 60, 150, 3260, 2282, 978,
         "LCL", "DC-2026-001", "COSCO Pacific");

  // Order items
  const insertOI = db.prepare(`INSERT INTO OrderItem
    (id, orderId, name, quantity, unitPrice, totalPrice, unit) VALUES (?, ?, ?, ?, ?, ?, 'piece')`);
  insertOI.run(cuid(), orderId, "Marble Dining Table", 1, 1200, 1200);
  insertOI.run(cuid(), orderId, "Dining Chair (Set of 6)", 1, 600, 600);
  insertOI.run(cuid(), orderId, "TV Console", 1, 450, 450);

  // Status history
  const insertSH = db.prepare(`INSERT INTO OrderStatusHistory
    (id, orderId, status, note, changedBy, createdAt) VALUES (?, ?, ?, ?, ?, ?)`);
  insertSH.run(cuid(), orderId, "pending", "Order created", "System", "2026-01-05T00:00:00.000Z");
  insertSH.run(cuid(), orderId, "confirmed", "Deposit received", "Jacky Zou", "2026-01-06T00:00:00.000Z");
  insertSH.run(cuid(), orderId, "sourcing", "Sourcing from Shenzhen", "Jacky Zou", "2026-01-10T00:00:00.000Z");
  insertSH.run(cuid(), orderId, "packing", "Products inspected, packing", "Jacky Zou", "2026-01-20T00:00:00.000Z");
  insertSH.run(cuid(), orderId, "in_transit", "Shipped via COSCO Pacific", "Jacky Zou", "2026-02-01T00:00:00.000Z");

  // Payment
  db.prepare(`INSERT INTO Payment
    (id, paymentNumber, orderId, customerId, amount, currency, method, status, type, paidAt, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, 'USD', ?, ?, ?, datetime('2026-01-06'), datetime('now'), datetime('now'))`)
    .run(cuid(), "PAY-2026-0001", orderId, realCustId, 2282, "credit_card", "completed", "deposit");
  console.log("✅  Sample order: ORD-2026-0001 with payment");
}

db.close();
console.log("\n🎉 Seed complete!");
console.log("──────────────────────────────────");
console.log("Admin login:  admin@dogeconsulting.com / admin123");
console.log("User login:   sarah@example.com / user123");
console.log("──────────────────────────────────");
