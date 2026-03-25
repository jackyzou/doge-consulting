// agents/lib/memory-manager.mjs — Agent memory evolution system
// Handles: compaction, cross-agent sharing, CEO feedback learning, performance tracking
//
// Memory lifecycle:
// 1. Agents append [MEMORY] entries during standups/chats (invoke-agent.mjs)
// 2. When entries exceed threshold, this module compacts old ones via LLM
// 3. Cross-agent memories are injected into context (build-context.mjs)
// 4. CEO feedback patterns are extracted and stored as learned preferences

import { invokeAgent } from "./invoke-agent.mjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, "..");
const MEMORY_DIR = resolve(AGENTS_DIR, "memory");
const ROOT = resolve(__dirname, "../..");
const SYSTEM_NODE = process.env.SYSTEM_NODE || "node";

const COMPACTION_THRESHOLD = 30;  // Compact when > 30 entries
const KEEP_RECENT = 10;           // Keep last 10 entries verbatim

const AGENT_IDS = ["alex", "amy", "seth", "rachel", "seto", "tiffany"];

const AGENT_NAMES = {
  alex: "Alex Chen", amy: "Amy Lin", seth: "Seth Parker",
  rachel: "Rachel Morales", seto: "Seto Nakamura", tiffany: "Tiffany Wang",
};

// Cross-agent memory access rules — who can read whose memory
const MEMORY_ACCESS = {
  alex:    ["amy", "seth", "rachel", "seto", "tiffany"], // COO reads everyone
  amy:     ["tiffany", "alex"],       // CFO reads CSO (quotes) + COO
  seth:    ["rachel", "seto"],        // CTO reads CMO (SEO) + PRO (blog)
  rachel:  ["seto", "seth"],          // CMO reads PRO (content) + CTO (analytics)
  seto:    ["rachel", "seth"],        // PRO reads CMO (SEO) + CTO (publishing)
  tiffany: ["amy", "alex"],           // CSO reads CFO (pricing) + COO
};

// ═══════════════════════════════════════════════════════════
// MEMORY COMPACTION
// ═══════════════════════════════════════════════════════════

/**
 * Compact all agent memories that exceed the threshold.
 */
export async function compactAllMemories({ verbose = true } = {}) {
  if (!existsSync(MEMORY_DIR)) {
    if (verbose) console.log("   📭 No memory directory — nothing to compact.");
    return { compacted: 0 };
  }

  let compacted = 0;
  for (const agentId of AGENT_IDS) {
    const memFile = resolve(MEMORY_DIR, `${agentId}.md`);
    if (!existsSync(memFile)) continue;

    const content = readFileSync(memFile, "utf8");
    const entries = parseMemoryEntries(content);

    if (entries.length <= COMPACTION_THRESHOLD) {
      if (verbose) console.log(`   ${agentId}: ${entries.length} entries — OK (threshold: ${COMPACTION_THRESHOLD})`);
      continue;
    }

    if (verbose) console.log(`   ${agentId}: ${entries.length} entries — COMPACTING...`);

    const oldEntries = entries.slice(0, -KEEP_RECENT);
    const recentEntries = entries.slice(-KEEP_RECENT);

    // Use LLM to summarize old entries
    const summary = await compactEntries(agentId, oldEntries, verbose);

    // Rebuild memory file
    const header = `# ${AGENT_NAMES[agentId] || agentId} — Persistent Memory\n\nKey decisions, learnings, and context preserved across conversations.\n`;
    const compactedSection = `\n## Compacted History (${oldEntries.length} entries → summary)\n\n${summary}\n\n## Recent Entries\n\n`;
    const recentSection = recentEntries.map(e => e.raw).join("\n");

    writeFileSync(memFile, header + compactedSection + recentSection + "\n", "utf8");
    if (verbose) console.log(`      ✅ Compacted ${oldEntries.length} old → summary + ${recentEntries.length} recent`);
    compacted++;
  }

  return { compacted };
}

