// Direct local sync — writes standups + decisions directly to production.db
// No network required. Run after creating the AgentLog table.
import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, readdirSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const dbPath = resolve(ROOT, "data", "production.db");
const logsDir = resolve(ROOT, "agents", "logs");

if (!existsSync(dbPath)) { console.error("No production.db found"); process.exit(1); }

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Ensure table exists
db.exec(`CREATE TABLE IF NOT EXISTS AgentLog (
  id TEXT PRIMARY KEY, agent TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'note',
  priority TEXT NOT NULL DEFAULT 'normal', title TEXT NOT NULL, content TEXT NOT NULL,
  tags TEXT, status TEXT NOT NULL DEFAULT 'open', assignedTo TEXT, relatedTo TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const insert = db.prepare(`INSERT OR IGNORE INTO AgentLog (id, agent, type, priority, title, content, tags, status, assignedTo, relatedTo, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
const findByType = db.prepare("SELECT id FROM AgentLog WHERE type = ? AND relatedTo = ?");
const findDecision = db.prepare("SELECT id FROM AgentLog WHERE type = 'decision' AND title = ?");
const updateContent = db.prepare("UPDATE AgentLog SET content = ?, updatedAt = ? WHERE id = ?");

const files = readdirSync(logsDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .sort()
  .reverse();

let standupsCreated = 0;
let decisionsCreated = 0;
const now = new Date().toISOString();

const agentMap = { seth: "seth", seto: "seto", rachel: "rachel", amy: "amy", tiffany: "tiffany", alex: "alex" };

for (const file of files) {
  const content = readFileSync(resolve(logsDir, file), "utf-8");
  const date = file.replace(".md", "");
  const relatedTo = `standup:${date}`;
  const agentMatches = content.match(/\*\*(Alex|Amy|Seth|Rachel|Seto|Tiffany|Jacky)\b/g);
  const agents = [...new Set((agentMatches || []).map(m => m.replace(/\*\*/g, "")))];

  // Upsert standup
  const existing = findByType.get("standup", relatedTo);
  if (!existing) {
    insert.run(randomUUID(), "alex", "standup", "normal", `Daily Standup — ${date}`, content, agents.join(","), "completed", null, relatedTo, `${date}T09:00:00.000Z`, now);
    standupsCreated++;
  }

  // Extract decisions
  let currentAgent = "alex";
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const agentHeader = trimmed.match(/^#{1,4}\s+(Seth|Seto|Rachel|Amy|Tiffany|Alex)\s/i);
    if (agentHeader) currentAgent = agentMap[agentHeader[1].toLowerCase()] || "alex";
    if (trimmed.match(/Round\s*2|Synthesis|Alex Chen Synthesis/i)) currentAgent = "alex";

    const decMatch = trimmed.match(/\[DECISION\]\s*(.+?)\s*—\s*(NEEDS_CEO|PROPOSED|APPROVED|REJECTED|MODIFIED)/i);
    if (decMatch) {
      const title = decMatch[1].trim();
      const rawStatus = decMatch[2].toUpperCase();
      const status = rawStatus === "NEEDS_CEO" ? "open" : rawStatus === "PROPOSED" ? "open" : rawStatus === "APPROVED" ? "completed" : rawStatus === "REJECTED" ? "rejected" : "open";
      const priority = rawStatus === "NEEDS_CEO" ? "critical" : "normal";

      const existingDec = findDecision.get(title);
      if (!existingDec) {
        insert.run(randomUUID(), currentAgent, "decision", priority, title, `From standup ${date} (proposed by ${currentAgent}): ${title}`, null, status, rawStatus === "NEEDS_CEO" ? "jacky" : null, `standup:${date}`, `${date}T09:00:00.000Z`, now);
        decisionsCreated++;
      }
    }
  }
}

// Also store the Code of Conduct
const cocPath = resolve(ROOT, "agents", "CODE-OF-CONDUCT.md");
if (existsSync(cocPath)) {
  const coc = readFileSync(cocPath, "utf-8");
  const existingCoc = findByType.get("coc", "coc:latest");
  if (!existingCoc) {
    insert.run(randomUUID(), "alex", "coc", "normal", "Code of Conduct", coc, null, "completed", null, "coc:latest", now, now);
    console.log("📜 Code of Conduct stored");
  } else {
    updateContent.run(coc, now, existingCoc.id);
    console.log("📜 Code of Conduct updated");
  }
}

const total = db.prepare("SELECT count(*) as c FROM AgentLog").get();
const byType = db.prepare("SELECT type, count(*) as c FROM AgentLog GROUP BY type ORDER BY c DESC").all();
console.log(`\n✅ Local sync complete:`);
console.log(`   Standups: ${standupsCreated} new`);
console.log(`   Decisions: ${decisionsCreated} new`);
console.log(`   Total rows: ${total.c}`);
console.table(byType);
db.close();
