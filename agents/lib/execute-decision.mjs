// agents/lib/execute-decision.mjs — Autonomous execution engine
// Takes approved decisions from standup and spawns agent sessions to execute them.
//
// Seth (CTO): code changes, features, bug fixes, deployments
// Seto (PRO): blog post drafting, seeding, verification
//
// Guard rails:
// - Only executes on feature branches (never master)
// - Must pass `npx next build` after code changes
// - Auto-reverts on build failure
// - Commits with descriptive messages
// - Creates execution log in agents/logs/

import { invokeAgent } from "./invoke-agent.mjs";
import { execSync } from "child_process";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const LOGS_DIR = resolve(__dirname, "../logs");

/**
 * Execute an approved decision autonomously.
 *
 * @param {Object} decision
 * @param {string} decision.title - The decision text
 * @param {string} decision.agent - The proposing agent
 * @param {string} decision.status - Must be "approved" or "modified"
 * @param {string} decision.rationale - Alex's reasoning for approval
 * @param {string} decision.type - "code" | "blog" | "config" | "other"
 * @param {Object} options
 * @param {boolean} options.dryRun - If true, plan but don't execute
 * @param {boolean} options.verbose - Log progress
 * @returns {Promise<ExecutionResult>}
 */
export async function executeDecision(decision, { dryRun = false, verbose = true } = {}) {
  const executor = resolveExecutor(decision);

  if (!executor) {
    return { success: false, reason: "No executor agent for this decision type", decision };
  }

  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`⚡ EXECUTING: "${decision.title}"`);
    console.log(`   Executor: ${executor.name} | Type: ${decision.type} | Dry run: ${dryRun}`);
    console.log(`${"═".repeat(60)}`);
  }

  // Pre-flight checks
  const preflight = runPreflight(executor, verbose);
  if (!preflight.ok) {
    return { success: false, reason: preflight.reason, decision };
  }

  try {
    let result;
    switch (decision.type) {
      case "code":
        result = await executeCodeDecision(decision, executor, { dryRun, verbose });
        break;
      case "blog":
        result = await executeBlogDecision(decision, executor, { dryRun, verbose });
        break;
      default:
        result = await executeGenericDecision(decision, executor, { dryRun, verbose });
        break;
    }

    // Log execution
    logExecution(decision, result, verbose);
    return result;

  } catch (error) {
    const result = { success: false, reason: error.message, decision };
    logExecution(decision, result, verbose);
    return result;
  }
}

/**
 * Determine which agent should execute a decision.
 */
function resolveExecutor(decision) {
  const title = decision.title.toLowerCase();

  // Code/technical decisions → Seth
  const codeKeywords = ["implement", "fix", "deploy", "build", "smtp", "api", "feature",
    "database", "migration", "schema", "test", "css", "component", "page", "endpoint",
    "config", "seo", "sitemap", "meta", "og:image", "tracking", "analytics", "cta"];
  if (decision.type === "code" || codeKeywords.some(k => title.includes(k))) {
    return { id: "seth", name: "Seth Parker (CTO)", type: "code" };
  }

  // Blog/content decisions → Seto
  const blogKeywords = ["blog", "post", "article", "write", "publish", "seed", "content",
    "draft", "research", "cover image"];
  if (decision.type === "blog" || blogKeywords.some(k => title.includes(k))) {
    return { id: "seto", name: "Seto Nakamura (PRO)", type: "blog" };
  }

  return null; // Not auto-executable
}

/**
 * Pre-flight checks before execution.
 */
function runPreflight(executor, verbose) {
  // 1. Ensure we're on a feature branch (never execute on master/main)
  const branch = git("rev-parse --abbrev-ref HEAD");
  if (branch === "master" || branch === "main") {
    return { ok: false, reason: `Cannot execute on ${branch} branch. Switch to a feature branch.` };
  }
  if (verbose) console.log(`   ✅ Branch: ${branch} (not master)`);

  // 2. Ensure clean working tree
  const status = git("status --porcelain");
  if (status.trim()) {
    return { ok: false, reason: `Working tree has uncommitted changes. Commit or stash first.` };
  }
  if (verbose) console.log(`   ✅ Working tree clean`);

  // 3. Ensure claude CLI is available
  try {
    const childEnv = { ...process.env };
    delete childEnv.CLAUDECODE;
    execSync("claude --version", { encoding: "utf8", timeout: 10000, env: childEnv });
    if (verbose) console.log(`   ✅ Claude CLI available`);
  } catch {
    return { ok: false, reason: "Claude CLI not found in PATH" };
  }

  return { ok: true };
}

/**
 * Execute a code decision via Seth.
 * Guard rails: feature branch, build check, auto-revert on failure.
 */
