import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { execFileSync, execSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const agentNames: Record<string, string> = {
  alex: "Alex Chen (Co-CEO/COO)",
  amy: "Amy Lin (CFO)",
  seth: "Seth Parker (CTO)",
  rachel: "Rachel Morales (CMO)",
  seto: "Seto Nakamura (PRO/Editor)",
  tiffany: "Tiffany Wang (CSO)",
};

/**
 * Check if Claude CLI is available on this machine.
 * Cached after first check for the lifetime of the process.
 */
let _claudeAvailable: boolean | null = null;
function isClaudeAvailable(): boolean {
  if (_claudeAvailable !== null) return _claudeAvailable;
  try {
    execSync("claude --version", { stdio: "pipe", timeout: 5000 });
    _claudeAvailable = true;
  } catch {
    _claudeAvailable = false;
  }
  return _claudeAvailable;
}

// POST /api/admin/fleet/chat/trigger — trigger agent responses for a thread
// Each agent spawns its own Claude Code Opus 4.6 session for real thinking
// Requires Claude CLI on this machine. On production (no CLI), returns an error
// telling the user to use the dev PC's localhost admin chat instead.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { threadId } = body;

    if (!threadId) {
      return NextResponse.json({ error: "threadId required" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: threadId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const lastMsg = thread.messages[0];
    if (!lastMsg) {
      return NextResponse.json({ error: "Thread has no messages" }, { status: 400 });
    }

    // Determine responding agents
    const mentionedAgents = lastMsg.mentions?.split(",").filter(Boolean) || [];
    const participants = thread.participants.split(",").filter(Boolean).filter(p => p !== "jacky");
    const respondingAgents = mentionedAgents.length > 0 ? mentionedAgents : participants.length > 0 ? participants : ["alex"];

    // Get conversation context
    const recentMessages = [...thread.messages].reverse(); // Oldest first
    const conversationContext = recentMessages.map(m => `${m.sender}: ${m.content}`).join("\n\n");

    // Generate and store responses
    const responses: { agent: string; content: string }[] = [];

    // Check if Claude CLI is available on this machine
    if (!isClaudeAvailable()) {
      return NextResponse.json({
        error: "Claude CLI not available on this server. Agent chat requires the dev PC. Use http://localhost:3000/admin/chat on the dev machine where Claude CLI is installed.",
        triggered: false,
      }, { status: 503 });
    }

    for (const agentId of respondingAgents) {
      let content: string;

      try {
        content = invokeClaude(agentId, lastMsg.content, conversationContext);
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.warn(`[trigger] Claude CLI failed for ${agentId}:`, error);
        content = `**${agentNames[agentId] || agentId}:** [LLM Error] Claude session failed: ${error.substring(0, 200)}. Try again or check Claude CLI status.`;
      }

      await prisma.chatMessage.create({
        data: {
          threadId,
          sender: agentId,
          content,
          mentions: null,
          status: "delivered",
        },
      });

      // Update thread participants
      const currentParticipants = new Set(thread.participants.split(",").filter(Boolean));
      currentParticipants.add(agentId);
      await prisma.chatThread.update({
        where: { id: threadId },
        data: {
          participants: Array.from(currentParticipants).join(","),
          updatedAt: new Date(),
        },
      });

      responses.push({ agent: agentId, content });
    }

    return NextResponse.json({
      triggered: true,
      agents: respondingAgents,
      responses,
      message: `${respondingAgents.length} agent(s) responded.`,
    });
  } catch (e) {
    console.error("Chat trigger error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Invoke Claude CLI for an agent response.
 * Spawns a real Claude Code Opus 4.6 session with the agent's full context.
 */
function invokeClaude(agentId: string, userMessage: string, conversationContext: string): string {
  const name = agentNames[agentId] || agentId;

  // Load agent profile if available
  const root = process.cwd();
  const profilePath = resolve(root, "agents", "profiles", `${agentId === "alex" ? "alex-chen" : agentId === "amy" ? "amy-lin" : agentId === "seth" ? "seth-parker" : agentId === "rachel" ? "rachel-morales" : agentId === "seto" ? "seto-nakamura" : "tiffany-wang"}.md`);
  let profile = "";
  if (existsSync(profilePath)) {
    profile = readFileSync(profilePath, "utf8").substring(0, 3000);
  }

  // Load agent memory if available
  const memoryPath = resolve(root, "agents", "memory", `${agentId}.md`);
  let memory = "";
  if (existsSync(memoryPath)) {
    memory = readFileSync(memoryPath, "utf8").substring(0, 2000);
  }

  const prompt = `You are ${name} at Doge Consulting. You are responding in a team chat.
You are powered by Claude Code Opus 4.6 (1M context).

${profile ? `YOUR PROFILE:\n${profile}\n` : ""}
${memory ? `YOUR MEMORY:\n${memory}\n` : ""}

CONVERSATION SO FAR:
${conversationContext.substring(0, 4000)}

RULES:
- Stay in character as ${name}. Use first person.
- Be concise but substantive. 2-5 sentences typical.
- If you need input from another agent, use @agentid (e.g., @seth).
- If proposing a decision, use [DECISION] tag.
- Reference specific data, files, or metrics when relevant.
- Address the CEO (Jacky) directly when relevant.

RESPOND TO THIS MESSAGE:
${userMessage}`;

  // Spawn claude CLI with a 2-minute timeout for chat responses
  const isSeth = agentId === "seth";
  const result = execFileSync("claude", [
    "-p",
    "--output-format", "text",
    "--no-session-persistence",
    "--model", "claude-opus-4-6",
    "--permission-mode", isSeth ? "bypassPermissions" : "plan",
    "--max-turns", isSeth ? "3" : "1",
  ], {
    input: prompt,
    encoding: "utf8",
    timeout: 120_000, // 2 minutes for chat (shorter than standup)
    cwd: root,
    env: { ...process.env, CLAUDECODE: "" }, // Allow spawning from within Claude Code sessions
  });

  return result.trim();
}
