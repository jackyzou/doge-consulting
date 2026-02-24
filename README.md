# 🐕 Doge Consulting

**Product sourcing & shipping from mainland China to the USA.**

Doge Consulting connects US businesses and consumers with China's manufacturing hubs—furniture from Foshan, electronics from Shenzhen, small commodities from Yiwu, and more. This repository contains the company website: a Next.js application with an instant quote calculator, shipment tracking, Airwallex payment integration, and an admin panel.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Shipping Rate Calculator](#shipping-rate-calculator)
- [Key Features](#key-features)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (25 components) |
| Animations | [Framer Motion 12](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev) + custom polygon Doge SVG |
| Payments | [Airwallex](https://www.airwallex.com) (demo mode) |
| Validation | [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) |
| Font | [Inter](https://fonts.google.com/specimen/Inter) via `next/font` |

**Brand colors:** Navy `#0F2B46` · Teal `#2EC4B6` · Gold `#F0A500`

---

## Prerequisites

- **Node.js** ≥ 20 (tested with v24)
- **npm** ≥ 10

---

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/jackyzou/doge-consulting.git
cd doge-consulting

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000** — the page hot-reloads as you edit.

---

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout (Header + Footer + Toaster)
│   ├── page.tsx               # Home (8 animated sections)
│   ├── globals.css            # Tailwind + custom CSS variables
│   ├── about/page.tsx         # Company story & locations
│   ├── contact/page.tsx       # Contact form & info
│   ├── faq/page.tsx           # FAQ accordion (4 categories)
│   ├── payment/page.tsx       # Airwallex checkout demo
│   ├── quote/page.tsx         # 4-step shipping quote calculator
│   ├── services/page.tsx      # Service cards & "Why Choose Us"
│   ├── track/page.tsx         # Shipment tracking with timeline
│   ├── admin/                 # Admin panel
│   │   ├── layout.tsx         # Sidebar navigation
│   │   ├── page.tsx           # Dashboard overview
│   │   ├── orders/page.tsx    # Order management
│   │   ├── quotes/page.tsx    # Quote management
│   │   └── settings/page.tsx  # Pricing rules & Airwallex config
│   └── api/webhooks/airwallex/
│       └── route.ts           # Airwallex webhook handler
│
├── components/
│   ├── home/                  # Landing page sections (8 files)
│   │   ├── HeroSection.tsx    # Animated hero with route visualization
│   │   ├── StatsBar.tsx       # Key metrics bar
│   │   ├── ServicesOverview.tsx
│   │   ├── HowItWorks.tsx     # 4-step process
│   │   ├── PricingOverview.tsx # 3-tier pricing cards
│   │   ├── Testimonials.tsx
│   │   ├── FAQPreview.tsx
│   │   └── CTABanner.tsx
│   ├── layout/
│   │   ├── Header.tsx         # Sticky nav, language toggle, mobile menu
│   │   └── Footer.tsx         # 4-column footer
│   └── ui/                    # shadcn/ui primitives (25) + custom
│       ├── doge-logo.tsx      # Geometric Shiba Inu SVG logo
│       ├── button.tsx, card.tsx, input.tsx, ...
│       └── sonner.tsx
│
└── lib/
    ├── shipping-calculator.ts # Zone-based rate engine (partner rates)
    ├── tracking.ts            # Shipment status types & demo data
    ├── airwallex.ts           # Payment helpers & formatCurrency
    └── utils.ts               # cn() class merge utility
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack (hot reload) |
| `npm run build` | Production build (TypeScript check + static generation) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Shipping Rate Calculator

The quote engine in `src/lib/shipping-calculator.ts` uses real partner rate card data:

### Door-to-Door (by US zone)

Rates in **RMB per KG**, charged by whichever is greater—actual weight or volumetric weight `(L×W×H cm) ÷ 6000`:

| Zone | 100+ KG | 500+ KG | 1,000+ KG | 3,500+ KG | Last-Mile |
|---|---|---|---|---|---|
| West Coast A (CA 90-92) | ¥14 | ¥12 | ¥11 | ¥9 | ¥500 |
| West Coast B (WA, OR, CA 93-96) | ¥15 | ¥13 | ¥11.5 | ¥9.5 | ¥500 |
| Mountain (AZ, NV, CO, UT) | ¥16 | ¥14 | ¥12 | ¥10 | ¥500 |
| South (TX, GA, FL) | ¥16 | ¥14 | ¥12 | ¥10 | ¥500 |
| Midwest (IL, OH, MI, MN) | ¥18 | ¥15 | ¥13 | ¥11 | ¥2,500 |
| Northeast A (NY, NJ, PA) | ¥18 | ¥16 | ¥13.5 | ¥11 | ¥2,500 |
| Northeast B (MA, CT, MD) | ¥19 | ¥16 | ¥14 | ¥11.5 | ¥2,500 |
| Other US | ¥20 | ¥17 | ¥15 | ¥12 | ¥2,500 |

### Warehouse Pickup (by US city)

| City | 100+ KG | 500+ KG | 1,000+ KG | 3,500+ KG |
|---|---|---|---|---|
| Los Angeles | ¥10 | ¥8.5 | ¥7.5 | ¥6 |
| Oakland | ¥11 | ¥9 | ¥8 | ¥6.5 |
| Houston | ¥14 | ¥12 | ¥10.5 | ¥8.5 |
| Chicago | ¥15 | ¥13 | ¥11 | ¥9 |
| NJ / New York | ¥15 | ¥13 | ¥11.5 | ¥9.5 |

Exchange rate: **1 USD ≈ 7.2 RMB** (configurable via `RMB_TO_USD` constant).

---

## Key Features

- **🐕 Polygon Doge Logo** — Custom geometric Shiba Inu SVG in brand colors
- **🌍 Bilingual** — English/Chinese language toggle in header
- **📦 Quote Calculator** — 4-step wizard: items → destination → summary → quote with RMB/USD dual display
- **🚢 Shipment Tracking** — Timeline UI with milestone statuses and demo data (try `DC-2026-001`)
- **💳 Airwallex Payments** — Credit card & bank transfer (demo/sandbox mode)
- **📱 Fully Responsive** — Mobile-first design with slide-out navigation
- **🎬 Motion** — Framer Motion scroll-triggered animations throughout
- **🔧 Admin Panel** — Dashboard, quotes, orders, and settings management at `/admin`

---

## Environment Variables

The app runs fully in **demo mode** with no env vars required. For production Airwallex integration, create a `.env.local`:

```env
# Airwallex (optional — app uses demo mode if unset)
AIRWALLEX_CLIENT_ID=your_client_id
AIRWALLEX_API_KEY=your_api_key
AIRWALLEX_WEBHOOK_SECRET=your_webhook_secret
AIRWALLEX_ENV=demo          # "demo" or "prod"
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on push.

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note:** For Docker, add `output: "standalone"` to `next.config.ts`.

### Static Export

```bash
# Add to next.config.ts: output: "export"
npm run build
# Serve the `out/` directory with any static host
```

---

## Testing

### Manual Smoke Tests

| Page | URL | What to Verify |
|---|---|---|
| Home | `/` | Hero animations, stats bar, 8 sections render |
| Services | `/services` | 6 service cards, "Why Choose Us" section |
| Quote | `/quote` | 4-step wizard: add items → choose zone → review → get quote |
| Tracking | `/track` | Enter `DC-2026-001` or `DC-2026-002` to see timeline |
| Payment | `/payment` | Card form renders, demo payment processes |
| Contact | `/contact` | Form submits, toast appears |
| FAQ | `/faq` | Accordions expand/collapse in 4 categories |
| About | `/about` | Story, values, 3 location cards |
| Admin | `/admin` | Dashboard stats, sidebar navigation |
| Admin Settings | `/admin/settings` | Email shows `dogetech77@gmail.com` |

### Build Verification

```bash
# Full production build (catches TypeScript & lint errors)
npm run build

# Serve and manually test
npm run start
```

### Lint

```bash
npm run lint
```

### Adding Tests (Future)

The project is ready for testing frameworks. Recommended setup:

```bash
# Unit & component tests
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom

# E2E tests
npm install -D playwright @playwright/test
npx playwright install
```

Example unit test for the shipping calculator:

```typescript
// src/lib/__tests__/shipping-calculator.test.ts
import { describe, it, expect } from "vitest";
import {
  calculateDoorToDoorQuote,
  calculateWarehousePickupQuote,
  calculateVolumetricWeight,
  getChargeableWeight,
  RMB_TO_USD,
} from "../shipping-calculator";

describe("shipping-calculator", () => {
  it("calculates volumetric weight", () => {
    // 100cm × 50cm × 60cm = 300,000 / 6,000 = 50 kg
    expect(calculateVolumetricWeight(100, 50, 60)).toBe(50);
  });

  it("uses actual weight when heavier than volumetric", () => {
    expect(getChargeableWeight(80, 50)).toBe(80);
  });

  it("uses volumetric weight when heavier than actual", () => {
    expect(getChargeableWeight(30, 50)).toBe(50);
  });

  it("calculates door-to-door quote for west coast", () => {
    const quote = calculateDoorToDoorQuote("west-1", 200, 150);
    expect(quote.chargeableWeightKG).toBe(200);
    expect(quote.ratePerKG_RMB).toBe(14); // 100+ KG tier
    expect(quote.lastMileSurchargeRMB).toBe(500);
    expect(quote.totalRMB).toBe(200 * 14 + 500);
    expect(quote.totalUSD).toBeCloseTo(quote.totalRMB / RMB_TO_USD, 1);
  });

  it("calculates warehouse pickup quote", () => {
    const quote = calculateWarehousePickupQuote("la", 600, 400);
    expect(quote.chargeableWeightKG).toBe(600);
    expect(quote.ratePerKG_RMB).toBe(8.5); // 500+ KG tier
    expect(quote.lastMileSurchargeRMB).toBe(0);
  });
});
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with a descriptive message
4. Push and open a Pull Request

**Code style:** TypeScript strict mode, Tailwind utility classes, shadcn/ui components.

---

## License

Private — © 2026 Doge Consulting Ltd. All rights reserved.
