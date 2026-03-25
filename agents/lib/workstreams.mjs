// agents/lib/workstreams.mjs — Parallel workstream orchestration
//
// Instead of sequential standup rounds, spawn parallel workstreams where
// agents collaborate on a shared goal with shared context.
//
// Workstreams:
//   content  — Seto (research/write) + Rachel (SEO) + Seth (publish/seed)
//   sales    — Amy (pricing/outreach) + Tiffany (CRM/followup) + Alex (strategy)
//   tech     — Seth solo (bugs, features, deployments, health)
//
// Each workstream:
//   1. Defines a goal + shared context
//   2. Spawns agents in parallel (Round 1)
//   3. Collects responses, resolves @mentions via agent-chain
//   4. Produces a workstream summary

import { invokeAgent, invokeParallel } from "./invoke-agent.mjs";
import { chainAgentMentions } from "./agent-chain.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const LOGS_DIR = resolve(__dirname, "../logs");
const SYSTEM_NODE = process.env.SYSTEM_NODE || "node";

/**
 * Workstream definitions.
 */
const WORKSTREAMS = {
  content: {
    name: "Content Pipeline",
    agents: ["seto", "rachel", "seth"],
    lead: "seto",
    goal: "Research, write, optimize, and publish content that drives organic traffic to our tools and generates leads.",
    prompt: (agent, context) => {
      const roles = {
        seto: `You are the WRITER in the content workstream. Your job:
1. Identify the highest-priority blog post to write or update today
2. Check the blog seed files for what's already published vs. queued
3. Draft an outline with target keywords, data sources, and internal links
4. Propose the post for SEO review by @rachel and seeding by @seth`,

        rachel: `You are the SEO STRATEGIST in the content workstream. Your job:
1. Review current blog inventory — which posts drive traffic? Which don't?
2. Identify keyword gaps and content opportunities
3. Provide keyword briefs for Seto's next post (target keyword, search volume, competition)
4. Review any drafts for SEO optimization (meta, headings, internal links, CTAs)`,

        seth: `You are the PUBLISHER in the content workstream. Your job:
1. Check if any blog posts are queued for seeding (in seed files but not yet in DB)
2. Verify published posts have working cover images and correct JSON-LD
3. Report on blog page performance (if analytics data available)
4. Seed any approved posts and verify they're live`,
      };
      return `WORKSTREAM: Content Pipeline
GOAL: ${WORKSTREAMS.content.goal}

YOUR ROLE: ${roles[agent] || "Contribute to the content pipeline."}

${context}

Produce a focused report (3-5 bullet points) + any @mentions for collaboration + [DECISION] proposals.`;
    },
  },

  sales: {
    name: "Sales Pipeline",
    agents: ["amy", "tiffany", "alex"],
    lead: "alex",
    goal: "Generate leads, manage quotes, close revenue, and build customer relationships.",
    prompt: (agent, context) => {
      const roles = {
        amy: `You are the FINANCIAL STRATEGIST in the sales workstream. Your job:
1. Review pipeline status — pending quotes, aging leads, conversion rates
2. Propose pricing adjustments or incentives to close deals
3. Prepare outreach materials (email templates, one-pagers)
4. Track revenue progress against $55K/month target`,

        tiffany: `You are the CUSTOMER RELATIONSHIP MANAGER in the sales workstream. Your job:
1. Check all pending quotes — which need followup?
2. Review any new contact inquiries and draft responses
3. Update CRM notes on active prospects
4. Propose customer engagement improvements`,

        alex: `You are the SALES LEADER in the sales workstream. Your job:
1. Assess pipeline health — enough leads? Conversion rate?
2. Prioritize prospects by revenue potential
3. Decide: warm outreach vs. cold outreach vs. content marketing
4. Set this week's sales targets and assign owners`,
      };
      return `WORKSTREAM: Sales Pipeline
GOAL: ${WORKSTREAMS.sales.goal}

YOUR ROLE: ${roles[agent] || "Contribute to sales pipeline."}

${context}

Produce a focused report (3-5 bullet points) + any @mentions + [DECISION] proposals.`;
    },
  },

  tech: {
    name: "Technical Operations",
    agents: ["seth"],
    lead: "seth",
    goal: "Maintain site health, implement approved features, fix bugs, and optimize performance.",
    prompt: (agent, context) => {
      return `WORKSTREAM: Technical Operations
GOAL: ${WORKSTREAMS.tech.goal}

You are running a solo tech sprint. Your job:
1. Check site health (build, uptime, errors)
2. Review any approved technical decisions waiting for implementation
3. Identify the highest-impact technical improvement you can make today
4. Report on test status, deployment state, and any technical debt

${context}

Produce: health status, today's implementation plan, any blockers. Include [DECISION] proposals for technical improvements.`;
    },
  },
};

