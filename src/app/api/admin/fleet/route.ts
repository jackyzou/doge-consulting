import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// GET /api/admin/fleet — list standup logs + extract pending decisions
export async function GET() {
  try {
    await requireAdmin();

    const logsDir = join(process.cwd(), "agents", "logs");
    if (!existsSync(logsDir)) {
      return NextResponse.json({ logs: [], decisions: [] });
    }

    // Read all daily log files (YYYY-MM-DD.md)
    const files = readdirSync(logsDir)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse();

    const logs = files.slice(0, 30).map((file) => {
      const content = readFileSync(join(logsDir, file), "utf-8");
      const date = file.replace(".md", "");

      // Count agents mentioned
      const agentMatches = content.match(/\*\*(Alex|Amy|Seth|Rachel|Seto|Tiffany|Jacky)\b/g);
      const agents = [...new Set((agentMatches || []).map((m) => m.replace(/\*\*/g, "")))];

      // Count decisions
      const decisionMatches = content.match(/\[DECISION\]/g);
      const decisionCount = decisionMatches ? decisionMatches.length : 0;

      // Check for CEO items
      const hasCeoItems = content.includes("NEEDS_CEO") || content.includes("Carry forward");

      // Extract summary lines (first meaningful heading + first paragraph)
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      const firstHeading = lines.find((l) => l.startsWith("## ")) || "";
      
      return {
        date,
        file,
        agents,
        decisionCount,
        hasCeoItems,
        firstHeading: firstHeading.replace(/^#+\s*/, ""),
        sizeKB: Math.round(content.length / 1024 * 10) / 10,
        content,
      };
    });

    // Extract ALL pending decisions (NEEDS_CEO + PROPOSED + carry forward)
    const decisions: { date: string; text: string; status: string; owner: string }[] = [];
    for (const log of logs) {
      const lines = log.content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        // Match [DECISION] lines
        const decMatch = trimmed.match(/\[DECISION\]\s*(.+?)\s*—\s*(NEEDS_CEO|PROPOSED)/i);
        if (decMatch) {
          decisions.push({
            date: log.date,
            text: decMatch[1].trim(),
            status: decMatch[2],
            owner: "CEO",
          });
        }
        // Match carry forward items
        if (trimmed.includes("Carry forward") || trimmed.includes("carry forward")) {
          const cleanText = trimmed.replace(/^\|?\s*\d*\s*\|?\s*/, "").replace(/\|.*$/, "").replace(/[🔴🟡🟢🔵⏸️]/g, "").trim();
          if (cleanText.length > 10 && !decisions.some((d) => d.text === cleanText)) {
            decisions.push({
              date: log.date,
              text: cleanText,
              status: "CARRY_FORWARD",
              owner: "CEO",
            });
          }
        }
      }
    }

    // Return logs without full content for the list view, include content for detail view
    return NextResponse.json({
      logs: logs.map(({ content: _content, ...rest }) => rest),
      decisions,
      logContents: Object.fromEntries(logs.map((l) => [l.date, l.content])),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
