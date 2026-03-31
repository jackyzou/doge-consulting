// Seed 12 long-tail keyword blog posts — run with: node prisma/seed-blog-expansion.mjs
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
let dbPath;
if (process.env.DATABASE_PATH) {
  dbPath = process.env.DATABASE_PATH;
} else {
  const prodPath = resolve(__dirname, "..", "data", "production.db");
  const devPath = resolve(__dirname, "dev.db");
  dbPath = existsSync(prodPath) ? prodPath : devPath;
}
console.log(`[seed-blog-expansion] Using database: ${dbPath}`);
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const posts = [
  {
    slug: "alibaba-supplier-verification-guide",
    title: "How to Verify Alibaba Suppliers: 7-Step Due Diligence Guide",
    excerpt: "Avoid scams and find reliable Chinese suppliers on Alibaba with this proven verification checklist used by professional importers.",
    category: "Sourcing",
    emoji: "🔍",
    readTime: "8 min",
    authorName: "Rachel Morales",
    content: `![Alibaba supplier verification on laptop screen](https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop)

## Why Supplier Verification Matters

Sourcing from China through Alibaba can save 40-60% on product costs — but only if you work with legitimate suppliers. In 2026, there are over 200,000 suppliers on Alibaba, and not all are created equal.

> 💡 TIP: Always verify before placing your first order. The cost of verification is a fraction of the cost of a bad shipment.

## The 7-Step Verification Process

### Step 1: Check Gold Supplier Status & Years

Gold Supplier badges indicate the manufacturer has paid for membership verification. Look for:
- **3+ years** of Gold Supplier status
- **Trade Assurance** badge (buyer protection program)
- **Verified** company registration

### Step 2: Request Business License

Ask every supplier for their Chinese Business License (营业执照). Verify it at the [National Enterprise Credit Information System](https://www.gsxt.gov.cn/).

- Company name should match exactly
- Registration capital should be reasonable for their industry
- Check the "operating status" — it should show "active"

### Step 3: Verify Factory vs. Trading Company

Understanding who you're buying from matters:

| Factor | Factory | Trading Company |
|--------|---------|-----------------|
| Price | Lower (direct) | 10-20% markup |
| MOQ | Higher (500+) | Flexible (50+) |
| Customization | Full control | Limited |
| Communication | May be slower | Usually better English |

### Step 4: Request Video Factory Tour

In 2026, any legitimate manufacturer will offer a video call factory tour. Red flags:
- Refuses video calls entirely
- Shows a different factory than listed
- Cannot demonstrate production equipment

### Step 5: Order Samples First

**Never skip this step.** Order 2-3 samples from different suppliers before committing. Compare:
- Material quality and finish
- Packaging standards
- Communication responsiveness
- Shipping speed of samples

### Step 6: Start with a Trial Order

Place a small trial order (1-2 cartons) before scaling:
- Test the full production → QC → shipping pipeline
- Verify shipping documents (commercial invoice, packing list)
- Confirm actual lead times vs. quoted

### Step 7: Use Third-Party Inspection

Hire a QC inspection service for your first production run. Services like SGS, Bureau Veritas, or local agents cost $200-400 per inspection and prevent thousands in potential losses.

> 🔑 KEY TAKEAWAY: The entire verification process costs $500-1000 and takes 2-3 weeks, but protects orders worth tens of thousands of dollars.

## Red Flags to Watch For

- Prices significantly below market average (likely bait-and-switch)
- Reluctance to share business documents
- Pressure to pay via Western Union or crypto
- No physical factory address
- Brand new Alibaba account with no transaction history

## Tools to Help

Use our [Product Match Tool](/catalog) to get instant price comparisons, or [request a free quote](/quote) and our team will verify suppliers for you.

---

*Need help finding verified suppliers? [Contact our sourcing team](/contact) — we've vetted 500+ factories across Shenzhen, Guangzhou, Yiwu, and Foshan.*`,
  },
  {
    slug: "amazon-fba-shipping-from-china-cost-breakdown",
    title: "Amazon FBA Shipping from China: Complete 2026 Cost Breakdown",
    excerpt: "Every cost involved in shipping to Amazon FBA from China — ocean freight, duties, prep fees, and how to calculate your true landed cost.",
    category: "Shipping",
    emoji: "📦",
    readTime: "10 min",
    authorName: "Seth Parker",
    content: `![Amazon FBA shipping containers](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=600&fit=crop)

## The True Cost of Amazon FBA Shipping from China

Most new Amazon sellers underestimate their shipping costs by 30-40%. Here's every cost you'll encounter when shipping from Chinese factories to Amazon FBA warehouses in the US.

## Cost Component Breakdown

### 1. Factory Price (FOB)
Your product cost at the factory gate. This is what you negotiate with your supplier.

- **Typical range:** $1-50/unit depending on product
- **Payment terms:** Usually 30% deposit, 70% before shipment
- **Tip:** Always negotiate FOB Shenzhen or FOB Ningbo pricing

### 2. Domestic China Freight
Moving goods from factory to the port.

| Route | Cost |
|-------|------|
| Factory → Shenzhen port | $50-150/CBM |
| Factory → Ningbo port | $50-200/CBM |
| Factory → Shanghai port | $80-250/CBM |

### 3. Ocean Freight (The Big One)

Ocean freight rates for China → USA in 2026:

| Route | 20GP | 40HC | Per CBM (LCL) |
|-------|------|------|---------------|
| Shenzhen → Los Angeles | $1,800-2,400 | $2,800-3,600 | $45-65 |
| Shenzhen → Seattle | $1,600-2,200 | $2,500-3,200 | $40-60 |
| Shanghai → New York | $2,200-3,000 | $3,500-4,500 | $55-75 |
| Ningbo → Los Angeles | $1,700-2,300 | $2,700-3,500 | $42-62 |

> 💰 PRO TIP: LCL (Less than Container Load) is cheaper for shipments under 15 CBM. Above that, a full 20GP container is more economical.

### 4. US Customs Duties

Import duties vary by product HS code:

- **Electronics:** 0-5%
- **Furniture:** 0-8%
- **Textiles:** 10-32%
- **Auto parts:** 2.5-6%
- **General merchandise:** 3-15%

Use our [Duty Calculator](/tools/duty-calculator) to estimate your exact rate.

### 5. Customs Broker Fee
- **Broker fee:** $150-300 per entry
- **ISF filing:** $50-75
- **Bond:** $275-500/year (single entry $50-75)

### 6. Amazon FBA Prep & Delivery
- **Drayage (port → warehouse):** $400-800
- **FBA prep (labeling, bundling):** $0.50-2.00/unit
- **FBA inbound shipping:** $0.30-0.75/unit

### 7. Insurance
- **Marine cargo insurance:** 0.3-0.5% of goods value
- **Highly recommended** for shipments over $5,000

## Sample Cost Calculation

Let's calculate for 500 units of a product:

| Cost Item | Amount |
|-----------|--------|
| Product cost (FOB) | $5,000 (500 × $10) |
| Domestic China freight | $80 |
| Ocean freight (LCL, 2 CBM) | $120 |
| US customs duty (5%) | $250 |
| Customs broker | $200 |
| Drayage + FBA prep | $450 |
| Insurance | $25 |
| **Total landed cost** | **$6,125** |
| **Per unit landed** | **$12.25** |

Your $10 FOB product actually costs $12.25 delivered to Amazon — a 22.5% increase.

## How to Reduce Costs

1. **Consolidate shipments** — Ship monthly instead of weekly
2. **Negotiate freight rates** — Use a freight forwarder (like us!) for volume discounts
3. **Optimize packaging** — Reduce CBM by 20-30% with better packaging design
4. **Use our [CBM Calculator](/tools/cbm-calculator)** to plan container loads

---

*Get an instant shipping quote for your Amazon FBA products. [Request a free estimate](/quote) — we've shipped for 200+ Amazon sellers.*`,
  },
  {
    slug: "china-usa-ocean-freight-transit-times-2026",
    title: "China to USA Ocean Freight Transit Times by Port (2026 Guide)",
    excerpt: "Updated transit times for all major China-to-USA shipping routes. Port-by-port breakdown with seasonal variations and delay factors.",
    category: "Shipping",
    emoji: "🚢",
    readTime: "7 min",
    authorName: "Seto Nakamura",
    content: `![Container ship at sea](https://images.unsplash.com/photo-1494412574643-ff11b0a5eb19?w=1200&h=600&fit=crop)

## Ocean Freight Transit Times: China → USA

Knowing accurate transit times is critical for inventory planning, especially for e-commerce sellers managing just-in-time stock.

## Direct Routes (No Transshipment)

| Origin Port | Destination Port | Transit Time | Carriers |
|-------------|-----------------|--------------|----------|
| Shenzhen (Yantian) | Los Angeles | 14-18 days | COSCO, Evergreen, ONE |
| Shenzhen (Yantian) | Long Beach | 14-18 days | Maersk, MSC, CMA CGM |
| Shenzhen (Shekou) | Seattle | 12-16 days | COSCO, Yang Ming |
| Shanghai | Los Angeles | 15-20 days | All major carriers |
| Shanghai | New York (via Panama) | 28-35 days | MSC, Hapag-Lloyd |
| Ningbo | Los Angeles | 14-19 days | COSCO, Evergreen |
| Ningbo | Savannah | 25-32 days | ZIM, ONE |
| Xiamen | Los Angeles | 15-20 days | EMC, COSCO |
| Qingdao | Seattle | 13-17 days | COSCO, HMM |
| Guangzhou (Nansha) | Long Beach | 16-21 days | CMA CGM, MSC |

## Routes with Transshipment

Some routes require a stop (usually in Busan, Korea or Kaohsiung, Taiwan):

| Route | Via | Total Transit |
|-------|-----|--------------|
| Shenzhen → Houston | Busan | 28-35 days |
| Shanghai → Miami | Kingston | 30-38 days |
| Ningbo → New York | Busan + Panama | 32-40 days |
| Xiamen → Charleston | Kaohsiung | 27-34 days |

> ⚠️ WARNING: Transshipment adds 5-10 days and increases risk of delays. Always prefer direct routes when available.

## Seasonal Variations

### Peak Season (Aug–Oct)
- Transit times increase by 2-5 days
- Port congestion at LA/Long Beach common
- Book 4-6 weeks in advance

### Chinese New Year (Jan–Feb)
- Factories close 2-4 weeks
- Post-CNY surge causes 1-2 week delays
- Ship before Dec 15 to avoid delays

### Off-Peak (Mar–Jun)
- Best transit times and rates
- More carrier options available
- Easier to get container space

## What Affects Transit Time

1. **Port congestion** — LA/LB historically have 1-3 day delays
2. **Weather** — Typhoon season (Jul-Nov) can add 2-4 days
3. **Carrier schedule reliability** — Currently ~65% on-time (Sea-Intelligence 2026)
4. **Customs holds** — Random inspections add 3-7 days

## Door-to-Door Total Time

Port-to-port is just part of the equation. Here's the full timeline:

| Phase | Duration |
|-------|----------|
| Factory → China port | 1-3 days |
| Port processing (China) | 1-2 days |
| Ocean transit | 12-35 days |
| US port processing | 2-5 days |
| Customs clearance | 1-3 days (no exam) |
| Drayage to warehouse | 1-3 days |
| **Total door-to-door** | **18-51 days** |

## Track Your Shipments

Use our [Vessel Tracker](/tools/vessel-tracker) to monitor your cargo in real-time, or our [Shipment Tracker](/tools/shipping-tracker) for end-to-end visibility.

---

*Need reliable shipping with tracked transit times? [Get a free quote](/quote) with guaranteed departure dates.*`,
  },
  {
    slug: "product-quality-inspection-checklist-china",
    title: "Product Quality Inspection Checklist: Before Shipping from China",
    excerpt: "The complete pre-shipment QC inspection checklist used by professional importers. Covers AQL sampling, defect classification, and documentation.",
    category: "Quality Control",
    emoji: "✅",
    readTime: "9 min",
    authorName: "Amy Lin",
    content: `![Quality inspection in factory](https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop)

## Why Pre-Shipment Inspection is Non-Negotiable

A single quality issue can cost you thousands in returns, negative reviews, and lost customers. Pre-shipment inspection catches 95% of defects before they leave China.

## The 5 Types of Inspections

### 1. Pre-Production Inspection (PPI)
**When:** Before production starts
**Purpose:** Verify raw materials, components, and production plan
**Cost:** $200-350

### 2. During Production Inspection (DPI)
**When:** 20-30% of production complete
**Purpose:** Catch issues early before full run
**Cost:** $250-400

### 3. Pre-Shipment Inspection (PSI)
**When:** 100% of production complete, 80%+ packed
**Purpose:** Final quality check before shipping
**Cost:** $250-400

### 4. Container Loading Supervision (CLS)
**When:** During container loading
**Purpose:** Verify correct quantities and packaging
**Cost:** $200-350

### 5. Piece-by-Piece Inspection
**When:** For high-value or precision products
**Purpose:** 100% inspection of every unit
**Cost:** $8-15 per man-hour

## AQL Sampling Standards

Most importers use the AQL (Acceptable Quality Level) system:

| Defect Type | AQL Level | Meaning |
|-------------|-----------|---------|
| Critical (safety hazard) | 0 | Zero tolerance |
| Major (function affected) | 2.5 | Accept ~2.5% defect rate |
| Minor (cosmetic only) | 4.0 | Accept ~4% defect rate |

### Sample Size by Order Quantity

| Order Qty | Sample Size | Accept/Reject (AQL 2.5) |
|-----------|-------------|-------------------------|
| 2-8 | All | 0/1 |
| 9-15 | All | 0/1 |
| 16-25 | All | 0/1 |
| 26-50 | 8 | 0/1 |
| 51-90 | 13 | 1/2 |
| 91-150 | 20 | 1/2 |
| 151-280 | 32 | 2/3 |
| 281-500 | 50 | 3/4 |
| 501-1200 | 80 | 5/6 |
| 1201-3200 | 125 | 7/8 |

## Your Inspection Checklist

### Packaging & Labeling
- [ ] Correct carton dimensions and weight
- [ ] Inner packaging protects product adequately
- [ ] Labels match approved artwork (no typos)
- [ ] Barcodes scan correctly
- [ ] Country of origin marked ("Made in China")
- [ ] FBA labels applied correctly (if Amazon)

### Product Appearance
- [ ] Color matches approved sample/Pantone
- [ ] No scratches, dents, or marks
- [ ] Surface finish consistent
- [ ] Logo/branding placement correct
- [ ] No loose threads or excess material

### Function & Performance
- [ ] Product works as specified
- [ ] Moving parts operate smoothly
- [ ] Electronics power on and function
- [ ] Measurements within tolerance (±2mm standard)
- [ ] Weight matches specification

### Safety & Compliance
- [ ] No sharp edges or pinch points
- [ ] Materials match safety certifications
- [ ] Required certifications included (FCC, UL, CE)
- [ ] Warning labels present where required
- [ ] Drop test passed (carton drop from 76cm)

### Documentation
- [ ] Commercial invoice matches PO
- [ ] Packing list accurate (quantity, weight, dimensions)
- [ ] Bill of Lading details correct
- [ ] Certificates of conformity provided
- [ ] Inspection report signed by QC

> 🎯 ACTION STEP: Download this checklist and share it with your supplier BEFORE production starts. Setting expectations upfront prevents 90% of quality issues.

## Cost of Not Inspecting

| Scenario | Cost |
|----------|------|
| QC inspection | $300 |
| Defective shipment returns | $3,000-15,000 |
| Amazon negative reviews | $5,000+ in lost sales |
| Product recall | $10,000-100,000+ |

---

*Our team coordinates quality inspections across all major manufacturing regions. [Contact us](/contact) for inspection services included with your shipment.*`,
  },
  {
    slug: "hs-code-classification-guide-importing",
    title: "HS Code Classification Guide for Importing from China (2026)",
    excerpt: "How to find the correct HS code for your products, avoid costly misclassification penalties, and minimize duty rates legally.",
    category: "Customs",
    emoji: "📋",
    readTime: "8 min",
    authorName: "Rachel Morales",
    content: `![Customs classification documents](https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop)

## What is an HS Code?

The Harmonized System (HS) code is a standardized numerical method for classifying traded products. Every product imported into the US needs the correct HS code — getting it wrong can mean overpaying duties or facing penalties.

## HS Code Structure

A full US tariff number has 10 digits:

\`\`\`
9401.61.40.11
│    │   │   └─ US statistical suffix (2 digits)
│    │   └───── US subheading (2 digits)
│    └───────── HS subheading (2 digits)
└────────────── HS chapter + heading (4 digits)
\`\`\`

- **Chapters 1-97** cover all products
- First 6 digits are internationally standardized
- Last 4 digits are US-specific

## Common HS Codes for China Imports

| Product Category | HS Code Range | Typical Duty Rate |
|-----------------|---------------|-------------------|
| Furniture (wooden) | 9403.60 | 0% |
| Furniture (metal) | 9403.20 | 0% |
| LED lighting | 9405.42 | 3.9% |
| Kitchen utensils (steel) | 7323.93 | 5.3% |
| Textiles/clothing | 6101-6117 | 10-32% |
| Electronics/PCBs | 8534.00 | 0% |
| Plastic containers | 3924.10 | 3.4% |
| Ceramic tableware | 6912.00 | 6% |
| Toys | 9503.00 | 0% |
| Auto parts | 8708 | 2.5% |
| Backpacks/bags | 4202.92 | 17.6% |
| Shoes (rubber sole) | 6402 | 20% |

## How to Find Your HS Code

### Method 1: USITC Search
Search at [hts.usitc.gov](https://hts.usitc.gov/) — the official US Harmonized Tariff Schedule.

### Method 2: Cross-Reference from Alibaba
Your Chinese supplier often provides an HS code on the commercial invoice. Verify it against the US schedule — Chinese HS codes and US codes share the first 6 digits.

### Method 3: Customs Ruling
For ambiguous products, request a binding ruling from CBP (US Customs and Border Protection). It's free and takes 30-60 days.

### Method 4: Use Our Duty Calculator
Get an instant estimate with our [Duty Calculator Tool](/tools/duty-calculator).

## Classification Tips

### Rule of Essential Character
If a product has multiple materials, classify by the material that gives it its "essential character."

**Example:** A wooden desk with metal legs → Classified as wooden furniture (9403.60) because the wood provides the essential character.

### Rule of Specificity
More specific descriptions take priority over general ones.

**Example:** A stainless steel water bottle → 7323.93 (stainless steel kitchen articles) rather than 7326 (other articles of iron/steel).

## Common Mistakes

1. **Using the Chinese HS code directly** — The first 6 digits match, but the US has different last 4 digits
2. **Classifying by use instead of material** — HS codes classify products by what they ARE, not what they're FOR
3. **Not accounting for Section 301 tariffs** — Additional 7.5-25% on many Chinese goods
4. **Misclassifying to avoid duties** — CBP audits are increasing; penalties are 2x the unpaid duty

> ⚠️ WARNING: Intentional misclassification is fraud. Penalties range from 20% of the goods value to criminal prosecution.

## Section 301 Tariffs (Still Active in 2026)

Many Chinese products face additional tariffs under Section 301:
- **List 1 (25%):** Industrial machinery, aerospace
- **List 2 (25%):** Plastics, chemicals, electronics
- **List 3 (25%):** Furniture, auto parts, lighting
- **List 4A (7.5%):** Consumer electronics, clothing, shoes

Check if your HS code is affected at [ustr.gov/301](https://ustr.gov/issue-areas/enforcement/section-301-investigations).

---

*Unsure about your HS code? [Ask our customs experts](/contact) — we classify 1,000+ products monthly and have a 99.8% accuracy rate.*`,
  },
  {
    slug: "lcl-vs-fcl-shipping-china-comparison",
    title: "LCL vs FCL Shipping from China: Which Saves You More Money?",
    excerpt: "Side-by-side comparison of LCL and FCL shipping methods with break-even analysis, pros/cons, and decision framework for importers.",
    category: "Shipping",
    emoji: "⚖️",
    readTime: "7 min",
    authorName: "Seth Parker",
    content: `![Shipping containers stacked](https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&h=600&fit=crop)

## LCL vs FCL: The #1 Decision for New Importers

Choosing between LCL (Less than Container Load) and FCL (Full Container Load) can save or waste thousands of dollars. Here's how to make the right call.

## What's the Difference?

**LCL (Less than Container Load):** Your goods share a container with other shippers' cargo. You pay per cubic meter (CBM).

**FCL (Full Container Load):** You rent an entire container. You pay a flat rate regardless of how full it is.

## Side-by-Side Comparison

| Factor | LCL | FCL |
|--------|-----|-----|
| Minimum shipment | 1 CBM | 15+ CBM (to be economical) |
| Pricing | $45-75/CBM | $1,800-4,500 per container |
| Transit time | +3-7 days (consolidation) | Direct, faster |
| Handling | More touches, higher damage risk | Sealed container, lower risk |
| Customs | May be examined with co-loaded cargo | Your cargo only |
| Flexibility | Ship any quantity | Need enough to fill container |

## Container Sizes

| Container | Internal Dimensions | CBM Capacity | Max Weight |
|-----------|-------------------|--------------|------------|
| 20GP | 5.9m × 2.35m × 2.39m | 33 CBM | 21,700 kg |
| 40GP | 12.0m × 2.35m × 2.39m | 67 CBM | 26,500 kg |
| 40HC | 12.0m × 2.35m × 2.69m | 76 CBM | 26,270 kg |

Use our [CBM Calculator](/tools/cbm-calculator) to calculate your cargo volume.

## The Break-Even Analysis

At what point is FCL cheaper than LCL?

### Scenario: Shenzhen → Los Angeles

| Your Volume | LCL Cost ($55/CBM) | 20GP FCL ($2,100) | Winner |
|-------------|--------------------|--------------------|--------|
| 5 CBM | $275 + $200 fees = **$475** | $2,100 | LCL |
| 10 CBM | $550 + $200 fees = **$750** | $2,100 | LCL |
| 15 CBM | $825 + $200 fees = **$1,025** | $2,100 | LCL |
| 25 CBM | $1,375 + $200 fees = **$1,575** | $2,100 | LCL |
| 30 CBM | $1,650 + $200 fees = **$1,850** | $2,100 | LCL |
| 33 CBM | $1,815 + $200 fees = **$2,015** | $2,100 | ~Equal |
| 35+ CBM | $2,125+ | $2,100 + $2,800 (40HC) | Depends |

> 💡 TIP: The LCL break-even point is approximately 85-90% of a 20GP container's capacity. Below that, LCL is almost always cheaper.

## When to Choose LCL

✅ Shipment under 15 CBM
✅ Testing a new product/supplier
✅ Seasonal or one-time orders
✅ Multiple small orders from different suppliers
✅ Cash flow constraints (lower upfront cost)

## When to Choose FCL

✅ Shipment over 15 CBM
✅ Regular, recurring shipments
✅ Fragile or high-value goods (less handling)
✅ Time-sensitive cargo (faster transit)
✅ Products that could be contaminated by co-loaded cargo (food, chemicals)

## Hidden Costs to Watch

### LCL Hidden Costs
- **CFS charges:** $100-200 (Container Freight Station handling)
- **Deconsolidation fee:** $50-100
- **Warehouse storage:** $5-15/CBM/day after free time

### FCL Hidden Costs
- **Demurrage:** $100-300/day if container sits at port too long
- **Chassis charges:** $30-50/day for the trailer
- **Container positioning:** $50-100 if container needs to be moved

## Our Recommendation

For most new importers, start with LCL for your first 3-5 shipments. Once you have consistent order volumes above 15 CBM/month, transition to FCL for cost savings and faster delivery.

---

*Not sure which option is right for you? [Get a comparison quote](/quote) — we'll calculate both LCL and FCL pricing for your specific route.*`,
  },
  {
    slug: "china-warehouse-consolidation-services",
    title: "China Warehouse Consolidation: Combine Suppliers into One Shipment",
    excerpt: "How warehouse consolidation in China can save 30-50% on shipping by combining multiple suppliers into a single container shipment.",
    category: "Logistics",
    emoji: "🏭",
    readTime: "6 min",
    authorName: "Amy Lin",
    content: `![Warehouse consolidation in China](https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&h=600&fit=crop)

## What is Warehouse Consolidation?

If you buy from multiple Chinese suppliers — which most importers do — consolidation lets you ship everything in one container instead of multiple expensive LCL shipments.

**How it works:**
1. Your suppliers ship to our warehouse in Shenzhen
2. We receive, inspect, and repackage goods
3. Everything ships together in one container
4. You save 30-50% vs. shipping separately

## Cost Savings Example

**Without consolidation** (3 separate LCL shipments):

| Supplier | Volume | LCL Rate | Cost |
|----------|--------|----------|------|
| Supplier A (Guangzhou) | 5 CBM | $55/CBM + $200 fees | $475 |
| Supplier B (Shenzhen) | 3 CBM | $55/CBM + $200 fees | $365 |
| Supplier C (Dongguan) | 4 CBM | $55/CBM + $200 fees | $420 |
| **Total** | **12 CBM** | | **$1,260** |

**With consolidation** (1 combined LCL shipment):

| Combined | Volume | LCL Rate | Cost |
|----------|--------|----------|------|
| All 3 suppliers | 12 CBM | $55/CBM + $200 fees | $860 |
| Domestic trucking to warehouse | — | — | $150 |
| **Total** | **12 CBM** | | **$1,010** |

**Savings: $250 (20%)** — and it gets even better with FCL volumes!

## Services Included

### Receiving & Inspection
- Verify quantities against your purchase orders
- Photo documentation of all goods received
- Report any visible damage or discrepancies

### Storage
- **Free storage:** First 14 days free
- **After 14 days:** $3/CBM/day
- Climate-controlled for sensitive products

### Value-Added Services
- Repackaging and relabeling
- Amazon FBA prep (FNSKU labels, poly bagging)
- Quality inspection (per the [QC checklist](/blog/product-quality-inspection-checklist-china))
- Custom kitting and bundling
- Photography for e-commerce listings

### Export Documentation
- Commercial invoice preparation
- Packing list consolidation
- Certificate of origin
- Fumigation certificate (for wood products)

## How We Handle It

Our Shenzhen warehouse processes 200+ consolidations monthly. Here's the timeline:

| Day | Activity |
|-----|----------|
| Day 1-7 | Suppliers deliver to warehouse |
| Day 8-9 | Inspection and QC check |
| Day 10 | Consolidation and container loading |
| Day 11 | Vessel departure |

> 📊 INSIGHT: Most consolidations complete in 10-14 days from first receipt to vessel departure.

## Best Practices

1. **Coordinate supplier timelines** — All goods should arrive within a 7-day window
2. **Require marking** — Each supplier marks cartons with your PO number
3. **Provide clear instructions** — Share packaging requirements in advance
4. **Plan around vessel schedules** — We'll advise on optimal timing

---

*Ready to consolidate? [Get a free consolidation quote](/quote) — we operate a 5,000 sqm warehouse in Shenzhen's Nanshan district.*`,
  },
  {
    slug: "negotiate-chinese-suppliers-email-templates",
    title: "How to Negotiate with Chinese Suppliers: Scripts & Email Templates",
    excerpt: "Proven negotiation scripts and email templates for getting better prices, payment terms, and MOQs from Chinese manufacturers.",
    category: "Sourcing",
    emoji: "🤝",
    readTime: "10 min",
    authorName: "Rachel Morales",
    content: `![Business negotiation](https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop)

## The Art of Negotiating with Chinese Suppliers

Negotiation in China is expected and respected. Suppliers build margin for negotiation — if you accept the first price, you're leaving money on the table.

## 5 Rules Before You Start

1. **Always get 3+ quotes** — Competition is your best leverage
2. **Never reveal your budget** — Let the supplier quote first
3. **Build relationships first** — Chinese business values guanxi (relationships)
4. **Be patient** — Rushing signals desperation
5. **Respect face** — Never embarrass a supplier publicly

## Email Template #1: Initial Inquiry

**Subject: Inquiry — [Product Name] — Volume Buyer**

> Dear [Supplier Name],
>
> I'm [Your Name] from [Company]. We're a [brief description, e.g., "growing e-commerce brand selling home goods in the US market"].
>
> We're looking for a reliable long-term supplier for:
> - **Product:** [Description]
> - **Specifications:** [Size, material, color]
> - **Initial order quantity:** [MOQ]
> - **Annual projected volume:** [Estimated yearly qty]
>
> Could you please provide:
> 1. FOB price for the initial quantity
> 2. Price tiers for larger quantities
> 3. MOQ requirements
> 4. Lead time for production
> 5. Sample availability and cost
>
> We've been importing from China for [X years] and have established logistics partnerships. We're looking for a supplier who can grow with us.
>
> Best regards,
> [Your Name]

> 💡 TIP: Mentioning projected annual volume signals you're a serious buyer and unlocks better pricing.

## Email Template #2: Price Negotiation

**Subject: RE: Quote — Price Discussion**

> Dear [Supplier Name],
>
> Thank you for your quotation of $[X] per unit.
>
> We appreciate the quality of your products, however, we've received competitive quotes from other manufacturers in the $[Y] range for similar specifications.
>
> We'd prefer to work with your company due to [specific compliment — "your experience," "your factory setup," "your certifications"]. Is there flexibility on pricing if we:
>
> 1. Increase our order quantity to [higher number]?
> 2. Commit to [quarterly/annual] orders?
> 3. Adjust packaging specifications?
>
> Our target price is $[target] per unit. Can we find a middle ground?
>
> Best regards,
> [Your Name]

## Email Template #3: Payment Terms Negotiation

**Subject: RE: Order Confirmation — Payment Terms**

> Dear [Supplier Name],
>
> We're ready to proceed with the order. Regarding payment terms:
>
> For our first order, we understand 30/70 (30% deposit, 70% before shipment) is standard. However, as we plan to place regular orders, could we discuss:
>
> - **After 3rd order:** 30/70 with 70% payable 15 days after B/L date
> - **After 6th order:** 20/80 with 80% payable 30 days after B/L date
>
> This gives you deposit security while helping our cash flow. We can also provide our business references.
>
> How does this sound?
>
> Best regards,
> [Your Name]

## Email Template #4: MOQ Negotiation

> Dear [Supplier Name],
>
> Your MOQ of [X] units is higher than we can commit to for a first order. We want to test market response before scaling.
>
> Would you consider:
> - A trial order of [lower number] at a slightly higher per-unit price?
> - Or [lower number] with a commitment to reorder within 60 days if testing goes well?
>
> We understand this impacts your production efficiency. We're willing to pay a 5-10% premium for the reduced quantity.
>
> Best regards,
> [Your Name]

## Negotiation Leverage Points

| Leverage | Why It Works |
|----------|-------------|
| Multiple quotes | Shows you have options |
| Larger volume commitment | Secures better per-unit pricing |
| Off-season ordering | Factories need work Dec-Feb, May-Jun |
| Payment in RMB | Saves supplier 2-3% FX fees |
| Long-term partnership | Chinese suppliers value loyalty |
| Social proof | Mention existing US market presence |

## Common Mistakes

- **Negotiating too aggressively** — If the price is too low, quality will suffer
- **Focusing only on price** — Payment terms, lead time, and MOQ matter too
- **Not having a BATNA** — Always have your Best Alternative ready
- **Ignoring cultural norms** — Build rapport before diving into price talk

---

*Need help negotiating with suppliers? Our [sourcing team](/contact) speaks Mandarin and has 10+ years of supplier relationships.*`,
  },
  {
    slug: "import-electronics-from-shenzhen-guide",
    title: "Importing Electronics from Shenzhen: The Complete 2026 Guide",
    excerpt: "Shenzhen is the world's electronics capital. Learn how to source, certify, and ship consumer electronics from Shenzhen to the US.",
    category: "Sourcing",
    emoji: "📱",
    readTime: "9 min",
    authorName: "Seto Nakamura",
    content: `![Shenzhen electronics market](https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=600&fit=crop)

## Why Shenzhen for Electronics?

Shenzhen produces 90% of the world's consumer electronics. The city has:
- **30,000+** electronics manufacturers
- **Complete supply chain** — components to finished goods in one city
- **Huaqiangbei** — the world's largest electronics market
- **Fast prototyping** — 3-7 day turnaround for samples

## What You Can Source

### Consumer Electronics
- Bluetooth speakers, headphones, earbuds
- Phone accessories (cases, chargers, cables)
- Smart home devices (cameras, sensors, switches)
- Wearables (smart watches, fitness trackers)
- LED lighting and displays

### Components
- PCBs and PCBAs
- Li-ion batteries and power supplies
- Connectors, sensors, microcontrollers
- Display panels (LCD, OLED)
- Enclosures and housings

## Compliance Requirements

### FCC Certification (Mandatory)
All electronic devices sold in the US must comply with FCC regulations.

| Category | Requirement | Cost | Timeline |
|----------|-------------|------|----------|
| Unintentional radiator | FCC Part 15B | $2,000-5,000 | 2-4 weeks |
| Intentional radiator (WiFi, BT) | FCC Part 15C | $5,000-15,000 | 4-8 weeks |
| External power supply | DOE efficiency | $1,000-3,000 | 2-3 weeks |

### UL Certification (Recommended)
Not legally required but:
- Amazon requires it for many categories
- Retailers (Walmart, Target) require it
- Protects against liability claims

| Product Type | UL Standard | Cost |
|-------------|-------------|------|
| Chargers/adapters | UL 62368-1 | $5,000-10,000 |
| Batteries | UL 2054 | $3,000-8,000 |
| LED lighting | UL 8750 | $4,000-9,000 |

### California Prop 65
Required for products sold in California. Need testing for lead, cadmium, phthalates, and other substances.

## Sourcing Process

### Step 1: Find Manufacturers
- **Alibaba Gold Suppliers** — filter for Shenzhen, verified, 3+ years
- **1688.com** — Chinese domestic marketplace (better prices, needs translator)
- **Trade shows** — Canton Fair (April, October), Hong Kong Electronics Fair
- **Huaqiangbei markets** — In-person sourcing (we can arrange factory visits)

### Step 2: Sample & Test
- Order 5-10 samples from 3 suppliers
- Test functionality, durability, and build quality
- Send to a US testing lab for preliminary compliance check
- Budget $500-2,000 for this phase

### Step 3: Certify
- Choose a NVLAP-accredited testing lab
- Popular labs: TÜV, Intertek, SGS, Bureau Veritas
- Many Shenzhen labs offer competitive rates ($50-70% of US lab costs)

### Step 4: Production & QC
- Set clear specifications with dimensional drawings
- Require golden sample approval before mass production
- Schedule mid-production and pre-shipment inspections
- See our [QC inspection checklist](/blog/product-quality-inspection-checklist-china)

### Step 5: Ship
- Electronics are best shipped by ocean (not air — lithium battery restrictions)
- Standard lead time: 14-18 days Shenzhen → Los Angeles
- See our [transit time guide](/blog/china-usa-ocean-freight-transit-times-2026)

## Customs Duties for Electronics

| Product | HS Code | Duty Rate | Sec. 301 |
|---------|---------|-----------|----------|
| Bluetooth speakers | 8518.22 | 0% | 7.5% |
| Phone cases (plastic) | 3926.90 | 5.3% | 25% |
| USB cables | 8544.42 | 0% | 25% |
| Cameras | 8525.81 | 0% | 0% |
| Smart watches | 9102.12 | 6.4% | 7.5% |
| LED bulbs | 8539.50 | 2.6% | 25% |

> 💰 PRO TIP: Many electronics qualify for 0% base duty. The main cost is Section 301 tariffs — check if your specific HS code is listed.

## Common Pitfalls

1. **Skipping FCC certification** — Amazon will remove your listing and CBP can seize shipments
2. **Lithium battery shipping** — Requires UN38.3 testing and proper DG documentation
3. **IP infringement** — Never source products that copy patented designs
4. **Counterfeit components** — Always verify chip markings and request component certificates

---

*Importing electronics from Shenzhen? [Get a specialized electronics shipping quote](/quote) — we handle FCC-compliant packaging and lithium battery documentation.*`,
  },
  {
    slug: "china-shipping-insurance-guide",
    title: "Shipping Insurance for China Imports: What Coverage Do You Need?",
    excerpt: "Marine cargo insurance explained — types of coverage, claim process, and when you absolutely need insurance for your China shipments.",
    category: "Shipping",
    emoji: "🛡️",
    readTime: "7 min",
    authorName: "Seth Parker",
    content: `![Container ship ocean voyage](https://images.unsplash.com/photo-1524522173746-f628baad3644?w=1200&h=600&fit=crop)

## Why Most Importers Are Underinsured

Here's a fact that surprises most new importers: **the shipping carrier's liability is capped at $500 per container** under standard terms. If your container of $50,000 worth of goods falls overboard, you get $500.

## Types of Marine Cargo Insurance

### 1. All-Risk Coverage (Institute Cargo Clauses A)
**Covers:** All risks of physical loss or damage from any external cause.

This is the gold standard. Covers:
- Vessel sinking, collision, grounding
- Fire, explosion, lightning
- Theft and pilferage
- Water damage and moisture
- Rough handling and dropping
- Container falling during loading

**Does NOT cover:**
- Inherent vice (product defects)
- Intentional damage by the shipper
- War, nuclear events
- Delay (unless specifically added)

### 2. Named Perils (Institute Cargo Clauses B)
**Covers:** Only specifically listed perils (fire, collision, jettison, etc.)

Cheaper but leaves gaps. **Not recommended** for most importers.

### 3. Free of Particular Average (Institute Cargo Clauses C)
**Covers:** Total loss only — not partial damage.

The cheapest option. Only makes sense for very low-value, durable goods.

## What It Costs

Marine cargo insurance is surprisingly affordable:

| Coverage | Rate | Example ($20,000 shipment) |
|----------|------|---------------------------|
| All-Risk (Clause A) | 0.3-0.5% of CIF value | $60-100 |
| Named Perils (Clause B) | 0.15-0.3% | $30-60 |
| Total Loss Only (Clause C) | 0.1-0.2% | $20-40 |

> 💡 TIP: Insurance is calculated on CIF value + 10% (to cover incidental costs). So a $20,000 CIF shipment is insured for $22,000.

## When You Need Insurance

### Always Insure:
- ✅ Shipments over $5,000
- ✅ Fragile or water-sensitive products
- ✅ Electronics and high-value goods
- ✅ First shipments from new suppliers
- ✅ Peak season shipments (higher congestion risk)

### Consider Self-Insuring:
- Low-value, durable goods (under $2,000)
- Repeat shipments with proven track record
- When you can absorb the loss without business impact

## How to File a Claim

### Step 1: Document Immediately
When you receive damaged goods:
- **Photograph everything** before unpacking further
- **Note damage on the delivery receipt** (do NOT sign "received in good condition")
- **Keep all packaging** — the insurer may want to inspect it

### Step 2: Notify Within 3 Days
Contact your insurance provider within 72 hours. Late notification can void your claim.

### Step 3: Gather Documentation
- Bill of Lading
- Commercial Invoice
- Packing List
- Insurance Certificate
- Damage survey report (arrange with insurer)
- Repair quotes or replacement costs

### Step 4: Settlement
Most claims settle in 30-60 days. All-Risk claims have the highest approval rate (85%+).

## Common Exclusions to Know

| Exclusion | What It Means |
|-----------|---------------|
| Insufficient packaging | If your supplier packed poorly |
| Inherent vice | Product deterioration (food spoilage) |
| Electrical/mechanical derangement | Internal failures |
| War/strikes | Need separate war risk coverage |

## Our Insurance Service

We include basic All-Risk coverage with every shipment over $10,000. For additional coverage or special cargo, our team can arrange:
- Extended coverage for high-value goods
- War risk riders
- Exhibition and trade show coverage
- Inland transit coverage

---

*All our shipping quotes include insurance options. [Get a quote](/quote) with full coverage details.*`,
  },
  {
    slug: "how-to-read-bill-of-lading",
    title: "How to Read a Bill of Lading: Step-by-Step Guide for Importers",
    excerpt: "The Bill of Lading is the most important shipping document. Learn what every field means and how to spot errors before they cause delays.",
    category: "Customs",
    emoji: "📄",
    readTime: "8 min",
    authorName: "Amy Lin",
    content: `![Shipping documents on desk](https://images.unsplash.com/photo-1568234928966-359c35dd8327?w=1200&h=600&fit=crop)

## What is a Bill of Lading?

The Bill of Lading (B/L) is the single most important document in international shipping. It serves three critical functions:

1. **Receipt of goods** — Proves the carrier received your cargo
2. **Contract of carriage** — Terms of the shipping agreement
3. **Document of title** — Whoever holds the B/L owns the goods

## Types of Bills of Lading

| Type | Description | When Used |
|------|-------------|-----------|
| **Original B/L** | Physical document, 3 originals issued | L/C payments, high-value cargo |
| **Telex Release** | Electronic release, no physical document | T/T payments, trusted parties |
| **Sea Waybill** | Non-negotiable, named consignee only | Same company shipper/consignee |
| **Express B/L** | Quick release, no originals needed | Regular shipments, trusted |

> 💡 TIP: For most China imports, a **Telex Release** is the fastest and most common option. It eliminates the need to courier physical documents.

## Reading the B/L: Field by Field

### 1. Shipper (Exporter)
Your Chinese supplier's company name and address. Must match the commercial invoice exactly.

### 2. Consignee (Importer)
Your company name and address. For L/C shipments, this may say "To Order" (negotiable).

### 3. Notify Party
Who the shipping line should notify upon arrival. Usually your customs broker or freight forwarder.

### 4. Vessel Name & Voyage Number
The specific ship carrying your cargo. Use this to track your shipment with our [Vessel Tracker](/tools/vessel-tracker).

### 5. Port of Loading (POL)
Where the container was loaded onto the vessel. Common: Yantian, Shekou, Shanghai, Ningbo.

### 6. Port of Discharge (POD)
Where the vessel will unload. Common: Los Angeles, Long Beach, Seattle, New York.

### 7. Container Number
Format: 4 letters + 7 digits (e.g., CSLU6543210). Used to track your specific container.

### 8. Seal Number
The security seal number on your container. This should match throughout the journey.

### 9. Description of Goods
General description — does NOT need to be detailed product info.

### 10. Number of Packages
Total cartons/pallets. Must match your packing list.

### 11. Gross Weight & Volume
Total weight (kg) and volume (CBM). Must match customs declaration.

### 12. Freight Terms
- **Freight Prepaid** — Seller pays ocean freight (CIF/CFR terms)
- **Freight Collect** — Buyer pays at destination (FOB terms)

### 13. B/L Number
Unique identifier. Use this for all correspondence with the carrier and customs.

### 14. Date of Issue
When the B/L was issued. This is the official "shipped on board" date.

## Common B/L Errors (And How They Cause Problems)

| Error | Consequence | Fix |
|-------|-------------|-----|
| Misspelled consignee name | Customs hold, can't release cargo | Request B/L amendment ($50-150) |
| Wrong HS code | Duty miscalculation | Amend before customs filing |
| Weight discrepancy >5% | Customs examination | Verify with supplier pre-shipment |
| Late B/L date | L/C discrepancy, bank rejection | Ensure B/L issued before L/C expiry |
| Wrong container number | Can't track or locate cargo | Verify against booking confirmation |

> ⚠️ WARNING: Always review your draft B/L before the carrier issues the final version. Amendments after issuance cost $50-150 and delay shipment.

## B/L Review Checklist

Before approving the draft B/L, verify:
- [ ] Shipper name and address correct
- [ ] Consignee name and address correct
- [ ] Notify party details correct
- [ ] Port of loading and discharge correct
- [ ] Cargo description matches invoice
- [ ] Number of packages matches packing list
- [ ] Weight matches commercial invoice
- [ ] Container and seal numbers correct
- [ ] Freight terms correct (prepaid vs collect)
- [ ] No spelling errors anywhere

## Digital Bills of Lading

In 2026, electronic B/Ls (eBL) are gaining adoption:
- **Platforms:** Bolero, essDOCS, TradeLens, WAVE BL
- **Benefits:** Instant transfer, no courier delays, lower fraud risk
- **Adoption:** ~15% of global trade (growing fast)

---

*Need help understanding your shipping documents? Our team reviews every B/L before shipment and catches errors before they become problems. [Get a quote](/quote) with full documentation support.*`,
  },
  {
    slug: "chinese-new-year-shipping-delays-planning-guide",
    title: "Chinese New Year Shipping Delays: 2027 Planning Guide for Importers",
    excerpt: "Plan around China's biggest holiday shutdown. Key dates, order deadlines, and strategies to keep your inventory stocked through CNY 2027.",
    category: "Planning",
    emoji: "🧧",
    readTime: "7 min",
    authorName: "Amy Lin",
    content: `![Chinese New Year celebration](https://images.unsplash.com/photo-1548707309-dcebeab426c7?w=1200&h=600&fit=crop)

## Chinese New Year 2027: Key Dates

**CNY 2027: February 6, 2027** (Year of the Goat/Sheep)

The effective shutdown period is much longer than the official holiday:

| Phase | Dates | Impact |
|-------|-------|--------|
| Pre-CNY slowdown | Jan 20 - Feb 5 | Workers leave early, production slows |
| Official holiday | Feb 6 - Feb 12 | Factories completely closed |
| Post-CNY ramp-up | Feb 13 - Mar 1 | 50-70% workforce, slow production |
| Full recovery | Mar 1+ | Normal operations resume |

**Total disruption: ~6 weeks** (late January through early March)

## The Timeline You Need

### October 2026: Plan
- Forecast Q1 2027 inventory needs
- Identify which products need pre-CNY orders
- Calculate safety stock levels

### November 2026: Order
- **Place all orders by November 15** for guaranteed pre-CNY shipment
- Confirm production schedules with suppliers
- Pay deposits to lock in production slots

### December 2026: Produce & Ship
- Production should complete by December 20
- **Last safe shipping date: December 25** for ocean freight
- Air freight cutoff: January 15 (for urgent items)

### January 2027: Final Window
- **January 1-10:** Last LCL consolidation window
- **January 10-20:** Only express/air freight possible
- **January 20+:** Accept that it's too late

> 🎯 ACTION STEP: Set a calendar reminder for October 1, 2026 to start your CNY planning. The importers who plan earliest get the best pricing and priority production slots.

## How CNY Affects Each Part of the Supply Chain

### Factories
- Workers travel to hometowns 1-2 weeks before CNY
- **15-20% of workers don't return** after CNY (find new jobs closer to home)
- New workers need 2-4 weeks of training
- Quality often dips in the first 2 weeks after CNY

### Shipping Lines
- Before CNY: Premium surcharges ($200-500/container)
- After CNY: Equipment shortages (empty containers stuck inland)
- Post-CNY surge: 2-3 week booking delays

### Ports
- Congestion builds from January 15 as everyone rushes to ship
- Post-CNY: Backlogs clear by mid-March

### Customs (China Side)
- Staff reduced during holiday period
- Slower documentation processing Jan 20 - Feb 15

## Strategies to Manage CNY

### Strategy 1: Stock Up (Best for Most Importers)
Order 8-10 weeks of extra inventory to cover the shutdown period.

**Extra inventory cost:** $X (holding cost)
**Cost of stockout:** Lost sales, lost Amazon ranking, lost customers

### Strategy 2: Diversify Suppliers
Have backup suppliers in countries not affected by CNY:
- Vietnam, India, Thailand (smaller shutdowns)
- Different regions within China (some areas have shorter shutdowns)

### Strategy 3: Stagger Orders
Split your Q1 order into two batches:
- Batch 1: Ship by December 20 (arrives before CNY)
- Batch 2: Place order January 15 for March production

### Strategy 4: Air Freight for Critical Items
For small, high-value products, air freight can bridge the gap:
- Transit time: 3-5 days vs. 14-25 days ocean
- Cost: $5-8/kg vs. $0.20-0.40/kg ocean
- Only economical for lightweight, high-margin products

## Post-CNY Quality Tips

With worker turnover and new staff, quality risks increase:
- **Schedule a QC inspection** for the first post-CNY production run
- **Keep your golden sample** updated — new workers need references
- **Be patient** — Don't pressure for speed in the first 2 weeks back

## Checklist: CNY Readiness

- [ ] Q1 inventory forecasted
- [ ] Orders placed by November 15
- [ ] Deposits paid by November 30
- [ ] Production confirmed complete by December 20
- [ ] Shipments booked by December 10
- [ ] Post-CNY orders planned for March delivery
- [ ] QC inspection scheduled for first post-CNY run
- [ ] Communication plan with suppliers (WeChat stays active during CNY)

---

*Need help planning around Chinese New Year? [Contact us](/contact) by October for CNY 2027 planning assistance. We'll help you forecast, order, and ship on the optimal timeline.*`,
  },
  {
    slug: "freight-forwarder-vs-customs-broker-difference",
    title: "Freight Forwarder vs Customs Broker: What's the Difference?",
    excerpt: "Many importers confuse these two roles. Learn what each does, when you need both, and how to choose the right partners for your supply chain.",
    category: "Logistics",
    emoji: "🔄",
    readTime: "6 min",
    authorName: "Rachel Morales",
    content: `![Logistics professionals working](https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop)

## Two Essential Partners, Different Roles

Both freight forwarders and customs brokers are essential for importing from China, but they handle very different parts of the process.

## Freight Forwarder

**What they do:** Arrange the physical transportation of your goods from origin to destination.

### Responsibilities:
- Book cargo space on vessels or airlines
- Coordinate pickup from supplier's factory
- Manage warehouse consolidation
- Handle documentation (B/L, packing list)
- Track shipments in transit
- Arrange last-mile delivery to your warehouse

### Think of them as: Your shipping travel agent — they plan the entire journey.

## Customs Broker

**What they do:** Handle all government compliance for importing goods into the United States.

### Responsibilities:
- Classify products with correct HS codes
- File ISF (Importer Security Filing) — required 24hrs before vessel departure
- Prepare and submit customs entry
- Calculate and pay import duties on your behalf
- Handle FDA, CPSC, or other agency requirements
- Resolve customs holds and examinations

### Think of them as: Your import lawyer — they handle all the government paperwork.

## Side-by-Side Comparison

| Aspect | Freight Forwarder | Customs Broker |
|--------|-------------------|----------------|
| **Focus** | Physical logistics | Government compliance |
| **License** | FMC (Federal Maritime Commission) | CBP (Customs & Border Protection) |
| **When involved** | Origin → Destination | At US port of entry |
| **Needed for** | Every shipment | Every customs entry |
| **Cost** | Included in freight rate | $150-300 per entry |
| **Skills** | Logistics, routing, rates | Tariff classification, regulations |
| **Liability** | Cargo in transit | Customs compliance |

## Do You Need Both?

**Yes, usually.** But there are options:

### Option 1: Separate Companies
Hire a freight forwarder AND a separate customs broker.
- **Pro:** Specialized expertise from each
- **Con:** More coordination needed

### Option 2: One-Stop Provider (Like Us!)
Many freight forwarders also offer customs brokerage.
- **Pro:** Single point of contact, seamless handoff
- **Con:** May not have deepest customs expertise for complex products

### Option 3: Only a Customs Broker
If your supplier arranges shipping (CIF terms), you only need a customs broker.
- **Pro:** Simpler supplier relationship
- **Con:** Less control over shipping costs and timing

## How to Choose a Freight Forwarder

| Criteria | What to Look For |
|----------|-----------------|
| **Specialization** | Experience with your origin/destination route |
| **Volume** | Handles enough volume for competitive rates |
| **Network** | Own agents or trusted partners in China |
| **Technology** | Online tracking, digital documentation |
| **Communication** | Responsive, proactive updates |
| **References** | Can provide client references |

### Red Flags:
- No FMC license or bond
- Only quotes the cheapest rate (no discussion of service)
- Can't explain Incoterms clearly
- No tracking visibility

## How to Choose a Customs Broker

| Criteria | What to Look For |
|----------|-----------------|
| **CBP license** | Must be licensed by US Customs |
| **Product experience** | Familiar with your product category |
| **Agency knowledge** | Understands FDA, CPSC, EPA, FCC requirements |
| **Response time** | Handles holds/exams within 24 hours |
| **Technology** | ACE portal access, electronic filing |
| **Error rate** | Should be below 1% on classifications |

## Our Approach

At Doge Consulting, we handle both roles — freight forwarding and customs brokerage — under one roof. This means:

- **One point of contact** from factory to your door
- **Zero handoff delays** between shipping and customs
- **Unified documentation** — no conflicting paperwork
- **Better control** over total cost and timeline

---

*Need a freight forwarder, customs broker, or both? [Get a quote](/quote) for our all-in-one door-to-door service.*`,
  },
  {
    slug: "incoterms-2020-guide-china-imports",
    title: "Incoterms 2020 Explained: Which Terms to Use When Importing from China",
    excerpt: "FOB, CIF, EXW, DDP — what do they mean and which Incoterm should you choose? A practical guide for China-to-USA importers.",
    category: "Customs",
    emoji: "📑",
    readTime: "8 min",
    authorName: "Seto Nakamura",
    content: `![International trade agreement](https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop)

## What are Incoterms?

Incoterms (International Commercial Terms) are standardized trade terms published by the International Chamber of Commerce. They define:

- **Who pays** for each part of the shipment
- **Who bears the risk** at each stage
- **Who arranges** insurance and documentation

The current version is **Incoterms 2020**, which will remain in use through at least 2030.

## The 4 Incoterms You'll Actually Use

While there are 11 Incoterms, 95% of China imports use one of these four:

### FOB (Free On Board) — Most Common ⭐

**Seller's responsibility:** Deliver goods loaded onto the vessel at the origin port.
**Buyer's responsibility:** Ocean freight, insurance, customs, and delivery from origin port.

| Cost Item | Who Pays |
|-----------|----------|
| Factory to port (China) | Seller |
| Export customs (China) | Seller |
| Loading onto vessel | Seller |
| Ocean freight | **Buyer** |
| Marine insurance | **Buyer** |
| US customs & duties | **Buyer** |
| Delivery to warehouse | **Buyer** |

**Best for:** Importers who want to control shipping costs and choose their own freight forwarder.

> 💡 TIP: FOB is our #1 recommendation. You control shipping costs, choose your carrier, and often save 15-25% vs. CIF pricing.

### CIF (Cost, Insurance & Freight)

**Seller's responsibility:** Deliver goods to the destination port, including freight and basic insurance.
**Buyer's responsibility:** Customs, duties, and delivery from destination port.

| Cost Item | Who Pays |
|-----------|----------|
| Factory to port (China) | Seller |
| Export customs (China) | Seller |
| Ocean freight | Seller |
| Marine insurance (basic) | Seller |
| US customs & duties | **Buyer** |
| Delivery to warehouse | **Buyer** |

**Best for:** First-time importers who want the supplier to handle shipping. But watch out — suppliers often mark up freight by 20-40%.

### EXW (Ex Works)

**Seller's responsibility:** Make goods available at their factory/warehouse.
**Buyer's responsibility:** Everything from the factory door onward.

**Best for:** Experienced importers who want maximum control. Requires a China-side logistics partner.

> ⚠️ WARNING: EXW makes you responsible for Chinese export customs, which requires a Chinese export license. Most foreign companies can't do this directly — you need a local agent.

### DDP (Delivered Duty Paid)

**Seller's responsibility:** Everything — delivery to the buyer's door in the US, duties paid.
**Buyer's responsibility:** Nothing until goods arrive at your door.

**Best for:** Small orders, samples, or when the supplier insists. Often the most expensive option because the seller adds significant margin on shipping and duties.

## Quick Decision Guide

| Situation | Recommended Incoterm |
|-----------|---------------------|
| Regular importer, own freight forwarder | **FOB** |
| First-time importer | **FOB** or **CIF** |
| Small sample order | **DDP** |
| Complex product, want maximum control | **EXW** |
| Large volume, own China operations | **EXW** |
| E-commerce dropshipping | **DDP** |

## Risk Transfer Points

Understanding when risk transfers from seller to buyer:

| Incoterm | Risk transfers at... |
|----------|---------------------|
| EXW | Seller's factory/warehouse |
| FOB | When goods cross ship's rail at origin port |
| CIF | When goods cross ship's rail at origin port* |
| DDP | Buyer's specified delivery location |

*With CIF, the seller pays for insurance but risk transfers at the origin port. If goods are damaged in transit, the buyer files the insurance claim.

## Common Mistakes

### 1. Using CIF and thinking you're covered
CIF only includes minimum insurance (Institute Cargo Clauses C — total loss only). For proper coverage, insure separately.

### 2. Using FOB but not getting the right FOB
Always specify the port: "FOB Shenzhen (Yantian)" is different from "FOB Shanghai" in price.

### 3. Confusing FOB with domestic FOB
In US domestic shipping, "FOB" means something different (the point where ownership transfers). International FOB specifically means "loaded on vessel."

### 4. Not negotiating the Incoterm
Many suppliers default to CIF because they earn margin on freight. Always try FOB first.

## Incoterms in Your Commercial Invoice

Your commercial invoice should clearly state:
- The Incoterm used
- The named place (port or address)
- The version year

**Example:** "FOB Yantian, Shenzhen (Incoterms 2020)"

---

*Need help choosing the right Incoterms for your shipment? [Ask our trade experts](/contact) — we'll advise based on your specific products and volumes.*`,
  },
];

const now = new Date().toISOString();

try {
  // Verify table exists before inserting
  const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='BlogPost'").get();
  if (!tableCheck) {
    console.log("[seed-blog-expansion] BlogPost table not found, skipping. Run Prisma migrations first.");
    db.close();
    process.exit(0);
  }

  const insert = db.prepare(`
  INSERT OR IGNORE INTO BlogPost (id, slug, language, title, excerpt, content, category, emoji, published, authorName, readTime, viewCount, createdAt, updatedAt)
  VALUES (?, ?, 'en', ?, ?, ?, ?, ?, 1, ?, ?, 0, ?, ?)
`);

const tx = db.transaction(() => {
  for (const post of posts) {
    insert.run(
      randomUUID(),
      post.slug,
      post.title,
      post.excerpt,
      post.content,
      post.category,
      post.emoji,
      post.authorName,
      post.readTime,
      now,
      now
    );
  }
});

tx();
console.log(`[seed-blog-expansion] Seeded ${posts.length} blog posts`);
} catch (e) {
  console.log(`[seed-blog-expansion] Warning: ${e.message} (non-fatal)`);
}
db.close();
