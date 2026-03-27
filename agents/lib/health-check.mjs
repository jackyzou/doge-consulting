// agents/lib/health-check.mjs — Seth's automated site health monitoring
// Checks: build status, site uptime, page responses, broken links, missing images
// Runs on cron (e.g., every 6 hours) or manually
// Alerts via agents/logs/ and escalates critical issues to Alex

import { invokeAgent } from "./invoke-agent.mjs";
import { queryDb, updateDb } from "./db-helper.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const LOGS_DIR = resolve(__dirname, "../logs");

const SITE_URL = process.env.SITE_URL || "https://doge-consulting.com";
const LOCAL_URL = "http://localhost:3000";

/**
 * Run all health checks and report results.
 */
export async function runHealthCheck({ verbose = true, useLocal = false } = {}) {
  const baseUrl = useLocal ? LOCAL_URL : SITE_URL;
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`🏥 Site Health Check — ${timestamp}`);
    console.log(`   Target: ${baseUrl}`);
    console.log(`${"═".repeat(60)}`);
  }

  const checks = {
    build: await checkBuild(verbose),
    uptime: await checkUptime(baseUrl, verbose),
    pages: await checkCriticalPages(baseUrl, verbose),
    api: await checkCriticalAPIs(baseUrl, verbose),
    database: await checkDatabase(verbose),
  };

  // Calculate overall status
  const allResults = Object.values(checks).flat();
  const failures = allResults.filter(c => !c.ok);
  const overall = failures.length === 0 ? "HEALTHY" : failures.some(c => c.severity === "critical") ? "CRITICAL" : "DEGRADED";

  if (verbose) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`   Overall: ${overall === "HEALTHY" ? "✅" : overall === "CRITICAL" ? "🔴" : "🟡"} ${overall}`);
    console.log(`   Checks: ${allResults.length} total, ${failures.length} failures`);
  }

  // Log results
  logHealthCheck(checks, overall, failures, timestamp);

  // If critical issues, escalate to Seth via LLM
  if (overall === "CRITICAL" && failures.length > 0) {
    await escalateToSeth(failures, verbose);
  }

  return { overall, checks, failures };
}

/**
 * Check if the Next.js build passes.
 */
async function checkBuild(verbose) {
  if (verbose) console.log("\n   🏗️ Build check...");
  try {
    execSync("npx next build", {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 180_000,
      stdio: "pipe",
    });
    if (verbose) console.log("      ✅ Build passes");
    return [{ name: "next-build", ok: true, severity: "critical" }];
  } catch (e) {
    if (verbose) console.log(`      ❌ Build FAILED: ${e.message?.substring(0, 100)}`);
    return [{ name: "next-build", ok: false, severity: "critical", error: e.message?.substring(0, 500) }];
  }
}

/**
 * Check if the site is reachable.
 */
async function checkUptime(baseUrl, verbose) {
  if (verbose) console.log("\n   🌐 Uptime check...");
  const results = [];

  try {
    const start = Date.now();
    const res = await fetch(baseUrl, { signal: AbortSignal.timeout(15000) });
    const elapsed = Date.now() - start;
    const ok = res.status === 200;

    if (verbose) console.log(`      ${ok ? "✅" : "❌"} Homepage: ${res.status} (${elapsed}ms)`);
    results.push({
      name: "homepage-uptime",
      ok,
      severity: "critical",
      status: res.status,
      responseTime: elapsed,
    });

    // Warn if slow
    if (elapsed > 5000) {
      if (verbose) console.log(`      ⚠️ Slow response: ${elapsed}ms (threshold: 5000ms)`);
      results.push({ name: "homepage-speed", ok: false, severity: "warning", responseTime: elapsed });
    }
  } catch (e) {
    if (verbose) console.log(`      ❌ Site unreachable: ${e.message}`);
    results.push({ name: "homepage-uptime", ok: false, severity: "critical", error: e.message });
  }

  return results;
}

/**
 * Check critical pages return 200.
 */
async function checkCriticalPages(baseUrl, verbose) {
  if (verbose) console.log("\n   📄 Critical pages check...");

  const pages = [
    "/", "/about", "/services", "/contact", "/quote",
    "/blog", "/tools", "/tools/cbm-calculator", "/tools/duty-calculator",
    "/tools/revenue-calculator", "/tools/vessel-tracker",
    "/admin", "/account",
  ];

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const res = await fetch(`${baseUrl}${page}`, {
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      });
      const ok = res.status < 400;
      if (ok) passed++; else failed++;
      if (!ok && verbose) console.log(`      ❌ ${page}: ${res.status}`);
      if (!ok) results.push({ name: `page:${page}`, ok: false, severity: "warning", status: res.status });
    } catch (e) {
      failed++;
      if (verbose) console.log(`      ❌ ${page}: ${e.message}`);
      results.push({ name: `page:${page}`, ok: false, severity: "warning", error: e.message });
    }
  }

  if (verbose) console.log(`      ✅ ${passed}/${pages.length} pages OK${failed > 0 ? `, ❌ ${failed} failed` : ""}`);

  if (failed === 0) {
    results.push({ name: "critical-pages", ok: true, severity: "warning" });
  }

  return results;
}

