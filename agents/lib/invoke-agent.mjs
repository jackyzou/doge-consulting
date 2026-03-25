// agents/lib/invoke-agent.mjs — Core function to invoke an agent via Claude CLI
import { spawn } from "child_process";
import { buildContext } from "./build-context.mjs";

const AGENT_NAMES = {
  alex: "Alex Chen (Co-CEO/COO)",
  amy: "Amy Lin (CFO)",
  seth: "Seth Parker (CTO)",
  rachel: "Rachel Morales (CMO)",
  seto: "Seto Nakamura (PRO/Editor)",
  tiffany: "Tiffany Wang (CSO)",
};

const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes (Opus needs room for deep thinking)

// Claude Code model and permission config per agent role
// Valid permission modes: acceptEdits, bypassPermissions, default, dontAsk, plan, auto
//
// Mode parameter in invokeAgent() controls behavior:
//   "plan"    → read-only analysis (standup reports, chat responses)
//   "execute" → full read-write with code changes (only for approved decisions)
const AGENT_CLI_CONFIG = {
  seth: {
    model: "claude-opus-4-6",
    plan: { permissionMode: "plan", maxTurns: 3 },         // Standup/chat: read-only
    execute: { permissionMode: "bypassPermissions", maxTurns: 10 }, // Approved decisions: full access
  },
  seto: {
    model: "claude-opus-4-6",
    plan: { permissionMode: "plan", maxTurns: 3 },
    execute: { permissionMode: "bypassPermissions", maxTurns: 5 },  // Blog publishing: can run seed scripts
  },
  default: {
    model: "claude-opus-4-6",
    plan: { permissionMode: "plan", maxTurns: 3 },
    execute: { permissionMode: "plan", maxTurns: 3 },      // Other agents: always read-only
  },
};

/**
 * Invoke an agent via the Claude CLI with full context.
 * 
 * @param {Object} params
 * @param {string} params.agentId - Agent ID (alex, amy, seth, rachel, seto, tiffany)
 * @param {string} params.prompt - The user message or task to respond to
 * @param {Array} params.threadMessages - Previous messages in the thread
 * @param {Array} params.recentDecisions - Recent decisions for this agent
 * @param {string} params.standupSummary - Latest standup summary
 * @param {string} params.gitLog - Recent git log
 * @param {string} params.mode - "plan" (read-only) or "full" (read-write, for CTO)
 * @returns {Promise<{response: string, mentions: string[], decisions: Array, memoryUpdate: string|null}>}
 */
export async function invokeAgent({
  agentId,
  prompt,
  threadMessages = [],
  recentDecisions = [],
  standupSummary = "",
  gitLog = "",
  mode = "plan",
}) {
  const agentName = AGENT_NAMES[agentId] || agentId;
  
  // Build context
  const context = buildContext({
    agentId,
    threadMessages,
    recentDecisions,
    standupSummary,
    gitLog,
  });

  // Build the full prompt for Claude CLI
  const isExecuteMode = mode === "execute";
  const canWrite = isExecuteMode && (agentId === "seth" || agentId === "seto");
  const systemPrompt = `You are ${agentName} at Doge Consulting. You are responding in a team chat.
You are powered by Claude Code Opus 4.6 (1M context) — the most capable AI model available.

CAPABILITIES (Claude Code Skill):
- You have full access to the codebase at C:\\Users\\jiaqizou\\doge-consulting
- You can read files, search code, analyze the project structure, and understand context deeply
- ${canWrite ? `You are in EXECUTE MODE — you have FULL read-write permission. You can edit files, run builds, run scripts, commit code, and deploy changes. Use this power to IMPLEMENT the approved decision.` : `You operate in PLAN mode — you can read and analyze but cannot modify files directly. For code changes, @seth with specific instructions.`}
- You can access git history, database state, and project configuration
- Think deeply before responding. Use your full reasoning capacity.

RULES:
- Stay in character as ${agentName}. Use first person.
- Be concise but substantive. No filler.
- If you need input from another agent, use @agentId (e.g., @seth, @rachel).
- If you're proposing a decision, use [DECISION] tag with — PROPOSED status.
- If you reference code, files, or technical details, be specific (file paths, line numbers).
- Address the user (Jacky/CEO) directly when relevant.
- If the ask is outside your domain, say so and @mention the right agent.
- End your response with a one-line memory note prefixed with [MEMORY]: summarizing any key decision or context worth remembering.

${context}

---

RESPOND TO THIS MESSAGE:
${prompt}`;

  // Use Claude CLI (or fallback to template if CLI unavailable)
  try {
    const response = await runClaudeCLI(systemPrompt, agentId, mode);
    return parseAgentResponse(agentId, response);
  } catch (error) {
    console.error(`[invoke-agent] CLI failed for ${agentId}:`, error.message);
    // Fallback: generate a template response
    return {
      response: `*${agentName}:* I've received your message and will address it in the next standup. The CLI is currently unavailable for real-time response.\n\n> "${prompt.substring(0, 100)}..."`,
      mentions: [],
      decisions: [],
      memoryUpdate: null,
    };
  }
}

