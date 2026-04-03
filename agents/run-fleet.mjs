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
  else if (args[i] === "--workstream" && args[i + 1]) { flags.workstream = args[++i]; }
  else if (args[i] === "--workstreams") { flags.workstream = "all"; }
}

// Workstream mode — runs workstreams instead of normal standup
if (flags.workstream) {
  (async () => {
    try {
      const { runWorkstream, runAllWorkstreams } = await import("./lib/workstreams.mjs");
      if (flags.workstream === "all") {
        await runAllWorkstreams({ verbose: true });
      } else {
        await runWorkstream(flags.workstream, { verbose: true });
      }
    } catch (e) {
      console.error(`❌ Workstream error: ${e.message}`);
      process.exit(1);
    }
    process.exit(0);
  })();
  // Prevent the rest of the standup from running
  await new Promise(() => {}); // Block (the IIFE above calls process.exit)
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
let dbSource = "none";

// Strategy 1: Fetch live stats from production site API (most accurate)
try {
  const prodUrl = "https://doge-consulting.com";
  const analyticsRes = await fetch(`${prodUrl}/api/admin/analytics?days=30`, {
    signal: AbortSignal.timeout(8000),
    headers: { Cookie: `doge_session=${process.env.ADMIN_SESSION_TOKEN || ""}` },
  }).catch(() => null);

  if (analyticsRes?.ok) {
    const analytics = await analyticsRes.json();
    db = {
      blogPosts: analytics.topBlogPosts?.length || 0,
      totalQuotes: 0,
      pendingQuotes: 0,
      totalOrders: 0,
      subscribers: analytics.totals?.totalSubscribers ?? 0,
      contactInquiries: 0,
      recentChats: 0,
      totalRevenue: 0,
      pageViews: analytics.totals?.pageViews ?? 0,
      productMatches: 0,
    };
    dbSource = "production-api";
  }
} catch { /* API unavailable, fall through to local DB */ }

// Strategy 2: Read from local production.db (synced from production)
if (!db) {
  try {
    const Database = require("better-sqlite3");
    // ONLY use production.db — never fall back to dev.db for standup stats
    const prodDbPath = join(ROOT, "data", "production.db");
    if (existsSync(prodDbPath)) {
      const conn = new Database(prodDbPath, { readonly: true });
      const safeCount = (sql) => { try { return conn.prepare(sql).get()?.c ?? 0; } catch { return 0; } };
      db = {
        blogPosts: safeCount("SELECT COUNT(*) as c FROM BlogPost WHERE published = 1 AND language = 'en'"),
        totalQuotes: safeCount("SELECT COUNT(*) as c FROM Quote"),
        pendingQuotes: safeCount("SELECT COUNT(*) as c FROM Quote WHERE status IN ('draft','sent')"),
        totalOrders: safeCount("SELECT COUNT(*) as c FROM [Order]"),
        subscribers: safeCount("SELECT COUNT(*) as c FROM Subscriber"),
        contactInquiries: safeCount("SELECT COUNT(*) as c FROM ContactInquiry WHERE status = 'new'"),
        recentChats: safeCount("SELECT COUNT(*) as c FROM AgentLog WHERE type = 'chat' AND createdAt > datetime('now', '-2 days')"),
        totalRevenue: safeCount("SELECT COALESCE(SUM(totalAmount),0) as c FROM [Order] WHERE status NOT IN ('cancelled')"),
        pageViews: safeCount("SELECT COUNT(*) as c FROM PageView"),
        productMatches: safeCount("SELECT COUNT(*) as c FROM ProductMatchQuery"),
      };
      conn.close();
      dbSource = "production.db";
    } else {
      console.log("⚠️ data/production.db not found — run sync to get production stats");
    }
  } catch (e) {
    console.log(`⚠️ DB stats unavailable: ${e.message}`);
  }
}

console.log(`\n${"═".repeat(60)}`);
console.log(`🐕 Doge Consulting Agent Fleet — ${mode === "morning" ? "Morning Brief" : "Evening Summary"}`);
console.log(`📅 ${today} | ⏰ ${timestamp} PST`);
console.log(`🔖 v${version} | 📄 ${pageCount} pages | 📝 ${db?.blogPosts ?? 0} blog posts | 👥 ${db?.subscribers ?? 0} subscribers | 📊 ${dbSource}`);
console.log(`${"═".repeat(60)}`);

// ═══════════════════════════════════════════════════════════
// PHASE 1b: PROCESS OPEN CHAT → DECISION TICKETS + LLM AGENT REPLIES
// Each agent spawns its own Claude Code Opus 4.6 session for real thinking
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
      console.log(`\n📨 Processing ${openChats.length} open chat messages → tickets + LLM agent replies`);
      console.log(`${"─".repeat(50)}`);

      // Import LLM invocation engine
      let invokeAgent = null;
      let useLLM = true;
      try {
        const lib = await import("./lib/invoke-agent.mjs");
        invokeAgent = lib.invokeAgent;
        console.log(`   🧠 Claude Code Opus 4.6 engine loaded — agents will think independently`);
      } catch (e) {
        console.log(`   ⚠️ LLM engine unavailable (${e.message}) — falling back to templates`);
        useLLM = false;
      }

      // Get shared context for LLM invocations
      const gitLog = run("git log --oneline -10 --format=\"%h %ar | %s\" 2>nul") || "";
      let standupSummary = "";
      try {
        const row = conn.prepare("SELECT content FROM AgentLog WHERE type='standup' ORDER BY createdAt DESC LIMIT 1").get();
        standupSummary = row?.content?.substring(0, 3000) || "";
      } catch {}

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

        // Generate agent replies — LLM-powered (parallel) or template fallback
        const respondingAgents = assigned.length > 0 ? assigned : ['alex'];

        if (useLLM && invokeAgent) {
          // Spawn parallel Claude Code sessions — each agent thinks independently
          console.log(`      🚀 Spawning ${respondingAgents.length} parallel Claude Code session(s)...`);
          const llmResults = await Promise.allSettled(
            respondingAgents.map(agentId => {
              const recentDecisions = (() => {
                try {
                  return conn.prepare("SELECT title, status FROM AgentLog WHERE type='decision' AND (agent=? OR assignedTo LIKE ?) ORDER BY createdAt DESC LIMIT 10")
                    .all(agentId, `%${agentId}%`);
                } catch { return []; }
              })();

              return invokeAgent({
                agentId,
                prompt: `[FROM CEO CHAT] ${cleanTitle}\n\n${chatContent}`,
                threadMessages: [],
                recentDecisions,
                standupSummary,
                gitLog,
                mode: agentId === "seth" ? "full" : "plan",
              });
            })
          );

          for (let i = 0; i < respondingAgents.length; i++) {
            const agentId = respondingAgents[i];
            const agentNames = { alex: 'Alex Chen', amy: 'Amy Lin', seth: 'Seth Parker', rachel: 'Rachel Morales', seto: 'Seto Nakamura', tiffany: 'Tiffany Wang' };
            const agentName = agentNames[agentId] || agentId;
            const result = llmResults[i];

            let reply;
            if (result.status === "fulfilled") {
              reply = result.value.response;
              // Update agent memory if LLM produced one
              if (result.value.memoryUpdate) {
                try {
                  const { updateMemory } = await import("./lib/build-context.mjs");
                  updateMemory(agentId, result.value.memoryUpdate);
                } catch {}
              }
              console.log(`      🧠 ${agentName} (LLM): ${reply.substring(0, 120)}...`);
            } else {
              // LLM failed for this agent — use template fallback
              reply = generateChatReply(agentId, cleanTitle, chatContent);
              console.log(`      📝 ${agentName} (template fallback): ${(reply || "no reply").substring(0, 100)}...`);
            }

            if (reply) {
              conn.prepare(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,tags,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
                randomUUID(), agentId, 'chat', 'normal',
                `RE: ${cleanTitle.substring(0, 80)}`,
                reply,
                'completed', chat.agent, `@${chat.agent}`, `chat:${chat.id}`, ts, ts
              );
              chatRepliesPosted++;
            }
          }
        } else {
          // Template fallback path (no LLM available)
          for (const agentId of respondingAgents) {
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
              console.log(`      📝 ${agentName}: ${reply.substring(0, 100)}...`);
              chatRepliesPosted++;
            }
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
// PHASE 1c: PRODUCTION TRIGGERS — Contact triage + Quote lifecycle + Health check
// ═══════════════════════════════════════════════════════════

try {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`🔔 PHASE 1c: Production Triggers`);
  console.log(`${"─".repeat(60)}`);

  // Contact form triage — check for new inquiries
  try {
    const { triageNewContacts } = await import("./lib/contact-triage.mjs");
    await triageNewContacts({ verbose: true });
  } catch (e) { console.log(`   ⚠️ Contact triage: ${e.message}`); }

  // Quote lifecycle — followups, escalations, archives
  try {
    const { processQuoteLifecycle } = await import("./lib/quote-lifecycle.mjs");
    await processQuoteLifecycle({ verbose: true });
  } catch (e) { console.log(`   ⚠️ Quote lifecycle: ${e.message}`); }

  // Health check (skip during evening summary to save time)
  if (mode === "morning") {
    try {
      const { runHealthCheck } = await import("./lib/health-check.mjs");
      await runHealthCheck({ verbose: true, useLocal: false });
    } catch (e) { console.log(`   ⚠️ Health check: ${e.message}`); }
  }
} catch (e) { console.log(`   ⚠️ Production triggers error: ${e.message}`); }

// ═══════════════════════════════════════════════════════════
// PHASE 2: ROUND 1 — Individual Agent Reports (LLM-powered)
// Each agent spawns its own Claude Code Opus 4.6 session
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

// Build standup context shared by all agents
const standupContext = `
PROJECT STATE:
- Version: v${version} | Pages: ${pageCount} | Branch: ${branch}
- Blog posts: ${db?.blogPosts ?? "?"} published | Subscribers: ${db?.subscribers ?? "?"}
- Quotes: ${db?.totalQuotes ?? 0} total, ${db?.pendingQuotes ?? 0} pending | Orders: ${db?.totalOrders ?? 0}
- Revenue: $0 / $${CONFIG.revenue.target.toLocaleString()} target | Monthly: $${CONFIG.revenue.monthlyTarget.toLocaleString()}/mo
- Days remaining: ${Math.ceil((new Date(CONFIG.revenue.deadline) - new Date()) / 86400000)}
- New inquiries: ${db?.contactInquiries ?? 0} | Recent chats: ${db?.recentChats ?? 0}

RECENT COMMITS:
${recentCommits}

${yesterdayLog ? `YESTERDAY'S STANDUP (summary):\n${yesterdayLog.substring(0, 3000)}` : "No previous standup log available."}
`.trim();

// Try to load the LLM invocation engine
let invokeAgent = null;
let invokeParallel = null;
let useLLM = true;
try {
  const lib = await import("./lib/invoke-agent.mjs");
  invokeAgent = lib.invokeAgent;
  invokeParallel = lib.invokeParallel;
  console.log(`\n   🧠 Claude Code Opus 4.6 engine loaded — agents will think independently`);
} catch (e) {
  console.log(`\n   ⚠️ LLM engine unavailable (${e.message}) — using template reports`);
  useLLM = false;
}

// Department heads run in parallel (excluding Alex — he synthesizes in Phase 3)
const departmentHeads = agentsToRun.filter(a => a.id !== "alex");
const alexAgent = agentsToRun.find(a => a.id === "alex");

if (useLLM && invokeAgent) {
  // ── LLM-POWERED STANDUP ──
  console.log(`   🚀 Spawning ${departmentHeads.length} parallel Claude Code sessions...\n`);

  const standupPrompt = (agent) => {
    const feedback = ceoFeedback[agent.id] || [];
    const feedbackText = feedback.length > 0
      ? `\nCEO FEEDBACK ON YOUR TICKETS:\n${feedback.map(f => `- [${f.status}] ${f.title}: ${f.action || "no comment"}`).join("\n")}`
      : "";

    return `You are in a DAILY STANDUP meeting. Today is ${today}. Mode: ${mode}.

${standupContext}
${feedbackText}

YOUR TASK: Produce your standup report following this EXACT format:

## Report
<Your analysis: what happened, what you see in the data, your domain priorities>

## Decisions
- [DECISION] <specific actionable proposal with expected impact> — PROPOSED
(MINIMUM 1 decision required — this is mandatory per Code of Conduct)

## Requests
- @agentid: <what you need from them>

## Status
DONE

IMPORTANT:
- Be specific. Use real data, file paths, numbers.
- Reference the project state above — don't make up metrics.
- Propose decisions that MOVE THE BUSINESS FORWARD.
- If you have in-progress tickets from CEO, address them specifically.
- Keep it concise but substantive. No filler.`;
  };

  // Invoke all department heads in parallel
  const llmResults = await Promise.allSettled(
    departmentHeads.map(agent => invokeAgent({
      agentId: agent.id,
      prompt: standupPrompt(agent),
      threadMessages: [],
      recentDecisions: [],
      standupSummary: yesterdayLog?.substring(0, 2000) || "",
      gitLog: recentCommits,
      mode: agent.id === "seth" ? "full" : "plan",
    }))
  );

  // Process results
  for (let i = 0; i < departmentHeads.length; i++) {
    const agent = departmentHeads[i];
    const result = llmResults[i];

    console.log(`\n👤 ${agent.name} — ${agent.role}`);
    console.log(`${"─".repeat(40)}`);

    if (result.status === "fulfilled") {
      const { response, decisions, mentions, memoryUpdate } = result.value;
      console.log(`   🧠 (LLM-powered response)\n`);
      // Print the full LLM response
      response.split("\n").forEach(line => console.log(`   ${line}`));

      // Extract structured data for logging
      const report = {
        agent: agent.id, name: agent.name, role: agent.role,
        fullResponse: response,
        decisions: decisions.map(d => ({ text: d.title, status: d.status })),
        requests: mentions.map(m => `@${m}`),
        priorities: [], blockers: [], // Embedded in fullResponse
      };
      reports.push(report);

      // Track decisions and requests
      for (const d of report.decisions) {
        allDecisions.push({ agent: agent.id, ...d });
      }
      for (const m of mentions) {
        allRequests.push({ from: agent.id, text: `@${m}: (see report above)` });
      }

      // Persist agent memory
      if (memoryUpdate) {
        try {
          const { updateMemory } = await import("./lib/build-context.mjs");
          updateMemory(agent.id, memoryUpdate);
        } catch {}
      }
    } else {
      // LLM failed for this agent — fallback to a minimal template
      console.log(`   ⚠️ LLM failed: ${result.reason?.message || "unknown"}`);
      console.log(`   📝 Using template fallback\n`);
      const report = generateTemplateReport(agent);
      reports.push(report);
      printTemplateReport(report);
    }

    console.log("\n   📊 Status: DONE");
  }
} else {
  // ── TEMPLATE FALLBACK (no LLM) ──
  for (const agent of departmentHeads) {
    const report = generateTemplateReport(agent);
    reports.push(report);
    console.log(`\n👤 ${report.name} — ${report.role}`);
    console.log(`${"─".repeat(40)}`);
    printTemplateReport(report);
    console.log("\n   📊 Status: DONE");
  }
}

// Helper: print a template report
function printTemplateReport(report) {
  if (report.ceoResponses?.length > 0) {
    console.log("\n   📬 CEO Feedback:");
    for (const f of report.ceoResponses) {
      const icon = f.status === "completed" ? "✅" : f.status === "rejected" ? "❌" : "🔄";
      console.log(`      ${icon} ${f.title}`);
    }
  }
  console.log("\n   📌 Priorities:");
  report.priorities.forEach((p, i) => console.log(`      ${i + 1}. ${p}`));
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
  if (report.blockers?.length > 0) {
    console.log("\n   🚫 Blockers:");
    report.blockers.forEach(b => console.log(`      ${b}`));
  }
}

// Template report generator (fallback when LLM unavailable)
function generateTemplateReport(agent) {
  const report = { agent: agent.id, name: agent.name, role: agent.role, priorities: [], decisions: [], requests: [], blockers: [], ceoResponses: ceoFeedback[agent.id] || [] };
  switch (agent.id) {
    case "amy":
      report.priorities = [`Revenue: $0. Pricing finalized. Airwallex verified. Preparing March P&L close-out.`];
      report.decisions = [{ text: "Draft warm lead email template for CEO to forward to contacts", status: "PROPOSED" }];
      report.requests = ["@alex: Need first warm lead from CEO network"];
      break;
    case "seth":
      report.priorities = [`Site v${version} stable. ${db?.blogPosts ?? "?"} blog posts. Build clean.`];
      report.decisions = [{ text: "SMTP setup with nodemailer for automated emails", status: "PROPOSED" }];
      report.requests = ["@seto: Send blog content for seeding"];
      break;
    case "rachel":
      report.priorities = [`SEO sprints complete. ${db?.blogPosts ?? "?"} posts live. Monitoring organic growth.`];
      report.decisions = [{ text: "Publish 3 high-intent blog posts this week targeting tool pages", status: "PROPOSED" }];
      report.requests = ["@seto: Coordinate on blog content and timing"];
      break;
    case "seto":
      report.priorities = [`${db?.blogPosts ?? "?"} posts published. Content pipeline active.`];
      report.decisions = [{ text: "Write next approved blog post today with full research and citations", status: "PROPOSED" }];
      report.requests = ["@rachel: Review draft for SEO optimization"];
      break;
    case "tiffany":
      report.priorities = [`0 customers. Onboarding SOP live. Quote templates ready. Blocked on SMTP.`];
      report.decisions = [{ text: "E2E test of customer onboarding flow once SMTP is live", status: "PROPOSED" }];
      report.requests = ["@seth: ETA on SMTP setup?"];
      break;
    case "kim":
      report.priorities = [`Auditing site pages for visual consistency and accessibility compliance.`];
      report.decisions = [{ text: "Conduct design QA of top 5 pages and report findings", status: "PROPOSED" }];
      report.requests = ["@seth: Coordinate on component improvements", "@rachel: Review landing page conversion"];
      break;
    default:
      report.priorities = ["Reviewing all agent reports and coordinating priorities."];
      report.decisions = [{ text: "Assign owners and deadlines to approved decisions", status: "PROPOSED" }];
      break;
  }
  return report;
}

// ═══════════════════════════════════════════════════════════
// PHASE 2b: DECISION THREAD REPLIES (LLM-powered)
// Per CoC §5 Decision Velocity: every ticket gets a [REPLY] every standup
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

    let reply = "";
    let mentionedReplies = [];

    if (useLLM && invokeAgent) {
      // LLM-powered reply
      try {
        const replyPrompt = `You have an in-progress decision ticket that needs a [REPLY] update per CoC §5 Decision Velocity.

TICKET: "${ticket.title}"
STATUS: ${ticket.status}
CEO COMMENT: ${ticket.action || "none"}

Provide a concise [REPLY] with:
1. What was DONE since last standup (specific: code committed, doc published, email sent)
2. What's NEXT
3. What's BLOCKING (if anything)

Do NOT say "working on it" or "in progress" — those are NOT meaningful updates.
Keep it to 2-3 sentences max.`;

        const result = await invokeAgent({
          agentId: ticket.agent,
          prompt: replyPrompt,
          threadMessages: [],
          recentDecisions: [],
          standupSummary: "",
          gitLog: recentCommits,
          mode: ticket.agent === "seth" ? "full" : "plan",
        });
        reply = result.response.replace(/^\*\*.*?\*\*:?\s*/m, "").trim(); // Strip agent name prefix if present
        console.log(`      🧠 [REPLY from ${ownerName}]: ${reply}`);
      } catch (e) {
        reply = `Reviewing this ticket. Update pending. (LLM error: ${e.message?.substring(0, 50)})`;
        console.log(`      📝 [REPLY from ${ownerName}]: ${reply}`);
      }
    } else {
      // Template fallback
      reply = generateTemplateTicketReply(ticket);
      console.log(`      📝 [REPLY from ${ownerName}]: ${reply}`);
    }

    allReplies.push({ ticket: ticket.title, agent: ticket.agent, reply });

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

// Template fallback for ticket replies
function generateTemplateTicketReply(ticket) {
  const t = ticket.title.toLowerCase();
  if (t.includes("smtp")) return "Investigating SMTP setup. Nodemailer available. Need credentials in .env.local.";
  if (t.includes("blog")) return "Content pipeline active. Posts being written and reviewed.";
  if (t.includes("airwallex") || t.includes("payment")) return "Payment setup in progress. Awaiting external response.";
  if (t.includes("sop") || t.includes("onboarding")) return "SOP live and shared with team. Ready for first customer.";
  if (t.includes("reddit")) return "Reddit account creation pending CEO approval.";
  return "Reviewing ticket scope. Specific update in next standup.";
}

// ═══════════════════════════════════════════════════════════
// PHASE 3: ROUND 2 — Alex Synthesis (LLM-powered)
// Alex receives all Round 1 reports and produces unified picture
// ═══════════════════════════════════════════════════════════

console.log(`\n${"─".repeat(60)}`);
console.log(`🎯 PHASE 3: Alex Chen — Synthesis & Priorities`);
console.log(`${"─".repeat(60)}`);

let alexSynthesis = "";

if (useLLM && invokeAgent && alexAgent) {
  // Build the full context: all agent reports + decisions + CEO feedback
  const allReportsText = reports.map(r => {
    if (r.fullResponse) return `### ${r.name} (${r.role})\n${r.fullResponse}`;
    return `### ${r.name} (${r.role})\nPriorities: ${r.priorities.join("; ")}\nDecisions: ${r.decisions.map(d => d.text).join("; ")}\nRequests: ${r.requests.join("; ")}`;
  }).join("\n\n---\n\n");

  const ticketRepliesText = allReplies.length > 0
    ? `\nIN-PROGRESS TICKET UPDATES:\n${allReplies.map(r => `- [${r.agent}] "${r.ticket}": ${r.reply}`).join("\n")}`
    : "";

  const alexPrompt = `You are in the SYNTHESIS round of the daily standup. Today is ${today}.

ALL AGENT REPORTS FROM ROUND 1:
${allReportsText}

${ticketRepliesText}

${standupContext}

YOUR TASK as Co-CEO/COO: Produce the Alex Synthesis following this EXACT format:

## Business Assessment
<2-3 sentences: unified picture, revenue status, critical path>

## Top 3 Priorities
1. <highest revenue-impact item with owner>
2. <second priority with owner>
3. <third priority with owner>

## Decisions Made
| # | Decision | Status | Owner | Rationale |
|---|----------|--------|-------|-----------|
<table of all decisions from agent reports — mark APPROVED/REJECTED/MODIFIED/NEEDS_CEO with your reasoning>

## CEO Items Requiring Decision
<numbered list of items ONLY the CEO can unblock>

## KPIs
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
<use real data from PROJECT STATE above>

## Action Items
| # | Priority | Owner | Action | Status |
|---|----------|-------|--------|--------|
<ranked list of all action items from this standup>

IMPORTANT:
- Use your HIGHEST-LEVEL JUDGMENT to evaluate each agent's proposals
- APPROVE decisions within your authority, REJECT weak ones with reason
- Identify conflicts between agents and resolve them
- Be decisive. Don't defer everything to CEO.`;

  try {
    console.log(`   🧠 Alex synthesizing with Opus 4.6...\n`);
    const alexResult = await invokeAgent({
      agentId: "alex",
      prompt: alexPrompt,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: recentCommits,
      mode: "plan",
    });
    alexSynthesis = alexResult.response;

    // Print Alex's full synthesis
    alexSynthesis.split("\n").forEach(line => console.log(`   ${line}`));

    // Track any decisions Alex made
    for (const d of alexResult.decisions) {
      allDecisions.push({ agent: "alex", text: d.title, status: d.status });
    }

    // Add Alex's report to the reports array
    reports.push({
      agent: "alex", name: "Alex Chen", role: "Co-CEO / COO",
      fullResponse: alexSynthesis,
      decisions: alexResult.decisions.map(d => ({ text: d.title, status: d.status })),
      requests: alexResult.mentions.map(m => `@${m}`),
      priorities: [], blockers: [],
    });

    // Persist Alex's memory
    if (alexResult.memoryUpdate) {
      try {
        const { updateMemory } = await import("./lib/build-context.mjs");
        updateMemory("alex", alexResult.memoryUpdate);
      } catch {}
    }
  } catch (e) {
    console.log(`   ⚠️ Alex LLM synthesis failed: ${e.message}`);
    console.log(`   📝 Using template synthesis\n`);
    alexSynthesis = generateTemplateSynthesis();
    console.log(alexSynthesis);
  }
} else {
  // Template fallback
  alexSynthesis = generateTemplateSynthesis();
  console.log(alexSynthesis);
}

