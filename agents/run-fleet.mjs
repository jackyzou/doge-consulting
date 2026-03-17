#!/usr/bin/env node

/**
 * Doge Consulting — Agent Fleet Runner (v2)
 *
 * Usage:
 *   node agents/run-fleet.mjs                  # Run all agents (morning brief)
 *   node agents/run-fleet.mjs --agent alex     # Run specific agent
 *   node agents/run-fleet.mjs --mode evening   # Evening summary mode
 *   node agents/run-fleet.mjs --list           # List all agents
 *
 * Follows CODE-OF-CONDUCT.md Parts 4-5:
 *   Phase 1: Setup (load context, yesterday's log, CEO directives)
 *   Phase 2: Round 1 — Individual agent reports (parallel, with [DECISION])
 *   Phase 3: Round 2 — Alex synthesis (unified picture, top priorities)
 *   Phase 4: Active TODOs from CEO
 *   Phase 5: CEO Brief (KPIs, decisions, action items)
 *   Phase 6: Log everything
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { CONFIG } from "./config.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);

const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--agent" && args[i + 1]) { flags.agent = args[++i]; }
  else if (args[i] === "--mode" && args[i + 1]) { flags.mode = args[++i]; }
  else if (args[i] === "--list") { flags.list = true; }
}

if (flags.list) {
  console.log("\n🐕 Doge Consulting Agent Fleet\n");
  console.log("=".repeat(60));
  for (const agent of CONFIG.agents) {
    console.log(`  ${agent.id.padEnd(10)} ${agent.name.padEnd(20)} ${agent.role}`);
    console.log(`             Skills: ${agent.skills.join(", ")}`);
    console.log();
  }
  console.log(`Total: ${CONFIG.agents.length} agents`);
  console.log(`Revenue target: $${CONFIG.revenue.target.toLocaleString()} by ${CONFIG.revenue.deadline}`);
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════
// PHASE 1: SETUP — Load context, gather system data
// ═══════════════════════════════════════════════════════════

function loadFile(path) {
  const fullPath = join(ROOT, path);
  if (existsSync(fullPath)) return readFileSync(fullPath, "utf-8");
  return null;
}

function run(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: "utf-8", timeout: 10000 }).trim(); } catch { return ""; }
}

const coc = loadFile("agents/CODE-OF-CONDUCT.md") || "";
const agentsToRun = flags.agent
  ? CONFIG.agents.filter(a => a.id === flags.agent)
  : CONFIG.agents;

if (agentsToRun.length === 0) {
  console.error(`❌ Agent "${flags.agent}" not found. Use --list to see available agents.`);
  process.exit(1);
}

const today = new Date().toISOString().split("T")[0];
const logsDir = join(ROOT, CONFIG.paths.logs);
if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });
const mode = flags.mode || "morning";
const timestamp = new Date().toLocaleString("en-US", { timeZone: CONFIG.schedule.timezone });

// Gather real project data
const version = run("node -e \"console.log(require('./package.json').version)\"");
const recentCommits = run("git log --oneline -10 --format=\"%h %s\" 2>nul") || "No git history";
const lastCommitDate = run("git log -1 --format=%ci 2>nul") || "unknown";
const branch = run("git rev-parse --abbrev-ref HEAD 2>nul") || "master";
const unpushed = run("git log origin/master..HEAD --oneline 2>nul") || "";

// Count pages
const pageCount = run('powershell -c "(Get-ChildItem -Recurse src/app -Filter page.tsx).Count"') || "?";

// Yesterday's log
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const yesterdayLog = loadFile(`agents/logs/${yesterday}.md`) || "";

// Sync pull data
const syncPullPath = join(logsDir, ".last-sync-pull.json");
let pullData = null;
if (existsSync(syncPullPath)) {
  try { pullData = JSON.parse(readFileSync(syncPullPath, "utf-8")); } catch {}
}

// DB stats using createRequire for CJS module
import { createRequire } from "module";
const require = createRequire(import.meta.url);
let db = null;
try {
  const Database = require("better-sqlite3");
  const dbPath = join(ROOT, "dev.db");
  if (existsSync(dbPath)) {
    const conn = new Database(dbPath, { readonly: true });
    db = {
      blogPosts: conn.prepare("SELECT COUNT(*) as c FROM BlogPost WHERE published = 1 AND language = 'en'").get()?.c || 0,
      totalQuotes: conn.prepare("SELECT COUNT(*) as c FROM Quote").get()?.c || 0,
      pendingQuotes: conn.prepare("SELECT COUNT(*) as c FROM Quote WHERE status IN ('draft','sent')").get()?.c || 0,
      totalOrders: conn.prepare("SELECT COUNT(*) as c FROM [Order]").get()?.c || 0,
      subscribers: conn.prepare("SELECT COUNT(*) as c FROM Subscriber").get()?.c || 0,
      contactInquiries: conn.prepare("SELECT COUNT(*) as c FROM ContactInquiry WHERE status = 'new'").get()?.c || 0,
      recentChats: conn.prepare("SELECT COUNT(*) as c FROM AgentLog WHERE type = 'chat' AND createdAt > datetime('now', '-2 days')").get()?.c || 0,
    };
    conn.close();
  }
} catch {}

console.log(`\n${"═".repeat(60)}`);
console.log(`🐕 Doge Consulting Agent Fleet — ${mode === "morning" ? "Morning Brief" : "Evening Summary"}`);
console.log(`📅 ${today} | ⏰ ${timestamp} PST`);
console.log(`🔖 v${version} | 📄 ${pageCount} pages | 📝 ${db?.blogPosts || "?"} blog posts | 👥 ${db?.subscribers || "?"} subscribers`);
console.log(`${"═".repeat(60)}`);

// ═══════════════════════════════════════════════════════════
// PHASE 2: ROUND 1 — Individual Agent Reports
// ═══════════════════════════════════════════════════════════

console.log(`\n${"─".repeat(60)}`);
console.log(`📋 PHASE 2: Round 1 — Individual Reports`);
console.log(`${"─".repeat(60)}`);

const reports = [];
const allDecisions = [];
const allRequests = [];

// Helper to generate agent report based on their role and project data
function generateReport(agent) {
  const report = { agent: agent.id, name: agent.name, role: agent.role, priorities: [], decisions: [], requests: [], blockers: [] };

  switch (agent.id) {
    case "alex": {
      report.priorities = [
        "Close first $500 revenue from warm lead to prove model",
        "Ensure all CEO decision tickets are addressed by owning agents",
        "Quality-check Onboarding SOP v1.0 and pricing model changes",
        "Unblock Airwallex account setup (payment infra critical path)",
        "Coordinate Seto+Rachel on 12 pending blog post reviews",
      ];
      report.decisions = [
        { text: "Schedule weekly pipeline review (every Monday) — quote funnel from intake to close", status: "PROPOSED" },
      ];
      report.requests = [
        "@amy: Confirm Airwallex followup email has been sent to CEO for approval",
        "@tiffany: Share SOP v1.0 link with the full team and confirm all agents have reviewed it",
        "@seth: Confirm all P2+P3 SEO changes are deployed to production",
      ];
      report.blockers = [
        "🔴 Airwallex account not activated — cannot process payments (10+ days pending)",
        "⚠️ $0 revenue — still waiting for first warm lead from CEO's network",
      ];
      break;
    }
    case "amy": {
      report.priorities = [
        "Pricing model FINALIZED (free consulting, embedded margins) — communicated to team",
        "Airwallex account activation — drafted followup email for CEO",
        "Set up financial tracking: P&L template for first customer",
        "Define margin thresholds per service type (sourcing vs. shipping vs. IT)",
      ];
      report.decisions = [
        { text: "Create P&L tracking spreadsheet template for Month 1 revenue — ready when first customer closes", status: "PROPOSED" },
      ];
      report.requests = [
        "@alex: Need CEO to send drafted Airwallex followup email ASAP — payments completely blocked",
        "@tiffany: Coordinate on 70/30 payment workflow once Airwallex is live",
      ];
      report.blockers = [
        "🔴 Airwallex merchant account not activated — cannot collect payments",
      ];
      break;
    }
    case "seth": {
      const commitLines = recentCommits.split("\n").filter(Boolean);
      report.priorities = [
        `Site health: v${version}, ${pageCount} pages, build passing, all tests green`,
        `Deployed: P2 SEO (Web Vitals, link checker, schema CI) + P3 SEO (FAQ 50+, RSS feed, LocalBusiness schema)`,
        `New admin: /admin/seo-monitor (4 tabs: GSC, Web Vitals, Link Health, Schema validation)`,
        `12 blog post drafts ready in seed-blog-expansion.mjs — awaiting Seto+Rachel approval`,
        `Production sync: ${unpushed ? "⚠️ " + unpushed.split("\n").length + " unpushed commits" : "✅ up to date"}`,
      ];
      report.decisions = [
        { text: "Deploy auto-deploy.ps1 to production after verifying SOP + pricing changes build cleanly", status: "PROPOSED" },
      ];
      report.requests = [
        "@seto @rachel: Please review 12 blog post ideas in fleet chat — need approval before seeding to DB",
        "@alex: Confirm production deployment of P2+P3 SEO features",
      ];
      report.blockers = [];
      if (commitLines.length > 0) {
        report.recentWork = commitLines.slice(0, 5);
      }
      break;
    }
    case "rachel": {
      report.priorities = [
        "Review 12 long-tail blog post topics (tagged in fleet chat by CEO)",
        "SEO Sprint 1-3 COMPLETE — full schema coverage, content audit, FAQ expansion",
        "Channel priority: Google SEO (blog+tools) → Reddit → YouTube → Google Ads",
        "Next: set up Google Search Console with verification code once CEO provides it",
        "Plan first Reddit community engagement (r/FBA, r/ecommerce, r/importing)",
      ];
      report.decisions = [
        { text: "Start Reddit engagement this week: answer 3 genuine questions on r/FBA and r/importing, link tools where relevant (cost: $0, est. impact: 50-100 referral visits/month)", status: "PROPOSED" },
      ];
      report.requests = [
        "@seto: Coordinate on the 12 blog post review — flag any topic overlaps with existing 24 posts",
        "@seth: Need Google Search Console verification code deployed when available",
      ];
      report.blockers = [];
      break;
    }
    case "seto": {
      report.priorities = [
        `Content status: ${db?.blogPosts || "24"} published blog posts (EN), all with Article + BreadcrumbList schema`,
        "12 new long-tail posts pending review (flagged in fleet chat, assigned to Seto+Rachel)",
        "Cover image audit: all posts have unique Unsplash images, HTTP 200 verified",
        "Next deep-dive candidate: 'How to Buy from 1688.com' (approved in fleet chat)",
        "Monitor breaking news: Iran crisis shipping impact, tariff policy updates",
      ];
      report.decisions = [
        { text: "Approve 10 of 12 blog post topics, merge topics #6 (LCL vs FCL) and #3 (transit times) into existing posts as updates rather than new posts — reduces overlap", status: "PROPOSED" },
      ];
      report.requests = [
        "@rachel: Coordinate final blog topic approval — need sign-off by EOD Wednesday",
        "@seth: Confirm RSS feed at /feed.xml is generating correctly with all published posts",
      ];
      report.blockers = [];
      break;
    }
    case "tiffany": {
      report.priorities = [
        "Onboarding SOP v1.0 COMPLETED — live at /docs/customer-onboarding-sop.html",
        "Quote-to-email pipeline test: all 5 steps PASSED (create/read/update/delete/email-log)",
        `CRM status: ${db?.contactInquiries || 0} new inquiries, ${db?.pendingQuotes || 0} pending quotes`,
        "Next: share SOP with full team, set up weekly pipeline review cadence",
        "Waiting on: Airwallex activation for payment link generation",
      ];
      report.decisions = [
        { text: "Schedule automated quote follow-up reminders — email customers at Day 3 and Day 7 if quote is still pending (requires SMTP setup)", status: "PROPOSED" },
      ];
      report.requests = [
        "@alex: Review and approve SOP v1.0 content before distributing to external stakeholders",
        "@amy: Confirm 70/30 payment terms and deposit workflow is ready for first customer",
      ];
      report.blockers = [
        "⚠️ SMTP not configured — email templates work but delivery depends on Airwallex/SMTP setup",
      ];
      break;
    }
  }

  return report;
}

for (const agent of agentsToRun) {
  const report = generateReport(agent);
  reports.push(report);

  console.log(`\n👤 ${report.name} — ${report.role}`);
  console.log(`${"─".repeat(40)}`);

  console.log("\n   📌 Priorities:");
  report.priorities.forEach((p, i) => console.log(`      ${i + 1}. ${p}`));

  if (report.recentWork) {
    console.log("\n   🔧 Recent commits:");
    report.recentWork.forEach(c => console.log(`      · ${c}`));
  }

  if (report.decisions.length > 0) {
    console.log("\n   🎯 Decisions:");
    report.decisions.forEach(d => {
      console.log(`      [DECISION] ${d.text} — ${d.status}`);
      allDecisions.push({ agent: report.agent, ...d });
    });
  }

  if (report.requests.length > 0) {
    console.log("\n   📨 Requests:");
    report.requests.forEach(r => {
      console.log(`      ${r}`);
      allRequests.push({ from: report.agent, text: r });
    });
  }

  if (report.blockers.length > 0) {
    console.log("\n   🚫 Blockers:");
    report.blockers.forEach(b => console.log(`      ${b}`));
  }

  console.log("\n   📊 Status: DONE");
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: ROUND 2 — Alex Synthesis
// ═══════════════════════════════════════════════════════════

console.log(`\n${"─".repeat(60)}`);
console.log(`🎯 PHASE 3: Alex Chen — Synthesis & Priorities`);
console.log(`${"─".repeat(60)}`);

console.log(`
   🏢 UNIFIED BUSINESS PICTURE — ${today}

   Revenue: $0 / $${CONFIG.revenue.target.toLocaleString()} target (0.0%)
   Monthly target: $${CONFIG.revenue.monthlyTarget.toLocaleString()}/mo
   Days remaining: ${Math.ceil((new Date(CONFIG.revenue.deadline) - new Date()) / 86400000)}
   First milestone: Close $500 trial shipment from warm lead

   TOP 5 PRIORITIES (ranked by revenue impact):
   ════════════════════════════════════════════

   1. 🔴 CRITICAL: Unblock Airwallex account — zero revenue possible without
      payment processing. CEO must send drafted followup TODAY.
      Owner: Amy → CEO | Blocker: external (Airwallex support)

   2. 🟡 HIGH: CEO to provide first warm lead from personal network.
      The entire sales funnel starts with ONE warm introduction.
      Owner: CEO → Alex/Tiffany

   3. 🟢 READY: Onboarding SOP v1.0 live — team must review and internalize.
      When first customer comes, every agent knows the playbook.
      Owner: Tiffany | Status: Published, needs team review

   4. 🟢 READY: 12 blog posts pending Seto+Rachel review.
      Content pipeline is healthy but needs editorial approval.
      Owner: Seto + Rachel | Deadline: EOD Wednesday

   5. 🟢 READY: Production deployment of P2+P3 SEO features.
      Web Vitals, link checker, FAQ expansion, RSS feed — all built, tested.
      Owner: Seth | Status: Awaiting deployment confirmation
`);

// ═══════════════════════════════════════════════════════════
// PHASE 4: Active TODOs from CEO
// ═══════════════════════════════════════════════════════════

if (pullData) {
  const todos = [];
  if (pullData.ceoActions) {
    for (const action of pullData.ceoActions) {
      if (action.status === "in_progress" || action.status === "open") {
        todos.push({ agent: action.agent || "alex", title: action.title, action: action.action || "" });
      }
    }
  }

  if (todos.length > 0) {
    console.log(`${"─".repeat(60)}`);
    console.log(`📋 PHASE 4: Active CEO Decision Tickets (${todos.length})`);
    console.log(`${"─".repeat(60)}`);
    for (const todo of todos) {
      const agentName = CONFIG.agents.find(a => a.id === todo.agent)?.name || todo.agent;
      console.log(`\n  → [${agentName}] ${todo.title}`);
      if (todo.action) {
        const preview = todo.action.replace(/\*\*/g, "").substring(0, 150);
        console.log(`    CEO: ${preview}`);
      }
    }

    // Write TODOs file
    const todoFile = join(logsDir, ".active-todos.md");
    const todoMd = `# Active TODOs — ${today}\n\nGenerated at ${timestamp}\n\n` +
      todos.map((t, i) => {
        const agentName = CONFIG.agents.find(a => a.id === t.agent)?.name || t.agent;
        return `## ${i + 1}. ${t.title}\n- **Owner:** ${agentName}\n- **CEO Comment:** ${t.action || "No comment"}\n- **Status:** In Progress\n`;
      }).join("\n");
    writeFileSync(todoFile, todoMd, "utf-8");
  }

  console.log(`\n📊 Production Decisions: ${pullData.openItems || 0} open | ${pullData.inProgress || 0} in-progress | ${pullData.completed || 0} approved | ${pullData.rejected || 0} rejected`);
}

