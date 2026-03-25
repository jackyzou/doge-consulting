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

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

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
  const systemPrompt = `You are ${agentName} at Doge Consulting. You are responding in a team chat.

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
    // Check if 'claude' is available
    const args = [
      "-p",
      "--output-format", "text",
      "--no-session-persistence",
      "--max-turns", "3",
    ];

    const child = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: TIMEOUT_MS,
      env: { ...process.env },
      shell: true,
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
