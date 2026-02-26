# 🐕 Doge Consulting

**Product sourcing & shipping from mainland China to the USA.**

Doge Consulting connects US businesses and consumers with China's manufacturing hubs—furniture and electronics from Shenzhen, small commodities from Yiwu, and more. This repository contains the company website: a Next.js application with an instant quote calculator, shipment tracking, Airwallex payment integration, and an admin panel.

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
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, TypeScript) |
| Database | [Prisma 7](https://www.prisma.io) + SQLite (via `better-sqlite3` adapter) |
| Auth | JWT sessions with httpOnly cookies, bcrypt password hashing |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (25+ components) |
| Animations | [Framer Motion 12](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev) + custom polygon Doge SVG |
| Payments | [Airwallex](https://www.airwallex.com) (demo mode) |
| Validation | [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) — invoice, receipt, PO generation |
| Email | [Nodemailer](https://nodemailer.com) — quote sent, payment received, order confirmed |
| Unit Tests | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |
| E2E Tests | [Playwright](https://playwright.dev) |
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

# 3. Set up the database
npx prisma generate          # Generate Prisma client types
npx prisma migrate dev       # Apply migrations to SQLite
node prisma/seed.mjs         # Seed admin user + sample data

# 4. Start the dev server
npm run dev
```

Open **http://localhost:3000** — the page hot-reloads as you edit.

### Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dogeconsulting.com` | `admin123` |

Customers can self-register via the **Sign Up** tab on `/login`.

---

## Project Structure

```
prisma/
├── schema.prisma              # Database schema (User, Product, Quote, Order, Payment, Document…)
├── seed.mjs                   # Seed script (admin user, sample products, demo data)
├── dev.db                     # SQLite database file
└── migrations/                # Prisma migration history

e2e/
├── public-pages.spec.ts       # Smoke tests for all public routes
└── auth-flow.spec.ts          # Login, signup, redirect tests

src/
├── proxy.ts                   # Edge middleware — route protection for /admin & /account
├── app/
│   ├── layout.tsx             # Root layout (Header + Footer + Toaster)
│   ├── page.tsx               # Home (8 animated sections)
│   ├── globals.css            # Tailwind + custom CSS variables
│   ├── about/page.tsx         # Company story & locations
│   ├── contact/page.tsx       # Contact form & info
│   ├── faq/page.tsx           # FAQ accordion (4 categories)
│   ├── login/page.tsx         # Login + signup tabs (role-based redirect)
│   ├── payment/page.tsx       # Airwallex checkout demo
│   ├── quote/page.tsx         # 4-step shipping quote calculator
│   ├── services/page.tsx      # Service cards & "Why Choose Us"
│   ├── track/page.tsx         # Shipment tracking with timeline
│   ├── pay/[token]/page.tsx   # Payment link landing page
│   │
│   ├── admin/                 # ── Admin Panel (role: admin) ──
│   │   ├── layout.tsx         # Sidebar navigation
│   │   ├── page.tsx           # Dashboard (revenue, order/quote status, charts)
│   │   ├── orders/page.tsx    # Order management (status, payments, shipping)
│   │   ├── quotes/page.tsx    # Quote CRUD (create, edit, send, convert to order)
│   │   ├── products/page.tsx  # Product catalog management
│   │   ├── customers/page.tsx # CRM — customer list with quote/order counts
│   │   ├── documents/page.tsx # Invoice, receipt, PO generation & download
│   │   ├── settings/page.tsx  # Shipping rules, Airwallex config, email
│   │   └── __tests__/         # Dashboard page tests
│   │
│   ├── account/               # ── Customer Portal (role: user) ──
│   │   ├── layout.tsx         # Sidebar navigation (My Account)
│   │   ├── page.tsx           # Customer dashboard (stats, recent activity)
│   │   ├── quotes/page.tsx    # View quotes, pay deposit
│   │   ├── orders/page.tsx    # Order detail with shipment timeline
│   │   ├── tracking/page.tsx  # Visual shipment progress tracker
│   │   └── documents/page.tsx # Download invoices & receipts
│   │
│   └── api/
│       ├── auth/              # Login, signup, me, logout routes
│       ├── admin/             # Dashboard, quotes, orders, products, customers,
│       │                      #   payments, documents, settings, shipping routes
│       ├── customer/          # Customer-scoped quotes, orders, documents
│       ├── catalog/           # Public product catalog
│       ├── contact/           # Contact form submission
│       ├── quote/             # Public quote submission (rate-limited)
│       ├── pay/               # Payment link validation
│       ├── payment/           # Airwallex payment processing
│       └── webhooks/          # Airwallex webhook handler
│
├── components/
│   ├── home/                  # Landing page sections (8 files)
│   ├── layout/
│   │   ├── Header.tsx         # Sticky nav, auth state, language toggle, mobile menu
│   │   └── Footer.tsx         # 4-column footer
│   └── ui/                    # shadcn/ui primitives (25+) + custom
│
├── lib/
│   ├── auth.ts                # JWT auth, password hashing, session helpers
│   ├── db.ts                  # Prisma client singleton
│   ├── email-notifications.ts # Transactional email (quote sent, payment, etc.)
│   ├── pdf.ts                 # PDF generation (invoice, receipt, PO, proforma)
│   ├── sequence.ts            # Auto-increment document numbers (QT-, ORD-, PAY-…)
│   ├── shipping-calculator.ts # Zone-based rate engine (partner rates)
│   ├── tracking.ts            # Shipment status types & demo data
│   ├── airwallex.ts           # Payment helpers & formatCurrency
│   ├── i18n.tsx               # Internationalization (en, zh-CN, zh-TW, es, fr)
│   ├── utils.ts               # cn() class merge utility
│   └── __tests__/             # Unit tests for auth, email, pdf, sequence, shipping
│
├── messages/                  # i18n translation files
│   ├── en.ts, zh-CN.ts, zh-TW.ts, es.ts, fr.ts
│
├── generated/prisma/          # Auto-generated Prisma client types
│
└── test/
    ├── setup.ts               # Vitest global setup (mocks for next/navigation, sonner)
    └── helpers.ts             # Test factories (createTestQuote, mockAdminSession, etc.)
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack (hot reload) |
| `npm run build` | Production build (TypeScript check + static generation) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npx vitest` | Run unit tests (Vitest) |
| `npx vitest --coverage` | Run tests with V8 coverage report |
| `npx playwright test` | Run E2E tests (requires dev server) |
| `npx prisma migrate dev` | Apply database migrations |
| `npx prisma generate` | Regenerate Prisma client types |
| `npx prisma studio` | Open Prisma Studio DB browser |

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

### Public Website
- **🐕 Polygon Doge Logo** — Custom geometric Shiba Inu SVG in brand colors
- **🌍 Multilingual** — 5 languages (EN, 中文简, 中文繁, ES, FR) with toggle in header
- **📦 Quote Calculator** — 4-step wizard: items → destination → summary → quote with RMB/USD dual display
- **🚢 Shipment Tracking** — Timeline UI with milestone statuses and demo data (try `DC-2026-001`)
- **💳 Airwallex Payments** — Credit card & bank transfer (demo/sandbox mode)
- **📱 Fully Responsive** — Mobile-first design with slide-out navigation
- **🎬 Motion** — Framer Motion scroll-triggered animations throughout

### Authentication & Accounts
- **🔐 JWT Auth** — Secure httpOnly cookie sessions with bcrypt password hashing
- **👤 Login / Signup** — Tabbed login page; role-based redirect (admin → `/admin`, user → `/account`)
- **🛡️ Route Protection** — Edge middleware guards `/admin/*` (admin only) and `/account/*` (any user)
- **📡 Live Auth State** — Header updates on login/logout via `pathname` watcher + custom DOM events

### Admin Panel (`/admin`)
- **📊 Dashboard** — Revenue from orders, order/quote status breakdowns, monthly revenue chart, recent activity
- **📋 Quote Management** — Create, edit, send, convert quotes to orders; auto-generated sequence numbers
- **📦 Order Management** — Status transitions, payment recording, shipping updates, document generation
- **🛒 Product Catalog** — CRUD for products with SKU, dimensions, pricing, catalog/link URL
- **👥 CRM** — Customer list with search, order/quote/payment counts
- **📄 Documents** — Generate & download PDF invoices, receipts, purchase orders
- **💰 Payments** — Record payments, auto-update balances, email notifications
- **⚙️ Settings** — Shipping rules, Airwallex config, email settings

### Customer Portal (`/account`)
- **🏠 Dashboard** — Stats overview, recent quotes and orders
- **📋 My Quotes** — View received quotes, pay deposit via payment link
- **📦 My Orders** — Order detail with item table, payment history, shipment timeline
- **🚚 Track Shipments** — Visual progress bar across all order statuses
- **📄 Documents** — Download invoices and receipts

### Developer Experience
- **✅ 13 Test Suites** — Vitest unit tests covering auth, API contracts, shipping calculator, PDF, email, sequence generation
- **🎭 E2E Tests** — Playwright tests for public pages and auth flows
- **📐 Contract Tests** — Validate API response shapes (e.g., `{ orders: [...] }` not flat arrays)
- **🧩 Test Helpers** — Factory functions for mock data, Prisma mocks, auth session mocks

---

## Environment Variables

The app runs fully in **demo mode** with no env vars required. For production, create a `.env.local`:

```env
# Database (default: SQLite file in prisma/dev.db)
DATABASE_URL="file:./dev.db"

# Auth (auto-generated fallback in dev)
JWT_SECRET=your_jwt_secret_here

# Email notifications (optional — logs to console if unset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="Doge Consulting <noreply@dogeconsulting.com>"

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

### Unit Tests (Vitest)

The project has 13 test suites covering core business logic and API contracts:

```bash
# Run all tests
npx vitest

# Run with coverage
npx vitest --coverage

# Run a specific suite
npx vitest shipping-calculator
```

| Suite | File | What It Tests |
|---|---|---|
| Auth | `src/lib/__tests__/auth.test.ts` | Password hashing, JWT create/verify, cookie options |
| Shipping Calculator | `src/lib/__tests__/shipping-calculator.test.ts` | All 8 zones, 5 warehouse cities, volumetric weight, rate tiers |
| PDF Generation | `src/lib/__tests__/pdf.test.ts` | Invoice, receipt, PO, proforma PDF buffer output |
| Email Notifications | `src/lib/__tests__/email-notifications.test.ts` | All 5 email types log to database correctly |
| Sequence Numbers | `src/lib/__tests__/sequence.test.ts` | Auto-increment for QT, ORD, PAY, INV, REC, PO prefixes |
| Dashboard API | `src/app/api/admin/__tests__/dashboard-api.test.ts` | Stats shape, monthlyRevenue as object, status counts |
| Dashboard Page | `src/app/admin/__tests__/dashboard-page.test.tsx` | Data transform, loading state, empty states |
| Quotes API | `src/app/api/admin/__tests__/quotes-api.test.ts` | GET/POST contract, subtotal/total calculation |
| Orders API | `src/app/api/admin/__tests__/orders-api.test.ts` | Response shape, status filter, search, includes |
| Products API | `src/app/api/admin/__tests__/products-api.test.ts` | Response shape, category/search/catalog filters |
| Customers API | `src/app/api/admin/__tests__/customers-api.test.ts` | Response shape, search, `_count` aggregation |
| Payments API | `src/app/api/admin/__tests__/payments-api.test.ts` | Payment recording, balance update, email dispatch |
| Auth Routes | `src/app/api/auth/__tests__/auth-routes.test.ts` | Login cookie, 401 on bad creds, session endpoint |
| Login Page | `src/app/login/__tests__/login-page.test.tsx` | Form rendering, error display, role-based redirect |

### E2E Tests (Playwright)

```bash
# Install browsers (first time)
npx playwright install

# Run E2E tests
npx playwright test
```

| Suite | File | What It Tests |
|---|---|---|
| Public Pages | `e2e/public-pages.spec.ts` | All 8 public routes render without crashing |
| Auth Flow | `e2e/auth-flow.spec.ts` | Invalid login error, login page renders, admin redirect |

### Manual Smoke Tests

| Page | URL | What to Verify |
|---|---|---|
| Home | `/` | Hero animations, stats bar, 8 sections render |
| Quote | `/quote` | 4-step wizard → submits to database |
| Tracking | `/track` | Enter `DC-2026-001` to see timeline |
| Login | `/login` | Login tab + signup tab; admin → `/admin`, user → `/account` |
| Admin | `/admin` | Dashboard stats, revenue chart, order/quote breakdowns |
| Admin Quotes | `/admin/quotes` | Create, edit (wide dialog), send, convert to order |
| Customer Portal | `/account` | Stats, recent quotes/orders |
| Customer Tracking | `/account/tracking` | Visual progress bar, status timeline |

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
