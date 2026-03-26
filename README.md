# 🐕 Doge Consulting

**AI-powered product sourcing & shipping from China to the USA.**

Full-stack web application for a logistics company connecting US businesses with China's manufacturing hubs. Features instant freight quotes, live vessel tracking, AI product matching, 8 free import tools, 26 SEO blog posts, an autonomous AI agent fleet, and a full admin CRM.

**Live:** [doge-consulting.com](https://doge-consulting.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, TypeScript) |
| Database | [Prisma 7](https://www.prisma.io) + SQLite (via `better-sqlite3` adapter) |
| Auth | JWT sessions + Google OAuth, bcrypt password hashing |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (25+ components) |
| Animations | [Framer Motion 12](https://www.framer.com/motion/) |
| Payments | [Airwallex](https://www.airwallex.com) (live — credit card + balance links) |
| Email | [Nodemailer](https://nodemailer.com) — branded transactional emails (7 templates, 5 languages) |
| 3D | [Three.js](https://threejs.org) + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) |
| PDF | [jsPDF](https://github.com/parallax/jsPDF) — invoice, receipt, PO generation |
| Agent AI | Claude Code Opus 4.6 (1M context) — 6 autonomous agents |
| Tests | [Vitest](https://vitest.dev) (201 tests) + [Playwright](https://playwright.dev) |
| Deploy | Docker Compose + Cloudflare Tunnel, zero-downtime blue-green deploy |
| i18n | 5 languages (EN, 中文简, 中文繁, ES, FR) |

**Brand colors:** Navy `#0F2B46` · Teal `#2EC4B6` · Gold `#F0A500`

---

## Quick Start

```bash
git clone https://github.com/jackyzou/doge-consulting.git
cd doge-consulting
npm install
npx prisma generate && npx prisma migrate dev
node prisma/seed.mjs          # Admin user + sample data
node prisma/seed-blog.mjs     # 22 blog posts
npm run dev                   # http://localhost:3000
```

**Default admin:** `admin@dogeconsulting.com` / `admin123`

---

## What's In the Box

### 93 Routes (Pages + APIs)

**Public Pages (21):**
Homepage, About, Services, Contact, FAQ, Quote Calculator, Blog (22 posts), Case Studies, Catalog, Glossary, Whitepaper, Privacy, Tracking

**Free Tools (8):**
- CBM Calculator — cubic meter & volumetric weight
- Duty & Tariff Calculator — HTS code lookup with Section 301 surcharges
- Revenue Calculator — import business P&L projector
- Freight Rate Calculator — 4 origins × 7 US destinations
- Live Vessel Map — real-time global vessel positions
- Container Tracker — track by container number
- Shipping Tracker — route & transit time lookup
- 3D Room Visualizer — furniture layout in Three.js

**Admin Panel (14 pages):**
Dashboard, Orders, Quotes, Products, Customers, Documents, Payments, Coupons, Blog Manager, Shipments, Analytics, SEO (5 tabs), Agent Chat, Operations (fleet standups/decisions)

**Customer Portal (6 pages):**
Dashboard, Quotes, Orders, Tracking, Documents, Profile

**APIs (40+ endpoints):**
Auth, admin CRUD, customer-scoped data, public blog/catalog, payment processing, contact form, newsletter, webhooks

### Blog (26 Posts)

SEO-optimized long-form content covering:
- Import guides (shipping, customs, tariffs, FBA, landed cost calculator)
- Sourcing guides (Shenzhen, Yiwu, Guangzhou, Foshan, Dongguan)
- Market analysis (freight rates, humanoid robots, DDR memory, LED lighting)
- Trade policy (Section 301 tariffs, compliance, US-China 2026 guide)

### SEO

- Dynamic sitemap with hreflang for 5 languages
- robots.txt with targeted allows/disallows
- JSON-LD structured data (Organization, WebSite, FAQPage, Article, WebApplication)
- Per-page OpenGraph + Twitter metadata
- Google Search Console ready

---

## Agent Fleet

Autonomous AI employee fleet powered by Claude Code Opus 4.6 (1M context). 6 specialist agents operate as a collaborative leadership team with daily standups, decision tracking, and autonomous execution.

| Agent | Role | Capabilities |
|-------|------|-------------|
| Alex Chen | Co-CEO/COO | Synthesizes reports, approves decisions, coordinates team |
| Amy Lin | CFO | Finance, pricing, sales operations, P&L |
| Seth Parker | CTO | Code changes, deployments, site health, SEO tech |
| Rachel Morales | CMO | SEO strategy, content distribution, Reddit, analytics |
| Seto Nakamura | PRO/Editor | Blog content, deep research, news monitoring, PR |
| Tiffany Wang | CSO | Customer service, CRM, quote management, onboarding |

**12 Runtime Modules** (`agents/lib/`):
- `invoke-agent` — Spawn Claude CLI sessions per agent with full context
- `build-context` — Assemble profile + CoC + memory + cross-agent context
- `execute-decision` — Autonomous code/blog execution with guard rails
- `agent-chain` — Real-time @mention conversation chains (5-round depth)
- `workstreams` — Parallel content/sales/tech pipeline orchestration
- `contact-triage` / `quote-lifecycle` / `health-check` — Operational automation
- `memory-manager` — Compaction, CEO feedback learning, performance tracking

```bash
node agents/run-fleet.mjs                      # Full standup (7 phases)
node agents/run-fleet.mjs --workstream content  # Content pipeline
node agents/run-fleet.mjs --agent seth          # Single agent
```

---

```
src/
├── app/                      # Next.js App Router (93 routes)
│   ├── page.tsx              # Homepage (8 animated sections)
│   ├── admin/                # Admin panel (12 pages)
│   ├── account/              # Customer portal (6 pages)
│   ├── tools/                # 8 free tools + index page
│   ├── blog/                 # Blog listing + [slug] pages
│   └── api/                  # 40+ API endpoints
├── components/               # React components
│   ├── home/                 # Landing page sections
│   ├── layout/               # Header, Footer
│   ├── seo/                  # JSON-LD structured data
│   └── ui/                   # shadcn/ui primitives (25+)
├── lib/                      # Business logic
│   ├── auth.ts               # JWT + OAuth + bcrypt
│   ├── shipping-calculator.ts # Zone-based rate engine
│   ├── email-notifications.ts # Branded transactional emails
│   ├── pdf.ts                # Document generation
│   └── i18n.tsx              # 5-language i18n system
├── messages/                 # Translation files (en, zh-CN, zh-TW, es, fr)
└── test/                     # Test setup + helpers

prisma/
├── schema.prisma             # 16+ models
├── seed.mjs                  # Admin + sample data
├── seed-blog.mjs             # 22 blog posts
└── migrations/               # Migration history

agents/                       # AI agent fleet
│   ├── run-fleet.mjs         # Standup runner (7 phases)
│   ├── lib/                  # 12 runtime modules (invoke, execute, triage, etc.)
│   ├── profiles/             # Agent personas (local only)
│   ├── memory/               # Persistent agent memory (local only)
│   └── logs/                 # Daily standup logs (local only)
scripts/                      # Deployment & ops scripts
docs/                         # Deployment guides
e2e/                          # Playwright E2E tests
```

---

## Testing

```bash
npx vitest              # 17 suites, 191 tests
npx vitest --coverage   # With V8 coverage
npx playwright test     # E2E tests
```

| Suites | Coverage |
|---|---|
| Auth, shipping calculator, PDF, email, sequence numbers | Core business logic |
| Dashboard, quotes, orders, products, customers, payments, settings APIs | API contract shapes |
| Auth routes, login page | Auth flow |
| Landed cost calculator, whitepaper access | Utility functions |

---

## Deployment

### Docker (Production)

```bash
docker compose build
docker compose up -d
```

Uses Cloudflare Tunnel for HTTPS. Zero-downtime blue-green deploy via `scripts/auto-deploy.ps1`.

See [docs/DEPLOY.md](docs/DEPLOY.md) and [docs/SELF-HOST.md](docs/SELF-HOST.md) for full instructions.

### Environment Variables

Copy `.env.local.example` → `.env.local`. The app runs in demo mode with no env vars.

For production: JWT_SECRET, SMTP credentials, Google OAuth, Airwallex keys, APP_URL.

---

## License

Private — © 2026 Doge Consulting Group Limited. All rights reserved.