/**
 * Parse memory entries from a memory file.
 */
function parseMemoryEntries(content) {
  const lines = content.split("\n");
  const entries = [];
  for (const line of lines) {
    const match = line.match(/^- \*\*(\d{4}-\d{2}-\d{2}):\*\*\s*(.+)/);
    if (match) {
      entries.push({ date: match[1], text: match[2], raw: line });
    }
  }
  return entries;
}

/**
 * Use LLM to summarize old memory entries into a condensed form.
 */
async function compactEntries(agentId, entries, verbose) {
  const entriesText = entries.map(e => `- ${e.date}: ${e.text}`).join("\n");

  try {
    const result = await invokeAgent({
      agentId,
      prompt: `You need to COMPACT your old memory entries into a concise summary.

OLD ENTRIES (${entries.length} total, spanning ${entries[0]?.date} to ${entries[entries.length - 1]?.date}):
${entriesText}

RULES:
- Summarize into 5-8 bullet points capturing the MOST IMPORTANT patterns, decisions, and learnings
- Preserve specific numbers, dates, and decisions that would be useful in future standups
- Drop redundant or superseded information
- Format as bullet points starting with the date range they cover
- This summary replaces the individual entries — make sure nothing critical is lost

Output ONLY the bullet point summary, nothing else.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });
    return result.response;
  } catch (e) {
    // Fallback: just keep first and last 3 entries
    if (verbose) console.log(`      ⚠️ LLM compaction failed, using simple truncation`);
    const kept = [...entries.slice(0, 3), ...entries.slice(-3)];
    return kept.map(e => `- ${e.date}: ${e.text}`).join("\n") + `\n\n_(${entries.length - 6} entries truncated)_`;
  }
}

// ═══════════════════════════════════════════════════════════
// CROSS-AGENT MEMORY SHARING
// ═══════════════════════════════════════════════════════════

/**
 * Get cross-agent memory context for an agent.
 * Returns a string with relevant excerpts from other agents' memories.
 */
export function getCrossAgentMemory(agentId) {
  const accessList = MEMORY_ACCESS[agentId] || [];
  if (accessList.length === 0) return "";

  const sections = [];
  for (const otherId of accessList) {
    const memFile = resolve(MEMORY_DIR, `${otherId}.md`);
    if (!existsSync(memFile)) continue;

    const content = readFileSync(memFile, "utf8");
    // Get last 5 entries from the other agent
    const entries = parseMemoryEntries(content).slice(-5);
    if (entries.length === 0) continue;

    sections.push(`### ${AGENT_NAMES[otherId]} (recent):\n${entries.map(e => `- ${e.date}: ${e.text}`).join("\n")}`);
  }

  if (sections.length === 0) return "";
  return `## TEAM MEMORY (what your colleagues remember)\n\n${sections.join("\n\n")}`;
}

// ═══════════════════════════════════════════════════════════
// CEO FEEDBACK LEARNING
// ═══════════════════════════════════════════════════════════

/**
 * Extract CEO feedback patterns from decision history and update agent memories.
 */
export async function learnFromCEOFeedback({ verbose = true } = {}) {
  // Query decisions with CEO actions (approved, rejected, modified)
  const decisions = queryDb(`
    SELECT agent, title, status, content, updatedAt
    FROM AgentLog
    WHERE type = 'decision'
      AND status IN ('approved', 'rejected', 'modified')
      AND updatedAt > datetime('now', '-7 days')
    ORDER BY updatedAt DESC
    LIMIT 50
  `);

  if (!decisions || decisions.length === 0) {
    if (verbose) console.log("   📭 No recent CEO feedback to learn from.");
    return { learned: 0 };
  }

  // Group by agent
  const byAgent = {};
  for (const d of decisions) {
    if (!byAgent[d.agent]) byAgent[d.agent] = [];
    byAgent[d.agent].push(d);
  }

  let learned = 0;
  for (const [agentId, agentDecisions] of Object.entries(byAgent)) {
    const approved = agentDecisions.filter(d => d.status === "approved").length;
    const rejected = agentDecisions.filter(d => d.status === "rejected").length;
    const modified = agentDecisions.filter(d => d.status === "modified").length;
    const total = agentDecisions.length;
    const acceptanceRate = Math.round((approved / total) * 100);

    // Extract patterns from rejections and modifications
    const rejections = agentDecisions.filter(d => d.status === "rejected");
    const modifications = agentDecisions.filter(d => d.status === "modified");

    if (rejections.length > 0 || modifications.length > 0) {
      const feedbackItems = [
        ...rejections.map(d => `REJECTED: "${d.title}"`),
        ...modifications.map(d => `MODIFIED: "${d.title}"`),
      ].join("\n");

      // Write learning to agent memory
      const learning = `CEO feedback (7d): ${approved}/${total} approved (${acceptanceRate}%). ${rejected > 0 ? `Rejected: ${rejections.map(r => r.title.substring(0, 50)).join("; ")}. ` : ""}${modified > 0 ? `Modified: ${modifications.map(m => m.title.substring(0, 50)).join("; ")}.` : ""}`;

      appendToMemory(agentId, learning);
      if (verbose) console.log(`   ${agentId}: ${acceptanceRate}% acceptance (${approved}✅ ${rejected}❌ ${modified}📝)`);
      learned++;
    } else if (verbose) {
      console.log(`   ${agentId}: ${acceptanceRate}% acceptance — all approved, no corrections needed`);
    }
  }

  return { learned };
}

// ═══════════════════════════════════════════════════════════
// PERFORMANCE TRACKING
// ═══════════════════════════════════════════════════════════

/**
 * Compute and store per-agent performance metrics.
 */
export async function trackPerformance({ verbose = true } = {}) {
  const metrics = {};

  for (const agentId of AGENT_IDS) {
    // Proposal stats (last 30 days)
    const proposals = queryDb(`
      SELECT status, COUNT(*) as count
      FROM AgentLog
      WHERE agent = '${agentId}' AND type = 'decision'
        AND createdAt > datetime('now', '-30 days')
      GROUP BY status
    `);

    const statusMap = {};
    for (const row of (proposals || [])) {
      statusMap[row.status] = row.count;
    }

    const totalProposals = Object.values(statusMap).reduce((s, v) => s + v, 0);
    const approved = statusMap.approved || 0;
    const rejected = statusMap.rejected || 0;
    const modified = statusMap.modified || 0;

    // Execution velocity (avg days open → completed)
    const velocityRows = queryDb(`
      SELECT
        ROUND(AVG(julianday(updatedAt) - julianday(createdAt)), 1) as avgDays,
        COUNT(*) as completed
      FROM AgentLog
      WHERE agent = '${agentId}' AND type = 'decision' AND status IN ('approved', 'completed')
        AND createdAt > datetime('now', '-30 days')
    `);
    const avgVelocity = velocityRows?.[0]?.avgDays || 0;
    const completed = velocityRows?.[0]?.completed || 0;

    // Cross-team mentions (how often this agent is @mentioned)
    const mentionRows = queryDb(`
      SELECT COUNT(*) as count
      FROM AgentLog
      WHERE type IN ('chat', 'action') AND content LIKE '%@${agentId}%'
        AND createdAt > datetime('now', '-30 days')
    `);
    const mentions = mentionRows?.[0]?.count || 0;

    metrics[agentId] = {
      name: AGENT_NAMES[agentId],
      proposals: {
        total: totalProposals,
        approved, rejected, modified,
        acceptanceRate: totalProposals > 0 ? Math.round((approved / totalProposals) * 100) : 0,
      },
      velocity: {
        avgDaysToClose: avgVelocity,
        completedLast30d: completed,
      },
      collaboration: {
        mentionedByOthers: mentions,
      },
    };

    if (verbose) {
      const m = metrics[agentId];
      console.log(`   ${agentId.padEnd(10)} proposals: ${m.proposals.total} (${m.proposals.acceptanceRate}% accepted) | velocity: ${m.velocity.avgDaysToClose}d avg | mentions: ${m.collaboration.mentionedByOthers}`);
    }
  }

  // Store metrics
  const metricsFile = resolve(AGENTS_DIR, "logs", "performance.json");
  const history = existsSync(metricsFile) ? JSON.parse(readFileSync(metricsFile, "utf8")) : [];
  history.push({
    date: new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
    metrics,
  });
  // Keep last 90 days
  const cutoff = history.length > 90 ? history.length - 90 : 0;
  writeFileSync(metricsFile, JSON.stringify(history.slice(cutoff), null, 2), "utf8");

  if (verbose) console.log(`\n   📊 Performance metrics saved to agents/logs/performance.json`);
  return metrics;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

function appendToMemory(agentId, entry) {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
  const memFile = resolve(MEMORY_DIR, `${agentId}.md`);
  const timestamp = new Date().toISOString().split("T")[0];
  const line = `\n- **${timestamp}:** ${entry}\n`;

  let existing = "";
  if (existsSync(memFile)) {
    existing = readFileSync(memFile, "utf8");
  } else {
    existing = `# ${AGENT_NAMES[agentId] || agentId} — Persistent Memory\n\nKey decisions, learnings, and context preserved across conversations.\n`;
  }
  writeFileSync(memFile, existing + line, "utf8");
}

function queryDb(sql) {
  try {
    const escaped = sql.replace(/`/g, "\\`").replace(/\n/g, " ");
    const script = `const Database=require('better-sqlite3'),path=require('path'),fs=require('fs');const p=path.join('${ROOT.replace(/\\/g, "\\\\")}','data','production.db');const d=path.join('${ROOT.replace(/\\/g, "\\\\")}','dev.db');const dbPath=fs.existsSync(p)?p:d;if(!fs.existsSync(dbPath)){console.log('[]');process.exit(0);}const db=new Database(dbPath,{readonly:true});try{console.log(JSON.stringify(db.prepare(\`${escaped}\`).all()));}catch(e){console.log('[]');}db.close();`;
    const result = execSync(`"${SYSTEM_NODE}" -e "${script.replace(/"/g, '\\"')}"`, {
      cwd: ROOT, encoding: "utf8", timeout: 10000,
    });
    return JSON.parse(result.trim() || "[]");
  } catch { return []; }
}

/**
 * Run all memory management tasks.
 */
export async function runMemoryManagement({ verbose = true } = {}) {
  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🧠 Agent Memory & Learning`);
    console.log(`${"═".repeat(60)}`);
  }

  if (verbose) console.log("\n   📦 Memory compaction:");
  const compaction = await compactAllMemories({ verbose });

  if (verbose) console.log("\n   🎓 CEO feedback learning:");
  const learning = await learnFromCEOFeedback({ verbose });

  if (verbose) console.log("\n   📊 Performance tracking:");
  const performance = await trackPerformance({ verbose });

  return { compaction, learning, performance };
}

// CLI entry point
if (process.argv[1]?.includes("memory-manager")) {
  const cmd = process.argv[2] || "all";
  console.log(`🧠 Memory manager: ${cmd}`);

  switch (cmd) {
    case "compact":
      compactAllMemories().then(r => console.log(`Done. Compacted ${r.compacted} agents.`));
      break;
    case "learn":
      learnFromCEOFeedback().then(r => console.log(`Done. Updated ${r.learned} agents.`));
      break;
    case "performance":
      trackPerformance().then(() => console.log("Done."));
      break;
    default:
      runMemoryManagement().then(() => console.log("\n✅ All memory tasks complete."));
  }
}
