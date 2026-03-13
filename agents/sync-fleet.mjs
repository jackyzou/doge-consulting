#!/usr/bin/env node
/**
 * Fleet Sync — Push local standup logs + decisions to production server
 *
 * Usage:
 *   node agents/sync-fleet.mjs                    # Sync all logs
 *   node agents/sync-fleet.mjs --days 7           # Sync last 7 days only
 *   node agents/sync-fleet.mjs --dry-run          # Preview without sending
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const ROOT = process.cwd();
const SYNC_URL = process.env.FLEET_SYNC_URL || "https://doge-consulting.com/api/admin/fleet/sync";
const SYNC_SECRET = process.env.FLEET_SYNC_SECRET || process.env.JWT_SECRET || "";

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--days" && args[i + 1]) flags.days = parseInt(args[++i]);
  if (args[i] === "--dry-run") flags.dryRun = true;
  if (args[i] === "--url" && args[i + 1]) flags.url = args[++i];
  if (args[i] === "--secret" && args[i + 1]) flags.secret = args[++i];
  if (args[i] === "--reset-decisions") flags.resetDecisions = true;
}

const targetUrl = flags.url || SYNC_URL;
const daysBack = flags.days || 30;
const syncSecret = flags.secret || SYNC_SECRET;

if (!syncSecret) {
  console.error("❌ No FLEET_SYNC_SECRET found. Set in .env.local or use --secret <value>");
  process.exit(1);
}

console.log(`\n🔄 Fleet Sync — Pushing to ${targetUrl}`);
console.log(`   Days: last ${daysBack} | Dry run: ${flags.dryRun ? "YES" : "no"}\n`);

const logsDir = join(ROOT, "agents", "logs");
if (!existsSync(logsDir)) {
  console.error("❌ No agents/logs/ directory found");
  process.exit(1);
}

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - daysBack);

const files = readdirSync(logsDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .filter(f => new Date(f.replace(".md", "")) >= cutoff)
  .sort()
  .reverse();

console.log(`📂 Found ${files.length} log files\n`);

const standups = [];
const decisions = [];

for (const file of files) {
  const content = readFileSync(join(logsDir, file), "utf-8");
  const date = file.replace(".md", "");
  const agentMatches = content.match(/\*\*(Alex|Amy|Seth|Rachel|Seto|Tiffany|Jacky)\b/g);
  const agents = [...new Set((agentMatches || []).map(m => m.replace(/\*\*/g, "")))];

  standups.push({ date, content, agents });
  console.log(`  📝 ${date} — ${(content.length / 1024).toFixed(1)} KB, ${agents.length} agents`);

  // Extract decisions with correct agent attribution
  // Track which agent section we're inside by looking for #### Agent Name headers
  let currentAgent = "alex";
  const agentMap = { "seth": "seth", "seto": "seto", "rachel": "rachel", "amy": "amy", "tiffany": "tiffany", "alex": "alex" };

  for (const line of content.split("\n")) {
    const trimmed = line.trim();

    // Detect agent section headers like "#### Seth Parker (CTO)" or "#### Amy Lin (CFO)"
    const agentHeader = trimmed.match(/^#{1,4}\s+(Seth|Seto|Rachel|Amy|Tiffany|Alex)\s/i);
    if (agentHeader) {
      currentAgent = agentMap[agentHeader[1].toLowerCase()] || "alex";
    }
    // Also detect "### Round 2 — Alex" synthesis sections
    if (trimmed.match(/Round\s*2|Synthesis|Alex Chen Synthesis/i)) {
      currentAgent = "alex";
    }

    const decMatch = trimmed.match(/\[DECISION\]\s*(.+?)\s*—\s*(NEEDS_CEO|PROPOSED|APPROVED|REJECTED|MODIFIED)/i);
    if (decMatch) {
      decisions.push({
        agent: currentAgent,
        title: decMatch[1].trim(),
        content: `From standup ${date} (proposed by ${currentAgent}): ${decMatch[1].trim()}`,
        status: decMatch[2] === "NEEDS_CEO" ? "open" : decMatch[2] === "PROPOSED" ? "open" : "completed",
        priority: decMatch[2] === "NEEDS_CEO" ? "critical" : "normal",
        assignedTo: decMatch[2] === "NEEDS_CEO" ? "jacky" : null,
        relatedTo: `standup:${date}`,
      });
    }
  }
}

console.log(`\n📊 Total: ${standups.length} standups, ${decisions.length} decisions`);

// Read Code of Conduct
let coc = null;
const cocPath = join(ROOT, "agents", "CODE-OF-CONDUCT.md");
if (existsSync(cocPath)) {
  coc = readFileSync(cocPath, "utf-8");
  console.log(`📜 Code of Conduct: ${(coc.length / 1024).toFixed(1)} KB`);
}

if (flags.dryRun) {
  console.log("\n🏁 Dry run complete. Remove --dry-run to push.\n");
  process.exit(0);
}

console.log(`\n🚀 Pushing...`);

try {
  const res = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-fleet-secret": syncSecret },
    body: JSON.stringify({ standups, decisions, coc, resetDecisions: flags.resetDecisions || false }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ ${data.message}\n`);
  } else {
    console.error(`❌ ${res.status}: ${data.error || JSON.stringify(data)}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`❌ Network error: ${err.message}`);
  process.exit(1);
}

// ── Bidirectional: Pull CEO decisions/feedback from production ──
console.log("📥 Pulling CEO decisions from production...");
try {
  const pullUrl = targetUrl.replace("/sync", "/sync");
  const pullRes = await fetch(pullUrl, {
    method: "GET",
    headers: { "x-fleet-secret": syncSecret },
  });
  const pullData = await pullRes.json();
  if (pullRes.ok && pullData.decisions) {
    const ceoFeedback = pullData.decisions.filter(d => d.content && d.content.includes("CEO Feedback"));
    const openItems = pullData.decisions.filter(d => d.status === "open");
    const inProgress = pullData.decisions.filter(d => d.status === "in_progress");
    const completed = pullData.decisions.filter(d => d.status === "completed");
    console.log(`   📊 ${pullData.count} total decisions on production`);
    console.log(`      Open: ${openItems.length} | In Progress: ${inProgress.length} | Completed: ${completed.length}`);
    if (ceoFeedback.length > 0) {
      console.log(`   💬 ${ceoFeedback.length} decisions have CEO feedback`);
      for (const d of ceoFeedback.slice(0, 5)) {
        console.log(`      → ${d.title} (${d.status})`);
      }
    }
    // Write a summary for the next standup context
    const summaryPath = join(ROOT, "agents", "logs", ".last-sync-pull.json");
    writeFileSync(summaryPath, JSON.stringify({ pulledAt: new Date().toISOString(), openItems: openItems.length, inProgress: inProgress.length, completed: completed.length, ceoFeedback: ceoFeedback.map(d => ({ title: d.title, status: d.status, feedback: d.content.split("CEO Feedback")[1]?.substring(0, 200) || "" })) }, null, 2));
    console.log(`   💾 Saved pull summary to agents/logs/.last-sync-pull.json`);
  } else {
    console.log(`   ⚠️  Pull returned ${pullRes.status}: ${pullData.error || "unknown"}`);
  }
} catch (err) {
  console.log(`   ⚠️  Pull failed (non-critical): ${err.message}`);
}

console.log("\n🏁 Sync complete. Run fleet standup to incorporate CEO feedback.\n");
