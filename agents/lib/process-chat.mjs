// agents/lib/process-chat.mjs — Process pending chat messages and generate agent responses
// Called by run-fleet.mjs during standups OR triggered by new CEO messages
import Database from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { invokeAgent } from "./invoke-agent.mjs";
import { routeMessage, parseMentions, shouldAlexSynthesize, isMaxDepth } from "./route-message.mjs";
import { updateMemory } from "./build-context.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getDb() {
  const prodPath = resolve(__dirname, "../../data/production.db");
  const devPath = resolve(__dirname, "../../prisma/dev.db");
  const dbPath = process.env.DATABASE_PATH || (existsSync(prodPath) ? prodPath : devPath);
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

function getGitLog() {
  try {
    return execSync("git log --oneline -10 --format=\"%h %ar | %s\"", { cwd: resolve(__dirname, "../.."), encoding: "utf8" });
  } catch { return ""; }
}

function getLatestStandup(db) {
  try {
    const row = db.prepare("SELECT content FROM AgentLog WHERE type='standup' ORDER BY createdAt DESC LIMIT 1").get();
    return row?.content?.substring(0, 3000) || "";
  } catch { return ""; }
}

function getRecentDecisions(db, agentId) {
  try {
    return db.prepare("SELECT title, status FROM AgentLog WHERE type='decision' AND (agent=? OR assignedTo LIKE ?) ORDER BY createdAt DESC LIMIT 10")
      .all(agentId, `%${agentId}%`);
  } catch { return []; }
}

/**
 * Process all pending chat messages — invoke agents and post responses.
 * @param {Object} options
 * @param {boolean} options.useCLI - Use Claude CLI for responses (true) or template fallback (false)
 * @param {boolean} options.verbose - Log progress
 */
export async function processChat({ useCLI = true, verbose = true } = {}) {
  const db = getDb();
  const gitLog = getGitLog();
  const standupSummary = getLatestStandup(db);

  // Find threads with pending agent responses (messages from jacky with no agent reply yet)
  const pendingMessages = db.prepare(`
    SELECT cm.id, cm.threadId, cm.sender, cm.content, cm.mentions, cm.createdAt
    FROM ChatMessage cm
    JOIN ChatThread ct ON cm.threadId = ct.id
    WHERE cm.status = 'pending_response'
    ORDER BY cm.createdAt ASC
  `).all();

  if (pendingMessages.length === 0) {
    // Also check for new user messages that haven't been responded to
    const unrepliedThreads = db.prepare(`
      SELECT ct.id as threadId, cm.content, cm.mentions, cm.createdAt
      FROM ChatThread ct
      JOIN ChatMessage cm ON cm.threadId = ct.id
      WHERE ct.status = 'active'
        AND cm.sender = 'jacky'
        AND cm.id = (SELECT id FROM ChatMessage WHERE threadId = ct.id ORDER BY createdAt DESC LIMIT 1)
        AND NOT EXISTS (
          SELECT 1 FROM ChatMessage 
          WHERE threadId = ct.id 
            AND sender != 'jacky' 
            AND sender != 'system'
            AND createdAt > cm.createdAt
        )
      ORDER BY cm.createdAt ASC
    `).all();

    if (unrepliedThreads.length === 0) {
      if (verbose) console.log("📭 No pending chat messages to process.");
      db.close();
      return { processed: 0, responses: 0 };
    }

    // Process unreplied threads
    let responses = 0;
    for (const thread of unrepliedThreads) {
      const r = await processThread(db, thread.threadId, thread.content, thread.mentions, {
        useCLI, verbose, gitLog, standupSummary,
      });
      responses += r;
    }
    db.close();
    return { processed: unrepliedThreads.length, responses };
  }

  // Process pending messages
  let responses = 0;
  for (const msg of pendingMessages) {
    const r = await processThread(db, msg.threadId, msg.content, msg.mentions, {
      useCLI, verbose, gitLog, standupSummary,
    });
    // Mark as delivered
    db.prepare("UPDATE ChatMessage SET status = 'delivered' WHERE id = ?").run(msg.id);
    responses += r;
  }

  db.close();
  return { processed: pendingMessages.length, responses };
}

