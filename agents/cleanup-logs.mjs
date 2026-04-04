/**
 * Retroactively clean up past standup logs to use the new structured template.
 * 
 * Reads each daily log, extracts key data (KPIs, decisions, agent names),
 * and re-renders it in the new template format.
 * 
 * Usage: node agents/cleanup-logs.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const LOGS_DIR = join(import.meta.dirname, "logs");

const files = readdirSync(LOGS_DIR)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort();

console.log(`Found ${files.length} standup log files to clean up.\n`);

for (const file of files) {
  const date = file.replace(".md", "");
  const filePath = join(LOGS_DIR, file);
  const content = readFileSync(filePath, "utf-8");
  
  // Extract data from the raw log
  const version = content.match(/v([\d.]+)/)?.[1] || "2.0.0";
  const pages = content.match(/(\d+)\s*pages/)?.[1] || "?";
  const blogPosts = content.match(/(\d+)\s*(?:blog\s*posts|published)/)?.[1] || "?";
  const subscribers = content.match(/(\d+)\s*subscribers?/)?.[1] || "?";
  const revenue = content.match(/\$(\d[\d,]*)\s*(?:\/|\s*revenue)/)?.[1] || "0";
  const quotes = content.match(/(\d+)\s*(?:total|quotes)/)?.[1] || "0";
  const orders = content.match(/(\d+)\s*orders?/i)?.[1] || "0";
  
  // Extract agent names mentioned
  const agentPattern = /###?\s*(Amy Lin|Seth Parker|Rachel Morales|Seto Nakamura|Tiffany Wang|Kim Park|Alex Chen)\s*[—–-]/g;
  const agents = new Set();
  let m;
  while ((m = agentPattern.exec(content)) !== null) agents.add(m[1]);
  
  // Extract decisions
  const decisionPattern = /\[DECISION\]\s*\*?\*?([^*\n]{10,200})/g;
  const decisions = [];
  while ((m = decisionPattern.exec(content)) !== null) {
    if (decisions.length < 7) {
      decisions.push(m[1].replace(/\*\*/g, "").trim().substring(0, 60));
    }
  }
  
  // Count health checks
  const healthChecks = (content.match(/Health Check/g) || []).length;
  const healthStatus = content.includes("CRITICAL") || content.includes("DEGRADED") ? "DEGRADED" : "HEALTHY";
  
  // Count standup runs (look for "Morning Brief" or "Evening Summary")
  const runs = (content.match(/Morning Brief|Evening Summary/g) || []).length || 1;
  
  // Extract agent report summaries (first paragraph after agent heading)
  const agentSummaries = [];
  for (const agent of agents) {
    const agentSection = content.match(new RegExp(`###?\\s*${agent.replace(/[()]/g, "\\$&")}[^#]*?(?=###|$)`, "s"));
    if (agentSection) {
      // Get first meaningful paragraph
      const paragraphs = agentSection[0].split("\n\n").filter(p => p.trim().length > 20 && !p.startsWith("#"));
      const summary = paragraphs[0]?.replace(/\n/g, " ").substring(0, 200).trim() || "Report available";
      agentSummaries.push({ name: agent, summary });
    }
  }
  
  // Build agent status board
  const agentStatusRows = agentSummaries.map(a => {
    const focus = a.summary.substring(0, 50);
    return `| ${a.name} | ${focus}... | — |`;
  }).join("\n");
  
  // Build decision rows
  const decisionRows = decisions.map((d, i) => {
    return `| ${i + 1} | DT-${date}-${i + 1} | ${d} | \`proposed\` |`;
  }).join("\n");
  
  // Build cleaned log
  const dateObj = new Date(date + "T12:00:00");
  const dateLong = dateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  
  const cleanedLog = `# Daily Brief — ${dateLong}

> **${runs} standup run${runs > 1 ? "s" : ""}** · v${version} · ${healthChecks} health checks

---

## Dashboard

| Metric | Value |
|--------|-------|
| Version | v${version} |
| Pages | ${pages} |
| Blog Posts | ${blogPosts} published |
| Revenue | $${revenue} |
| Subscribers | ${subscribers} |
| Quotes | ${quotes} |
| Orders | ${orders} |
| Site Health | ${healthStatus} |

---

## Agent Status Board

| Agent | Focus | Blocker |
|-------|-------|---------|
${agentStatusRows || "| — | No agent reports available | — |"}

---

## Decisions (${decisions.length})

| # | ID | Decision | Status |
|---|-----|----------|--------|
${decisionRows || "| — | — | No decisions this day | — |"}

---

## Agent Reports

${agentSummaries.map(a => `### ${a.name}

${a.summary}
`).join("\n---\n\n") || "> No detailed agent reports available for this day."}

---

*Cleaned from original ${Math.round(content.length / 1024)}KB log · ${runs} standup run${runs > 1 ? "s" : ""} · ${agents.size} agents*
`;
  
  writeFileSync(filePath, cleanedLog, "utf-8");
  
  const originalSizeKB = Math.round(content.length / 1024);
  const newSizeKB = Math.round(cleanedLog.length / 1024);
  console.log(`  ${date}: ${originalSizeKB}KB → ${newSizeKB}KB (${agents.size} agents, ${decisions.length} decisions)`);
}

console.log(`\n✅ Cleaned ${files.length} log files.`);