async function executeCodeDecision(decision, executor, { dryRun, verbose }) {
  const headBefore = git("rev-parse HEAD");

  const prompt = `You are executing an APPROVED decision from the daily standup.

DECISION: "${decision.title}"
RATIONALE: ${decision.rationale || "Approved by Alex Chen (COO)"}

YOUR TASK:
1. Read the relevant code to understand the current state
2. Implement the change with minimal, focused edits
3. Run \`npx next build\` to verify the build passes
4. If build passes, commit with a descriptive message
5. If build fails, revert your changes and explain what went wrong

GUARD RAILS:
- You are on branch: ${git("rev-parse --abbrev-ref HEAD")}
- Do NOT push to remote — only commit locally
- Do NOT modify files outside the scope of this decision
- Do NOT change auth, payment, or database schema without explicit approval
- Keep changes minimal and focused
- Commit message format: "feat: <what changed> [auto: decision from standup]"
${dryRun ? "\n⚠️ DRY RUN: Plan the implementation but do NOT make any changes." : ""}

START EXECUTION.`;

  if (verbose) console.log(`   🔧 Spawning Seth's execution session...`);

  const result = await invokeAgent({
    agentId: "seth",
    prompt,
    threadMessages: [],
    recentDecisions: [decision],
    standupSummary: "",
    gitLog: git("log --oneline -5"),
    mode: dryRun ? "plan" : "execute",
  });

  // Check if commits were made
  const headAfter = git("rev-parse HEAD");
  const newCommits = headBefore !== headAfter;

  if (newCommits && !dryRun) {
    // Verify build passes
    if (verbose) console.log(`   🏗️ Verifying build...`);
    const buildOk = verifyBuild(verbose);

    if (!buildOk) {
      // Auto-revert
      if (verbose) console.log(`   ❌ Build failed — auto-reverting to ${headBefore.substring(0, 8)}`);
      git(`reset --hard ${headBefore}`);
      return {
        success: false,
        reason: "Build failed after code changes — auto-reverted",
        decision,
        agentResponse: result.response,
        reverted: true,
      };
    }

    const commitLog = git(`log ${headBefore}..HEAD --oneline`);
    if (verbose) {
      console.log(`   ✅ Build passed`);
      console.log(`   📝 Commits:\n${commitLog.split("\n").map(l => `      ${l}`).join("\n")}`);
    }

    return {
      success: true,
      decision,
      agentResponse: result.response,
      commits: commitLog,
      reverted: false,
    };
  }

  return {
    success: !dryRun ? false : true,
    reason: dryRun ? "Dry run — no changes made" : "No commits produced",
    decision,
    agentResponse: result.response,
    reverted: false,
  };
}

/**
 * Execute a blog publishing decision via Seto.
 * Steps: draft content → seed to DB → verify post + cover image.
 */
async function executeBlogDecision(decision, executor, { dryRun, verbose }) {
  const prompt = `You are executing an APPROVED blog post decision from the daily standup.

DECISION: "${decision.title}"
RATIONALE: ${decision.rationale || "Approved by Alex Chen (COO)"}

YOUR TASK:
1. Read the existing blog seed files to understand the format:
   - prisma/seed-blog.mjs (main seed file, 24 posts)
   - prisma/seed-blog-expansion.mjs (14 long-tail posts)
2. Check if this post already exists (search by slug)
3. If not already seeded, add the new post to the appropriate seed file
4. The post MUST have:
   - Unique slug (check against existing slugs)
   - Unique Unsplash cover image (grep for photo ID to avoid duplicates)
   - Cover image URL that returns HTTP 200 (verify with curl)
   - Real data, citations, and actionable takeaways
   - Internal links to 2-3 existing posts + at least 1 tool page
   - Target keyword in title and first paragraph
5. Run the seed script: node prisma/seed-blog.mjs (or the expansion script)
6. Verify the post was created by checking the database
${dryRun ? "\n⚠️ DRY RUN: Plan the blog post but do NOT create or seed it." : ""}

CONTENT STANDARDS (from Code of Conduct):
- Every post cites specific data — rates with numbers, tariff percentages, company names, dates
- Cross-reference 3+ sources
- Include actionable takeaways
- NEVER reuse the same cover image across blog posts

START EXECUTION.`;

  if (verbose) console.log(`   📝 Spawning Seto's publishing session...`);

  const result = await invokeAgent({
    agentId: "seto",
    prompt,
    threadMessages: [],
    recentDecisions: [decision],
    standupSummary: "",
    gitLog: git("log --oneline -5"),
    mode: dryRun ? "plan" : "execute",
  });

  return {
    success: true,
    decision,
    agentResponse: result.response,
    type: "blog",
  };
}

/**
 * Generic decision execution — plan-only, no auto-execution.
 */