/**
 * Run a specific workstream.
 *
 * @param {string} streamId - "content" | "sales" | "tech"
 * @param {Object} options
 * @returns {Promise<WorkstreamResult>}
 */
export async function runWorkstream(streamId, { verbose = true, chainMentions = true } = {}) {
  const stream = WORKSTREAMS[streamId];
  if (!stream) throw new Error(`Unknown workstream: ${streamId}. Available: ${Object.keys(WORKSTREAMS).join(", ")}`);

  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🔀 Workstream: ${stream.name}`);
    console.log(`   Agents: ${stream.agents.join(", ")} | Lead: ${stream.lead}`);
    console.log(`   Goal: ${stream.goal}`);
    console.log(`${"═".repeat(60)}`);
  }

  // Build shared context
  const context = buildWorkstreamContext(streamId);

  // Round 1: All agents run in parallel
  if (verbose) console.log(`\n   🚀 Round 1: Spawning ${stream.agents.length} parallel session(s)...`);

  const results = await Promise.allSettled(
    stream.agents.map(agentId =>
      invokeAgent({
        agentId,
        prompt: stream.prompt(agentId, context),
        threadMessages: [],
        recentDecisions: [],
        standupSummary: "",
        gitLog: git("log --oneline -5"),
        mode: "plan",
      })
    )
  );

  // Collect responses
  const agentResponses = [];
  const allMentions = [];

  for (let i = 0; i < stream.agents.length; i++) {
    const agentId = stream.agents[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      agentResponses.push({ agentId, ...result.value });
      allMentions.push(...result.value.mentions.filter(m => !stream.agents.includes(m)));

      if (verbose) {
        console.log(`\n   📋 ${agentId}:`);
        result.value.response.split("\n").slice(0, 10).forEach(l => console.log(`      ${l}`));
        if (result.value.response.split("\n").length > 10) console.log(`      ... (${result.value.response.split("\n").length} lines total)`);
      }
    } else {
      if (verbose) console.log(`\n   ❌ ${agentId}: ${result.reason?.message}`);
      agentResponses.push({ agentId, response: `(failed: ${result.reason?.message})`, mentions: [], decisions: [] });
    }
  }

  // Round 2: Chain any cross-workstream @mentions
  let chainResults = [];
  if (chainMentions && allMentions.length > 0) {
    if (verbose) console.log(`\n   🔗 Cross-workstream mentions detected: ${allMentions.join(", ")}`);
    try {
      chainResults = await chainAgentMentions(
        allMentions,
        agentResponses.map(r => `${r.agentId}: ${r.response.substring(0, 500)}`).join("\n\n"),
        { verbose, maxDepth: 2 }
      );
    } catch (e) {
      if (verbose) console.log(`      ⚠️ Chain error: ${e.message}`);
    }
  }

  // Lead agent synthesizes if multiple agents
  let synthesis = null;
  if (stream.agents.length > 1) {
    if (verbose) console.log(`\n   📊 ${stream.lead} synthesizing workstream output...`);

    const synthResult = await invokeAgent({
      agentId: stream.lead,
      prompt: `WORKSTREAM SYNTHESIS — you are the lead of the ${stream.name} workstream.

Your team's reports:
${agentResponses.map(r => `### ${r.agentId}\n${r.response.substring(0, 800)}`).join("\n\n---\n\n")}

${chainResults.length > 0 ? `Cross-team responses:\n${chainResults.map(r => `${r.agentId}: ${r.response?.substring(0, 300)}`).join("\n")}` : ""}

Synthesize into:
1. **Status**: One-line workstream status
2. **Top 3 actions**: Prioritized, with owners and deadlines
3. **Blockers**: Anything stopping progress
4. **Decisions**: Any [DECISION] proposals that need Alex/CEO approval`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    synthesis = synthResult.response;
    if (verbose) {
      console.log(`\n   📊 Synthesis:`);
      synthesis.split("\n").forEach(l => console.log(`      ${l}`));
    }
  }

  // Log workstream
  logWorkstream(streamId, agentResponses, synthesis);

  return {
    streamId,
    name: stream.name,
    agentResponses,
    chainResults,
    synthesis,
  };
}

/**
 * Run all workstreams in parallel.
 */
export async function runAllWorkstreams({ verbose = true } = {}) {
  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🔀 MULTI-AGENT ORCHESTRATION — All Workstreams`);
    console.log(`${"═".repeat(60)}`);
  }

  const streamIds = Object.keys(WORKSTREAMS);

  // Run all workstreams in parallel
  const results = await Promise.allSettled(
    streamIds.map(id => runWorkstream(id, { verbose, chainMentions: true }))
  );

  const output = {};
  for (let i = 0; i < streamIds.length; i++) {
    output[streamIds[i]] = results[i].status === "fulfilled"
      ? results[i].value
      : { error: results[i].reason?.message };
  }

  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`✅ All workstreams complete`);
    for (const [id, result] of Object.entries(output)) {
      const status = result.error ? "❌" : "✅";
      console.log(`   ${status} ${WORKSTREAMS[id].name}: ${result.error || `${result.agentResponses?.length} agents responded`}`);
    }
    console.log(`${"═".repeat(60)}`);
  }

  return output;
}

