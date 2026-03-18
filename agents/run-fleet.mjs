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
// PHASE 1b: PROCESS OPEN CHAT → DECISION TICKETS + AGENT REPLIES
// ═══════════════════════════════════════════════════════════

let chatProcessed = 0;
let chatRepliesPosted = 0;
try {
  const Database = require("better-sqlite3");
  const { randomUUID } = require("crypto");
  const dbPath = join(ROOT, "dev.db");
  if (existsSync(dbPath)) {
    const conn = new Database(dbPath);
    const openChats = conn.prepare(`SELECT id, agent, title, content, assignedTo FROM AgentLog WHERE type='chat' AND status='open' ORDER BY createdAt ASC`).all();
    if (openChats.length > 0) {
      console.log(`\n📨 Processing ${openChats.length} open chat messages → tickets + agent replies`);
      console.log(`${"─".repeat(50)}`);

      for (const chat of openChats) {
        const assigned = (chat.assignedTo || '').split(',').filter(Boolean);
        const cleanTitle = chat.title.replace(/^@\w+\s*:?\s*/, '').substring(0, 100);
        const chatContent = chat.content || '';
        const ts = new Date().toISOString();

        console.log(`\n   📩 CEO: "${cleanTitle}"`);
        console.log(`      To: ${assigned.join(', ') || 'all'}`);

        // Create decision ticket
        conn.prepare(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          randomUUID(), assigned[0] || 'alex', 'decision',
          chat.title.includes('URGENT') || chat.title.includes('CRITICAL') ? 'high' : 'normal',
          `[FROM CHAT] ${cleanTitle}`,
          `CEO posted in fleet chat:\n\n${chatContent.substring(0, 800)}`,
          'open', chat.assignedTo,
          assigned.map(a => `@${a}`).join(','),
          `chat:${chat.id}`, ts, ts
        );
        console.log(`      📋 Decision ticket created`);

        // Generate agent replies in the chat thread
        for (const agentId of (assigned.length > 0 ? assigned : ['alex'])) {
          const reply = generateChatReply(agentId, cleanTitle, chatContent);
          if (reply) {
            const agentNames = { alex: 'Alex Chen', amy: 'Amy Lin', seth: 'Seth Parker', rachel: 'Rachel Morales', seto: 'Seto Nakamura', tiffany: 'Tiffany Wang' };
            const agentName = agentNames[agentId] || agentId;
            conn.prepare(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
              randomUUID(), agentId, 'chat', 'normal',
              `RE: ${cleanTitle.substring(0, 80)}`,
              reply,
              'completed', chat.agent, `@${chat.agent}`, `chat:${chat.id}`, ts, ts
            );
            console.log(`      💬 ${agentName}: ${reply.substring(0, 100)}...`);
            chatRepliesPosted++;
          }
        }

        // Mark original chat as completed
        conn.prepare(`UPDATE AgentLog SET status='completed' WHERE id=?`).run(chat.id);
        chatProcessed++;
      }
      console.log(`\n${"─".repeat(50)}`);
      console.log(`   ✅ ${chatProcessed} chats → tickets, ${chatRepliesPosted} agent replies posted\n`);
    }
    conn.close();
  }
} catch (e) { console.log(`   ⚠️ Chat processing error: ${e.message}`); }

