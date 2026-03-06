// Blog post seed data — run with: node prisma/seed-blog.mjs
// Requires DATABASE_URL to be set

import Database from "better-sqlite3";
import { randomBytes } from "crypto";

const DB_PATH = process.env.DATABASE_PATH || process.env.DATABASE_URL?.replace("file:", "") || "./data/production.db";
const db = new Database(DB_PATH);

const cuid = () => {
  const t = Date.now().toString(36);
  const r = randomBytes(8).toString("hex");
  return `c${t}${r}`.slice(0, 25);
};

const posts = [
  {
    slug: "how-to-make-money-importing-from-china",
    title: "How to Make Money Importing from China: The Complete 2026 Guide",
    excerpt: "Learn how everyday entrepreneurs are building profitable import businesses with 3-6x markups on Chinese goods. Startup costs, product selection, and step-by-step playbook.",
    category: "Business",
    emoji: "💰",
    readTime: "15 min",
    content: `## Why Importing from China Is One of the Best Business Opportunities in 2026

China produces **over 28% of the world's manufactured goods**. The typical markup from Chinese factory price to US retail is **3-6x**. This means a product that costs $5 to manufacture in China sells for $20-$30 in the US — and that gap is your profit opportunity.

## The Numbers: What Kind of Margins Can You Expect?

| Product Category | Factory Cost | US Retail | Your Margin |
|---|---|---|---|
| Phone accessories | $0.50-$3 | $10-$30 | 70-90% |
| Home goods & kitchen | $1-$5 | $15-$40 | 65-85% |
| Pet products | $2-$10 | $20-$50 | 60-80% |
| LED lighting | $2-$8 | $15-$40 | 60-75% |
| Furniture | $30-$150 | $150-$600 | 60-75% |
| Fitness equipment | $1-$5 | $15-$35 | 70-80% |

## Three Business Models That Work

### 1. Amazon FBA Private Label
- Source products from China, brand them with your logo
- Ship directly to Amazon's warehouses
- Amazon handles storage, shipping, and customer service
- **Startup cost:** $3,000-$10,000
- **Typical net margin:** 15-35% after all fees

### 2. Direct-to-Consumer (Shopify/Your Own Store)
- Build your own brand and website
- Higher margins (no Amazon fees)
- Requires marketing investment (Facebook/Google ads)
- **Startup cost:** $5,000-$15,000
- **Typical net margin:** 25-45%

### 3. Wholesale/B2B Distribution
- Import in bulk, sell to US retailers
- Lower margins per unit but higher volume
- Relationships matter — trade shows and cold outreach
- **Startup cost:** $10,000-$50,000
- **Typical net margin:** 15-25%

## Step-by-Step: Starting Your Import Business

1. **Research products** — Use tools like Jungle Scout, Google Trends, and Amazon Best Sellers to find products with demand
2. **Find suppliers** — Search Alibaba.com, attend Canton Fair, or use a sourcing agent like Doge Consulting
3. **Order samples** — Always test quality before committing. Budget $200-$500 for samples
4. **Negotiate pricing** — Get quotes from 3-5 factories. Negotiate MOQ (Minimum Order Quantity) and FOB pricing
5. **Arrange shipping** — Use a freight forwarder for ocean freight (cheapest for bulk). Air freight for urgent/lightweight items
6. **Handle customs** — A customs broker files your ISF and entry. Budget for duties (0-25% depending on product)
7. **Sell and scale** — List on Amazon, launch your store, or approach retailers. Reinvest profits into more inventory

## The China Advantage: Why This Works

- **Scale:** Thousands of factories competing for your business drives prices down
- **Quality:** Chinese manufacturing has improved dramatically — the same factories that make for Nike and Apple make for small importers too
- **Infrastructure:** Ports like Shenzhen and Shanghai can ship anywhere in the world in 2-5 weeks
- **Support services:** Inspection companies, freight forwarders, customs brokers — the entire supply chain exists to help you

## How Doge Consulting Helps You Succeed

We handle the hard parts: factory sourcing, quality inspection, shipping logistics, customs clearance, and door-to-door delivery. You focus on selling. Get a free quote and start your import journey today.`,
  },
  {
    slug: "top-10-profitable-products-import-china-2026",
    title: "Top 10 Most Profitable Products to Import from China in 2026",
    excerpt: "Data-driven list of the highest-margin products to import from China right now. Real factory prices, US retail prices, and profit calculations for each.",
    category: "Business",
    emoji: "📊",
    readTime: "10 min",
    content: `## Finding Profitable Products

The best import products share three traits: **low shipping cost relative to value**, **consistent demand**, and **high perceived value**. Here are the top 10 for 2026:

## 1. Ergonomic Office Chairs
- **Factory price:** $30-$60
- **US retail:** $150-$350
- **Markup:** 3-5x
- **Source from:** Foshan, Guangdong
- **Why now:** Remote work is permanent. Demand for quality office furniture is steady.

## 2. Smart Home Devices
- **Factory price:** $5-$20
- **US retail:** $30-$100
- **Markup:** 4-6x
- **Source from:** Shenzhen, Guangdong
- **Why now:** Smart home market growing 25% annually. WiFi plugs, sensors, cameras.

## 3. Pet Products (Beds, Toys, Accessories)
- **Factory price:** $2-$10
- **US retail:** $20-$50
- **Markup:** 4-5x
- **Source from:** Yiwu, Zhejiang
- **Why now:** US pet spending hit $150B in 2025. Pet parents spend freely.

## 4. Stainless Steel Kitchenware
- **Factory price:** $1-$5
- **US retail:** $15-$35
- **Markup:** 5-7x
- **Source from:** Jieyang, Guangdong (China's kitchenware capital)
- **Why now:** Kitchen gadgets are evergreen. Low return rates. Easy to private label.

## 5. LED Lighting (Strips, Panels, Bulbs)
- **Factory price:** $1-$5
- **US retail:** $12-$30
- **Markup:** 4-6x
- **Source from:** Zhongshan, Guangdong (LED capital of China)
- **Why now:** Energy efficiency trends. Home improvement spending strong.

## 6. Yoga & Fitness Accessories
- **Factory price:** $1-$5
- **US retail:** $15-$40
- **Markup:** 5-8x
- **Source from:** Nantong, Jiangsu
- **Why now:** Home fitness market matured post-COVID. Resistance bands, mats, blocks.

## 7. Children's Educational Toys
- **Factory price:** $1-$5
- **US retail:** $15-$35
- **Markup:** 5-7x
- **Source from:** Shantou, Guangdong (toy capital of China)
- **Why now:** Parents investing in STEM toys. Many Chinese toy categories have 0% import duty.

## 8. Electric Standing Desks
- **Factory price:** $80-$150
- **US retail:** $350-$800
- **Markup:** 3-5x
- **Source from:** Foshan, Guangdong
- **Why now:** $12B market. Premium product with high margins.

## 9. Portable Power Banks & Chargers
- **Factory price:** $3-$10
- **US retail:** $20-$50
- **Markup:** 4-5x
- **Source from:** Shenzhen, Guangdong
- **Why now:** Universal demand. Multiple device usage increasing.

## 10. Premium Ceramic Dinnerware
- **Factory price:** $8-$20 per set
- **US retail:** $50-$150 per set
- **Markup:** 4-6x
- **Source from:** Chaozhou, Guangdong (ceramics capital)
- **Why now:** Home entertaining culture. Instagram-worthy dinnerware trends.

## Pro Tips for Product Selection

- **Check Amazon BSR** (Best Sellers Rank) — aim for products in categories with BSR under 10,000
- **Calculate landed cost** — factory price + shipping + duties = your true cost
- **Avoid regulated products** initially — skip electronics that need FCC certification, food-contact items needing FDA approval
- **Look for low return rates** — fragile items and clothing have high returns
- **Consider seasonality** — Christmas decorations from Yiwu can yield 10x markup but only sell Q4`,
  },
  {
    slug: "amazon-fba-from-china-complete-guide",
    title: "Amazon FBA from China: Complete Guide to Building a 6-Figure Business",
    excerpt: "Step-by-step guide to sourcing products from Chinese factories and selling on Amazon FBA. Real economics, supplier selection, and scaling strategies.",
    category: "Business",
    emoji: "🏪",
    readTime: "14 min",
    content: `## What Is Amazon FBA from China?

Amazon FBA (Fulfillment by Amazon) lets you send inventory to Amazon's warehouses. When customers order, Amazon picks, packs, ships, and handles returns. Combined with Chinese sourcing, this creates a powerful business model.

## The Economics

| Item | Cost |
|---|---|
| Product cost (FOB China) | $2-$8/unit |
| Ocean freight + duties | $0.50-$3/unit |
| **Landed cost** | **$3-$11/unit** |
| Amazon selling price | $15-$40 |
| Amazon FBA fees | $3-$7 |
| Amazon referral (15%) | $2.25-$6 |
| PPC advertising | $1-$3/unit sold |
| **Net profit/unit** | **$2-$12** |
| **Net margin** | **15-35%** |

## Step 1: Product Research

Use these tools to find winning products:
- **Jungle Scout** — Amazon product database with sales estimates
- **Helium 10** — Keyword research and competitor analysis
- **Google Trends** — Verify growing demand
- **Amazon Best Sellers** — Browse top 100 in each category

**Good product criteria:**
- Selling price $15-$50
- Lightweight (under 2 lbs) to minimize FBA fees
- Not dominated by big brands
- At least 300 units/month sales for top sellers
- Room for improvement (read negative reviews of existing products)

## Step 2: Find a Supplier

- **Alibaba.com** — Largest B2B platform. Filter by "Verified Manufacturer"
- **1688.com** — Chinese domestic platform (lower prices, need a sourcing agent)
- **Canton Fair** — World's largest trade fair, held twice yearly in Guangzhou
- **Sourcing agents** — Companies like Doge Consulting that find and vet factories for you

**Always order 3-5 samples before committing to a bulk order.**

## Step 3: Ship to Amazon

1. Factory ships to Chinese port (drayage)
2. Ocean freight to US port (20-35 days)
3. Customs clearance (your broker handles this)
4. Drayage from port to Amazon FBA warehouse
5. Amazon receives and stores your inventory

**Pro tip:** Ship directly from China to Amazon FBA to save on domestic warehousing. Your freight forwarder can prepare FBA-compliant labels and pallets.

## Step 4: Launch and Scale

- Create optimized listings with professional photos and keyword-rich titles
- Run Amazon PPC campaigns to drive initial sales
- Get early reviews through Amazon's Vine program
- Reorder when you have 6-8 weeks of inventory left
- Expand to multiple products in your niche

## Common Mistakes to Avoid

- **Ordering too much inventory** on your first order — start with 200-500 units
- **Ignoring customs compliance** — incorrect HTS codes can lead to seizure
- **Skipping quality inspection** — always inspect before shipping
- **Not calculating all costs** — include duties, FBA fees, returns, and PPC in your math
- **Choosing oversaturated products** — avoid markets dominated by 50+ identical sellers`,
  },
  {
    slug: "complete-guide-shipping-from-china-to-usa",
    title: "The Complete Guide to Shipping Products from China to the USA in 2026",
    excerpt: "Everything you need to know about importing goods from China — from finding suppliers to customs clearance, shipping methods, and landed cost calculation.",
    category: "Import Guide",
    emoji: "🚢",
    readTime: "12 min",
    content: `## Why Ship from China?

China remains the world's largest manufacturing economy, producing everything from furniture and electronics to textiles and industrial equipment. For US businesses and consumers, importing directly from Chinese manufacturers can mean **40-60% savings** compared to buying from domestic retailers.

## Shipping Methods Compared

| Method | Transit Time | Cost/kg | Best For |
|---|---|---|---|
| Ocean FCL | 20-35 days | $0.10-$0.50 | Large orders (1+ container) |
| Ocean LCL | 25-40 days | $0.30-$1.00 | Small orders sharing container |
| Air Freight | 3-7 days | $4-$8 | Urgent/high-value/lightweight |
| Express (DHL/FedEx) | 3-5 days | $6-$12 | Samples, small parcels |

## The Journey: Factory to Your Door

1. **Production** — Factory manufactures your goods (15-45 days)
2. **Quality inspection** — Third-party inspector checks at factory (1-2 days)
3. **Domestic transport** — Trucked to Chinese port (1-3 days)
4. **Export customs** — Chinese customs clearance (1-2 days)
5. **Ocean transit** — Ship crosses Pacific Ocean (14-35 days)
6. **US port arrival** — Arrives at LA, Seattle, NY, etc.
7. **US customs clearance** — CBP reviews, duties assessed (1-5 days)
8. **Last mile delivery** — Trucked to your door or warehouse (1-5 days)

## Understanding Customs Duties

Every import requires:
- **ISF Filing** — Submitted 24 hours before vessel departure
- **HTS Classification** — Determines your duty rate (0-32%)
- **Section 301 Tariffs** — Additional 25% on most Chinese goods
- **MPF** — Merchandise Processing Fee (0.3464%, min $31.67)
- **HMT** — Harbor Maintenance Tax (0.125%)

## How We Help

At Doge Consulting, we handle every step — from sourcing to delivery. You tell us what you need, we handle the rest. Our typical clients save 40-60% on premium products with zero hassle.`,
  },
  {
    slug: "lcl-vs-fcl-shipping-guide",
    title: "LCL vs FCL: Which Shipping Method Should You Choose?",
    excerpt: "A detailed comparison of Less-than-Container Load and Full Container Load shipping. Learn when each method saves you money.",
    category: "Shipping Tips",
    emoji: "📦",
    readTime: "8 min",
    content: `## LCL (Less than Container Load)

Your cargo shares space with other shippers in one container.

**Best for:** Shipments under 15 CBM
**Cost:** $80-$200 per CBM
**Transit:** 25-40 days (extra handling time)

**Pros:** Lower minimum cost, pay only for your space
**Cons:** Higher per-CBM rate, more handling, potential delays

## FCL (Full Container Load)

You rent an entire container.

| Container | Volume | Max Weight | Typical Cost |
|---|---|---|---|
| 20ft | 33 CBM | 28,000 kg | $2,000-$3,500 |
| 40ft | 67 CBM | 28,000 kg | $3,000-$5,000 |
| 40ft HC | 76 CBM | 28,000 kg | $3,500-$5,500 |

**Best for:** Shipments over 15 CBM
**Pros:** Lower per-CBM cost, faster transit, less handling
**Cons:** Higher minimum cost, need enough volume

## The Breakeven Point

FCL becomes cheaper than LCL at approximately **15 CBM** — about half a 20ft container. Use our CBM calculator at /tools/cbm-calculator to estimate your volume.`,
  },
  {
    slug: "understanding-section-301-tariffs-2026",
    title: "Understanding Section 301 Tariffs on Chinese Goods (2026 Update)",
    excerpt: "Current Section 301 tariff rates, which products are affected, and proven strategies to minimize your duty costs when importing from China.",
    category: "Tariff Updates",
    emoji: "📊",
    readTime: "10 min",
    content: `## What Are Section 301 Tariffs?

Section 301 tariffs are additional duties imposed by the US on Chinese imports, on top of regular customs duties. Most Chinese goods face an **additional 25%** tariff.

## Which Products Are Affected?

The tariffs apply to most manufactured goods from China, organized in several "lists":

- **List 1:** $34 billion in goods (25% tariff) — industrial machinery, electronics
- **List 2:** $16 billion in goods (25% tariff) — semiconductors, chemicals
- **List 3:** $200 billion in goods (25% tariff) — consumer goods, furniture, lighting
- **List 4A:** $120 billion in goods (7.5-25% tariff) — apparel, footwear, electronics

## Products With 0% or Low Base Duty

Even with Section 301 tariffs, some products have 0% base duty:
- Most furniture (wood and metal)
- Consumer electronics
- Toys and games
- Many lighting products

**Example:** A $5,000 furniture shipment faces:
- Base duty: 0%
- Section 301: 25% = $1,250
- MPF: $17.32
- HMT: $6.25
- **Total duty: $1,273.57** (25.5% effective rate)

## Strategies to Minimize Duties

1. **Correct HTS classification** — Ensure your products are classified under the correct code. Small differences can mean big duty savings.
2. **First Sale Rule** — If goods pass through a middleman, you may be able to use the lower first sale price as the customs value.
3. **Foreign Trade Zones** — Store goods in an FTZ to defer duties until you sell.
4. **Duty drawback** — If you re-export goods, you can recover up to 99% of duties paid.

## Use Our Duty Calculator

Estimate your import duties using our free calculator at /tools/duty-calculator.`,
  },
  {
    slug: "furniture-sourcing-foshan-china",
    title: "Furniture Sourcing from Foshan, China: Save 40-60% on Premium Pieces",
    excerpt: "How to source marble tables, sofas, wardrobes, and custom furniture from Foshan — the world's furniture capital. Quality tips and real cost breakdowns.",
    category: "Sourcing",
    emoji: "🪑",
    readTime: "9 min",
    content: `## Why Foshan?

Foshan (佛山) in Guangdong Province is **China's furniture manufacturing capital**, producing everything from marble dining tables to custom wardrobes. Over 5,000 furniture factories and showrooms line the 10-km stretch known as Shunde Furniture City.

## What You Can Source

- **Marble & stone furniture** — Dining tables, coffee tables, countertops
- **Solid wood furniture** — Beds, wardrobes, bookshelves, desks
- **Upholstered furniture** — Sofas, armchairs, ottomans
- **Office furniture** — Desks, ergonomic chairs, filing systems
- **Custom furniture** — Built to your exact specifications

## Real Cost Comparison

| Product | Foshan Factory | US Retail | You Save |
|---|---|---|---|
| Marble dining table (6-seater) | $400-$800 | $2,000-$4,000 | 60-75% |
| Leather sectional sofa | $300-$600 | $1,500-$3,000 | 70-80% |
| Solid wood wardrobe | $200-$400 | $800-$2,000 | 65-75% |
| King bed frame + nightstands | $250-$500 | $1,200-$2,500 | 70-80% |
| Standing desk (electric) | $80-$150 | $350-$800 | 75-80% |

## Quality Concerns and Solutions

- **Always visit or send an inspector** — Photos can be misleading
- **Request material samples** — Check marble thickness, wood grain, fabric quality
- **Ask for BSCI/ISO certificates** — Verified factories have better quality control
- **Order one piece first** — Test quality and shipping before ordering a full set
- **Use video inspections** — Factory video calls are standard practice now

## Shipping Furniture

Furniture is heavy but has **0% base import duty** in the US (most HTS codes under Chapter 94). Section 301 adds 25%, but the massive markup still makes it highly profitable.

**Pro tip:** Professional crating is essential. Budget $50-$200 per piece for custom wooden crates with foam padding. It's worth every penny vs damage claims.`,
  },
  {
    slug: "shenzhen-electronics-sourcing-guide",
    title: "Shenzhen Electronics Sourcing Guide: From Factory Floor to Your Store",
    excerpt: "Navigate Shenzhen's massive electronics ecosystem. Where to find suppliers, how to order, quality control tips, and the best product categories.",
    category: "Sourcing",
    emoji: "📱",
    readTime: "11 min",
    content: `## Shenzhen: The World's Electronics Capital

Shenzhen (深圳) produces **90% of the world's consumer electronics**. With a GDP of $557 billion, it's home to Huawei, Tencent, DJI, and BYD — but also thousands of smaller factories making everything from phone cases to smart home devices.

## The Shenzhen Ecosystem

- **Huaqiangbei** — The world's largest electronics market (physical marketplace)
- **Foxconn/BYD complexes** — Massive contract manufacturing (for Apple, Samsung, etc.)
- **Maker spaces** — HAX, Trouble Maker — prototype to production in weeks
- **Alibaba/1688** — Online sourcing (most Shenzhen factories are on both)

## Best Product Categories from Shenzhen

1. **Phone accessories** — Cases, screen protectors, chargers, cables (margin: 70-90%)
2. **Smart home devices** — WiFi plugs, cameras, sensors (margin: 60-80%)
3. **Portable electronics** — Power banks, Bluetooth speakers, earbuds (margin: 60-75%)
4. **LED products** — Strip lights, bulbs, panels (margin: 60-75%)
5. **Drones & RC** — Consumer drones, FPV equipment (margin: 50-70%)
6. **Computer peripherals** — Keyboards, mice, webcams, monitors (margin: 50-65%)

## Finding Reliable Suppliers

- **Alibaba** — Filter by "Verified Manufacturer" and "Trade Assurance"
- **Made-in-China.com** — Alternative to Alibaba with good electronics listings
- **Global Sources** — Higher-quality supplier directory, hosts Hong Kong electronics fairs
- **Direct factory visits** — Fly to Shenzhen, hire a translator, visit 5-10 factories in a week

## Quality Control Essentials

Electronics require extra diligence:
- **FCC certification** — Required for any electronic device sold in the US
- **UL listing** — Important for products with lithium batteries
- **Pre-shipment inspection** — Test a random sample (AQL 2.5 standard)
- **Burn-in testing** — Run devices for 24-48 hours before shipping to catch early failures

## Import Duties for Electronics

Good news: most consumer electronics have **0% base US import duty**. Section 301 may add 7.5-25% depending on the specific product list. Despite duties, the markup from Shenzhen factory to US retail is typically **4-6x**.`,
  },
  {
    slug: "yiwu-small-commodities-guide",
    title: "Yiwu: The World's Largest Small Commodities Market",
    excerpt: "Everything about sourcing from Yiwu — the city that supplies Christmas decorations, toys, accessories, and household goods to 200+ countries.",
    category: "Sourcing",
    emoji: "🎁",
    readTime: "8 min",
    content: `## What Is Yiwu?

Yiwu (义乌) in Zhejiang Province hosts the **Yiwu International Trade Market** — the world's largest wholesale market for small commodities. Spanning 5.5 million square meters (60 million sq ft), it has **75,000+ booths** selling everything imaginable.

## What You Can Source in Yiwu

- **Christmas & holiday decorations** — Yiwu produces 60% of the world's Christmas decorations
- **Toys & games** — Plush toys, puzzles, educational toys, outdoor toys
- **Accessories** — Jewelry, hair accessories, sunglasses, watches
- **Household goods** — Kitchen utensils, storage, cleaning supplies
- **Stationery** — Notebooks, pens, school supplies
- **Bags & luggage** — Backpacks, totes, travel bags
- **Hardware** — Tools, fasteners, fittings

## Why Yiwu Is Different

- **Low MOQ** — Many Yiwu suppliers accept orders as small as 50-100 pieces
- **One-stop sourcing** — Buy 50 different products from one market trip
- **Ready stock** — Unlike custom manufacturing, many items ship immediately
- **Incredible prices** — The $0.01-$5 price range dominates

## How to Buy from Yiwu

1. **Online:** Search Alibaba or 1688 for Yiwu suppliers
2. **In person:** Fly to Yiwu (Shanghai → Yiwu by high-speed rail, 1.5 hours)
3. **Through an agent:** Companies like Doge Consulting source from Yiwu on your behalf

## Profit Margins from Yiwu Products

| Product | Yiwu Price | US Retail | Markup |
|---|---|---|---|
| Christmas ornaments (pack) | $0.50-$2 | $8-$15 | 8-15x |
| Plush toys | $1-$3 | $10-$20 | 5-10x |
| Sunglasses | $0.50-$2 | $10-$25 | 10-15x |
| Kitchen gadgets | $0.30-$2 | $5-$15 | 8-12x |
| Hair accessories (set) | $0.20-$1 | $5-$12 | 10-20x |

The markups from Yiwu products are among the highest in all of China sourcing — because the goods are so inexpensive to produce and ship, yet consumers willingly pay premium retail prices.`,
  },
  {
    slug: "guangzhou-textile-garment-sourcing",
    title: "Guangzhou Textile & Garment Sourcing: Fashion from the Factory",
    excerpt: "Navigate Guangzhou's massive textile and garment industry. Find fabric suppliers, clothing manufacturers, and quality control strategies.",
    category: "Sourcing",
    emoji: "👕",
    readTime: "8 min",
    content: `## Guangzhou: China's Fashion Capital

Guangzhou (广州) is the hub of China's textile and garment industry. The city hosts the **Canton Fair** (world's largest trade fair) twice a year and has sprawling wholesale markets.

## Key Markets in Guangzhou

- **Zhongda Fabric Market** — Asia's largest fabric wholesale market. 5,000+ fabric sellers
- **Shahe Clothing Market** — Massive ready-to-wear wholesale center
- **Baima Clothing Market** — Higher-end fashion wholesale (13 floors)
- **Liuhua Clothing Market** — Export-focused garment center

## What to Source

- **T-shirts & basics** — Factory price $1-$3, US retail $15-$30
- **Activewear** — Factory price $3-$8, US retail $25-$60
- **Outerwear** — Factory price $10-$30, US retail $50-$150
- **Custom fabrics** — Silk, cotton, bamboo, performance fabrics
- **Accessories** — Scarves, hats, gloves, belts

## Import Considerations for Textiles

Textiles have **higher import duties** than most other Chinese goods:
- Cotton garments: 10-16% base duty
- Synthetic fabrics: 8-32% base duty
- Plus Section 301: additional 7.5-25%

Despite higher duties, the factory-to-retail markup of **5-8x** still makes textiles one of the most profitable import categories if you choose the right products.

## Quality Control for Garments

- **Fabric test report** — Request GSM weight, color fastness, shrinkage tests
- **Size specs** — Provide detailed tech packs with measurements in cm
- **Pre-production sample** — Always approve a sample before bulk production
- **Inline inspection** — Check quality during production, not just after
- **AQL inspection** — Standard sampling inspection before shipping`,
  },
  {
    slug: "us-customs-clearance-explained",
    title: "US Customs Clearance Explained: ISF, Duties, and What to Expect",
    excerpt: "Demystifying US customs for first-time importers. ISF filings, duty calculations, customs bonds, and how to avoid delays and penalties.",
    category: "Customs",
    emoji: "🛂",
    readTime: "11 min",
    content: `## Overview of US Customs

Every commercial shipment entering the US must clear customs through **US Customs and Border Protection (CBP)**. The process involves documentation, duty assessment, and possible physical inspection.

## Key Documents Required

1. **Commercial Invoice** — Value, quantity, description of goods
2. **Packing List** — Detailed breakdown of cargo
3. **Bill of Lading (B/L)** — Shipping contract and cargo receipt
4. **ISF (10+2)** — Importer Security Filing, required 24 hours before vessel departure
5. **Customs Bond** — Financial guarantee (required for shipments over $2,500)
6. **Certificate of Origin** — Proves country of manufacture

## The Customs Process Step by Step

1. **ISF Filing** (24 hrs before departure) — Your broker submits 10 data elements to CBP
2. **Entry Filing** (at arrival) — Formal customs entry with HTS classification
3. **Duty Assessment** — CBP calculates duties based on HTS code and value
4. **Examination** (if selected) — 2-5% of containers are physically inspected
5. **Release** — Goods cleared for domestic transport
6. **Duty Payment** — Due within 10 working days of release

## Understanding HTS Codes

The **Harmonized Tariff Schedule** is a 10-digit code system that determines:
- What duty rate applies to your product
- Whether your product is subject to Section 301 tariffs
- Any quotas or restrictions

**Example:** A wooden dining table is HTS 9403.60.8080 — duty rate 0%.

## Common Mistakes That Cause Delays

- Missing or late ISF filing (penalty: $5,000-$10,000)
- Incorrect HTS classification
- Undervaluing goods on commercial invoice
- Missing certificates or test reports
- Inconsistent documentation between invoice and B/L

## Do You Need a Customs Broker?

**Yes**, for any commercial import. A licensed customs broker:
- Files all paperwork electronically with CBP
- Ensures correct HTS classification
- Calculates and pays duties
- Handles inspections and holds
- Costs $150-$500 per entry

At Doge Consulting, customs clearance is included in our door-to-door service.`,
  },
  {
    slug: "how-to-find-reliable-chinese-suppliers",
    title: "How to Find Reliable Chinese Suppliers: A Step-by-Step Guide",
    excerpt: "Vet manufacturers, avoid scams, negotiate pricing, and build lasting supplier relationships for your import business.",
    category: "Sourcing",
    emoji: "🔍",
    readTime: "9 min",
    content: `## Where to Find Suppliers

### Online Platforms
- **Alibaba.com** — 200,000+ manufacturers, largest B2B platform
- **1688.com** — Domestic Chinese platform, lower prices (need agent for non-Chinese buyers)
- **Made-in-China.com** — Good for industrial/electronic products
- **Global Sources** — Higher-quality verified suppliers

### Offline
- **Canton Fair** — April and October in Guangzhou, 25,000+ exhibitors
- **Yiwu International Trade Market** — 75,000 booths, walk-in wholesale
- **Industry-specific fairs** — Furniture Fair (Dongguan), Electronics Fair (Shenzhen)

## Red Flags to Watch For

- No factory photos or video — might be a trading company
- Price too good to be true — quality will suffer
- Won't send samples — hiding quality issues
- No business license displayed — may not be registered
- Pushes for Western Union/MoneyGram payment — scam indicator

## Vetting Process

1. **Request business license** — Verify on China's SAIC website
2. **Ask for factory photos/video** — Look for actual production lines
3. **Order samples from 3-5 suppliers** — Compare quality and communication
4. **Start with a small order** — 200-500 units to test the relationship
5. **Use Trade Assurance** — Alibaba's buyer protection for first orders
6. **Hire a third-party inspector** — QIMA, V-Trust, Asia Inspection ($200-$500)

## Negotiation Tips

- Get quotes from multiple factories — leverage competing offers
- Ask about MOQ flexibility — many factories will lower MOQ for new customers
- Negotiate payment terms — start with 30/70 (30% deposit, 70% before shipping)
- Request FOB pricing — so you control the shipping
- Build relationships — loyalty to one factory often leads to better pricing over time`,
  },
  {
    slug: "dongguang-manufacturing-hub-guide",
    title: "Dongguan: Inside China's Premier OEM/ODM Manufacturing Hub",
    excerpt: "Dongguan makes products for Nike, Samsung, and Apple. Learn how to source from the same factories that supply the world's biggest brands.",
    category: "Sourcing",
    emoji: "🏭",
    readTime: "7 min",
    content: `## Dongguan: The World's Factory Floor

Dongguan (东莞) sits between Shenzhen and Guangzhou in the Pearl River Delta. Known as "the world's factory floor," it's where many global brands have their products manufactured.

## What Dongguan Produces

- **Consumer electronics** — Phone accessories, audio equipment, wearables
- **Footwear** — Athletic shoes, casual footwear (Yue Yuen makes for Nike, Adidas, Puma)
- **Toys** — Action figures, plush toys, board games
- **Furniture** — Modern furniture, office furniture, outdoor furniture
- **Garments** — Denim, sportswear, uniforms

## Famous Factories in Dongguan

| Factory | Products | Clients |
|---|---|---|
| Yue Yuen | Footwear | Nike, Adidas, New Balance |
| Foxconn | Electronics | Apple, Sony, Nintendo |
| Top Form | Intimate apparel | Victoria's Secret, Wacoal |
| Various | Toys | Mattel, Hasbro, LEGO |

## Why Source from Dongguan?

1. **World-class quality** — These factories already meet the strictest international standards
2. **OEM/ODM capabilities** — Design your own product, they'll manufacture it
3. **Proximity to Shenzhen** — 1 hour by car, easy logistics
4. **Lower costs than Shenzhen** — Factory rent and labor are 20-30% cheaper
5. **Export infrastructure** — Direct access to Shenzhen and Guangzhou ports

## How to Access Dongguan Factories

Most Dongguan factories don't have Alibaba storefronts — they work through relationships. The best ways:
- Sourcing agents (like Doge Consulting)
- Canton Fair (many Dongguan factories exhibit)
- Industry referrals
- Direct factory visits (fly to Shenzhen, drive to Dongguan)`,
  },
  {
    slug: "save-money-home-furnishing-from-china",
    title: "How to Save $10,000+ Furnishing Your Home with Chinese Furniture",
    excerpt: "Real cost breakdowns showing how homeowners save 50-70% by sourcing furniture from China. Step-by-step process for first-time buyers.",
    category: "Consumer Guide",
    emoji: "🏠",
    readTime: "8 min",
    content: `## The Price Gap Is Real

Furniture has one of the largest price gaps between Chinese factory and US retail. Here's what a full home furnishing looks like:

| Room | Item | US Retail | From China | You Save |
|---|---|---|---|---|
| Dining | Marble table + 6 chairs | $4,000 | $1,200 | $2,800 |
| Living | Leather sectional sofa | $3,000 | $800 | $2,200 |
| Living | TV console + coffee table | $1,500 | $400 | $1,100 |
| Bedroom | King bed + nightstands | $2,500 | $500 | $2,000 |
| Bedroom | Custom wardrobe | $2,000 | $500 | $1,500 |
| Office | Standing desk + chair | $1,200 | $250 | $950 |
| **Total** | | **$14,200** | **$3,650** | **$10,550** |

**That's $10,550 in savings — a 74% discount.**

## How It Works

1. **Tell us what you need** — Send photos, links, or descriptions of the furniture you want
2. **We source from factories** — We find matching products from verified Foshan/Dongguan factories
3. **Review and approve** — We send photos, samples, and pricing for your approval
4. **We handle shipping** — Professional crating, ocean freight, customs, and door-to-door delivery
5. **Receive and enjoy** — Furniture delivered to your home in 6-8 weeks

## Quality You Can Trust

Chinese furniture factories produce for brands like West Elm, Pottery Barn, and Restoration Hardware. The same marble, wood, and craftsmanship — without the brand markup.

## Why Furniture Is Ideal for China Sourcing

- **0% base import duty** on most furniture (HTS Chapter 94)
- **High value-to-weight ratio** — even with shipping, savings are massive
- **Custom options** — Chinese factories can build to your exact dimensions
- **Professional packing** — Wooden crates with foam inserts = zero damage

## Get Started

Request a free quote at doge-consulting.com/quote. Tell us what rooms you're furnishing and we'll send a detailed cost comparison within 24 hours.`,
  },
  {
    slug: "china-pet-products-import-guide",
    title: "Importing Pet Products from China: A $150 Billion Opportunity",
    excerpt: "The US pet industry hit $150B in 2025. Learn how to tap into this massive market by sourcing pet products from Chinese manufacturers.",
    category: "Business",
    emoji: "🐕",
    readTime: "7 min",
    content: `## The Pet Industry Boom

Americans spend over **$150 billion annually** on their pets. The pet products market is growing 6-8% per year, with premiumization driving higher per-item spending.

## Top Pet Products to Import from China

| Product | Factory Price | US Retail | Margin |
|---|---|---|---|
| Dog beds (various sizes) | $3-$12 | $25-$60 | 60-80% |
| Cat trees/condos | $8-$25 | $40-$120 | 60-75% |
| Pet toys (assorted) | $0.50-$3 | $5-$15 | 75-85% |
| Grooming tools | $2-$8 | $15-$40 | 65-80% |
| Leashes & harnesses | $1-$5 | $12-$30 | 75-85% |
| Food bowls (ceramic/steel) | $1-$4 | $10-$25 | 75-85% |
| Pet carriers | $5-$15 | $30-$70 | 65-80% |

## Where to Source

- **Nantong, Jiangsu** — Major pet bed and toy manufacturing center
- **Yiwu, Zhejiang** — Pet accessories, toys, small items
- **Shenzhen** — Smart pet tech (GPS trackers, auto feeders, cameras)

## Compliance Requirements

- **CPSC** — Consumer Product Safety Commission standards apply to pet products
- **State regulations** — California Proposition 65 applies to pet products too
- **Labeling** — Country of origin, material composition required
- **Testing** — Lead and phthalate testing recommended for pet toys

## Import Duties

Most pet products have **0-4.4% base duty**. Section 301 adds 25% for Chinese goods. Even with duties, the 3-5x markup makes pet products highly profitable.`,
  },
  {
    slug: "china-led-lighting-sourcing-zhongshan",
    title: "LED Lighting from Zhongshan: China's Lighting Capital",
    excerpt: "Zhongshan produces 70% of China's lighting products. Source LED strips, panels, smart bulbs, and commercial lighting at factory prices.",
    category: "Sourcing",
    emoji: "💡",
    readTime: "7 min",
    content: `## Zhongshan: The Lighting Capital

Zhongshan (中山) in Guangdong Province is known as China's lighting capital. The Guzhen district alone has **over 6,000 lighting manufacturers** producing everything from LED strips to commercial chandeliers.

## Products Available

- **LED strip lights** — Factory: $1-3/5m roll, US retail: $12-$25
- **Smart bulbs** — Factory: $2-$5, US retail: $12-$30
- **Panel lights** — Factory: $8-$20, US retail: $30-$80
- **Chandeliers** — Factory: $20-$200, US retail: $100-$1,000
- **Outdoor/landscape lighting** — Factory: $5-$30, US retail: $25-$120
- **Commercial fixtures** — Factory: $15-$50, US retail: $60-$200

## Why LED Lighting Is a Great Import Category

1. **Growing market** — LED adoption still increasing globally
2. **High margins** — 4-6x markup typical
3. **Lightweight** — Low shipping cost per unit value
4. **Low duty** — Most LED products: 3.9% base duty
5. **Easy to private label** — Custom packaging and branding available

## Quality and Certification

- **UL listing** — Important for US retail (many Chinese factories are UL certified)
- **FCC compliance** — Required for any electronic product
- **Energy Star** — Adds premium value to your product
- **DLC listing** — For commercial LED products

## Annual Lighting Events

- **Guzhen International Lighting Fair** — October annually, 3,000+ exhibitors
- **Hong Kong International Lighting Fair** — April and October
- **Canton Fair** — Lighting is a major category in Phase 1`,
  },
  {
    slug: "hangzhou-ecommerce-tech-hub",
    title: "Hangzhou: Where E-Commerce Meets Manufacturing",
    excerpt: "Home to Alibaba, Hangzhou is the crossroads of Chinese e-commerce and manufacturing. How to leverage this tech hub for your import business.",
    category: "Sourcing",
    emoji: "🖥️",
    readTime: "6 min",
    content: `## Hangzhou: The E-Commerce Capital

Hangzhou (杭州) is the headquarters of Alibaba Group and the birthplace of Chinese e-commerce. This creates a unique ecosystem where technology, logistics, and manufacturing converge.

## Why Hangzhou Matters for Importers

- **Alibaba HQ** — Direct access to the platform that connects you with Chinese factories
- **Cross-border e-commerce zone** — Streamlined export processes
- **Tech ecosystem** — Logistics tech, payment processing, SaaS tools
- **Proximity to Yiwu** — 1.5 hours by high-speed rail

## What to Source from Hangzhou Area

- **Silk & textiles** — Hangzhou is China's silk capital
- **Tea** — Longjing (Dragon Well) tea, one of China's most famous
- **Tech accessories** — Smart devices, IoT products
- **E-commerce tools** — Packaging, labels, marketing materials

## Cross-Border E-Commerce Opportunities

Hangzhou's Comprehensive Cross-Border E-Commerce Pilot Zone offers:
- Simplified customs for B2C exports
- Tax incentives for cross-border merchants
- Bonded warehouse facilities
- Integration with Alibaba/Tmall Global

## Leveraging Alibaba

1. **Alibaba.com** — B2B platform for finding factories
2. **1688.com** — Domestic prices (need agent), often 20-40% cheaper than Alibaba
3. **Tmall Global** — Sell directly to Chinese consumers (reverse import)
4. **AliExpress** — Dropshipping channel (low margin but low risk)`,
  },
];

console.log("🌱 Seeding blog posts...");

const insert = db.prepare(`
  INSERT OR IGNORE INTO BlogPost (id, slug, title, excerpt, content, category, emoji, published, authorName, readTime, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'Doge Consulting Team', ?, datetime('now'), datetime('now'))
`);

const txn = db.transaction(() => {
  for (const p of posts) {
    insert.run(cuid(), p.slug, p.title, p.excerpt, p.content, p.category, p.emoji, p.readTime);
  }
});

txn();
console.log(`✅ ${posts.length} blog posts seeded!`);
db.close();
