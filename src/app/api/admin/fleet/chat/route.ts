import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// GET /api/admin/fleet/chat — list threads with latest messages
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const threadId = searchParams.get("threadId");
    const limit = parseInt(searchParams.get("limit") || "50");

    // If threadId specified, return full thread messages
    if (threadId) {
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: limit,
          },
        },
      });
      if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
      return NextResponse.json({ thread });
    }

    // List all threads with last message + message count
    const threads = await prisma.chatThread.findMany({
      where: { status: { not: "archived" } },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ threads });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

// POST /api/admin/fleet/chat — send a message (creates thread if needed)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type") || "";

    let text = "";
    let mentions: string[] = [];
    let imageUrl: string | null = null;
    let threadId: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      text = (formData.get("text") as string) || "";
      const mentionsStr = (formData.get("mentions") as string) || "";
      mentions = mentionsStr ? mentionsStr.split(",").filter(Boolean) : [];
      threadId = (formData.get("threadId") as string) || null;

      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        const uploadsDir = join(process.cwd(), "public", "uploads", "chat");
        if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
        const ext = imageFile.name.split(".").pop() || "png";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filepath = join(uploadsDir, filename);
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        writeFileSync(filepath, buffer);
        imageUrl = `/uploads/chat/${filename}`;
      }
    } else {
      const body = await request.json();
      text = body.text || "";
      mentions = body.mentions || [];
      imageUrl = body.imageUrl || null;
      threadId = body.threadId || null;
    }

    if (!text.trim() && !imageUrl) {
      return NextResponse.json({ error: "Message text or image required" }, { status: 400 });
    }

    let content = text.trim();
    if (imageUrl) {
      content += `\n\n![attached image](${imageUrl})`;
    }

    // Create thread if not replying to existing
    if (!threadId) {
      const thread = await prisma.chatThread.create({
        data: {
          title: content.substring(0, 120).replace(/\n/g, " "),
          triggerType: "user_message",
          participants: ["jacky", ...mentions].join(","),
          status: "active",
        },
      });
      threadId = thread.id;
    } else {
      // Update thread participants + timestamp
      const existing = await prisma.chatThread.findUnique({ where: { id: threadId } });
      if (existing) {
        const currentParticipants = new Set(existing.participants.split(",").filter(Boolean));
        currentParticipants.add("jacky");
        mentions.forEach(m => currentParticipants.add(m));
        await prisma.chatThread.update({
          where: { id: threadId },
          data: {
            participants: Array.from(currentParticipants).join(","),
            updatedAt: new Date(),
          },
        });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId,
        sender: "jacky",
        content,
        mentions: mentions.length > 0 ? mentions.join(",") : null,
        attachments: imageUrl ? JSON.stringify([imageUrl]) : null,
        status: "delivered",
      },
    });

    // Also create in AgentLog for backward compat with standup processing
    await prisma.agentLog.create({
      data: {
        agent: "jacky",
        type: "chat",
        priority: "normal",
        title: content.substring(0, 100),
        content,
        status: "open",
        assignedTo: mentions.length > 0 ? mentions.join(",") : null,
        tags: mentions.map(m => `@${m}`).join(",") || null,
        relatedTo: `chat:thread:${threadId}`,
      },
    });

    return NextResponse.json({ message, threadId }, { status: 201 });
  } catch (e) {
    console.error("Chat error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// PATCH /api/admin/fleet/chat — update thread status or resolve
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { threadId, messageId, status } = body;

    if (threadId && status) {
      const updated = await prisma.chatThread.update({
        where: { id: threadId },
        data: { status },
      });
      return NextResponse.json(updated);
    }

    if (messageId && status) {
      // Legacy: update individual message or AgentLog
      const updated = await prisma.agentLog.update({
        where: { id: messageId },
        data: { status },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "threadId or messageId required" }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