function generateTemplateSynthesis() {
  return `
   🏢 UNIFIED BUSINESS PICTURE — ${today}

   Revenue: $0 / $${CONFIG.revenue.target.toLocaleString()} target (0.0%)
   Monthly target: $${CONFIG.revenue.monthlyTarget.toLocaleString()}/mo
   Days remaining: ${Math.ceil((new Date(CONFIG.revenue.deadline) - new Date()) / 86400000)}
   First milestone: Close $500 trial shipment from warm lead

   TOP 3 PRIORITIES (ranked by revenue impact):
   1. 🔴 CEO: Provide first warm lead — Day 18, all systems ready
   2. 🟡 SMTP setup — unblocks automated customer followups
   3. 🟡 Blog pipeline — continue publishing high-intent content
`;
}

// ═══════════════════════════════════════════════════════════
// PHASE 3b: AUTONOMOUS EXECUTION of approved decisions
// CEO Mandate (March 31): Running standup = planning + executing.
// Every approved decision MUST be executed with a git commit.
// Also picks up previously approved but unexecuted decisions.
// ═══════════════════════════════════════════════════════════

const autoExecute = !process.argv.includes("--no-execute");

if (autoExecute && alexSynthesis) {
  try {
    const { executeApprovedDecisions } = await import("./lib/execute-decision.mjs");

    // 1. Parse Alex's current synthesis for newly approved decisions
    const approvedForExecution = parseAlexDecisions(alexSynthesis);

    // 2. Also check for previously approved but unexecuted decisions from DB
    let pendingFromDb = [];
    try {
      const Database = require("better-sqlite3");
      const prodDbPath = join(ROOT, "data", "production.db");
      const devDbPath = join(ROOT, "dev.db");
      const dbPath = existsSync(prodDbPath) ? prodDbPath : devDbPath;
      if (existsSync(dbPath)) {
        const conn = new Database(dbPath, { readonly: true });
        const rows = conn.prepare("SELECT title, content FROM AgentLog WHERE type='decision' AND status='open' AND priority IN ('normal','high','critical') ORDER BY createdAt DESC LIMIT 20").all();
        pendingFromDb = rows.map(r => ({ text: r.title, status: "APPROVED", agent: "previous" }));
        conn.close();
      }
    } catch {}

    const allToExecute = [...approvedForExecution, ...pendingFromDb];

    if (allToExecute.length > 0) {
      console.log(`\n${"═".repeat(60)}`);
      console.log(`⚡ PHASE 3b: Autonomous Execution`);
      console.log(`   ${approvedForExecution.length} new + ${pendingFromDb.length} pending = ${allToExecute.length} decision(s) to execute`);
      console.log(`${"═".repeat(60)}`);

      const results = await executeApprovedDecisions(allToExecute, { dryRun: false, verbose: true });

      const succeeded = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      if (results.length > 0) {
        console.log(`\n   📊 Execution summary: ${succeeded} succeeded, ${failed} failed, ${allToExecute.length - results.length} skipped (non-executable)`);
      }
    } else {
      console.log(`\n   📭 No executable approved decisions found.`);
    }
  } catch (e) {
    console.log(`\n   ⚠️ Execution engine error: ${e.message}`);
  }
} else if (!autoExecute) {
  console.log(`\n   ⏸️ Auto-execution disabled (--no-execute flag). Decisions logged but not executed.`);
}