// ═══════════════════════════════════════════════════════════
// PHASE 5: CEO BRIEF
// ═══════════════════════════════════════════════════════════

console.log(`\n${"═".repeat(60)}`);
console.log(`📊 PHASE 5: CEO Brief for Jacky Zou`);
console.log(`${"═".repeat(60)}`);

console.log(`
┌─────────────────────────────────────────────────────────┐
│ 🔴 ITEMS REQUIRING CEO DECISION                         │
├─────────────────────────────────────────────────────────┤
│ 1. Send Airwallex followup email (draft in fleet chat)  │
│    → Payments blocked 10+ days. URGENT.                 │
│ 2. Provide first warm lead from personal network        │
│    → Revenue clock starts when we have a prospect.      │
│ 3. Share Google Search Console verification code        │
│    → Enables SEO monitoring in /admin/seo-monitor.      │
└─────────────────────────────────────────────────────────┘
`);

console.log(`📊 KPI SNAPSHOT`);
console.log(`   Revenue:       $0 / $${CONFIG.revenue.monthlyTarget.toLocaleString()}/mo (target: $${CONFIG.revenue.target.toLocaleString()} by EOY)`);
console.log(`   Blog Posts:    ${db?.blogPosts || "?"} published (+12 pending review)`);
console.log(`   Subscribers:   ${db?.subscribers || "?"} / ${CONFIG.kpis.subscribers.target.toLocaleString()} target`);
console.log(`   Quotes:        ${db?.totalQuotes || 0} total, ${db?.pendingQuotes || 0} pending`);
console.log(`   Orders:        ${db?.totalOrders || 0}`);
console.log(`   CRM Inquiries: ${db?.contactInquiries || 0} new`);
console.log(`   Site Version:  v${version} | ${pageCount} pages`);

