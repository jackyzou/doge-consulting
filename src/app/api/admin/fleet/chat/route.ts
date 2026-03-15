import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

// GET /api/admin/fleet/chat — list chat messages
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "50");
    const before = searchParams.get("before"); // cursor pagination

    const messages = await prisma.agentLog.findMany({
      where: {
        type: "chat",
        ...(before && { createdAt: { lt: new Date(before) } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Return in chronological order (oldest first)
    return NextResponse.json({ messages: messages.reverse() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

// POST /api/admin/fleet/chat — send a chat message
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type") || "";

    let text = "";
    let mentions: string[] = [];
    let imageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle image upload
      const formData = await request.formData();
      text = (formData.get("text") as string) || "";
      const mentionsStr = (formData.get("mentions") as string) || "";
      mentions = mentionsStr ? mentionsStr.split(",").filter(Boolean) : [];

      const imageFile = formData.get("image") as File | null;
      if (imageFile && imageFile.size > 0) {
        // Store image as file in public/uploads/chat/
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
      // JSON body
      const body = await request.json();
      text = body.text || "";
      mentions = body.mentions || [];
      imageUrl = body.imageUrl || null;
    }

    if (!text.trim() && !imageUrl) {
      return NextResponse.json({ error: "Message text or image required" }, { status: 400 });
    }

    // Build content with image markdown if present
    let content = text.trim();
    if (imageUrl) {
      content += `\n\n![attached image](${imageUrl})`;
    }

    const message = await prisma.agentLog.create({
      data: {
        agent: "jacky", // CEO messages
        type: "chat",
        priority: "normal",
        title: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        content,
        status: "open", // Agents need to address this
        assignedTo: mentions.length > 0 ? mentions.join(",") : null,
        tags: mentions.length > 0 ? mentions.map(m => `@${m}`).join(",") : null,
        relatedTo: "chat:ceo",
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    console.error("Chat error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// PATCH /api/admin/fleet/chat — mark message as addressed or add agent reply
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, status } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await prisma.agentLog.update({
      where: { id },
      data: { ...(status && { status }) },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