async function executeGenericDecision(decision, executor, { dryRun, verbose }) {
  if (verbose) console.log(`   📋 Decision type "${decision.type}" — generating execution plan only`);

  const result = await invokeAgent({
    agentId: executor.id,
    prompt: `An approved decision needs your input: "${decision.title}". Provide a specific execution plan with steps, owners, and timeline.`,
    threadMessages: [],
    recentDecisions: [decision],
    standupSummary: "",
    gitLog: "",
    mode: "plan",
  });

  return {
    success: true,
    decision,
    agentResponse: result.response,
    type: "plan-only",
  };
}

/**
 * Verify the Next.js build passes.
 */
function verifyBuild(verbose) {
  try {
    if (verbose) console.log(`   🏗️ Running: npx next build`);
    execSync("npx next build", {
      cwd: ROOT,
      encoding: "utf8",
      timeout: 180_000, // 3 min build timeout
      stdio: verbose ? "inherit" : "pipe",
    });
    return true;
  } catch (e) {
    if (verbose) console.error(`   ❌ Build error: ${e.message?.substring(0, 200)}`);
    return false;
  }
}

/**
 * Run a git command and return stdout.
 */
function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8", timeout: 10000 }).trim();
  } catch { return ""; }
}

/**
 * Log execution result to the daily log file.
 */
function logExecution(decision, result, verbose) {
  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true });

  const today = new Date().toISOString().split("T")[0];
  const logFile = resolve(LOGS_DIR, `${today}.md`);
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const entry = `
## Autonomous Execution — ${timestamp}

**Decision:** ${decision.title}
**Executor:** ${result.decision?.agent || "unknown"}
**Type:** ${decision.type || "unknown"}
**Success:** ${result.success ? "✅ YES" : "❌ NO"}
${result.reason ? `**Reason:** ${result.reason}` : ""}
${result.commits ? `**Commits:**\n${result.commits}` : ""}
${result.reverted ? `**⚠️ REVERTED:** Build failed, changes rolled back` : ""}

<details>
<summary>Agent Response</summary>

${result.agentResponse?.substring(0, 2000) || "(no response)"}

</details>

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
  writeFileSync(logFile, existing + entry, "utf8");
  if (verbose) console.log(`   📝 Execution logged to agents/logs/${today}.md`);
}

/**
 * Process a batch of approved decisions from a standup.
 * Only executes "code" and "blog" types automatically.
 *
 * @param {Array} decisions - Decisions from Alex's synthesis
 * @param {Object} options
 * @returns {Promise<Array<ExecutionResult>>}
 */
export async function executeApprovedDecisions(decisions, { dryRun = false, verbose = true } = {}) {
  const executable = decisions.filter(d => {
    const status = (d.status || "").toLowerCase();
    return status === "approved" || status === "modified";
  });

  if (executable.length === 0) {
    if (verbose) console.log("\n   📭 No executable decisions to process.");
    return [];
  }

  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`⚡ PHASE 3b: Autonomous Execution (${executable.length} decisions)`);
    console.log(`${"═".repeat(60)}`);
  }

  const results = [];
  for (const decision of executable) {
    // Classify the decision
    decision.type = classifyDecision(decision.title);
    if (decision.type === "other") {
      if (verbose) console.log(`   ⏭️ Skipping non-executable: "${decision.title.substring(0, 60)}..."`);
      continue;
    }

    const result = await executeDecision(decision, { dryRun, verbose });
    results.push(result);
  }

  if (verbose) {
    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`\n   ✅ Execution complete: ${succeeded} succeeded, ${failed} failed`);
  }

  return results;
}

/**
 * Classify a decision title into an executable type.
 */
function classifyDecision(title) {
  const t = title.toLowerCase();

  const codePatterns = ["implement", "fix", "deploy", "build", "smtp", "api", "feature",
    "add .* to", "create .* endpoint", "update .* page", "set up", "configure",
    "tracking", "og:image", "meta tag", "cta click", "analytics", "subscriber count"];
  if (codePatterns.some(p => t.match(new RegExp(p)))) return "code";

  const blogPatterns = ["blog post", "write.*article", "publish.*post", "draft.*guide",
    "alibaba.*verification", "fba.*cost", "qc.*checklist", "import.*duties",
    "seed.*blog", "content.*today"];
  if (blogPatterns.some(p => t.match(new RegExp(p)))) return "blog";

  return "other";
}

// CLI entry point
if (process.argv[1]?.includes("execute-decision")) {
  const title = process.argv[2] || "Test: verify build passes";
  const type = process.argv[3] || "code";
  const dryRun = process.argv.includes("--dry-run");

  console.log(`⚡ Executing decision: "${title}" (type: ${type}, dry-run: ${dryRun})`);
  executeDecision(
    { title, agent: "seth", status: "approved", type, rationale: "CLI test" },
    { dryRun }
  ).then(result => {
    console.log(`\nResult: ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
    if (result.reason) console.log(`Reason: ${result.reason}`);
    process.exit(result.success ? 0 : 1);
  });
}
