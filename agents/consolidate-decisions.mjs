/**
 * Consolidate open decision tickets.
 * 
 * - Closes duplicate/similar decisions (keeps the most recent)
 * - Cleans titles: strips markdown, truncates to 80 chars
 * - Auto-approves decisions older than 7 days (stale = auto-approved per CoC)
 * 
 * Usage: node agents/consolidate-decisions.mjs
 */
import { createRequire } from "module";
import { join } from "path";
import { existsSync } from "fs";

const require = createRequire(import.meta.url);
const ROOT = join(import.meta.dirname, "..");

const Database = require("better-sqlite3");
const dbPath = join(ROOT, "dev.db");

if (!existsSync(dbPath)) {
  console.log("No dev.db found");
  process.exit(1);
}

const conn = new Database(dbPath);

// Get all open decisions
const openDecisions = conn.prepare(
  `SELECT id, title, content, agent, status, createdAt FROM AgentLog 
   WHERE type = 'decision' AND status IN ('open', 'proposed') 
   ORDER BY createdAt DESC`
).all();

console.log(`Found ${openDecisions.length} open decisions.\n`);

// Step 1: Clean titles (strip markdown, truncate)
let cleaned = 0;
for (const d of openDecisions) {
  const cleanTitle = d.title.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  const shortTitle = cleanTitle.length > 80 ? cleanTitle.substring(0, 77) + "..." : cleanTitle;
  if (shortTitle !== d.title) {
    conn.prepare(`UPDATE AgentLog SET title = ?, updatedAt = datetime('now') WHERE id = ?`).run(shortTitle, d.id);
    cleaned++;
  }
}
console.log(`Cleaned ${cleaned} titles (stripped ** and truncated).`);

// Step 2: Find and close duplicates (same core topic)
const seen = new Map(); // normalized title → most recent id
let dupesClosed = 0;

for (const d of openDecisions) {
  // Normalize: lowercase, strip noise words, take first 40 chars
  const normalized = d.title.toLowerCase()
    .replace(/\*\*/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(the|and|for|with|from|that|this|should|must|need|will|today|tomorrow|by|noon|eod|asap)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 40);
  
  if (seen.has(normalized)) {
    // This is a duplicate — close it
    conn.prepare(`UPDATE AgentLog SET status = 'completed', updatedAt = datetime('now') WHERE id = ?`).run(d.id);
    dupesClosed++;
  } else {
    seen.set(normalized, d.id);
  }
}
console.log(`Closed ${dupesClosed} duplicate decisions.`);

// Step 3: Auto-approve decisions older than 7 days
const staleDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const staleResult = conn.prepare(
  `UPDATE AgentLog SET status = 'completed', updatedAt = datetime('now') 
   WHERE type = 'decision' AND status IN ('open', 'proposed') AND createdAt < ?`
).run(staleDate);
console.log(`Auto-completed ${staleResult.changes} stale decisions (>7 days old).`);

// Final count
const remaining = conn.prepare(
  `SELECT COUNT(*) as c FROM AgentLog WHERE type = 'decision' AND status IN ('open', 'proposed')`
).get();
console.log(`\nRemaining open decisions: ${remaining.c}`);

conn.close();
console.log("✅ Done.");
