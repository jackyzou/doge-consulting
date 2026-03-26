// Test items 7-9: quote lifecycle, contact triage, memory compaction
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Lazy require for better-sqlite3
const Database = (await import("better-sqlite3")).default;
const db = new Database(resolve(__dirname, "..", "data", "production.db"));

console.log("=== Test 7: Quote Lifecycle ===");
const quotes = db.prepare("SELECT quoteNumber, status, customerEmail, createdAt FROM Quote ORDER BY createdAt DESC LIMIT 5").all();
console.log(`Quotes in DB: ${quotes.length}`);
quotes.forEach(q => console.log(`  ${q.quoteNumber} | ${q.status} | ${q.customerEmail} | ${q.createdAt}`));

// Check if any quotes are old enough for Day 3 followup
const oldQuotes = db.prepare("SELECT count(*) as c FROM Quote WHERE status='sent' AND createdAt < datetime('now', '-3 days')").get();
console.log(`Quotes pending >3 days: ${oldQuotes.c}`);
console.log(`Result: ${oldQuotes.c > 0 ? "TESTABLE — real aging quotes found" : "NO DATA — no aging quotes to trigger lifecycle"}`);

console.log("\n=== Test 8: Contact Triage ===");
try {
  const contacts = db.prepare("SELECT count(*) as c FROM ContactInquiry WHERE status='new'").get();
  console.log(`New contacts to triage: ${contacts.c}`);
  console.log(`Result: ${contacts.c > 0 ? "TESTABLE — new contacts found" : "NO DATA — no new contacts to triage"}`);
} catch (e) {
  console.log(`ContactInquiry table: ${e.message.includes("no such table") ? "TABLE NOT FOUND — need to create" : e.message}`);
}

console.log("\n=== Test 9: Memory Compaction ===");
import { readFileSync, existsSync } from "fs";
const memDir = resolve(__dirname, "..", "agents", "memory");
const agents = ["alex", "amy", "seth", "rachel", "seto", "tiffany"];
let maxEntries = 0;
agents.forEach(id => {
  const path = resolve(memDir, `${id}.md`);
  if (existsSync(path)) {
    const content = readFileSync(path, "utf8");
    const entries = (content.match(/^- \*\*/gm) || []).length;
    maxEntries = Math.max(maxEntries, entries);
    console.log(`  ${id}: ${entries} memory entries`);
  } else {
    console.log(`  ${id}: no memory file`);
  }
});
console.log(`Max entries: ${maxEntries}`);
console.log(`Result: ${maxEntries >= 30 ? "TESTABLE — compaction threshold reached" : `BELOW THRESHOLD — need ${30 - maxEntries} more entries to trigger compaction`}`);

db.close();
console.log("\n=== All Tests Complete ===");