async function processThread(db, threadId, messageContent, mentions, { useCLI, verbose, gitLog, standupSummary }) {
  // Get full thread history
  const threadMessages = db.prepare("SELECT * FROM ChatMessage WHERE threadId = ? ORDER BY createdAt ASC").all(threadId);
  
  // Check max depth
  if (isMaxDepth(threadMessages)) {
    if (verbose) console.log(`  ⚠️ Thread ${threadId} at max depth — skipping.`);
    return 0;
  }

  // Determine which agents should respond
  const explicitMentions = mentions ? mentions.split(",").filter(Boolean) : parseMentions(messageContent);
  const respondingAgents = routeMessage(messageContent, explicitMentions);

  if (verbose) console.log(`  💬 Thread ${threadId.substring(0, 8)}... → routing to: ${respondingAgents.join(", ")}`);

  let responseCount = 0;

  for (const agentId of respondingAgents) {
    const recentDecisions = getRecentDecisions(db, agentId);

    if (verbose) console.log(`    🤖 ${agentId} responding...`);

    const result = await invokeAgent({
      agentId,
      prompt: messageContent,
      threadMessages: threadMessages.map(m => ({ sender: m.sender, content: m.content, createdAt: m.createdAt })),
      recentDecisions,
      standupSummary,
      gitLog,
      mode: agentId === "seth" ? "full" : "plan",
    });

    // Store the response
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    db.prepare(`
      INSERT INTO ChatMessage (id, threadId, sender, content, mentions, metadata, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, 'delivered', datetime('now'))
    `).run(
      msgId, threadId, agentId, result.response,
      result.mentions.length > 0 ? result.mentions.join(",") : null,
      result.decisions.length > 0 ? JSON.stringify({ decisions: result.decisions }) : null,
    );

    // Update thread participants
    const thread = db.prepare("SELECT participants FROM ChatThread WHERE id = ?").get(threadId);
    if (thread) {
      const participants = new Set(thread.participants.split(",").filter(Boolean));
      participants.add(agentId);
      result.mentions.forEach(m => participants.add(m));
      db.prepare("UPDATE ChatThread SET participants = ?, updatedAt = datetime('now') WHERE id = ?")
        .run(Array.from(participants).join(","), threadId);
    }

    // Create decision tickets if any
    for (const decision of result.decisions) {
      db.prepare(`
        INSERT OR IGNORE INTO AgentLog (id, agent, type, priority, title, content, status, assignedTo, relatedTo, createdAt, updatedAt)
        VALUES (?, ?, 'decision', 'normal', ?, ?, 'open', ?, ?, datetime('now'), datetime('now'))
      `).run(
        `decision_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        agentId, decision.title, `[FROM CHAT] ${decision.title}`, agentId,
        `chat:thread:${threadId}`,
      );
    }

    // Update agent memory
    if (result.memoryUpdate) {
      try {
        const { writeFileSync, readFileSync } = await import("fs");
        const memPath = resolve(__dirname, "..", "memory", `${agentId}.md`);
        let existing = "";
        if (existsSync(memPath)) {
          existing = readFileSync(memPath, "utf8");
        } else {
          existing = `# ${agentId} — Persistent Memory\n\nKey decisions, learnings, and context.\n`;
        }
        const timestamp = new Date().toISOString().split("T")[0];
        writeFileSync(memPath, existing + `\n- **${timestamp}:** ${result.memoryUpdate}\n`, "utf8");
      } catch (e) {
        if (verbose) console.warn(`    ⚠️ Failed to update memory for ${agentId}:`, e.message);
      }
    }

    responseCount++;

    // If agent @mentioned other agents, process follow-up (1 level deep)
    if (result.mentions.length > 0 && !isMaxDepth([...threadMessages, { sender: agentId, content: result.response, createdAt: new Date().toISOString() }])) {
      if (verbose) console.log(`    → ${agentId} mentioned: ${result.mentions.join(", ")} — chaining response`);
      // We'll let these get picked up in the next processChat cycle to avoid deep recursion
    }
  }

  // If 3+ agents responded, have Alex synthesize
  if (shouldAlexSynthesize(respondingAgents)) {
    if (verbose) console.log("    📋 Alex synthesizing multi-agent response...");
    const synthResult = await invokeAgent({
      agentId: "alex",
      prompt: `Multiple agents responded to this thread. Please synthesize their inputs, identify the top priority action, and make any decisions within your authority.\n\nOriginal message: ${messageContent}`,
      threadMessages: db.prepare("SELECT * FROM ChatMessage WHERE threadId = ? ORDER BY createdAt ASC").all(threadId)
        .map(m => ({ sender: m.sender, content: m.content, createdAt: m.createdAt })),
      recentDecisions: getRecentDecisions(db, "alex"),
      standupSummary,
      gitLog,
    });

    db.prepare(`
      INSERT INTO ChatMessage (id, threadId, sender, content, mentions, metadata, status, createdAt)
      VALUES (?, ?, 'alex', ?, ?, ?, 'delivered', datetime('now'))
    `).run(
      `msg_${Date.now()}_synth`, threadId, synthResult.response,
      synthResult.mentions.length > 0 ? synthResult.mentions.join(",") : null,
      synthResult.decisions.length > 0 ? JSON.stringify({ decisions: synthResult.decisions }) : null,
    );
    responseCount++;
  }

  return responseCount;
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes("process-chat")) {
  const useCLI = !process.argv.includes("--no-cli");
  console.log(`🗨️ Processing chat messages (CLI: ${useCLI ? "enabled" : "disabled"})...`);
  processChat({ useCLI }).then(({ processed, responses }) => {
    console.log(`✅ Processed ${processed} threads, generated ${responses} responses.`);
  }).catch(err => {
    console.error("❌ Chat processing failed:", err);
    process.exit(1);
  });
}