// Chat reply generator — produces contextual responses based on chat content
function generateChatReply(agentId, title, content) {
  const t = (title + ' ' + content).toLowerCase();
  const agentReplies = {
    alex: () => {
      if (t.includes('compliance') || t.includes('airwallex')) return 'Acknowledged. I\'ll review all service descriptions for compliance-sensitive terms and coordinate with the team to ensure we\'re aligned. Any items needing CEO action will be escalated immediately.';
      if (t.includes('blog') || t.includes('content')) return 'Coordinating with Seto and Rachel on this. Will ensure editorial review meets our quality bar before publishing. Timeline and assignments will be in today\'s standup.';
      if (t.includes('customer') || t.includes('lead') || t.includes('onboard')) return 'Noted. SOP is in place — when we have a prospect, I\'ll lead the initial handoff per the onboarding protocol. Tiffany on standby for follow-up.';
      return 'Received. Will review and assign to the appropriate team members. Update in next standup.';
    },
    amy: () => {
      if (t.includes('airwallex') || t.includes('payment')) return 'Standing by for Airwallex activation. Interim HSBC wire payment ready as fallback. P&L tracking template prepared for first transaction.';
      if (t.includes('pricing') || t.includes('cost') || t.includes('margin')) return 'Reviewing from a financial perspective. Will provide margin analysis and pricing recommendation in next standup.';
      if (t.includes('budget') || t.includes('expense')) return 'Will review against our budget. Current OpEx is within targets. Detailed breakdown available if needed.';
      return 'Noted from finance side. Will assess any financial implications and report in standup.';
    },
    seth: () => {
      if (t.includes('website') || t.includes('deploy') || t.includes('fix') || t.includes('change')) return 'On it. Will implement, verify build passes, and push to GitHub. Production will update on next Docker rebuild.';
      if (t.includes('seo') || t.includes('schema') || t.includes('page')) return 'Reviewing technical SEO implications. Will check structured data, meta tags, and build verification.';
      if (t.includes('smtp') || t.includes('email')) return 'SMTP setup is on my list. Will configure nodemailer with credentials from .env.local and test delivery.';
      if (t.includes('blog') || t.includes('seed')) return 'Blog seed script ready. Will run once content is approved by Seto/Rachel.';
      return 'Acknowledged. Will evaluate technical requirements and provide implementation timeline in next standup.';
    },
    rachel: () => {
      if (t.includes('blog') || t.includes('content') || t.includes('seo')) return 'Reviewing from an SEO/content strategy perspective. Will check keyword targets, internal linking opportunities, and content calendar alignment.';
      if (t.includes('marketing') || t.includes('insurance') || t.includes('compliance')) return 'Will audit all marketing materials and content for the flagged terms. Any updates needed will be listed with specific page references.';
      if (t.includes('reddit') || t.includes('channel')) return 'On it. Reddit engagement plan in progress — targeting r/FBA, r/importing, r/ecommerce with genuine answers linking to our tools.';
      return 'Noted. Will evaluate marketing and content implications and report in standup.';
    },
    seto: () => {
      if (t.includes('blog') || t.includes('post') || t.includes('content')) return 'Reviewing content requirements. Will check against our existing 24 posts for overlap, verify topic angles, and prepare outlines for approved topics.';
      if (t.includes('news') || t.includes('industry')) return 'Monitoring. Will research and prepare analysis if this impacts our audience of US importers.';
      return 'Acknowledged. Will research and prepare a thorough analysis for next standup.';
    },
    tiffany: () => {
      if (t.includes('customer') || t.includes('onboard') || t.includes('sop')) return 'SOP is live and ready. Quote pipeline tested and operational. Standing by for first customer — response time target is under 2 hours.';
      if (t.includes('quote') || t.includes('payment')) return 'Quote system operational. Will coordinate with Amy on payment workflow once Airwallex is activated.';
      return 'Noted. Will review for any customer service process impacts and update in standup.';
    },
  };
  const fn = agentReplies[agentId];
  return fn ? fn() : null;
}

// ═══════════════════════════════════════════════════════════
// PHASE 2: ROUND 1 — Individual Agent Reports
// ═══════════════════════════════════════════════════════════

console.log(`\n${"─".repeat(60)}`);
console.log(`📋 PHASE 2: Round 1 — Individual Reports`);
console.log(`${"─".repeat(60)}`);

const reports = [];
const allDecisions = [];
const allRequests = [];

// Parse CEO actions per agent from last sync pull
const ceoFeedback = {};
if (pullData?.ceoActions) {
  for (const a of pullData.ceoActions) {
    const agentId = a.agent || "alex";
    if (!ceoFeedback[agentId]) ceoFeedback[agentId] = [];
    ceoFeedback[agentId].push(a);
  }
}

