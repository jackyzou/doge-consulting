import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/fleet/chat/respond — agent posts a reply (called by fleet runner)
// Protected by FLEET_SYNC_SECRET header
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-fleet-secret");
    const expected = process.env.FLEET_SYNC_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { threadId, sender, content, mentions, metadata, parentId } = body;

    if (!threadId || !sender || !content) {
      return NextResponse.json({ error: "threadId, sender, and content required" }, { status: 400 });
    }

    // Verify thread exists
    const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Add sender to thread participants
    const participants = new Set(thread.participants.split(",").filter(Boolean));
    participants.add(sender);
    if (mentions) {
      mentions.split(",").filter(Boolean).forEach((m: string) => participants.add(m));
    }

    await prisma.chatThread.update({
      where: { id: threadId },
      data: {
        participants: Array.from(participants).join(","),
        updatedAt: new Date(),
      },
    });

    // Create the agent message
    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        parentId: parentId || null,
        sender,
        content,
        mentions: mentions || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: "delivered",
      },
    });

    // Also log in AgentLog for standup visibility
    await prisma.agentLog.create({
      data: {
        agent: sender,
        type: "chat",
        priority: "normal",
        title: `RE: ${thread.title.substring(0, 80)}`,
        content,
        status: "completed",
        assignedTo: "jacky",
        relatedTo: `chat:thread:${threadId}`,
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (e) {
    console.error("Agent respond error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
