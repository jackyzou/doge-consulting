// agents/lib/build-context.mjs — Assembles context for LLM agent invocation
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENTS_DIR = resolve(__dirname, "..");
const ROOT_DIR = resolve(__dirname, "../..");

/**
 * Build the full context string for an agent invocation.
 * Keeps total size under ~30KB to stay within practical token limits.
 */
export function buildContext({ agentId, threadMessages = [], recentDecisions = [], standupSummary = "", gitLog = "" }) {
  const sections = [];

  // 1. Agent profile
  const profilePath = resolve(AGENTS_DIR, "profiles", `${agentId.replace(/\s+/g, "-").toLowerCase()}.md`);
  // Try various profile file naming conventions
  const profilePaths = [
    profilePath,
    resolve(AGENTS_DIR, "profiles", `${agentId}.md`),
    ...["alex-chen", "amy-lin", "seth-parker", "rachel-morales", "seto-nakamura", "tiffany-wang"]
      .filter(name => name.startsWith(agentId.split("-")[0] || agentId))
      .map(name => resolve(AGENTS_DIR, "profiles", `${name}.md`)),
  ];
  
  let profile = "";
  for (const p of profilePaths) {
    if (existsSync(p)) {
      profile = readFileSync(p, "utf8");
      break;
    }
  }
  if (profile) {
    sections.push(`## YOUR PROFILE\n\n${profile.substring(0, 4000)}`);
  }

  // 2. Code of Conduct excerpts (trimmed to relevant sections)
  const cocPath = resolve(AGENTS_DIR, "CODE-OF-CONDUCT.md");
  if (existsSync(cocPath)) {
    const coc = readFileSync(cocPath, "utf8");
    // Extract the agent's specific section + collaboration rules + decision protocol
    const agentSection = extractSection(coc, agentId);
    const collabRules = extractPartialSection(coc, "Part 5 — Collaboration Rules", 3000);
    const chatExecution = extractPartialSection(coc, "Chat Execution", 2000);
    sections.push(`## CODE OF CONDUCT (Excerpts)\n\n${agentSection}\n\n${collabRules}\n\n${chatExecution}`);
  }

  // 3. Thread history
  if (threadMessages.length > 0) {
    const threadText = threadMessages
      .slice(-20) // Last 20 messages
      .map(m => `**${m.sender}** (${new Date(m.createdAt).toLocaleString()}):\n${m.content}`)
      .join("\n\n---\n\n");
    sections.push(`## CONVERSATION HISTORY\n\n${threadText}`);
  }

  // 4. Recent decisions (this agent's)
  if (recentDecisions.length > 0) {
    const decisionsText = recentDecisions
      .slice(0, 10)
      .map(d => `- [${d.status.toUpperCase()}] ${d.title}`)
      .join("\n");
    sections.push(`## YOUR RECENT DECISIONS\n\n${decisionsText}`);
  }

  // 5. Latest standup summary
  if (standupSummary) {
    sections.push(`## LATEST STANDUP SUMMARY\n\n${standupSummary.substring(0, 3000)}`);
  }

  // 6. Git log
  if (gitLog) {
    sections.push(`## RECENT COMMITS\n\n${gitLog.substring(0, 1000)}`);
  }

  // 7. Agent memory
  const memoryPath = resolve(AGENTS_DIR, "memory", `${agentId}.md`);
  if (existsSync(memoryPath)) {
    const memory = readFileSync(memoryPath, "utf8");
    sections.push(`## YOUR MEMORY (Persistent Context)\n\n${memory.substring(0, 3000)}`);
  }

  return sections.join("\n\n---\n\n");
}

function extractSection(text, agentId) {
  // Map agentId to the section header name
  const nameMap = {
    alex: "Alex Chen",
    amy: "Amy Lin",
    seth: "Seth Parker",
    rachel: "Rachel Morales",
    seto: "Seto Nakamura",
    tiffany: "Tiffany Wang",
  };
  const name = nameMap[agentId] || agentId;
  const regex = new RegExp(`### ${name}[\\s\\S]*?(?=###\\s|## Part|$)`, "i");
  const match = text.match(regex);
  return match ? match[0].substring(0, 3000) : "";
}

function extractPartialSection(text, sectionName, maxLength = 2000) {
  const idx = text.indexOf(sectionName);
  if (idx === -1) return "";
  return text.substring(idx, idx + maxLength);
}

/**
 * Update an agent's persistent memory file (append-only).
 */
export function updateMemory(agentId, entry) {
  const memoryPath = resolve(AGENTS_DIR, "memory", `${agentId}.md`);
  const timestamp = new Date().toISOString().split("T")[0];
  const line = `\n- **${timestamp}:** ${entry}\n`;
  
  let existing = "";
  if (existsSync(memoryPath)) {
    existing = readFileSync(memoryPath, "utf8");
  } else {
    existing = `# ${agentId} — Persistent Memory\n\nKey decisions, learnings, and context preserved across conversations.\n`;
  }
  
  const { writeFileSync } = await import("fs");
  writeFileSync(memoryPath, existing + line, "utf8");
}