/**
 * Run the Claude CLI with the given prompt via stdin.
 */
function runClaudeCLI(prompt, agentId, mode = "plan") {
  return new Promise((resolve, reject) => {
    const agentConfig = AGENT_CLI_CONFIG[agentId] || AGENT_CLI_CONFIG.default;
    // mode "plan" = standup/chat (read-only), "execute" = approved decisions (read-write)
    const modeKey = mode === "execute" ? "execute" : "plan";
    const modeConfig = agentConfig[modeKey] || agentConfig.plan;
    const args = [
      "-p",
      "--output-format", "text",
      "--no-session-persistence",
      "--model", agentConfig.model,
      "--permission-mode", modeConfig.permissionMode,
      "--max-turns", String(modeConfig.maxTurns),
    ];

    // Remove CLAUDECODE env var to allow spawning from within a Claude Code session
    const childEnv = { ...process.env };
    delete childEnv.CLAUDECODE;

    const child = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: TIMEOUT_MS,
      env: childEnv,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => { stdout += data.toString(); });
    child.stderr.on("data", (data) => { stderr += data.toString(); });

    child.on("close", (code) => {
      if (code !== 0 && !stdout) {
        reject(new Error(`Claude CLI exited ${code}: ${stderr.substring(0, 500)}`));
      } else {
        resolve(stdout || stderr);
      }
    });

    child.on("error", (err) => {
      reject(new Error(`Claude CLI spawn error: ${err.message}`));
    });

    // Pipe the prompt via stdin (avoids Windows 8191-char limit)
    child.stdin.write(prompt);
    child.stdin.end();

    // Safety timeout
    setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`Agent ${agentId} timed out after ${TIMEOUT_MS / 1000}s`));
    }, TIMEOUT_MS);
  });
}

/**
 * Parse an agent's response to extract @mentions, [DECISION] tags, and [MEMORY] notes.
 */
function parseAgentResponse(agentId, rawResponse) {
  const response = rawResponse.trim();
  
  // Extract @mentions
  const mentionRegex = /@(alex|amy|seth|rachel|seto|tiffany)\b/gi;
  const mentionMatches = response.matchAll(mentionRegex);
  const mentions = [...new Set([...mentionMatches].map(m => m[1].toLowerCase()))];
  
  // Extract [DECISION] proposals
  const decisionRegex = /\[DECISION\]\s*(.+?)(?:\s*—\s*(PROPOSED|APPROVED|NEEDS_CEO))?$/gim;
  const decisions = [];
  for (const match of response.matchAll(decisionRegex)) {
    decisions.push({
      title: match[1].trim(),
      status: (match[2] || "PROPOSED").toLowerCase(),
      agent: agentId,
    });
  }

  // Extract [MEMORY] note
  const memoryRegex = /\[MEMORY\]:?\s*(.+)$/im;
  const memoryMatch = response.match(memoryRegex);
  const memoryUpdate = memoryMatch ? memoryMatch[1].trim() : null;

  // Clean the response (remove [MEMORY] line from display)
  const cleanResponse = response.replace(/\n?\[MEMORY\]:?\s*.+$/im, "").trim();

  return {
    response: cleanResponse,
    mentions,
    decisions,
    memoryUpdate,
  };
}

/**
 * Invoke multiple agents in parallel for a standup round.
 */
export async function invokeParallel(agentIds, params) {
  const results = await Promise.allSettled(
    agentIds.map(id => invokeAgent({ ...params, agentId: id }))
  );
  
  return agentIds.map((id, i) => ({
    agentId: id,
    ...(results[i].status === "fulfilled" ? results[i].value : {
      response: `*${AGENT_NAMES[id]}:* [Error: ${results[i].reason?.message || "Unknown error"}]`,
      mentions: [],
      decisions: [],
      memoryUpdate: null,
    }),
  }));
}