/**
 * Parse approved decisions from Alex's synthesis markdown.
 * Looks for table rows with APPROVED or MODIFIED status.
 */
function parseAlexDecisions(synthesis) {
  const decisions = [];
  const lines = synthesis.split("\n");

  for (const line of lines) {
    // Match markdown table rows: | # | Decision text | APPROVED | Owner | Rationale |
    const match = line.match(/\|\s*\d+\s*\|\s*(.+?)\s*\|\s*\*{0,2}(APPROVED|MODIFIED)\*{0,2}\s*\|\s*(.+?)\s*\|/i);
    if (match) {
      const title = match[1].replace(/\*{1,2}/g, "").trim();
      const status = match[2].toLowerCase();
      const owner = match[3].replace(/\*{1,2}/g, "").trim();

      // Determine the agent from owner field
      const agentMap = { seth: "seth", seto: "seto", amy: "amy", rachel: "rachel", tiffany: "tiffany", alex: "alex" };
      const ownerLower = owner.toLowerCase();
      const agent = Object.keys(agentMap).find(a => ownerLower.includes(a)) || "alex";

      decisions.push({ title, status, agent, rationale: "", type: "auto" });
    }
  }

  return decisions;
}

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
console.log(`   Revenue:       $${db?.totalRevenue ?? 0} / $${CONFIG.revenue.monthlyTarget.toLocaleString()}/mo (target: $${CONFIG.revenue.target.toLocaleString()} by EOY)`);
console.log(`   Blog Posts:    ${db?.blogPosts ?? 0} published`);
console.log(`   Subscribers:   ${db?.subscribers ?? 0} / ${CONFIG.kpis.subscribers.target.toLocaleString()} target`);
console.log(`   Quotes:        ${db?.totalQuotes ?? 0} total, ${db?.pendingQuotes ?? 0} pending`);
console.log(`   Orders:        ${db?.totalOrders ?? 0}`);
console.log(`   CRM Inquiries: ${db?.contactInquiries ?? 0} new`);
console.log(`   Page Views:    ${db?.pageViews ?? 0} total`);
console.log(`   Product Matches: ${db?.productMatches ?? 0}`);
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

