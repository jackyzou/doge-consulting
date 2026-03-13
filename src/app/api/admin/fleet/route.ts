import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const AGENTS = [
  { id: "alex", name: "Alex Chen", role: "Co-CEO / COO", skills: ["Strategy", "Operations", "Team Management", "Business Development", "Revenue Ops", "Quality Assurance"] },
  { id: "amy", name: "Amy Lin", role: "CFO", skills: ["Accounting", "Pricing Strategy", "Tax Planning", "Cash Flow", "Financial Reporting", "Sales Ops"] },
  { id: "seth", name: "Seth Parker", role: "CTO", skills: ["Next.js", "DevOps", "Database", "Security", "SEO Technical", "Frontend Design"] },
  { id: "rachel", name: "Rachel Morales", role: "CMO", skills: ["SEO Content", "Reddit Community", "Channel Strategy", "Conversion", "Analytics", "Newsletter"] },
  { id: "seto", name: "Seto Nakamura", role: "PRO / Editor-in-Chief", skills: ["News Monitoring", "Content Creation", "PR", "Legal", "Industry Analysis"] },
  { id: "tiffany", name: "Tiffany Wang", role: "CSO", skills: ["Customer Support", "Quote Management", "Order Tracking", "Pricing", "CRM", "Bilingual EN/ZH"] },
];

interface LogEntry {
  date: string;
  agents: string[];
  decisionCount: number;
  hasCeoItems: boolean;
  sizeKB: number;
  content: string;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const section = searchParams.get("section");
    const result: Record<string, unknown> = {};

    if (!section || section === "agents") {
      result.agents = AGENTS;
    }

    if (!section || section === "decisions") {
      const dbDecisions = await prisma.agentLog.findMany({
        where: { type: "decision" },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      result.decisions = dbDecisions;
    }

    if (!section || section === "logs") {
      const logs: LogEntry[] = [];

      const logsDir = join(process.cwd(), "agents", "logs");
      if (existsSync(logsDir)) {
        const files = readdirSync(logsDir)
          .filter((f: string) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
          .sort().reverse().slice(0, 30);

        for (const file of files) {
          const content = readFileSync(join(logsDir, file), "utf-8");
          const date = file.replace(".md", "");
          const agentMatches = content.match(/\*\*(Alex|Amy|Seth|Rachel|Seto|Tiffany|Jacky)\b/g);
          const agents = [...new Set((agentMatches || []).map((m: string) => m.replace(/\*\*/g, "")))];
          const decisionCount = (content.match(/\[DECISION\]/g) || []).length;
          const hasCeoItems = content.includes("NEEDS_CEO") || content.includes("BLOCKED");
          logs.push({ date, agents, decisionCount, hasCeoItems, sizeKB: Math.round(content.length / 1024 * 10) / 10, content });
        }
      }

      const dbStandups = await prisma.agentLog.findMany({
        where: { type: "standup" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: { id: true, title: true, content: true, createdAt: true, tags: true, relatedTo: true },
      });

      for (const dbs of dbStandups) {
        const dateMatch = dbs.relatedTo?.match(/standup:(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : new Date(dbs.createdAt).toISOString().split("T")[0];
        if (!logs.some((l) => l.date === date)) {
          const agents = (dbs.tags || "").split(",").filter(Boolean);
          const decisionCount = (dbs.content.match(/\[DECISION\]/g) || []).length;
          const hasCeoItems = dbs.content.includes("NEEDS_CEO") || dbs.content.includes("BLOCKED");
          logs.push({ date, agents, decisionCount, hasCeoItems, sizeKB: Math.round(dbs.content.length / 1024 * 10) / 10, content: dbs.content });
        }
      }

      logs.sort((a, b) => b.date.localeCompare(a.date));
      result.logs = logs;
    }

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const log = await prisma.agentLog.create({
      data: {
        agent: body.agent || "alex",
        type: body.type || "decision",
        priority: body.priority || "normal",
        title: body.title,
        content: body.content || "",
        tags: body.tags || null,
        status: body.status || "open",
        assignedTo: body.assignedTo || null,
        relatedTo: body.relatedTo || null,
      },
    });
    return NextResponse.json(log, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, status, content } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await prisma.agentLog.update({
      where: { id },
      data: { ...(status && { status }), ...(content && { content }) },
    });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}