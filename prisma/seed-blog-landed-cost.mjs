// Blog: How to Calculate Your Total Landed Cost — run with: node prisma/seed-blog-landed-cost.mjs
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
let dbPath;
if (process.env.DATABASE_PATH) {
  dbPath = process.env.DATABASE_PATH;
} else {
  const prodPath = resolve(__dirname, "..", "data", "production.db");
  const devPath = resolve(__dirname, "dev.db");
  const fs = await import("fs");
  dbPath = fs.existsSync(prodPath) ? prodPath : devPath;
}
console.log(`Using database: ${dbPath}`);
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const post = {
  slug: "landed-cost-importing-china-guide",
  title: "How to Calculate Your Total Landed Cost When Importing from China",
  excerpt: "Most importers underestimate their true costs by 20-40%. Learn to calculate every component of landed cost — from FOB price to warehouse delivery — with real numbers, formulas, and a worked example.",
  category: "Import Guide",
  emoji: "🧮",
  readTime: "10 min",
  authorName: "Seto Nakamura",
  content: `![Calculating landed cost for China imports](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop)

## What Is "Landed Cost" and Why Most Importers Get It Wrong

Landed cost is the **total price of a product once it arrives at your warehouse door** — not just the factory price. It includes every fee, tax, duty, and handling charge between the supplier's loading dock in China and your shelves in the US.

Here's the problem: most first-time importers only look at the **FOB (Free on Board) price** from their supplier and assume that's their cost. It's not. The real cost is typically **30-60% higher** depending on product category, shipping method, and tariff classification.

> 💡 RULE OF THUMB: If your supplier quotes you $10,000 FOB, your actual landed cost will be $13,000–$16,000. If you haven't budgeted for this, your margins are already gone.

## The 7 Components of Landed Cost

Every import shipment from China includes these cost layers:

### 1. Product Cost (FOB Price)

The price your supplier charges at the Chinese port. This is your starting point.

| FOB Term | What's Included | What's NOT Included |
|----------|----------------|---------------------|
| FOB Shenzhen | Product + domestic transport to port + export customs | Ocean freight, import duties, US customs |
| EXW Factory | Product only at factory gate | Everything else — domestic China transport, export fees, freight, duties |

**Tip:** Always negotiate FOB, not EXW. FOB means your supplier handles China-side logistics, which they can do more cheaply than you.

### 2. International Freight

The cost to move goods from the Chinese port to a US port. This varies dramatically by method:

| Method | Cost Range | Transit Time | Best For |
|--------|-----------|--------------|----------|
| Ocean LCL | $60–$120/CBM | 25–40 days | Small orders (<5 CBM) |
| Ocean FCL 20' | $1,800–$3,500 | 18–30 days | 28 CBM capacity |
| Ocean FCL 40' | $2,500–$5,000 | 18–30 days | 58 CBM capacity |
| Air freight | $4–$8/kg | 5–10 days | Urgent or high-value |
| Air express | $6–$12/kg | 3–5 days | Samples, small parcels |

Current ocean freight rates fluctuate based on fuel costs, seasonal demand, and geopolitical events. Use our [Shipping Rate Tracker](/track) for live rates.

> 📊 Use our [Freight Calculator](/tools/freight-calculator) to get an instant estimate based on your cargo dimensions and destination port.

### 3. Cargo Insurance

Standard coverage is **110% of CIF value** (Cost + Insurance + Freight). Rates typically run **0.3–0.8%** of declared value depending on commodity type and shipping method.

| Cargo Type | Typical Rate | Example ($10,000 CIF) |
|-----------|-------------|------------------------|
| General merchandise | 0.35% | $35 |
| Electronics | 0.50% | $50 |
| Fragile/glass | 0.80% | $80 |
| Furniture | 0.45% | $45 |

**Never skip insurance.** A single lost or damaged container can wipe out an entire year's profit. Learn more in our [Shipping Insurance Guide](/blog/shipping-insurance-china-imports).

### 4. US Import Duties & Tariffs

This is where most importers get surprised. Your duty is determined by:

**A. MFN Duty Rate** — Based on your product's [HS code](/blog/hs-code-classification-guide). Ranges from 0% (many electronics) to 48% (some footwear).

**B. Section 301 Tariff** — An additional 7.5% or 25% on most Chinese goods, on top of the MFN rate.

**Total duty = (MFN rate + Section 301 rate) × CIF value**

Example for furniture (HS 9401.30):
- MFN rate: 0%
- Section 301 (List 3): 25%
- On $10,000 CIF: **$2,500 in duties**

Read our complete [US-China Tariffs 2026 Guide](/blog/us-china-tariffs-2026-guide-importers) for detailed rates by product category.

> 🧮 Use our [Duty Calculator](/tools/duty-calculator) to find your exact rate by HS code.

### 5. Customs Clearance Fees

These are the fees your customs broker charges plus mandatory government fees:

| Fee | Amount | Notes |
|-----|--------|-------|
| Customs broker fee | $150–$350 | Per entry filing |
| Merchandise Processing Fee (MPF) | 0.3464% of value | Min $31.67, max $614.35 |
| Harbor Maintenance Fee (HMF) | 0.125% of value | Ocean shipments only |
| ISF Filing (10+2) | $25–$75 | Required 72h before vessel departure |
| Customs bond | $50–$100/yr | Single-entry or annual continuous |

**Pro tip:** If you're importing regularly, get a **continuous customs bond** (~$300-500/year) instead of paying for single-entry bonds ($50-100 each). It pays for itself after 5-6 shipments.

### 6. Domestic Transportation (Drayage + Last Mile)

Getting your container from the US port to your warehouse:

| Service | Cost Range | What It Covers |
|---------|-----------|----------------|
| Port drayage | $300–$800 | Container from port to nearby warehouse |
| Chassis rental | $30–$50/day | The frame the container sits on |
| Warehouse unloading | $150–$400 | Devanning/unloading the container |
| Demurrage | $150–$350/day | Penalty for leaving container at port too long |
| Last-mile delivery | $200–$1,500 | Trucking from port area to your facility |

**Watch out for demurrage and detention charges.** You typically get 3-5 free days at the port. After that, charges of $150-350/day add up fast. Clear your shipment quickly.

### 7. Additional Fees (The Hidden Costs)

These are the fees that catch first-time importers off guard:

| Fee | When It Applies | Cost |
|-----|----------------|------|
| FDA Prior Notice | Food, cosmetics, supplements | $0 (filing) + $300-500 (agent) |
| CPSC testing | Children's products, toys | $500–$2,000 per SKU |
| FCC testing | Electronics with wireless | $1,000–$5,000 per SKU |
| Fumigation certificate | Wood packaging material | $75–$200 |
| Container examination (CBP) | Random or flagged | $300–$1,000+ |
| Warehouse storage | After free period | $50–$150/pallet/month |

## Worked Example: $10,000 Furniture Order

Let's walk through a real calculation for importing 50 dining chairs from Foshan, China to Los Angeles.

| Cost Component | Calculation | Amount |
|---------------|-------------|--------|
| **1. FOB Price** | 50 chairs × $200 each | $10,000 |
| **2. Ocean Freight** | LCL, 8 CBM × $85/CBM | $680 |
| **3. Insurance** | ($10,000 + $680) × 0.45% | $48.06 |
| **Subtotal: CIF Value** | | **$10,728.06** |
| **4a. MFN Duty** | 0% × $10,728.06 | $0 |
| **4b. Section 301** | 25% × $10,728.06 | $2,682.02 |
| **5a. Customs Broker** | Flat fee | $250 |
| **5b. MPF** | 0.3464% × $10,728.06 | $37.16 |
| **5c. HMF** | 0.125% × $10,728.06 | $13.41 |
| **5d. ISF Filing** | Flat fee | $35 |
| **5e. Customs Bond** | Single entry | $75 |
| **6a. Port Drayage** | LA port to warehouse | $450 |
| **6b. Warehouse Unload** | Palletize + store | $200 |
| **7. Fumigation Cert** | Wood packaging | $100 |
| | | |
| **TOTAL LANDED COST** | | **$15,048.71** |
| **Per Chair** | $15,048.71 ÷ 50 | **$300.97** |
| **Markup over FOB** | ($15,048.71 - $10,000) / $10,000 | **50.5%** |

**The $200 FOB chair actually costs $301 landed.** If you were planning to sell at $350 thinking you had $150 margin, your real margin is only $49 (14%).

## The Landed Cost Formula

Here's the formula you can use for any import:

**Landed Cost = FOB + Freight + Insurance + Duties + Customs Fees + Domestic Transport + Additional Fees**

Or expressed as percentages of FOB for quick estimation:

| Category | Furniture | Electronics | Textiles | General Goods |
|----------|----------|-------------|----------|---------------|
| Freight | 5–10% | 3–8% | 4–8% | 5–10% |
| Insurance | 0.3–0.5% | 0.5–0.8% | 0.3–0.5% | 0.3–0.5% |
| Duties (MFN + 301) | 25–35% | 7.5–15% | 20–45% | 10–30% |
| Customs + fees | 3–5% | 3–5% | 3–5% | 3–5% |
| Domestic transport | 3–8% | 2–5% | 3–6% | 3–8% |
| **Total markup** | **36–58%** | **16–34%** | **30–64%** | **21–54%** |

## 5 Ways to Reduce Your Landed Cost

### 1. Optimize Your HS Code Classification

Work with a licensed customs broker to ensure you're using the **most favorable HS code** that accurately describes your product. Misclassification can cost you thousands.

### 2. Consolidate Shipments

Combining orders from multiple suppliers into one container through [warehouse consolidation](/blog/china-warehouse-consolidation) reduces per-unit freight costs significantly. A full FCL is 40-60% cheaper per CBM than LCL.

### 3. Negotiate Better FOB Terms

The FOB price is negotiable. Tactics that work:
- Order larger quantities for volume discounts
- Offer advance payment (30% deposit, 70% before shipping)
- Build long-term relationships — suppliers reward loyalty

### 4. Use a Freight Forwarder

A good freight forwarder like Doge Consulting negotiates bulk rates with carriers. Our customers typically save 15-25% on freight costs compared to booking directly.

### 5. Check for Duty Exemptions

Some products qualify for reduced or zero duties through:
- **First Sale Valuation** — declare duties on the factory-to-middleman price, not the middleman-to-you price
- **Foreign Trade Zones** — defer or reduce duties by storing and processing in an FTZ
- **Section 301 Exclusions** — some products have active exemptions

## Calculate Your Landed Cost Now

Don't guess — calculate. Use our free tools:

- **[Duty Calculator](/tools/duty-calculator)** — Find your exact MFN + Section 301 rate by HS code
- **[Freight Calculator](/tools/freight-calculator)** — Get instant ocean and air freight estimates
- **[Revenue Calculator](/tools/revenue-calculator)** — Model your margins with all costs included

Or [request a free quote](/quote) and our team will calculate your complete landed cost breakdown — no obligation.

---

*Doge Consulting helps importers understand their true costs before they commit. We provide free landed cost analysis as part of every quote. [Get started](/contact).*`,
};

const now = new Date().toISOString();
const id = randomUUID().replace(/-/g, "").slice(0, 25);

const existing = db.prepare("SELECT id FROM BlogPost WHERE slug = ? AND language = ?").get(post.slug, "en");

if (existing) {
  console.log(`Post "${post.title}" already exists — updating...`);
  db.prepare(`
    UPDATE BlogPost SET title = ?, excerpt = ?, content = ?, category = ?, emoji = ?,
    readTime = ?, authorName = ?, published = 1, updatedAt = ?
    WHERE slug = ? AND language = ?
  `).run(post.title, post.excerpt, post.content, post.category, post.emoji,
    post.readTime, post.authorName, now, post.slug, "en");
} else {
  console.log(`Creating post: "${post.title}"`);
  db.prepare(`
    INSERT INTO BlogPost (id, slug, language, title, excerpt, content, category, emoji, published, authorName, readTime, viewCount, createdAt, updatedAt)
    VALUES (?, ?, 'en', ?, ?, ?, ?, ?, 1, ?, ?, 0, ?, ?)
  `).run(id, post.slug, post.title, post.excerpt, post.content, post.category,
    post.emoji, post.authorName, post.readTime, now, now);
}

console.log("✅ Blog post seeded successfully!");
db.close();