// Build CEO items list from agent reports
const ceoItems = [];
for (const r of reports) {
  for (const d of r.decisions) {
    if (d.status === "NEEDS_CEO") ceoItems.push(d.text);
  }
}

const logEntry = `
# ${mode === "morning" ? "Morning Brief" : "Evening Summary"} — ${timestamp}

> Fleet standup for **${new Date(today).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}**

---

## Fleet Status

| Metric | Value |
|--------|-------|
| **Version** | v${version} |
| **Pages** | ${pageCount} |
| **Blog Posts** | ${db?.blogPosts ?? "?"} published |
| **Revenue** | $0 / $${CONFIG.revenue.target.toLocaleString()} |
| **Subscribers** | ${db?.subscribers ?? "?"} |
| **Quotes** | ${db?.totalQuotes ?? "?"} total, ${db?.pendingQuotes ?? "?"} pending |
| **Orders** | ${db?.totalOrders ?? "?"} |
| **Inquiries** | ${db?.contactInquiries ?? "?"} new |

---

## Agent Reports

${reports.map(r => {
  // Prefer the full LLM response for rich content; fall back to parsed fields
  if (r.fullResponse) {
    return `### ${r.name} — ${r.role}\n\n${r.fullResponse}`;
  }
  // Structured fallback when no full response
  return `### ${r.name} — ${r.role}

#### Priorities
${r.priorities.map((p, i) => `${i + 1}. ${p}`).join("\n") || "- (none)"}

#### Decisions
${r.decisions.map(d => `- **\\[DECISION\\]** ${d.text} — \`${d.status}\``).join("\n") || "- (none)"}