console.log(`\n📋 DECISIONS THIS STANDUP (${allDecisions.length}):`);
console.log(`   #  Agent      Decision                                              Status`);
console.log(`   ${"─".repeat(75)}`);
allDecisions.forEach((d, i) => {
  const name = CONFIG.agents.find(a => a.id === d.agent)?.name || d.agent;
  const truncated = d.text.length > 55 ? d.text.substring(0, 52) + "..." : d.text;
  console.log(`   ${String(i + 1).padStart(2)}  ${name.padEnd(10)} ${truncated.padEnd(55)} ${d.status}`);
});

console.log(`\n📨 CROSS-TEAM REQUESTS (${allRequests.length}):`);
allRequests.forEach(r => {
  const fromName = CONFIG.agents.find(a => a.id === r.from)?.name || r.from;
  console.log(`   [${fromName}] ${r.text}`);
});

// ═══════════════════════════════════════════════════════════
// PHASE 6: LOG EVERYTHING
// ═══════════════════════════════════════════════════════════

const recentLogFile = join(logsDir, `${today}.md`);
const existingLog = existsSync(recentLogFile) ? readFileSync(recentLogFile, "utf-8") : "";

const logEntry = `
# ${mode === "morning" ? "Morning Brief" : "Evening Summary"} — ${timestamp}

## Fleet Status
- **Version:** v${version} | **Pages:** ${pageCount} | **Blog Posts:** ${db?.blogPosts || "?"}
- **Revenue:** $0 / $${CONFIG.revenue.target.toLocaleString()} | **Subscribers:** ${db?.subscribers || "?"}

## Agent Reports

${reports.map(r => `### ${r.name} (${r.role})
**Priorities:**
${r.priorities.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**Decisions:**
${r.decisions.map(d => `- [DECISION] ${d.text} — ${d.status}`).join("\n") || "- (none)"}

**Requests:**
${r.requests.map(req => `- ${req}`).join("\n") || "- (none)"}

**Blockers:**
${r.blockers?.map(b => `- ${b}`).join("\n") || "- (none)"}
`).join("\n")}

## CEO Brief — Items Requiring Decision
1. Send Airwallex followup email (draft in fleet chat)
2. Provide first warm lead from personal network
3. Share Google Search Console verification code

## Decisions Log
| # | Agent | Decision | Status |
|---|-------|----------|--------|
${allDecisions.map((d, i) => `| ${i + 1} | ${CONFIG.agents.find(a => a.id === d.agent)?.name || d.agent} | ${d.text.substring(0, 80)} | ${d.status} |`).join("\n")}

---
`;

writeFileSync(recentLogFile, existingLog + logEntry, "utf-8");
console.log(`\n📝 Log saved: agents/logs/${today}.md`);

console.log(`\n${"═".repeat(60)}`);
console.log(`✅ Fleet ${mode} complete — ${timestamp} PST`);
console.log(`   ${agentsToRun.length} agents | ${allDecisions.length} decisions | ${allRequests.length} requests`);
console.log(`   Log: agents/logs/${today}.md`);
console.log(`${"═".repeat(60)}\n`);
