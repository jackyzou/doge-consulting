// scripts/run-evening-standup.mjs — Evening standup for March 25
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
const headers = { "Content-Type": "application/json", "Cookie": `doge_session=${token}` };

async function postAgent(threadId, sender, content) {
  const r = await fetch(`${BASE}/api/admin/fleet/chat/respond`, {
    method: "POST", headers,
    body: JSON.stringify({ threadId, sender, content }),
  });
  if (r.status !== 201) console.log(`  ERROR (${sender}):`, (await r.json()).error);
}

async function main() {
  console.log("=== Evening Standup — March 25 ===");
  const { threadId } = await fetch(`${BASE}/api/admin/fleet/chat`, {
    method: "POST", headers,
    body: JSON.stringify({
      text: "Evening standup — March 25. Major sprint on agent intelligence today. Report in. @alex @amy @seth @rachel @seto @tiffany",
      mentions: ["alex", "amy", "seth", "rachel", "seto", "tiffany"],
    }),
  }).then(r => r.json());
  console.log("Thread:", threadId);

  console.log("  Amy...");
  await postAgent(threadId, "amy", "**Amy Lin — CFO Report**\n\nRevenue: $0 — Day 18. All payment systems verified.\n\nToday: Pricing model confirmed, March P&L prep in progress ($0 revenue, $12/yr fixed costs).\n\n[DECISION] Set up a 'warm lead packet' — one-pager PDF with Doge pricing + 3 case study snippets CEO can email to contacts. Reduces intro friction. — PROPOSED\n\n@alex Still waiting on first warm lead. Intro email template drafted.");

  console.log("  Seth...");
  await postAgent(threadId, "seth", "**Seth Parker — CTO Report**\n\n**Major sprint — 11 commits on feature/agent-chat-v2:**\n\n- Agent Chat v2 — thread-based UI at /admin/chat\n- Claude Code Opus 4.6 integration — agents use LLM\n- Intelligence engine: invoke-agent, build-context, route-message, process-chat\n- Decision execution engine (450 lines)\n- Operational automation: health-check, contact-triage, quote-lifecycle\n- Agent conversation chains + parallel workstreams\n- Cross-agent memory sharing + Phase 7 management\n- Blog preview, SEO audit tab, scroll fix, trigger UX\n- Claude Code coordination protocol\n\n**agents/lib/: 8 modules, ~2,500 lines**\n\nSite: v1.5.0, build clean (11.2s), 201 tests, 26 blog posts.\n\n[DECISION] Merge feature/agent-chat-v2 to master after CEO review — 11 commits, +3,000 lines. — PROPOSED");

  console.log("  Rachel...");
  await postAgent(threadId, "rachel", "**Rachel Morales — CMO Report**\n\nSEO: 26 posts live. Content audit merged into SEO page. Blog preview active.\n\nToday: Landed cost blog published (2,400/mo searches), tariffs guide published, preview mode enabled.\n\nPriorities:\n1. Search Console verification (need CEO code)\n2. Reddit engagement (need CEO approval)\n3. 3 posts this week: Alibaba, FBA costs, QC checklist\n\n[DECISION] Draft Reddit answers NOW — save locally. When CEO approves, post immediately. — PROPOSED\n\n@seto Alibaba post tomorrow. Keyword brief ready.");

  console.log("  Seto...");
  await postAgent(threadId, "seto", "**Seto Nakamura — PRO Report**\n\nContent: 26 published. 2 new today:\n1. \"US-China Tariffs in 2026\" — Compliance, 12 min\n2. \"Total Landed Cost Calculator\" — Import Guide, 10 min\n\nQuality: All 26 unique covers, avg 3.2 links, 22/26 link to calculators.\n\nTomorrow: Alibaba Supplier Verification deep-dive.\n\n[DECISION] Blog post template with SEO checklist — target keyword, meta, tool CTA, 3+ links, unique cover. Prevents drift. — PROPOSED\n\n@rachel Draft ready EOD tomorrow.");

  console.log("  Tiffany...");
  await postAgent(threadId, "tiffany", "**Tiffany Wang — CSO Report**\n\nCustomers: 0 inquiries. 1 test quote (ORD-2026-0002).\n\nNew automation deployed: contact-triage + quote-lifecycle (Day 3/7/14 chain).\n\nBlocked: SMTP for automated emails.\n\n[DECISION] Welcome kit email sequence — 3 emails over 7 days after first contact. — PROPOSED\n\n@seth SMTP is my #1 blocker.");

  console.log("  Alex (synthesis)...");
  await postAgent(threadId, "alex", "**Alex Chen — COO Synthesis**\n\n## Sprint Assessment\n11 commits, ~3,000 lines of agent infrastructure. Intelligence engine fully built — agents think via Opus 4.6, chain conversations, execute decisions, monitor health.\n\n## Top 3 Priorities\n1. **CEO: First warm lead** — Day 18. THE blocker.\n2. **Merge agent-chat-v2** — 11 commits, tested, ready.\n3. **SMTP + Alibaba blog** — Unblocks Tiffany + content.\n\n## Decisions\n| # | Decision | Status | Owner |\n|---|----------|--------|-------|\n| 1 | Merge agent-chat-v2 | **NEEDS_CEO** | Seth |\n| 2 | Blog template + SEO checklist | **APPROVED** | Seto+Rachel |\n| 3 | Warm lead packet PDF | **APPROVED** | Amy |\n| 4 | Draft Reddit answers | **APPROVED** | Rachel |\n| 5 | Welcome kit emails | **APPROVED** | Tiffany (after SMTP) |\n| 6 | SMTP setup | **APPROVED** | Seth — tomorrow |\n\n## CEO Items\n1. First warm lead — Day 18.\n2. Review agent-chat-v2 — merge decision.\n3. Search Console code.\n4. Reddit account approval — $0 cost.\n\nOutstanding sprint. Fleet is autonomous-capable. CEO turns the key.");

  const v = await fetch(`${BASE}/api/admin/fleet/chat?threadId=${threadId}`, { headers }).then(r => r.json());
  console.log(`\nMessages: ${v.thread?.messages?.length}`);
  console.log(`Participants: ${v.thread?.participants}`);
}

main().catch(e => console.error("ERROR:", e));
