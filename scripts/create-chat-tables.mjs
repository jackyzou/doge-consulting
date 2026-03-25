// Create ChatThread + ChatMessage tables in production DB
import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prodPath = resolve(__dirname, "..", "data", "production.db");
const devPath = resolve(__dirname, "..", "prisma", "dev.db");
const dbPath = process.env.DATABASE_PATH || (existsSync(prodPath) ? prodPath : devPath);

console.log(`Using database: ${dbPath}`);
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS ChatThread (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  triggerType TEXT NOT NULL DEFAULT 'user_message',
  participants TEXT NOT NULL DEFAULT '',
  relatedId TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chatthread_status ON ChatThread(status);
CREATE INDEX IF NOT EXISTS idx_chatthread_createdAt ON ChatThread(createdAt);
CREATE INDEX IF NOT EXISTS idx_chatthread_triggerType ON ChatThread(triggerType);

CREATE TABLE IF NOT EXISTS ChatMessage (
  id TEXT PRIMARY KEY,
  threadId TEXT NOT NULL REFERENCES ChatThread(id) ON DELETE CASCADE,
  parentId TEXT,
  sender TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT,
  attachments TEXT,
  metadata TEXT,
  status TEXT NOT NULL DEFAULT 'delivered',
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chatmessage_threadId ON ChatMessage(threadId);
CREATE INDEX IF NOT EXISTS idx_chatmessage_sender ON ChatMessage(sender);
CREATE INDEX IF NOT EXISTS idx_chatmessage_createdAt ON ChatMessage(createdAt);
CREATE INDEX IF NOT EXISTS idx_chatmessage_status ON ChatMessage(status);
`);

console.log("✅ Tables created:");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Chat%'").all();
tables.forEach(t => console.log("  -", t.name));

const threadCount = db.prepare("SELECT count(*) as c FROM ChatThread").get();
const messageCount = db.prepare("SELECT count(*) as c FROM ChatMessage").get();
console.log(`  ChatThread rows: ${threadCount.c}`);
console.log(`  ChatMessage rows: ${messageCount.c}`);
db.close();
