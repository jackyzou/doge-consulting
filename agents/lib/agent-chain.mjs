// agents/lib/agent-chain.mjs — Agent-to-agent conversation chains
//
// When agent A @mentions agent B in a response, this module automatically
// spawns agent B's Claude session to respond, creating a real conversation
// chain without waiting for the next standup.
//
// Chain rules:
// - Max depth: 5 rounds (configurable)
// - An agent cannot @mention itself
// - Alex auto-synthesizes if 3+ agents are involved
// - Each chain is logged for auditability

import { invokeAgent } from "./invoke-agent.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = resolve(__dirname, "../logs");

const AGENT_NAMES = {
  alex: "Alex Chen (COO)", amy: "Amy Lin (CFO)", seth: "Seth Parker (CTO)",
  rachel: "Rachel Morales (CMO)", seto: "Seto Nakamura (PRO)", tiffany: "Tiffany Wang (CSO)",
};

const VALID_AGENTS = new Set(Object.keys(AGENT_NAMES));

/**
 * Process @mentions from an agent response and chain responses.
 *
 * @param {string[]} mentionedAgents - Agent IDs that were @mentioned
 * @param {string} context - The conversation so far
 * @param {Object} options
 * @param {number} options.maxDepth - Maximum chain depth (default 5)
 * @param {boolean} options.verbose - Log progress
 * @param {string} options.sourceAgent - Who started the chain
 * @param {number} options.currentDepth - Current recursion depth
 * @returns {Promise<Array<{agentId: string, response: string, mentions: string[], decisions: Array}>>}
 */
export async function chainAgentMentions(
  mentionedAgents,
  context,
  { maxDepth = 5, verbose = true, sourceAgent = "", currentDepth = 0 } = {}
) {
  if (currentDepth >= maxDepth) {
    if (verbose) console.log(`      ⛔ Max chain depth (${maxDepth}) reached — stopping`);
    return [];
  }

  // Filter valid, unique agents (exclude source to prevent loops)
  const targets = [...new Set(mentionedAgents)]
    .filter(id => VALID_AGENTS.has(id) && id !== sourceAgent);

  if (targets.length === 0) return [];

  if (verbose) {
    const indent = "   ".repeat(currentDepth + 1);
    console.log(`${indent}🔗 Chain depth ${currentDepth + 1}: spawning ${targets.join(", ")}`);
  }

  // Spawn all mentioned agents in parallel
  const results = await Promise.allSettled(
    targets.map(agentId =>
      invokeAgent({
        agentId,
        prompt: `You were @mentioned by a colleague in a team discussion. Here's the conversation so far:

${context.substring(0, 4000)}

---

You were specifically mentioned because your expertise is needed. Respond to the request directed at you.
- Be specific and actionable
- If you need input from another agent, @mention them
- If you can resolve the request, do so
- Keep it concise (3-5 sentences typical)`,
        threadMessages: [],
        recentDecisions: [],
        standupSummary: "",
        gitLog: "",
        mode: "plan",
      })
    )
  );

  // Collect responses
  const responses = [];
  const newMentions = [];

  for (let i = 0; i < targets.length; i++) {
    const agentId = targets[i];
    const result = results[i];

    if (result.status === "fulfilled") {
      const { response, mentions, decisions } = result.value;
      responses.push({ agentId, response, mentions, decisions });

      // Collect new @mentions for next chain round (exclude agents already in this chain)
      const nextMentions = mentions.filter(m => !targets.includes(m) && m !== sourceAgent);
      newMentions.push(...nextMentions);

      if (verbose) {
        const indent = "   ".repeat(currentDepth + 1);
        console.log(`${indent}   💬 ${agentId}: ${response.substring(0, 120)}...`);
        if (nextMentions.length > 0) {
          console.log(`${indent}   → mentions: ${nextMentions.join(", ")}`);
        }
      }

      // Update memory if provided
      if (result.value.memoryUpdate) {
        try {
          const { updateMemory } = await import("./build-context.mjs");
          updateMemory(agentId, result.value.memoryUpdate);
        } catch {}
      }
    } else {
      if (verbose) {
        const indent = "   ".repeat(currentDepth + 1);
        console.log(`${indent}   ❌ ${agentId}: ${result.reason?.message}`);
      }
    }
  }

  // Recurse: if new @mentions were generated, chain them
  if (newMentions.length > 0 && currentDepth + 1 < maxDepth) {
    const updatedContext = context + "\n\n" +
      responses.map(r => `${r.agentId}: ${r.response}`).join("\n\n");

    const chainedResponses = await chainAgentMentions(
      [...new Set(newMentions)],
      updatedContext,
      {
        maxDepth,
        verbose,
        sourceAgent: targets[0], // Use first responder as source to prevent ping-pong
        currentDepth: currentDepth + 1,
      }
    );

    responses.push(...chainedResponses);
  }

  // If 3+ agents involved and Alex isn't already in the chain, have him synthesize
  const allAgentsInChain = new Set([sourceAgent, ...targets, ...responses.map(r => r.agentId)]);
  if (allAgentsInChain.size >= 3 && !allAgentsInChain.has("alex") && currentDepth === 0) {
    if (verbose) console.log(`      📋 Alex auto-synthesizing (3+ agents involved)...`);

    try {
      const synthResult = await invokeAgent({
        agentId: "alex",
        prompt: `Multiple agents had a discussion chain. Synthesize their inputs and make any decisions within your authority.

CONVERSATION:
${responses.map(r => `**${r.agentId}:** ${r.response.substring(0, 500)}`).join("\n\n")}

Provide: key takeaway, any decisions you're making, and next steps.`,
        threadMessages: [],
        recentDecisions: [],
        standupSummary: "",
        gitLog: "",
        mode: "plan",
      });

      responses.push({ agentId: "alex", response: synthResult.response, mentions: synthResult.mentions, decisions: synthResult.decisions });
      if (verbose) console.log(`      📋 Alex: ${synthResult.response.substring(0, 120)}...`);
    } catch {}
  }

  // Log the chain
  if (currentDepth === 0) {
    logChain(sourceAgent, responses);
  }

  return responses;
}

