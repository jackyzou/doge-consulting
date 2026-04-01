import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// Full agent profiles with descriptions (synced from local Code of Conduct)
const AGENTS = [
  { id: "alex", name: "Alex Chen", role: "CEO & Co-Founder", avatar: "AC", avatarUrl: "/team/alex-chen.svg", color: "#0F2B46",
    skills: ["Strategy", "Operations", "Executive Briefs", "Project Orchestration", "Supply Chain Strategy", "Pipeline Management", "Stakeholder Alignment"],
    bio: "20+ years scaling businesses. McKinsey-grade executive communication (SCQA/Pyramid Principle). Orchestrates cross-functional pipelines, manages supply chain strategy, and leads 7-agent fleet." },
  { id: "amy", name: "Amy Lin", role: "CFO", avatar: "AL", avatarUrl: "/team/amy-lin.svg", color: "#059669",
    skills: ["Accounting", "Pricing Strategy", "Tax Planning", "Cash Flow", "Financial Reporting", "Sales Ops"],
    bio: "15 years in finance, SMB accounting, international trade. Manages pricing, outreach pipeline, and financial reporting." },
  { id: "seth", name: "Seth Parker", role: "CTO", avatar: "SP", avatarUrl: "/team/seth-parker.svg", color: "#2563EB",
    skills: ["Full-Stack Dev", "Software Architecture", "AI/ML Engineering", "DevOps", "Data Engineering", "Code Review", "Frontend Excellence", "Security"],
    bio: "12 years full-stack engineering. Software architect, AI/ML integrator, data pipeline builder. Owns site, agent fleet execution, health monitoring, and code quality." },
  { id: "rachel", name: "Rachel Morales", role: "CMO", avatar: "RM", avatarUrl: "/team/rachel-morales.svg", color: "#D97706",
    skills: ["SEO Content", "Reddit Community", "Channel Strategy", "Conversion", "Analytics", "Newsletter"],
    bio: "14 years digital marketing, B2B/B2C. Creative, data-informed. Owns channel strategy (SEO, Reddit, YouTube), content distribution, and conversion optimization." },
  { id: "seto", name: "Seto Nakamura", role: "PRO / Editor & Legal Compliance", avatar: "SN", avatarUrl: "/team/seto-nakamura.svg", color: "#7C3AED",
    skills: ["News Monitoring", "Content Creation", "PR", "Legal Compliance", "Trade Regulations", "Data Privacy", "Contract Review"],
    bio: "10 years journalism, PR, trade media, and legal compliance. Writes blog content, monitors regulations, ensures GDPR/CCPA compliance, reviews contracts, screens sanctions lists." },
  { id: "tiffany", name: "Tiffany Wang", role: "CSO", avatar: "TW", avatarUrl: "/team/tiffany-wang.svg", color: "#EC4899",
    skills: ["Customer Support", "Quote Management", "Order Tracking", "Pricing", "CRM", "Bilingual EN/ZH"],
    bio: "8 years customer success, e-commerce ops. Warm, proactive. First point of contact, tracks quotes/orders, coordinates with Rachel on customer relationships." },
  { id: "kim", name: "Kim Park", role: "UI/UX Designer", avatar: "KP", avatarUrl: "/team/kim-park.svg", color: "#8B5CF6",
    skills: ["UI Design", "UX Research", "Brand Systems", "Accessibility", "Conversion Optimization", "Design QA"],
    bio: "10 years UI/UX design, brand systems, and conversion optimization. Owns visual identity, component library, and accessibility compliance." },
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
    const id = searchParams.get("id");
    const agentId = searchParams.get("agentId");
    const result: Record<string, unknown> = {};

    // Single decision detail
    if (id) {
      const decision = await prisma.agentLog.findUnique({ where: { id } });
      return NextResponse.json(decision);
    }

    // Per-agent decisions (for agent detail view)
    if (agentId) {
      const agentDecisions = await prisma.agentLog.findMany({
        where: { type: "decision", agent: agentId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ decisions: agentDecisions });
    }

    if (!section || section === "agents") {
      // Per-agent decision stats for performance tracking
      const allDecisions = await prisma.agentLog.findMany({
        where: { type: "decision" },
        select: { agent: true, status: true },
      });
      const agentPerf: Record<string, { total: number; approved: number; rejected: number; open: number }> = {};
      for (const d of allDecisions) {
        if (!agentPerf[d.agent]) agentPerf[d.agent] = { total: 0, approved: 0, rejected: 0, open: 0 };
        agentPerf[d.agent].total++;
        if (d.status === "completed") agentPerf[d.agent].approved++;
        else if (d.status === "rejected") agentPerf[d.agent].rejected++;
        else agentPerf[d.agent].open++;
      }
      result.agents = AGENTS.map(a => ({
        ...a,
        stats: agentPerf[a.id] || { total: 0, approved: 0, rejected: 0, open: 0 },
      }));
    }

    if (!section || section === "decisions") {
      const dbDecisions = await prisma.agentLog.findMany({ where: { type: "decision" }, orderBy: { createdAt: "desc" }, take: 200 });
      result.decisions = dbDecisions;
    }

    if (!section || section === "logs") {
      const logs: LogEntry[] = [];
      const logsDir = join(process.cwd(), "agents", "logs");
      if (existsSync(logsDir)) {
        const files = readdirSync(logsDir).filter((f: string) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse().slice(0, 30);
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
      const dbStandups = await prisma.agentLog.findMany({ where: { type: "standup" }, orderBy: { createdAt: "desc" }, take: 30, select: { id: true, content: true, createdAt: true, tags: true, relatedTo: true } });
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

    // Code of Conduct
    if (!section || section === "coc") {
      const cocPath = join(process.cwd(), "agents", "CODE-OF-CONDUCT.md");
      if (existsSync(cocPath)) {
        const raw = readFileSync(cocPath, "utf-8");
        // Split into sections by ## Part headers
        const sections: { title: string; content: string }[] = [];
        const parts = raw.split(/^## (Part \d+ — .+)$/gm);
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i += 2) {
            sections.push({ title: parts[i], content: parts[i + 1]?.trim() || "" });
          }
        }
        // Also grab appendix
        const appendixMatch = raw.match(/^## (Appendix .+)$/gm);
        if (appendixMatch) {
          for (const header of appendixMatch) {
            const idx = raw.indexOf(header);
            const nextSection = raw.indexOf("\n## ", idx + 1);
            sections.push({ title: header.replace("## ", ""), content: raw.substring(idx + header.length, nextSection > 0 ? nextSection : undefined).trim() });
          }
        }
        result.coc = { sections, updatedAt: raw.match(/Last updated: (.+)/)?.[1] || "Unknown" };
      } else {
        // Fallback: read from DB (production server)
        const dbCoc = await prisma.agentLog.findFirst({ where: { type: "coc", relatedTo: "coc:latest" } });
        if (dbCoc) {
          const raw = dbCoc.content;
          const sections: { title: string; content: string }[] = [];
          const parts = raw.split(/^## (Part \d+ — .+)$/gm);
          if (parts.length > 1) {
            for (let i = 1; i < parts.length; i += 2) {
              sections.push({ title: parts[i], content: parts[i + 1]?.trim() || "" });
            }
          }
          const appendixMatch = raw.match(/^## (Appendix .+)$/gm);
          if (appendixMatch) {
            for (const header of appendixMatch) {
              const idx = raw.indexOf(header);
              const nextSection = raw.indexOf("\n## ", idx + 1);
              sections.push({ title: header.replace("## ", ""), content: raw.substring(idx + header.length, nextSection > 0 ? nextSection : undefined).trim() });
            }
          }
          result.coc = { sections, updatedAt: raw.match(/Last updated: (.+)/)?.[1] || "Unknown" };
        }
      }
    }

    // Timeline data
    if (!section || section === "timeline") {
      const allLogs = await prisma.agentLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, agent: true, type: true, title: true, status: true, priority: true, createdAt: true },
      });
      result.timeline = allLogs;
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
        agent: body.agent || "jacky",
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
    const { id, status, content, tags } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updated = await prisma.agentLog.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
