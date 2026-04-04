import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function authCheck(request: NextRequest): boolean {
  const secret = request.headers.get("x-fleet-secret") || "";
  const expected = process.env.FLEET_SYNC_SECRET || process.env.JWT_SECRET || "";
  return !!(expected && secret === expected);
}

// POST /api/admin/fleet/sync — receive standup logs + decisions + chat data from local dev machine
// Authenticated via a shared secret (FLEET_SYNC_SECRET env var)
export async function POST(request: NextRequest) {
  try {
    if (!authCheck(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { standups, decisions, coc, resetDecisions, replies, chatThreads, consolidateDecisions } = body;

    let standupsCreated = 0;
    let decisionsCreated = 0;

    // ── Consolidate open decisions (CEO directive: dedup + close stale) ──
    let decisionsConsolidated = 0;
    if (consolidateDecisions) {
      // Close all open decisions older than 3 days
      const staleResult = await prisma.$executeRawUnsafe(
        `UPDATE AgentLog SET status = 'completed', updatedAt = datetime('now') WHERE type = 'decision' AND status IN ('open', 'proposed') AND createdAt < datetime('now', '-3 days')`
      );
      decisionsConsolidated += (typeof staleResult === 'number' ? staleResult : 0);

      // Deduplicate remaining by cleaning titles and closing duplicates
      const openDecisions = await prisma.agentLog.findMany({
        where: { type: "decision", status: { in: ["open", "proposed"] } },
        orderBy: { createdAt: "desc" },
      });

      // Clean all titles
      for (const d of openDecisions) {
        const clean = d.title.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
        const short = clean.length > 80 ? clean.substring(0, 77) + "..." : clean;
        if (short !== d.title) {
          await prisma.agentLog.update({ where: { id: d.id }, data: { title: short } });
        }
      }

      // Group by topic and keep only most recent per topic
      const topics: Record<string, typeof openDecisions> = {};
      for (const d of openDecisions) {
        const t = d.title.toLowerCase();
        let topic = "other";
        if (t.includes("cta") || t.includes("click track")) topic = "cta";
        else if (t.includes("search console") || t.includes("google_site")) topic = "gsc";
        else if (t.includes("bank wire") || t.includes("payment")) topic = "payment";
        else if (t.includes("quote") && (t.includes("logan") || t.includes("s-power"))) topic = "leads";
        else if (t.includes("reddit") || t.includes("linkedin") || t.includes("distribution")) topic = "distribution";
        else if (t.includes("seed data") || t.includes("test data")) topic = "seed";
        else if (t.includes("accessib") || t.includes("wcag")) topic = "a11y";
        if (!topics[topic]) topics[topic] = [];
        topics[topic].push(d);
      }

      for (const decs of Object.values(topics)) {
        for (let i = 1; i < decs.length; i++) {
          await prisma.agentLog.update({
            where: { id: decs[i].id },
            data: { status: "completed" },
          });
          decisionsConsolidated++;
        }
      }
    }

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

    // ── Append replies to decision threads ──
    let repliesAppended = 0;
    if (Array.isArray(replies)) {
      for (const r of replies) {
        if (!r.ticket || !r.reply) continue;
        const existing = await prisma.agentLog.findFirst({
          where: { type: "decision", title: r.ticket },
        });
        if (existing) {
          const agentName = r.agentName || r.agent || "agent";
          const replyLine = `\n\n---\n**[REPLY from ${agentName}] (${new Date().toISOString().split("T")[0]}):** ${r.reply}`;
          await prisma.agentLog.update({
            where: { id: existing.id },
            data: { content: existing.content + replyLine },
          });
          repliesAppended++;
        }
      }
    }

    // ── Sync ChatThreads + ChatMessages ──
    let threadsCreated = 0;
    let messagesCreated = 0;
    if (Array.isArray(chatThreads)) {
      for (const t of chatThreads) {
        if (!t.id || !Array.isArray(t.messages)) continue;

        // Upsert thread
        const existingThread = await prisma.chatThread.findUnique({ where: { id: t.id } });
        if (!existingThread) {
          await prisma.chatThread.create({
            data: {
              id: t.id,
              title: t.title || "Untitled",
              triggerType: t.triggerType || "user_message",
              participants: t.participants || "",
              relatedId: t.relatedId || null,
              status: t.status || "active",
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            },
          });
          threadsCreated++;
        } else {
          // Update thread metadata if newer
          await prisma.chatThread.update({
            where: { id: t.id },
            data: {
              title: t.title || existingThread.title,
              participants: t.participants || existingThread.participants,
              status: t.status || existingThread.status,
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            },
          });
        }

        // Upsert messages
        for (const m of t.messages) {
          if (!m.id) continue;
          const existingMsg = await prisma.chatMessage.findUnique({ where: { id: m.id } });
          if (!existingMsg) {
            await prisma.chatMessage.create({
              data: {
                id: m.id,
                threadId: t.id,
                parentId: m.parentId || null,
                sender: m.sender || "system",
                content: m.content || "",
                mentions: m.mentions || null,
                attachments: m.attachments || null,
                metadata: m.metadata || null,
                status: m.status || "delivered",
                createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
              },
            });
            messagesCreated++;
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      standupsCreated,
      decisionsCreated,
      decisionsConsolidated,
      repliesAppended,
      threadsCreated,
      messagesCreated,
      message: `Synced ${standupsCreated} standups, ${decisionsCreated} decisions, ${repliesAppended} replies, ${threadsCreated} threads, ${messagesCreated} messages${decisionsConsolidated ? `, consolidated ${decisionsConsolidated} decisions` : ""}`,
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
    if (!authCheck(request)) {
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