/**
 * Process a single message and resolve all @mention chains.
 * Convenience wrapper for use from chat/standup processing.
 */
export async function resolveMessage(senderAgent, message, { maxDepth = 5, verbose = true } = {}) {
  // Parse @mentions from the message
  const mentionRegex = /@(alex|amy|seth|rachel|seto|tiffany)\b/gi;
  const mentions = [...new Set([...message.matchAll(mentionRegex)].map(m => m[1].toLowerCase()))];

  if (mentions.length === 0) return [];

  return chainAgentMentions(mentions, `${senderAgent}: ${message}`, {
    maxDepth,
    verbose,
    sourceAgent: senderAgent,
  });
}

function logChain(sourceAgent, responses) {
  const today = new Date().toISOString().split("T")[0];
  const logFile = resolve(LOGS_DIR, `${today}.md`);
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const entry = `
## Agent Chain — ${timestamp}

**Initiated by:** ${sourceAgent || "system"}
**Agents involved:** ${responses.map(r => r.agentId).join(", ")}
**Depth:** ${responses.length} responses

${responses.map(r => `### ${r.agentId}\n${r.response?.substring(0, 500) || "(no response)"}`).join("\n\n")}

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
  writeFileSync(logFile, existing + entry, "utf8");
}

// CLI entry point
if (process.argv[1]?.includes("agent-chain")) {
  const sender = process.argv[2] || "jacky";
  const message = process.argv[3] || "@seth @rachel What's the status of our SEO and should we prioritize technical fixes or content this week?";

  console.log(`🔗 Resolving message from ${sender}: "${message.substring(0, 80)}..."`);
  resolveMessage(sender, message).then(responses => {
    console.log(`\n✅ Chain complete: ${responses.length} responses from ${responses.map(r => r.agentId).join(", ")}`);
  });
}