#### Requests
${r.requests.map(req => `- ${req}`).join("\n") || "- (none)"}

${r.blockers?.length ? `#### Blockers\n${r.blockers.map(b => `- 🔴 ${b}`).join("\n")}` : ""}`;
}).join("\n\n---\n\n")}

---

## CEO Brief — Items Requiring Decision

${ceoItems.length > 0 ? ceoItems.map((item, i) => `${i + 1}. ${item}`).join("\n") : "> No items requiring CEO decision this standup."}

---

## In-Progress Decision Threads

${allReplies.length > 0 ? allReplies.map(r => {
  const name = CONFIG.agents.find(a => a.id === r.agent)?.name || r.agent;
  return `> **${r.ticket}**\n> \n> *[REPLY from ${name}]:* ${r.reply}`;
}).join("\n\n") : "> No in-progress tickets."}

---

## Decisions Log

| # | Agent | Decision | Status |
|---|-------|----------|--------|
${allDecisions.map((d, i) => `| ${i + 1} | ${CONFIG.agents.find(a => a.id === d.agent)?.name || d.agent} | ${d.text.substring(0, 100)} | \`${d.status}\` |`).join("\n")}

---
`;

writeFileSync(recentLogFile, existingLog + logEntry, "utf-8");

// ── Phase 6b: Write decisions to local DB for tracking ──
let decisionsWritten = 0;
try {
  const Database = require("better-sqlite3");
  const { randomUUID } = require("crypto");
  const dbPath = join(ROOT, "dev.db");
  if (existsSync(dbPath) && allDecisions.length > 0) {
    const conn = new Database(dbPath);
    const checkStmt = conn.prepare(`SELECT id FROM AgentLog WHERE type='decision' AND title=?`);
    const insertStmt = conn.prepare(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,relatedTo,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const ts = new Date().toISOString();
    for (const d of allDecisions) {
      // Skip if already exists (avoids duplicates across multiple standup runs)
      const existing = checkStmt.get(d.text);
      if (!existing) {
        insertStmt.run(
          randomUUID(), d.agent, 'decision', 'normal',
          d.text, `From standup ${today} (proposed by ${d.agent}): ${d.text}`,
          'open', `standup:${today}`, ts, ts
        );
        decisionsWritten++;
      }
    }
    conn.close();
    if (decisionsWritten > 0) {
      console.log(`💾 ${decisionsWritten} new decisions written to local DB`);
    }
  }
} catch {}
console.log(`\n📝 Log saved: agents/logs/${today}.md`);

// ═══════════════════════════════════════════════════════════
// PHASE 7: MEMORY MANAGEMENT — Compaction, learning, performance
// ═══════════════════════════════════════════════════════════

try {
  const { runMemoryManagement } = await import("./lib/memory-manager.mjs");
  await runMemoryManagement({ verbose: true });
} catch (e) { console.log(`   ⚠️ Memory management: ${e.message}`); }

console.log(`\n${"═".repeat(60)}`);
console.log(`✅ Fleet ${mode} complete — ${timestamp} PST`);
console.log(`   ${agentsToRun.length} agents | ${allDecisions.length} decisions | ${allRequests.length} requests | ${allReplies.length} ticket replies | ${chatProcessed} chats→tickets`);
console.log(`   Log: agents/logs/${today}.md`);
console.log(`${"═".repeat(60)}\n`);
