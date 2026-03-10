#!/usr/bin/env node

/**
 * Doge Consulting — GitHub Issue Comment Watcher
 *
 * Polls GitHub issues for new comments from jackyzou (CEO).
 * When a new comment is found, it logs it and triggers the relevant agent.
 *
 * Usage:
 *   node agents/watch-issues.mjs                  # Start watching (foreground)
 *   node agents/watch-issues.mjs --poll 30        # Poll every 30 seconds
 *   node agents/watch-issues.mjs --once           # Check once and exit
 *
 * Prerequisites:
 *   - gh CLI installed and authenticated (gh auth login)
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { CONFIG } from "./config.mjs";

const ROOT = process.cwd();
const REPO = "jackyzou/doge-consulting";
const CEO_USERNAME = "jackyzou";
const STATE_FILE = join(ROOT, "agents", "logs", ".last-comment-id");
const LOG_DIR = join(ROOT, "agents", "logs");
const POLL_INTERVAL = parseInt(process.argv.find((a, i) => process.argv[i - 1] === "--poll") || "60") * 1000;
const ONCE = process.argv.includes("--once");

if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });

function log(msg) {
  const ts = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
  console.log(`[${ts}] ${msg}`);
}

function getLastCommentId() {
  if (existsSync(STATE_FILE)) return readFileSync(STATE_FILE, "utf-8").trim();
  return "0";
}

function setLastCommentId(id) {
  writeFileSync(STATE_FILE, String(id), "utf-8");
}

// Detect which agent is being addressed in the comment
function detectAgent(text) {
  const lower = text.toLowerCase();
  for (const agent of CONFIG.agents) {
    if (lower.includes(`@${agent.id}`) || lower.includes(agent.name.toLowerCase())) {
      return agent;
    }
  }
  // Check for role mentions
  if (lower.includes("cto") || lower.includes("tech") || lower.includes("dev") || lower.includes("site") || lower.includes("bug")) return CONFIG.agents.find(a => a.id === "seth");
  if (lower.includes("cfo") || lower.includes("financ") || lower.includes("pric") || lower.includes("revenue") || lower.includes("money")) return CONFIG.agents.find(a => a.id === "amy");
  if (lower.includes("cmo") || lower.includes("market") || lower.includes("seo") || lower.includes("brand") || lower.includes("social")) return CONFIG.agents.find(a => a.id === "rachel");
  if (lower.includes("pr") || lower.includes("news") || lower.includes("blog") || lower.includes("legal") || lower.includes("compliance")) return CONFIG.agents.find(a => a.id === "seto");
  // Default to Alex (Co-CEO handles everything)
  return CONFIG.agents.find(a => a.id === "alex");
}

function fetchRecentComments() {
  try {
    // Get all open issues
    const issuesJson = execSync(
      `gh issue list --repo ${REPO} --state open --json number,title --limit 20`,
      { encoding: "utf-8", timeout: 30000 }
    );
    const issues = JSON.parse(issuesJson);

    const allComments = [];

    for (const issue of issues) {
      try {
        const commentsJson = execSync(
          `gh issue view ${issue.number} --repo ${REPO} --json comments --jq ".comments"`,
          { encoding: "utf-8", timeout: 15000 }
        );
        const comments = JSON.parse(commentsJson || "[]");

        for (const comment of comments) {
          if (comment.author && comment.author.login === CEO_USERNAME) {
            allComments.push({
              issueNumber: issue.number,
              issueTitle: issue.title,
              commentId: comment.id || comment.createdAt,
              body: comment.body,
              createdAt: comment.createdAt,
              author: comment.author.login,
            });
          }
        }
      } catch {
        // Skip issues we can't read
      }
    }

    // Sort by date, newest first
    allComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allComments;
  } catch (err) {
    log(`ERROR fetching comments: ${err.message}`);
    return [];
  }
}

function processComment(comment) {
  const agent = detectAgent(comment.body);
  const today = new Date().toISOString().split("T")[0];
  const logFile = join(LOG_DIR, `${today}.md`);

  log(`NEW DIRECTIVE from CEO on issue #${comment.issueNumber}`);
  log(`  Issue: ${comment.issueTitle}`);
  log(`  Agent: ${agent.name} (${agent.role})`);
  log(`  Comment: ${comment.body.substring(0, 100)}...`);

  // Append to daily log
  const logEntry = `
### CEO Directive — ${new Date(comment.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })}

**Issue:** #${comment.issueNumber} — ${comment.issueTitle}
**Assigned to:** ${agent.name} (${agent.role})
**From:** ${comment.author}

> ${comment.body.split("\n").join("\n> ")}

**Status:** Received, pending action

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf-8") : `# Agent Fleet Log — ${today}\n`;
  writeFileSync(logFile, existing + logEntry, "utf-8");
  log(`  Logged to: agents/logs/${today}.md`);

  // Post agent acknowledgment as a comment on the issue
  try {
    const response = `**${agent.name}** (${agent.role}) here. Received your directive. I'll work on this and report back.\n\n_Assigned via Agent Fleet at ${new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PST_`;
    execSync(
      `gh issue comment ${comment.issueNumber} --repo ${REPO} --body "${response.replace(/"/g, '\\"')}"`,
      { encoding: "utf-8", timeout: 15000 }
    );
    log(`  Agent ${agent.name} acknowledged on issue #${comment.issueNumber}`);
  } catch (err) {
    log(`  WARNING: Could not post acknowledgment: ${err.message}`);
  }
}

// ── Main Loop ───────────────────────────────────────────────
log("=== Doge Consulting — Issue Comment Watcher ===");
log(`Repo: ${REPO}`);
log(`Watching for comments from: ${CEO_USERNAME}`);
log(`Poll interval: ${POLL_INTERVAL / 1000}s`);
log("");

async function check() {
  const lastId = getLastCommentId();
  const comments = fetchRecentComments();

  if (comments.length === 0) {
    if (ONCE) log("No comments found.");
    return;
  }

  // Find new comments (newer than last processed)
  const lastDate = lastId !== "0" ? new Date(lastId) : new Date(0);
  const newComments = comments.filter(c => new Date(c.createdAt) > lastDate);

  if (newComments.length > 0) {
    log(`Found ${newComments.length} new comment(s) from CEO`);
    // Process oldest first
    for (const comment of newComments.reverse()) {
      processComment(comment);
    }
    // Save the newest comment timestamp
    setLastCommentId(comments[0].createdAt);
  }
}

// Run once or loop
await check();

if (!ONCE) {
  log(`Watching... (poll every ${POLL_INTERVAL / 1000}s)`);
  setInterval(check, POLL_INTERVAL);
}
