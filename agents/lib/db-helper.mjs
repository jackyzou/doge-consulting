// agents/lib/db-helper.mjs — Shared database access helpers
// Handles the Node version mismatch: better-sqlite3 is compiled for the system Node (v24),
// but Claude Code's shell uses v22. This module detects the right Node and uses it.

import { execSync } from "child_process";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

/**
 * Detect the correct Node binary for better-sqlite3 access.
 * Strategy:
 * 1. If current process can load better-sqlite3, use process.execPath (we're already on the right Node)
 * 2. Otherwise, try known system Node locations
 * 3. Fall back to "node" and hope for the best
 */
function detectNodePath() {
  // First: try current process
  try {
    require("better-sqlite3");
    return process.execPath; // Current Node works
  } catch {}

  // Second: try known Windows system Node locations
  const candidates = [
    "C:\\Program Files\\nodejs\\node.exe",
    "C:\\Program Files (x86)\\nodejs\\node.exe",
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      try {
        // Verify this Node can actually load better-sqlite3
        execSync(`"${candidate}" -e "require('better-sqlite3')"`, {
          cwd: ROOT, timeout: 5000, stdio: "pipe",
        });
        return candidate;
      } catch {}
    }
  }

  // Third: try process.execPath (the Node that launched us)
  return process.execPath;
}

// Cache the detected path
let _nodePath = null;
function getNodePath() {
  if (!_nodePath) _nodePath = detectNodePath();
  return _nodePath;
}

/**
 * Get the database file path (production.db preferred, dev.db fallback).
 */
function getDbPath() {
  const prodDb = resolve(ROOT, "data", "production.db");
  const devDb = resolve(ROOT, "dev.db");
  if (existsSync(prodDb)) return prodDb;
  if (existsSync(devDb)) return devDb;
  return null;
}

/**
 * Run a read-only SQL query and return rows as JSON array.
 * @param {string} sql - The SQL query
 * @returns {Array} - Array of row objects, or [] on failure
 */
export function queryDb(sql) {
  const dbPath = getDbPath();
  if (!dbPath) return [];

  const nodePath = getNodePath();
  const escapedDb = dbPath.replace(/\\/g, "\\\\");
  const escapedSql = sql.replace(/`/g, "\\`").replace(/\n/g, " ").replace(/"/g, '\\"');

  try {
    const script = `const D=require('better-sqlite3');const db=new D('${escapedDb}',{readonly:true});try{console.log(JSON.stringify(db.prepare(\`${escapedSql}\`).all()));}catch(e){console.log('[]');}db.close();`;
    const result = execSync(`"${nodePath}" -e "${script}"`, {
      cwd: ROOT, encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"],
    });
    return JSON.parse(result.trim() || "[]");
  } catch {
    return [];
  }
}

/**
 * Run a write SQL statement.
 * @param {string} sql - The SQL statement
 */
export function updateDb(sql) {
  const dbPath = getDbPath();
  if (!dbPath) return;

  const nodePath = getNodePath();
  const escapedDb = dbPath.replace(/\\/g, "\\\\");
  const escapedSql = sql.replace(/`/g, "\\`").replace(/\n/g, " ").replace(/"/g, '\\"');

  try {
    const script = `const D=require('better-sqlite3');const db=new D('${escapedDb}');db.prepare(\`${escapedSql}\`).run();db.close();`;
    execSync(`"${nodePath}" -e "${script}"`, {
      cwd: ROOT, encoding: "utf8", timeout: 10000, stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {}
}

export { getNodePath, getDbPath, ROOT };