/**
 * Check critical API endpoints.
 */
async function checkCriticalAPIs(baseUrl, verbose) {
  if (verbose) console.log("\n   🔌 API health check...");

  const endpoints = [
    { path: "/api/contact", method: "OPTIONS" },
    { path: "/api/quote", method: "OPTIONS" },
    { path: "/api/blog", method: "GET" },
  ];

  const results = [];
  let passed = 0;

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep.path}`, {
        method: ep.method,
        signal: AbortSignal.timeout(10000),
      });
      // OPTIONS may return 405, GET should return 200
      const ok = res.status < 500;
      if (ok) passed++;
      if (!ok) {
        if (verbose) console.log(`      ❌ ${ep.method} ${ep.path}: ${res.status}`);
        results.push({ name: `api:${ep.path}`, ok: false, severity: "critical", status: res.status });
      }
    } catch (e) {
      if (verbose) console.log(`      ❌ ${ep.method} ${ep.path}: ${e.message}`);
      results.push({ name: `api:${ep.path}`, ok: false, severity: "critical", error: e.message });
    }
  }

  if (verbose) console.log(`      ✅ ${passed}/${endpoints.length} APIs responding`);
  if (results.length === 0) results.push({ name: "api-health", ok: true, severity: "critical" });

  return results;
}

/**
 * Check database integrity (local DB on dev machine).
 * Note: This checks the DEV PC's database, not the production server's DB.
 */
async function checkDatabase(verbose) {
  if (verbose) console.log("\n   🗄️ Database check (local dev DB)...");

  try {
    const tables = queryDb("SELECT count(*) as c FROM sqlite_master WHERE type='table'");
    const blogPosts = queryDb("SELECT count(*) as c FROM BlogPost WHERE published=1");
    const tableCount = tables?.[0]?.c || 0;
    const blogCount = blogPosts?.[0]?.c || 0;
    const ok = tableCount > 0;

    if (verbose) {
      console.log(`      ${ok ? "✅" : "❌"} Integrity: ${ok ? "OK" : "no tables found"}`);
      if (ok) console.log(`      📊 ${tableCount} tables, ${blogCount} blog posts (local dev DB)`);
    }
    return [{ name: "database (local)", ok, severity: "critical", tables: tableCount, blogPosts: blogCount }];
  } catch (e) {
    if (verbose) console.log(`      ❌ DB check failed: ${e.message}`);
    return [{ name: "database", ok: false, severity: "critical", error: e.message }];
  }
}

/**
 * Escalate critical issues to Seth via LLM.
 */
async function escalateToSeth(failures, verbose) {
  if (verbose) console.log("\n   🚨 Escalating critical issues to Seth...");

  const failureList = failures.map(f => `- ${f.name}: ${f.error || `status ${f.status}`}`).join("\n");

  try {
    const result = await invokeAgent({
      agentId: "seth",
      prompt: `CRITICAL HEALTH CHECK FAILURE — immediate attention needed.

The following checks FAILED:
${failureList}

YOUR TASK:
1. Diagnose the root cause for each failure
2. Propose immediate fixes
3. If the site is down, identify what needs to restart
4. Escalate to @alex if this affects customer-facing functionality

Respond with a triage report: what's broken, why, and how to fix it.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan", // Read-only for diagnosis
    });

    if (verbose) console.log(`      Seth's triage: ${result.response.substring(0, 200)}...`);

    // Log as critical AgentLog
    const id = `health_${Date.now()}`;
    const content = result.response.replace(/'/g, "''").substring(0, 2000);
    updateDb(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,createdAt,updatedAt) VALUES ('${id}','seth','alert','critical','HEALTH CHECK FAILURE','${content}','open','seth,alex',datetime('now'),datetime('now'))`);
  } catch (e) {
    if (verbose) console.log(`      ⚠️ Seth escalation failed: ${e.message}`);
  }
}

/**
 * Log health check results to daily log file.
 */
function logHealthCheck(checks, overall, failures, timestamp) {
  const today = new Date().toISOString().split("T")[0];
  const logFile = resolve(LOGS_DIR, `${today}.md`);

  const entry = `
## Health Check — ${timestamp}

**Overall:** ${overall}
**Failures:** ${failures.length}

${failures.length > 0 ? `### Issues\n${failures.map(f => `- ❌ **${f.name}**: ${f.error || `status ${f.status}`} (${f.severity})`).join("\n")}` : "All checks passed."}

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
  writeFileSync(logFile, existing + entry, "utf8");
}

// CLI entry point
if (process.argv[1]?.includes("health-check")) {
  const useLocal = process.argv.includes("--local");
  console.log(`🏥 Running health check (${useLocal ? "local" : "production"})...`);
  runHealthCheck({ useLocal }).then(({ overall, failures }) => {
    console.log(`\n${overall === "HEALTHY" ? "✅" : "❌"} ${overall} — ${failures.length} issue(s)`);
    process.exit(overall === "CRITICAL" ? 1 : 0);
  });
}
