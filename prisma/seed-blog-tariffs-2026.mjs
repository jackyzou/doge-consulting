// Seed blog post: US-China Tariffs 2026 Guide — run with: node prisma/seed-blog-tariffs-2026.mjs
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try production DB first, fall back to dev.db
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
  slug: "us-china-tariffs-2026-guide-importers",
  title: "US-China Tariffs in 2026: What Every Importer Needs to Know",
  excerpt: "Navigate Section 301 tariffs, duty rates, and exemptions for importing from China to the US. Updated for 2026 with current rates, reduction strategies, and real cost examples.",
  category: "Compliance",
  emoji: "🏛️",
  readTime: "12 min",
  authorName: "Seth Nakamura",
  content: `![US-China trade tariffs](https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=600&fit=crop)

## The State of US-China Tariffs in 2026

If you're importing goods from China into the United States, tariffs are likely your single largest variable cost after the product itself. Understanding the current tariff landscape isn't optional — it's the difference between a profitable import business and one that bleeds money on every container.

As of March 2026, most Chinese imports face a combination of **standard MFN (Most Favored Nation) duty rates** plus **Section 301 additional tariffs** ranging from 7.5% to 25% depending on the product category.

> 💡 KEY INSIGHT: The effective import duty on Chinese goods typically ranges from **12% to 50%** when you stack MFN duties + Section 301 tariffs. Knowing your exact rate is critical before sourcing.

## Understanding the Tariff Structure

### Layer 1: Standard MFN Duty Rates

Every product imported into the US has a base duty rate determined by its **HS (Harmonized System) code**. These rates apply regardless of country of origin:

| Product Category | Typical MFN Rate | Example HS Code |
|-----------------|------------------|-----------------|
| Electronics & components | 0–5% | 8471, 8542 |
| Furniture | 0–10% | 9401, 9403 |
| Textiles & apparel | 10–32% | 6101–6114 |
| Footwear | 8–48% | 6401–6405 |
| Auto parts | 2.5–6% | 8708 |
| Toys & games | 0–6.5% | 9503 |
| Kitchenware | 0–7.5% | 7323, 7615 |
| Plastics | 0–6.5% | 3924 |

### Layer 2: Section 301 Tariffs

On top of MFN rates, Section 301 tariffs add an **additional 7.5% or 25%** to most Chinese goods. Your product falls into one of these lists:

**List 1 (25% additional):** Industrial machinery, electronics components, medical devices, aerospace parts — approximately 818 product lines

**List 2 (25% additional):** Semiconductors, plastics, chemicals, railway parts — approximately 279 product lines

**List 3 (25% additional):** Furniture, lighting, auto parts, building materials, handbags — the broadest list covering ~5,700+ product lines

**List 4A (7.5% additional):** Consumer goods including apparel, footwear, textiles, electronics accessories — approximately 3,800+ product lines

### How to Check Your Rate

1. **Find your HS code** using the [USITC Harmonized Tariff Schedule](https://hts.usitc.gov/)
2. **Check Section 301 status** at [USTR's 301 page](https://ustr.gov/issue-areas/enforcement/section-301-investigations/tariff-actions)
3. **Calculate total duty** = MFN rate + Section 301 rate

> 📊 EXAMPLE: Importing office chairs (HS 9401.30) from China
> - MFN duty: 0% (free)
> - Section 301 (List 3): +25%
> - **Total effective duty: 25% of declared value**

## Real Cost Impact: Case Studies

### Case 1: Furniture Importer

| Cost Element | Amount |
|-------------|--------|
| FOB China price (100 chairs) | $5,000 |
| Ocean freight (LCL) | $800 |
| Insurance | $50 |
| **CIF value (dutiable value)** | **$5,850** |
| MFN duty (0%) | $0 |
| Section 301 (25%) | $1,462.50 |
| Merchandise Processing Fee (0.3464%) | $20.26 |
| Harbor Maintenance Fee (0.125%) | $7.31 |
| **Total duties & fees** | **$1,490.07** |
| **Landed cost** | **$7,340.07** |

**Tariffs add 25.5% to the landed cost.** Without factoring this in, your margin calculation is wrong from day one.

### Case 2: Electronics Accessories (List 4A)

| Cost Element | Amount |
|-------------|--------|
| FOB China price (phone cases) | $3,000 |
| Ocean freight | $500 |
| Insurance | $30 |
| **CIF value** | **$3,530** |
| MFN duty (3.4%) | $120.02 |
| Section 301 (7.5%) | $264.75 |
| MPF + HMF | $16.63 |
| **Total duties & fees** | **$401.40** |
| **Landed cost** | **$3,931.40** |

**Tariffs add 11.4%** — much more manageable than furniture.

## 6 Strategies to Reduce Tariff Costs

### 1. Tariff Engineering (Reclassification)

Some products qualify for lower-tariff HS codes depending on how they're manufactured, packaged, or described. For example:

- A "set" of items may classify differently than individual items
- Unfinished goods sometimes face lower duties than finished products
- Components shipped separately may have lower rates than assembled products

⚠️ **Warning:** Misclassification is a federal offense. Always work with a licensed customs broker.

### 2. First Sale Valuation

If your supply chain involves a middleman (trading company), you may be able to declare duties based on the **first sale price** (factory to trading company) rather than the higher price you paid. This can reduce dutiable value by 10-20%.

**Requirements:**
- Two-tier transaction must be genuine and documented
- First sale must be an arm's-length transaction
- All documentation must be available for CBP audit

### 3. Foreign Trade Zones (FTZ)

FTZs are designated areas where you can import goods, store them, and even assemble them before they enter US commerce. Benefits:

- **Defer duties** until goods leave the FTZ
- **Inverted tariff benefit** — if the finished product has a lower duty than the components
- **No duties on re-exported goods** — if you eventually ship to another country

### 4. Section 301 Exclusions

Check if your specific product has an active exclusion. While most exclusions from 2020-2022 have expired, new exclusions are periodically granted. Monitor the [Federal Register](https://www.federalregister.gov/) for updates.

### 5. Diversify Sourcing (China Plus One)

For products where tariffs significantly impact margins, consider sourcing from countries with lower or zero tariff rates:

| Country | Section 301? | Key Industries |
|---------|-------------|----------------|
| Vietnam | No | Textiles, furniture, electronics assembly |
| India | No | Textiles, pharmaceuticals, handicrafts |
| Thailand | No | Auto parts, electronics, food products |
| Mexico | No (USMCA) | Auto parts, electronics, appliances |
| Cambodia | No (GSP) | Textiles, footwear |

> 🌍 NOTE: "China Plus One" doesn't mean abandoning China — it means having alternatives for tariff-sensitive products while keeping China for items where it's still competitive.

### 6. Use a Freight Forwarder Who Understands Tariffs

This is where a partner like Doge Consulting makes a difference. We help importers:

- **Classify products correctly** with proper HS codes before shipping
- **Structure shipments** to minimize dutiable value where legally possible
- **Connect you with customs brokers** who specialize in Section 301 goods
- **Calculate total landed cost** so you know your true margins upfront

## Common Mistakes That Cost Importers Thousands

### Mistake 1: Not Factoring Tariffs Into Product Pricing

Many first-time importers calculate margins based on FOB price + shipping, forgetting that 25% tariffs can eliminate their entire profit margin.

**Fix:** Always calculate landed cost including all duties before committing to a supplier.

### Mistake 2: Wrong HS Code Classification

Using the wrong HS code — even accidentally — can result in:
- Overpaying duties (money left on the table)
- Underpaying duties (penalties, fines, seizure)
- Shipments held at customs for examination

**Fix:** Have a licensed customs broker confirm your HS codes before your first shipment.

### Mistake 3: Ignoring De Minimis Threshold

Shipments valued under **$800** enter the US duty-free under the de minimis exemption. While this isn't practical for commercial importers shipping containers, it's useful for sample shipments and small test orders.

### Mistake 4: Not Keeping Documentation

CBP can audit import entries for up to **5 years**. You need:
- Commercial invoices (signed, with full product descriptions)
- Packing lists
- Bills of lading
- Certificates of origin
- Any Section 301 exclusion documentation

## What's Coming: 2026 Tariff Outlook

The tariff landscape continues to evolve. Key developments to watch:

- **Potential List 4A adjustments** — the 7.5% rate on consumer goods may be modified
- **New trade agreements** — ongoing negotiations could affect specific product categories
- **Enhanced enforcement** — CBP is increasing audits on origin declarations and valuation

Stay current by monitoring the USTR website and working with an experienced freight partner.

## Calculate Your Tariff Impact

Ready to find out exactly what tariffs will cost you? Use our [free quote tool](/quote) to get a complete landed cost breakdown — including duties, shipping, insurance, and all fees.

For complex tariff questions, [contact our team](/contact) directly. We've helped importers save collectively on duties through proper classification and strategic structuring.

---

*Doge Consulting helps importers navigate US-China trade compliance. We coordinate with licensed customs brokers and freight partners to make your import process smooth. [Get a free consultation](/contact).*`,
};

const now = new Date().toISOString();
const id = randomUUID().replace(/-/g, "").slice(0, 25);

try {
  // Verify table exists before inserting
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='BlogPost'").get();
  if (!tableCheck) {
    console.log("[seed-blog-tariffs] BlogPost table not found, skipping.");
    db.close();
    process.exit(0);
  }

  // Check if post already exists
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

  console.log("[seed-blog-tariffs] Blog post seeded successfully!");
} catch (e) {
  console.log(`[seed-blog-tariffs] Warning: ${e.message} (non-fatal)`);
}
db.close();