// ── Helpers ──

function buildWorkstreamContext(streamId) {
  const version = git("describe --tags --always") || git("log -1 --format=%h") || "unknown";
  const commits = git("log --oneline -5");

  // DB stats
  let dbStats = "";
  try {
    const script = `const Database=require('better-sqlite3'),path=require('path'),fs=require('fs');const p=path.join('${ROOT.replace(/\\/g, "\\\\")}','data','production.db');const d=path.join('${ROOT.replace(/\\/g, "\\\\")}','dev.db');const dbPath=fs.existsSync(p)?p:d;if(!fs.existsSync(dbPath)){console.log('{}');process.exit(0);}const db=new Database(dbPath,{readonly:true});try{const r={blogs:db.prepare("SELECT count(*) as c FROM BlogPost WHERE published=1 AND language='en'").get()?.c,quotes:db.prepare("SELECT count(*) as c FROM Quote").get()?.c,pending:db.prepare("SELECT count(*) as c FROM Quote WHERE status IN ('draft','sent')").get()?.c,orders:db.prepare("SELECT count(*) as c FROM [Order]").get()?.c,inquiries:db.prepare("SELECT count(*) as c FROM ContactInquiry WHERE status='new'").get()?.c,subs:db.prepare("SELECT count(*) as c FROM Subscriber").get()?.c};console.log(JSON.stringify(r));}catch(e){console.log('{}');}db.close();`;
    const result = execSync(`"${SYSTEM_NODE}" -e "${script.replace(/"/g, '\\"')}"`, {
      cwd: ROOT, encoding: "utf8", timeout: 10000,
    });
    const data = JSON.parse(result.trim() || "{}");
    dbStats = `Blog posts: ${data.blogs || "?"} | Quotes: ${data.quotes || 0} (${data.pending || 0} pending) | Orders: ${data.orders || 0} | Inquiries: ${data.inquiries || 0} new | Subscribers: ${data.subs || 0}`;
  } catch {}

  return `
PROJECT STATE:
- Version: ${version} | Revenue: $0 / $500K target
- ${dbStats || "DB stats unavailable"}
- Recent commits: ${commits || "none"}
- Date: ${new Date().toISOString().split("T")[0]}
`.trim();
}

function git(cmd) {
  try { return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8", timeout: 10000 }).trim(); }
  catch { return ""; }
}

function logWorkstream(streamId, responses, synthesis) {
  const today = new Date().toISOString().split("T")[0];
  const logFile = resolve(LOGS_DIR, `${today}.md`);
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const entry = `
## Workstream: ${WORKSTREAMS[streamId].name} — ${timestamp}

${responses.map(r => `### ${r.agentId}\n${r.response?.substring(0, 800) || "(no response)"}`).join("\n\n")}

${synthesis ? `### Synthesis\n${synthesis.substring(0, 1000)}` : ""}

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
  writeFileSync(logFile, existing + entry, "utf8");
}

// CLI entry point
if (process.argv[1]?.includes("workstreams")) {
  const stream = process.argv[2];

  if (stream && WORKSTREAMS[stream]) {
    console.log(`🔀 Running workstream: ${stream}`);
    runWorkstream(stream).then(() => console.log("\n✅ Done."));
  } else if (stream === "all" || !stream) {
    console.log("🔀 Running all workstreams in parallel...");
    runAllWorkstreams().then(() => console.log("\n✅ All done."));
  } else {
    console.log(`Unknown workstream: ${stream}`);
    console.log(`Available: ${Object.keys(WORKSTREAMS).join(", ")}, all`);
    process.exit(1);
  }
}
