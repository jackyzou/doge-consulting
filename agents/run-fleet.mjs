#!/usr/bin/env node

/**
 * Doge Consulting — Agent Fleet Runner
 *
 * Usage:
 *   node agents/run-fleet.mjs                  # Run all agents (morning brief)
 *   node agents/run-fleet.mjs --agent alex     # Run specific agent
 *   node agents/run-fleet.mjs --mode evening   # Evening summary mode
 *   node agents/run-fleet.mjs --list           # List all agents
 *
 * This script:
 *   1. Loads agent profiles and CODE-OF-CONDUCT.md
 *   2. Gathers context (analytics, financials, recent logs)
 *   3. Produces a structured brief/report
 *   4. Logs decisions to the database (AgentLog model)
 *   5. Saves a backup log to agents/logs/YYYY-MM-DD.md
 *   6. Sends the brief email to dogetech77@gmail.com
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { CONFIG } from "./config.mjs";

const ROOT = process.cwd();
const args = process.argv.slice(2);

// Parse CLI flags
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--agent" && args[i + 1]) { flags.agent = args[++i]; }
  else if (args[i] === "--mode" && args[i + 1]) { flags.mode = args[++i]; }
  else if (args[i] === "--list") { flags.list = true; }
}

// ── List agents ─────────────────────────────────────────────
if (flags.list) {
  console.log("\n🐕 Doge Consulting Agent Fleet\n");
  console.log("=" .repeat(60));
  for (const agent of CONFIG.agents) {
    console.log(`  ${agent.id.padEnd(10)} ${agent.name.padEnd(20)} ${agent.role}`);
    console.log(`             Skills: ${agent.skills.join(", ")}`);
    console.log();
  }
  console.log(`Total: ${CONFIG.agents.length} agents`);
  console.log(`Revenue target: $${CONFIG.revenue.target.toLocaleString()} by ${CONFIG.revenue.deadline}`);
  process.exit(0);
}

// ── Load context ────────────────────────────────────────────
function loadFile(path) {
  const fullPath = join(ROOT, path);
  if (existsSync(fullPath)) return readFileSync(fullPath, "utf-8");
  return null;
}

const skills = loadFile("agents/CODE-OF-CONDUCT.md") || loadFile("agents/SKILLS.md") || "";
const readme = loadFile("agents/README.md") || "";

// Load specific agent profile or all
const agentsToRun = flags.agent
  ? CONFIG.agents.filter(a => a.id === flags.agent)
  : CONFIG.agents;

if (agentsToRun.length === 0) {
  console.error(`❌ Agent "${flags.agent}" not found. Use --list to see available agents.`);
  process.exit(1);
}

// ── Gather system context ───────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const logsDir = join(ROOT, CONFIG.paths.logs);
if (!existsSync(logsDir)) mkdirSync(logsDir, { recursive: true });

// Read recent logs for context
const recentLogFile = join(logsDir, `${today}.md`);
const existingLog = existsSync(recentLogFile) ? readFileSync(recentLogFile, "utf-8") : "";

// ── Generate brief ──────────────────────────────────────────
const mode = flags.mode || "morning";
const timestamp = new Date().toLocaleString("en-US", { timeZone: CONFIG.schedule.timezone });

console.log(`\n🐕 Doge Consulting Agent Fleet — ${mode === "morning" ? "Morning Brief" : "Evening Summary"}`);
console.log(`📅 ${today} | ⏰ ${timestamp} PST`);
console.log("=".repeat(60));

const briefSections = [];

for (const agent of agentsToRun) {
  const profile = loadFile(agent.profile);
  if (!profile) {
    console.log(`⚠️  Profile not found: ${agent.profile}`);
    continue;
  }

  console.log(`\n👤 ${agent.name} (${agent.role})`);
  console.log(`   Skills: ${agent.skills.join(", ")}`);
  console.log(`   Profile: ${agent.profile}`);

  briefSections.push({
    agent: agent.id,
    name: agent.name,
    role: agent.role,
    skills: agent.skills,
    profile: profile.substring(0, 500) + "...",
  });
}

// ── Write daily log ─────────────────────────────────────────
const logEntry = `
## ${mode === "morning" ? "Morning Brief" : "Evening Summary"} — ${timestamp}

### Agents Invoked
${agentsToRun.map(a => `- **${a.name}** (${a.role})`).join("\n")}

### Revenue Target
- Goal: $${CONFIG.revenue.target.toLocaleString()} by ${CONFIG.revenue.deadline}
- Monthly target: $${CONFIG.revenue.monthlyTarget.toLocaleString()}

### Status
Fleet invoked at ${timestamp} PST.
Mode: ${mode}
Agents: ${agentsToRun.length}

---
`;

const updatedLog = existingLog + logEntry;
writeFileSync(recentLogFile, updatedLog, "utf-8");
console.log(`\n📝 Log saved: agents/logs/${today}.md`);

// ── Generate TODOs from sync pull (CEO decisions + chat messages) ────
const syncPullPath = join(logsDir, ".last-sync-pull.json");
if (existsSync(syncPullPath)) {
  try {
    const pullData = JSON.parse(readFileSync(syncPullPath, "utf-8"));
    const todos = [];

    // In-progress decisions = active TODOs
    if (pullData.ceoActions) {
      for (const action of pullData.ceoActions) {
        if (action.status === "in_progress" || action.status === "open") {
          todos.push({ type: "decision", agent: action.agent || "alex", title: action.title, action: action.action || "" });
        }
      }
    }

    if (todos.length > 0) {
      console.log(`\n📋 Active TODOs from CEO (${todos.length}):`);
      console.log("─".repeat(50));
      for (const todo of todos) {
        const agentName = CONFIG.agents.find(a => a.id === todo.agent)?.name || todo.agent;
        console.log(`  → [${agentName}] ${todo.title}`);
        if (todo.action) {
          const actionPreview = todo.action.replace(/\*\*/g, "").substring(0, 120);
          if (actionPreview) console.log(`    CEO: ${actionPreview}`);
        }
      }
      console.log("─".repeat(50));

      // Write TODOs to a file for easy reference
      const todoFile = join(logsDir, ".active-todos.md");
      const todoMd = `# Active TODOs — ${today}\n\nGenerated from CEO decisions at ${timestamp}\n\n` +
        todos.map((t, i) => {
          const agentName = CONFIG.agents.find(a => a.id === t.agent)?.name || t.agent;
          return `## ${i + 1}. ${t.title}\n- **Owner:** ${agentName}\n- **CEO Comment:** ${t.action || "No comment"}\n- **Status:** In Progress\n`;
        }).join("\n");
      writeFileSync(todoFile, todoMd, "utf-8");
      console.log(`   Saved to: agents/logs/.active-todos.md`);
    }

    // Unaddressed chat messages
    // Check for chat messages in the local DB or from sync
    console.log(`\n📊 Sync Status: ${pullData.openItems || 0} open | ${pullData.inProgress || 0} in-progress | ${pullData.completed || 0} approved | ${pullData.rejected || 0} rejected`);
  } catch {
    // Non-critical — sync pull may not exist yet
  }
}

// ── Summary ─────────────────────────────────────────────────
console.log("\n" + "=".repeat(60));
console.log(`✅ Fleet ${mode} complete.`);
console.log(`   ${agentsToRun.length} agent(s) invoked`);
console.log(`   Log: agents/logs/${today}.md`);
console.log(`   Email target: ${CONFIG.company.briefEmail}`);
console.log(`\n💡 To send email brief, connect to the app's /api/deploy-notify endpoint`);
console.log(`   or run with SMTP configured.\n`);
