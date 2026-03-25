// scripts/create-standup-thread.mjs — Create a standup chat thread with all agent reports
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, "..", ".env.local"), "utf8");
const JWT_SECRET = envContent.match(/JWT_SECRET=(.+)/)[1].trim();
const jwt = await import("jsonwebtoken");

const token = jwt.default.sign(
  { id: "admin", email: "admin@doge-consulting.com", role: "admin", name: "Jacky" },
  JWT_SECRET, { expiresIn: "1h" }
);

const BASE = "http://localhost:3000";
const ceoHeaders = { "Content-Type": "application/json", "Cookie": `doge_session=${token}` };

async function postCeo(text, mentions) {
  const r = await fetch(`${BASE}/api/admin/fleet/chat`, {
    method: "POST", headers: ceoHeaders,
    body: JSON.stringify({ text, mentions }),
  });
  return r.json();
}

async function postAgent(threadId, sender, content) {
  const r = await fetch(`${BASE}/api/admin/fleet/chat/respond`, {
    method: "POST", headers: ceoHeaders,
    body: JSON.stringify({ threadId, sender, content }),
  });
  if (r.status !== 201) {
    const err = await r.json();
    console.log(`  ERROR (${sender}):`, err.error);
  }
  return r.json();
}

async function main() {
  // Create standup thread
  console.log("=== Creating Daily Standup Thread (March 25) ===");
  const { threadId } = await postCeo(
    "Good morning team. Daily standup for March 25. Report status, priorities, and propose at least one [DECISION]. @alex @amy @seth @rachel @seto @tiffany",
    ["alex", "amy", "seth", "rachel", "seto", "tiffany"]
  );
  console.log("Thread:", threadId);

  // Amy
  console.log("  Amy...");
  await postAgent(threadId, "amy", `**Amy Lin — CFO Report**

**Revenue:** $0 — Day 18. All systems operational but no pipeline.

**Status:**
- Airwallex: Verified working (CEO tested March 19)
- Pricing: Finalized — free consulting + embedded margins (10% freight min $150, 15% product)
- March P&L: Will close at $0. Fixed costs: domain $12/yr only.

**Priorities:**
1. First warm lead from CEO network
2. Draft warm lead email template
3. March P&L close-out by 3/31

[DECISION] Create referral incentive — 5% commission for anyone who refers a paying customer. Low-risk way to activate CEO's network. — PROPOSED

@alex Day 18 with $0 — what's the timeline for CEO's first warm lead?`);

  // Seth
  console.log("  Seth...");
  await postAgent(threadId, "seth", `**Seth Parker — CTO Report**

**Site Health:** v1.5.0 stable. Build clean (8.3s), 201 tests passing.

**Completed today:**
- Agent Chat v2 — thread-based UI at /admin/chat
- Claude Code Opus 4.6 integration — agents use LLM for responses
- Blog preview mode (?preview=1 for drafts)
- SEO page — content audit merged as 5th tab
- Webhook hardened, deploy script validates Airwallex env vars
- 26 blog posts (2 pending deploy to prod)

**New infrastructure:**
- ChatThread + ChatMessage Prisma models
- Agent intelligence engine (invoke-agent, build-context, route-message, process-chat)
- Claude Code coordination protocol (CLAUDE_CODE_HANDOFF.md)

[DECISION] SMTP setup with nodemailer — Gmail creds in .env.local. Required for Tiffany's quote followups. — PROPOSED

@rachel Should I push the 2 pending blog posts to production now?`);

  // Rachel
  console.log("  Rachel...");
  await postAgent(threadId, "rachel", `**Rachel Morales — CMO Report**

**SEO:** All Sprint 1-3 complete. 26 blog posts live.

**Channel priorities:**
1. Google SEO — 26 posts solid foundation, need Search Console to track
2. Reddit — r/FBA (470K), r/importing — ready for genuine engagement
3. Blog gap filled — landed cost guide drives to 3 calculator tools

**Blockers:**
- No Google Search Console access
- Reddit account needs CEO approval

[DECISION] Publish 3 blog posts this week: Alibaba verification (2,400/mo searches), Amazon FBA costs (3,100/mo), QC checklist (1,800/mo). @seto writes, I optimize SEO. — PROPOSED

@seth Yes, push the 2 pending posts now. Every day = lost indexing time.`);

  // Seto
  console.log("  Seto...");
  await postAgent(threadId, "seto", `**Seto Nakamura — PRO Report**

**Content:** 26 published. Latest: US-China Tariffs guide + Landed Cost calculator guide.

**Quality audit:** All 26 posts have unique covers, avg 3.2 internal links, 22/26 link to calculators.

**Next 3 priorities (per Rachel's SEO brief):**
1. Alibaba Supplier Verification (deep refresh) — 2,000 words
2. Amazon FBA Shipping Costs (2026 update) — 2,500 words
3. QC Inspection Checklist — 1,500 words

[DECISION] Write Alibaba verification post today. Research done, cover verified. Will include verification scripts + red flag checklist. — PROPOSED

@rachel Draft ready for your SEO review by end of day.`);

  // Tiffany
  console.log("  Tiffany...");
  await postAgent(threadId, "tiffany", `**Tiffany Wang — CSO Report**

**Customers:** 0 new inquiries. 1 pending test quote (CEO's ORD-2026-0002).

**Readiness:**
- Onboarding SOP v1.0: Live
- Quote followup templates: Day 3 + Day 7 drafted
- CRM: Clean, ready
- Payments: Airwallex verified, balance links deployed

**Blocked on:**
- SMTP — need @seth to configure for automated followups
- First warm lead from CEO

[DECISION] After SMTP: full E2E test — create test quote, trigger Day 3 email, verify delivery + CTAs. Test with CEO's email first. — PROPOSED

@seth ETA on SMTP setup?`);

  // Alex synthesis
  console.log("  Alex (synthesis)...");
  await postAgent(threadId, "alex", `**Alex Chen — COO Synthesis**

## Assessment
Day 18, $0 revenue. All tech verified. The machine is built and idling. **We need a customer.**

## Top 3 Priorities
1. **CEO: First warm lead** — Day 18, all systems ready
2. **SMTP setup** — Seth today, unblocks Tiffany's followups
3. **Blog pipeline** — Seto + Rachel: 3 high-intent posts this week

## Decisions
| # | Decision | Status | Owner |
|---|----------|--------|-------|
| 1 | Alibaba blog post today | **APPROVED** | Seto→Rachel |
| 2 | SMTP setup | **APPROVED** | Seth |
| 3 | E2E customer test after SMTP | **APPROVED** | Tiffany+Seth |
| 4 | 3 blog posts this week | **APPROVED** | Seto+Rachel |
| 5 | Referral program (5%) | **NEEDS_CEO** | Amy |
| 6 | Push 2 pending posts to prod | **APPROVED** | Seth |

## CEO Items
1. **First warm lead** — Day 18. 
2. **Search Console verification code** — Rachel needs it.
3. **Reddit account approval** — $0 cost.
4. **Referral program** — Amy's 5% proposal, needs yes/no.

The team is executing. The single blocker is pipeline.`);

  // Verify
  console.log("\n=== Thread Summary ===");
  const r = await fetch(`${BASE}/api/admin/fleet/chat?threadId=${threadId}`, { headers: ceoHeaders });
  const d = await r.json();
  console.log(`Messages: ${d.thread?.messages?.length}`);
  console.log(`Participants: ${d.thread?.participants}`);
  d.thread?.messages?.forEach((m, i) => 
    console.log(`  ${i+1}. [${m.sender}] ${m.content.substring(0, 80)}...`)
  );
}

main().catch(e => console.error("ERROR:", e));
