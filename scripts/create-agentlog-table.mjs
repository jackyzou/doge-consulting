import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prodPath = resolve(__dirname, "..", "data", "production.db");
const devPath = resolve(__dirname, "..", "prisma", "dev.db");
const dbPath = existsSync(prodPath) ? prodPath : devPath;

console.log(`Using database: ${dbPath}`);
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS AgentLog (
    id TEXT PRIMARY KEY,
    agent TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'note',
    priority TEXT NOT NULL DEFAULT 'normal',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    assignedTo TEXT,
    relatedTo TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec("CREATE INDEX IF NOT EXISTS idx_agentlog_agent ON AgentLog(agent)");
db.exec("CREATE INDEX IF NOT EXISTS idx_agentlog_type ON AgentLog(type)");
db.exec("CREATE INDEX IF NOT EXISTS idx_agentlog_priority ON AgentLog(priority)");
db.exec("CREATE INDEX IF NOT EXISTS idx_agentlog_status ON AgentLog(status)");
db.exec("CREATE INDEX IF NOT EXISTS idx_agentlog_createdAt ON AgentLog(createdAt)");

const count = db.prepare("SELECT count(*) as c FROM AgentLog").get();
console.log(`✅ AgentLog table ready — ${count.c} existing rows`);
db.close();
