import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/admin/fleet/sync — receive standup logs + decisions from local dev machine
// Authenticated via a shared secret (FLEET_SYNC_SECRET env var)
export async function POST(request: NextRequest) {
  try {
    // Auth: check sync secret
    const secret = request.headers.get("x-fleet-secret") || "";
    const expected = process.env.FLEET_SYNC_SECRET || process.env.JWT_SECRET || "";
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { standups, decisions, coc, resetDecisions } = body;

    let standupsCreated = 0;
    let decisionsCreated = 0;

    // ── Reset decisions if requested (re-sync with correct attribution) ──
    if (resetDecisions) {
      await prisma.agentLog.deleteMany({ where: { type: "decision" } });
    }

    // ── Store Code of Conduct as AgentLog type="coc" ──
    if (coc && typeof coc === "string") {
      const existing = await prisma.agentLog.findFirst({ where: { type: "coc", relatedTo: "coc:latest" } });
      if (existing) {
        await prisma.agentLog.update({ where: { id: existing.id }, data: { content: coc } });
      } else {
        await prisma.agentLog.create({
          data: { agent: "alex", type: "coc", priority: "normal", title: "Code of Conduct", content: coc, status: "completed", relatedTo: "coc:latest" },
        });
      }
    }

    // ── Upsert standup logs as AgentLog type="standup" ──
    if (Array.isArray(standups)) {
      for (const s of standups) {
        // Use date as relatedTo to deduplicate
        const existing = await prisma.agentLog.findFirst({
          where: { type: "standup", relatedTo: `standup:${s.date}` },
        });
        if (!existing) {
          await prisma.agentLog.create({
            data: {
              agent: "alex", // standups are attributed to Alex (orchestrator)
              type: "standup",
              priority: "normal",
              title: `Daily Standup — ${s.date}`,
              content: s.content,
              status: "completed",
              relatedTo: `standup:${s.date}`,
              tags: (s.agents || []).join(","),
            },
          });
          standupsCreated++;
        } else if (s.content.length > existing.content.length) {
          // Update if the new content is longer (more complete standup)
          await prisma.agentLog.update({
            where: { id: existing.id },
            data: {
              content: s.content,
              tags: (s.agents || []).join(","),
            },
          });
          standupsCreated++;
        }
      }
    }

    // ── Upsert decisions as AgentLog type="decision" ──
    // THREADING: If a decision with the same title already exists, DON'T replace it.
    // CEO comments and back-and-forth are preserved on the existing record.
    // Only create if it's genuinely new (no title match).
    if (Array.isArray(decisions)) {
      for (const d of decisions) {
        // Check if ANY decision with this title exists (regardless of relatedTo)
        const existing = await prisma.agentLog.findFirst({
          where: {
            type: "decision",
            title: d.title,
          },
        });
        if (existing) {
          // Update agent attribution if wrong, but NEVER overwrite content (preserves CEO comments)
          if (existing.agent !== (d.agent || "alex")) {
            await prisma.agentLog.update({
              where: { id: existing.id },
              data: { agent: d.agent || "alex" },
            });
          }
          // Don't count as new — this is a thread update
        } else {
          await prisma.agentLog.create({
            data: {
              agent: d.agent || "alex",
              type: "decision",
              priority: d.priority || "normal",
              title: d.title,
              content: d.content || "",
              status: d.status || "open",
              assignedTo: d.assignedTo || null,
              relatedTo: d.relatedTo || null,
              tags: d.tags || null,
            },
          });
          decisionsCreated++;
        }
      }
    }

    return NextResponse.json({
      ok: true,
      standupsCreated,
      decisionsCreated,
      message: `Synced ${standupsCreated} standups, ${decisionsCreated} decisions`,
    });
  } catch (e) {
    console.error("Fleet sync error:", e);
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/admin/fleet/sync — pull CEO decisions/feedback back to dev machine
export async function GET(request: NextRequest) {
  try {
    const secret = request.headers.get("x-fleet-secret") || "";
    const expected = process.env.FLEET_SYNC_SECRET || process.env.JWT_SECRET || "";
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return all decisions + unaddressed chat messages
    const decisions = await prisma.agentLog.findMany({
      where: { type: "decision" },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const chatMessages = await prisma.agentLog.findMany({
      where: { type: "chat", status: "open" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ ok: true, decisions, chatMessages, count: decisions.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