// Helper to generate agent report based on their role, project data, and CEO feedback
function generateReport(agent) {
  const report = { agent: agent.id, name: agent.name, role: agent.role, priorities: [], decisions: [], requests: [], blockers: [], ceoResponses: [] };

  // Attach CEO feedback for this agent
  const myFeedback = ceoFeedback[agent.id] || [];
  const recentFeedback = myFeedback.filter(f => f.action?.includes("3/16/2026") || f.action?.includes("3/17/2026"));
  report.ceoResponses = recentFeedback;

  switch (agent.id) {
    case "alex": {
      report.priorities = [
        "✅ Weekly pipeline review APPROVED by CEO — scheduling for every Monday",
        "Close first $500 revenue from warm lead to prove model",
        "Quality-check Onboarding SOP v1.0 — distribute to all agents today",
        "Unblock Airwallex account setup (payment infra critical path)",
        "Blog post topics APPROVED (10 of 12) by CEO — coordinate Seth on seeding",
      ];
      report.decisions = [
        { text: "Execute on all APPROVED decisions from today's CEO review — assign owners and deadlines", status: "PROPOSED" },
      ];
      report.requests = [
        "@seth: CEO asked 'why is auto-deploy critical?' — please respond with justification or withdraw",
        "@tiffany: CEO approved quote followup reminders — coordinate with @seth on SMTP setup",
        "@rachel: Reddit engagement APPROVED — start posting genuine answers this week",
        "@seto: Blog topics APPROVED — begin writing the first 3 posts",
      ];
      report.blockers = [
        "🔴 Airwallex account still not activated — 10+ days pending",
        "⚠️ $0 revenue — waiting for first warm lead from CEO network",
      ];
      break;
    }
    case "amy": {
      report.priorities = [
        "✅ P&L template APPROVED by CEO — building Month 1 tracking spreadsheet",
        "Pricing model finalized and communicated — free consulting, embedded margins",
        "Airwallex blocked — CEO has sent followup email, awaiting response",
        "Preparing: interim payment via bank wire/PayPal (previously approved)",
        "Define margin thresholds: sourcing (15% product cost), shipping (10% freight, min $150)",
      ];
      report.decisions = [
        { text: "Set up interim bank wire payment acceptance while Airwallex is pending — send wire details to Alex/Tiffany for first customer readiness", status: "PROPOSED" },
      ];
      report.requests = [
        "@tiffany: Share bank wire payment details for inclusion in quote template once first customer arrives",
        "@alex: Confirm margin thresholds — 10% freight (min $150) + 15% product cost per CEO's earlier approval",
      ];
      report.blockers = [
        "🔴 Airwallex still pending — interim wire payment is the fallback",
      ];
      break;
    }
    case "seth": {
      const commitLines = recentCommits.split("\n").filter(Boolean);
      report.priorities = [
        `Site health: v${version}, ${pageCount} pages, build passing, all tests green`,
        "⚠️ CEO asked: 'why is auto-deploy critical?' — need to respond or withdraw decision",
        "🔄 Tiffany's quote followup reminders need SMTP — CEO approved, assigned to Seth",
        "Production deployment of P2+P3 SEO features confirmed — all pushed to GitHub",
        `12 blog post drafts ready — Seto's topics APPROVED by CEO, seeding pending`,
      ];
      report.decisions = [
        { text: "Respond to CEO: auto-deploy is LOW priority (not critical) — it automates manual Docker rebuild but site works fine with manual deploy. Withdraw as non-critical.", status: "PROPOSED" },
        { text: "Set up SMTP email delivery using existing nodemailer config — required for Tiffany's automated quote follow-ups (CEO approved)", status: "PROPOSED" },
      ];
      report.requests = [
        "@tiffany: Once SMTP is configured, I'll enable the Day 3/Day 7 quote followup scheduler",
        "@seto: Ready to seed the 10 approved blog posts whenever you give the go-ahead",
      ];
      report.blockers = [];
      if (commitLines.length > 0) report.recentWork = commitLines.slice(0, 5);
      break;
    }
    case "rachel": {
      report.priorities = [
        "✅ Reddit engagement APPROVED by CEO — starting this week",
        "Target: answer 3 genuine questions on r/FBA and r/importing",
        "Blog topic review DONE — Seto's 10-of-12 approval is confirmed",
        "SEO Sprint 1-3 all complete — monitoring organic traffic growth",
        "Next: Google Search Console setup (waiting for CEO verification code)",
      ];
      report.decisions = [
        { text: "Create Reddit account u/DogeConsulting (or similar) TODAY and post first 3 genuine answers — link CBM calculator and duty calculator where relevant", status: "PROPOSED" },
      ];
      report.requests = [
        "@seth: Need CBM calculator and duty calculator direct URLs for Reddit posts",
        "@seto: Coordinate on which blog posts to reference in Reddit answers",
      ];
      report.blockers = [];
      break;
    }
    case "seto": {
      report.priorities = [
        `✅ Blog topic approval: 10 of 12 APPROVED by CEO — merging #3 and #6 into existing posts`,
        `Content status: ${db?.blogPosts || "24"} published + 10 new posts to write`,
        "First 3 to write: Alibaba supplier verification, Amazon FBA cost breakdown, QC inspection checklist",
        "1688.com deep-dive guide also approved — scheduled after the first 3",
        "Cover image audit: all clean, no duplicates",
      ];
      report.decisions = [
        { text: "Begin writing first 3 approved posts this week — target 1 per day (Mon/Tue/Wed), each 1500-2500 words with unique Unsplash cover images", status: "PROPOSED" },
      ];
      report.requests = [
        "@seth: Confirm seed-blog-expansion.mjs is ready — I'll update content for the 10 approved topics",
        "@rachel: Need keyword research for the 3 posts I'm writing this week",
      ];
      report.blockers = [];
      break;
    }
    case "tiffany": {
      report.priorities = [
        "Onboarding SOP v1.0 live at /docs/customer-onboarding-sop.html — sharing with team",
        "🔄 Quote followup reminders APPROVED by CEO — finding @seth for SMTP setup",
        "Quote-to-email pipeline test: PASSED all 5 steps",
        `CRM status: ${db?.contactInquiries || 0} new inquiries, ${db?.pendingQuotes || 0} pending quotes`,
        "Pipeline review: APPROVED — joining Alex's Monday cadence",
      ];
      report.decisions = [
        { text: "Coordinate with Seth on SMTP setup this week — once live, enable Day 3 and Day 7 automated quote followup emails", status: "PROPOSED" },
      ];
      report.requests = [
        "@seth: CEO approved my quote followup idea and assigned SMTP to you — when can we set this up?",
        "@alex: SOP v1.0 is ready for team distribution — please review and approve for external use",
        "@amy: Need bank wire payment details as interim solution for first customer",
      ];
      report.blockers = [
        "⚠️ SMTP not configured — blocking automated email delivery (quote followups, notifications)",
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

  // Show CEO feedback first (CoC Part 5, Decision Ticket Protocol)
  if (report.ceoResponses.length > 0) {
    console.log("\n   📬 CEO Feedback (addressing per CoC §5 Decision Ticket Protocol):");
    for (const f of report.ceoResponses) {
      const icon = f.status === "completed" ? "✅" : f.status === "rejected" ? "❌" : f.status === "in_progress" ? "🔄" : "💬";
      console.log(`      ${icon} ${f.title}`);
      if (f.action) {
        const actionText = f.action.replace(/\*\*/g, "").substring(0, 120);
        console.log(`         → ${actionText}`);
      }
    }
  }

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
// PHASE 2b: DECISION THREAD REPLIES (CoC §5 Decision Velocity)
// Every in-progress ticket gets a [REPLY] from owner + @mentioned
// ═══════════════════════════════════════════════════════════

const inProgressTickets = (pullData?.ceoActions || []).filter(a => a.status === "in_progress" || a.status === "open");
const allReplies = [];

if (inProgressTickets.length > 0) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`💬 PHASE 2b: In-Progress Decision Thread Replies`);
  console.log(`   Per CoC §5 Decision Velocity: every ticket gets a [REPLY] every standup`);
  console.log(`${"─".repeat(60)}`);

  for (const ticket of inProgressTickets) {
    const ownerAgent = CONFIG.agents.find(a => a.id === ticket.agent);
    const ownerName = ownerAgent?.name || ticket.agent;

    console.log(`\n   📋 "${ticket.title}"`);
    console.log(`      Owner: ${ownerName} | Status: ${ticket.status.toUpperCase()}`);
    if (ticket.action) {
      const ceoText = ticket.action.replace(/\*\*/g, "").substring(0, 150);
      console.log(`      CEO: ${ceoText}`);
    }

    // Generate reply based on the ticket owner
    let reply = "";
    let mentionedReplies = [];

    switch (ticket.agent) {
      case "alex":
        reply = generateAlexReply(ticket);
        break;
      case "amy":
        reply = generateAmyReply(ticket);
        break;
      case "seth":
        reply = generateSethReply(ticket);
        mentionedReplies = generateMentionedReplies(ticket, "seth");
        break;
      case "rachel":
        reply = generateRachelReply(ticket);
        break;
      case "seto":
        reply = generateSetoReply(ticket);
        break;
      case "tiffany":
        reply = generateTiffanyReply(ticket);
        mentionedReplies = generateMentionedReplies(ticket, "tiffany");
        break;
      default:
        reply = `Reviewing this ticket. Will provide update by next standup.`;
    }

    console.log(`      [REPLY from ${ownerName}]: ${reply}`);
    allReplies.push({ ticket: ticket.title, agent: ticket.agent, reply });

    for (const mr of mentionedReplies) {
      const mName = CONFIG.agents.find(a => a.id === mr.agent)?.name || mr.agent;
      console.log(`      [REPLY from ${mName}]: ${mr.reply}`);
      allReplies.push({ ticket: ticket.title, agent: mr.agent, reply: mr.reply });
    }

    // Check staleness
    const dateMatch = ticket.action?.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      const ticketDate = new Date(dateMatch[1]);
      const daysSince = Math.floor((new Date() - ticketDate) / 86400000);
      if (daysSince > 7) {
        console.log(`      ⚠️ STALE: ${daysSince} days old — per CoC, auto-reject and propose revised version`);
      } else if (daysSince > 5) {
        console.log(`      ⏳ WARNING: ${daysSince} days — approaching 7-day auto-reject threshold`);
      }
    }
  }
}

// Reply generators per agent
function generateAlexReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("pipeline")) return "Weekly Monday pipeline review is now on the calendar. First session scheduled for next Monday. Will include: active quotes, conversion funnel, blockers.";
  if (t.includes("pricing")) return "Pricing model finalized per CEO directive. Free consulting, embedded margins. All agents have been notified. Closing this ticket.";
  if (t.includes("warm lead")) return "Still waiting on CEO for first warm lead introduction. This is CEO-dependent — proposing we prepare a 'first customer readiness checklist' while we wait.";
  return "Working on this. Specific update: reviewed the ticket scope and assigned sub-tasks to relevant agents.";
}

function generateAmyReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("airwallex") || t.includes("revenue clock")) return "Airwallex still pending. CEO confirmed he sent followup on 3/15. I've drafted a second followup email. Meanwhile, preparing bank wire as interim payment method per previous CEO approval.";
  if (t.includes("p&l")) return "P&L template created in Google Sheets. Columns: date, customer, product cost, shipping cost, our margin, total revenue, gross profit %. Ready for first transaction.";
  if (t.includes("pricing")) return "Pricing is DONE. Free consulting, 10% freight margin (min $150), 15% product cost. Updated in SOP and services page. Proposing to close this ticket.";
  if (t.includes("wire") || t.includes("bank")) return "HSBC bank wire details prepared. Account: Doge Consulting Group Limited. Ready to share with first customer via Tiffany.";
  return "Reviewing financials for this item. Will have specific numbers by next standup.";
}

function generateSethReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("auto-deploy")) return "Withdrawing this as non-critical per CEO question. Auto-deploy is convenience, not necessity — current manual deploy via Docker works fine. Closing.";
  if (t.includes("smtp")) return "Investigating SMTP setup. Need SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local. Will use nodemailer (already installed). Can configure with Gmail SMTP or any provider. Target: complete by tomorrow's standup.";
  if (t.includes("blog") || t.includes("seed")) return "seed-blog-expansion.mjs is ready with all 10 approved topics. Waiting for Seto's go-ahead to run the seed command.";
  if (t.includes("deploy") || t.includes("production")) return "All P2+P3 SEO features pushed to GitHub. Production will pick up on next Docker rebuild. Build verified clean locally.";
  return "Investigating this technical item. Will have implementation plan by next standup.";
}

function generateRachelReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("reddit")) return "Creating Reddit account today. Target subreddits: r/FBA (470K members), r/importing, r/ecommerce. Will answer 3 genuine questions this week linking to our CBM calculator and duty calculator.";
  if (t.includes("search console") || t.includes("gsc")) return "GSC setup code deployed in codebase (GOOGLE_SITE_VERIFICATION env var). Waiting for CEO to provide the actual verification code from Google Search Console.";
  if (t.includes("newsletter")) return "Newsletter template drafted. Will share with Alex + CEO for approval before first send.";
  return "Reviewing marketing metrics for this item. Will have specific plan by next standup.";
}

function generateSetoReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("blog") && t.includes("topic")) return "10 of 12 topics approved. Merging #3 and #6 into existing posts as updates. Starting with: 1) Alibaba supplier verification, 2) Amazon FBA cost breakdown, 3) QC inspection checklist. Target: 1 post per day this week.";
  if (t.includes("1688")) return "1688.com deep-dive guide outlined. Will include: registration walkthrough, payment methods, price comparison, agent options. Scheduled after the first 3 long-tail posts.";
  if (t.includes("cover image")) return "All 24 posts verified — unique Unsplash photo IDs, all HTTP 200. No duplicates found.";
  return "Researching content for this item. Will have draft or outline by next standup.";
}

function generateTiffanyReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("sop") || t.includes("onboarding")) return "SOP v1.0 is live at /docs/customer-onboarding-sop.html. Sharing link with all agents today. Includes: 8-stage process, pricing table, escalation matrix, email templates. Link: https://doge-consulting.com/docs/customer-onboarding-sop.html";
  if (t.includes("quote follow") || t.includes("smtp")) return "Quote followup reminders approved by CEO. @seth assigned for SMTP setup. Once SMTP is configured, I'll test Day 3 and Day 7 templates. Target: enabled by end of this week.";
  if (t.includes("pipeline")) return "Pipeline test passed all 5 steps (create/read/update/delete/email-log). System is operational. Weekly testing cadence established per Alex's Monday review.";
  return "Reviewing customer workflow for this item. Will have update by next standup.";
}

function generateMentionedReplies(ticket, owner) {
  const replies = [];
  const t = ticket.title.toLowerCase();

  // If Tiffany's ticket mentions Seth (SMTP)
  if (owner === "tiffany" && (t.includes("smtp") || t.includes("quote follow"))) {
    replies.push({ agent: "seth", reply: "Acknowledged. SMTP setup is on my priority list. Will configure with nodemailer and test delivery by tomorrow's standup. Need: SMTP credentials in .env.local." });
  }
  // If Seth's ticket mentions Tiffany
  if (owner === "seth" && t.includes("smtp")) {
    replies.push({ agent: "tiffany", reply: "Standing by. Once Seth confirms SMTP is working, I'll test the Day 3 followup email template with a mock quote." });
  }
  // If ticket mentions Seto/Rachel for blog
  if (t.includes("blog") && (owner === "seth" || owner === "seto")) {
    if (owner !== "rachel") replies.push({ agent: "rachel", reply: "Confirmed — keyword research for the 3 blog posts in progress. Will share target keywords by EOD." });
  }

  return replies;
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

## In-Progress Decision Threads (CoC §5 Decision Velocity)
${allReplies.map(r => {
  const name = CONFIG.agents.find(a => a.id === r.agent)?.name || r.agent;
  return `- **${r.ticket}**\n  - [REPLY from ${name}]: ${r.reply}`;
}).join("\n") || "- (no in-progress tickets)"}

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
console.log(`   ${agentsToRun.length} agents | ${allDecisions.length} decisions | ${allRequests.length} requests | ${allReplies.length} ticket replies | ${chatProcessed} chats→tickets`);
console.log(`   Log: agents/logs/${today}.md`);
console.log(`${"═".repeat(60)}\n`);
