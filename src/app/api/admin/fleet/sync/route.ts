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
    const { standups, decisions, coc } = body;

    let standupsCreated = 0;
    let decisionsCreated = 0;

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
        }
      }
    }

    // ── Upsert decisions as AgentLog type="decision" ──
    if (Array.isArray(decisions)) {
      for (const d of decisions) {
        // Deduplicate by title + date combo
        const existing = await prisma.agentLog.findFirst({
          where: {
            type: "decision",
            title: d.title,
            relatedTo: d.relatedTo || null,
          },
        });
        if (!existing) {
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

    // Return all decisions with CEO feedback (updated since last sync)
    const decisions = await prisma.agentLog.findMany({
      where: { type: "decision" },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ ok: true, decisions, count: decisions.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
