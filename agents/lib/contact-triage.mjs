// agents/lib/contact-triage.mjs — Auto-triage new contact form submissions
// When a customer submits the contact form, this module:
// 1. Detects new ContactInquiry records (status = "new")
// 2. Routes to agents based on content (Tiffany always, Alex for first-contact, Amy for pricing)
// 3. Spawns agent sessions to draft responses and log actions
// 4. Marks the inquiry as "contacted" after processing

import { invokeAgent } from "./invoke-agent.mjs";
import { queryDb, updateDb } from "./db-helper.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const LOGS_DIR = resolve(__dirname, "../logs");

/**
 * Check for new contact inquiries and triage to agents.
 */
export async function triageNewContacts({ verbose = true } = {}) {
  // Query new inquiries via system Node (avoids better-sqlite3 version mismatch)
  const newInquiries = queryDb(`
    SELECT id, name, email, phone, countryCode, subject, message, source, createdAt
    FROM ContactInquiry
    WHERE status = 'new'
    ORDER BY createdAt ASC
    LIMIT 10
  `);

  if (!newInquiries || newInquiries.length === 0) {
    if (verbose) console.log("📭 No new contact inquiries to triage.");
    return { processed: 0 };
  }

  if (verbose) {
    console.log(`\n📨 ${newInquiries.length} new contact inquiry(ies) detected`);
    console.log(`${"─".repeat(50)}`);
  }

  let processed = 0;

  for (const inquiry of newInquiries) {
    if (verbose) {
      console.log(`\n   📩 From: ${inquiry.name} <${inquiry.email}>`);
      console.log(`      Subject: ${inquiry.subject}`);
      console.log(`      Message: ${inquiry.message?.substring(0, 100)}...`);
    }

    // Determine which agents should respond
    const agents = routeInquiry(inquiry);
    if (verbose) console.log(`      Routing to: ${agents.join(", ")}`);

    // Spawn agent sessions in parallel
    const results = await Promise.allSettled(
      agents.map(agentId => triageWithAgent(agentId, inquiry))
    );

    // Log results
    const responses = [];
    for (let i = 0; i < agents.length; i++) {
      const agentId = agents[i];
      const result = results[i];
      if (result.status === "fulfilled") {
        responses.push({ agent: agentId, response: result.value.response });
        if (verbose) console.log(`      ✅ ${agentId}: ${result.value.response.substring(0, 120)}...`);
      } else {
        if (verbose) console.log(`      ❌ ${agentId}: ${result.reason?.message}`);
      }
    }

    // Store triage result as AgentLog
    storeTriageResult(inquiry, responses);

    // Mark inquiry as contacted
    updateDb(`UPDATE ContactInquiry SET status = 'contacted', updatedAt = datetime('now') WHERE id = '${inquiry.id}'`);

    // Log to daily log
    logTriage(inquiry, responses);
    processed++;
  }

  if (verbose) console.log(`\n   ✅ Triaged ${processed} inquiry(ies)`);
  return { processed };
}

/**
 * Route an inquiry to the appropriate agents.
 * Tiffany always responds (CSO). Others based on content.
 */
function routeInquiry(inquiry) {
  const agents = ["tiffany"]; // CSO always handles customer inquiries
  const text = `${inquiry.subject} ${inquiry.message}`.toLowerCase();

  // Alex: first-contact rule (all new customers)
  agents.push("alex");

  // Amy: pricing, cost, payment questions
  if (text.match(/pric|cost|rate|fee|quote|payment|budget|margin|tariff|duty/)) {
    agents.push("amy");
  }

  // Seth: technical questions about the site/tools
  if (text.match(/website|tool|calculator|track|api|bug|error|broken/)) {
    agents.push("seth");
  }

  // Rachel: marketing, partnership inquiries
  if (text.match(/partner|sponsor|advertis|collaborat|media|press|interview/)) {
    agents.push("rachel");
  }

  return [...new Set(agents)];
}

/**
 * Invoke an agent to triage a contact inquiry.
 */
async function triageWithAgent(agentId, inquiry) {
  const prompt = `NEW CUSTOMER INQUIRY — requires immediate attention.

FROM: ${inquiry.name} <${inquiry.email}>
PHONE: ${inquiry.phone || "not provided"} (${inquiry.countryCode || "unknown"})
SUBJECT: ${inquiry.subject}
SOURCE: ${inquiry.source || "contact_form"}
RECEIVED: ${inquiry.createdAt}

MESSAGE:
${inquiry.message}

---

${agentId === "tiffany" ? `YOUR TASK (as CSO):
1. Draft a professional response email to this customer (warm, specific to their inquiry)
2. Classify the inquiry: quote request, general question, partnership, complaint, or spam
3. Identify what information we need from them to proceed
4. Flag if this needs urgent CEO attention (per first-contact rule: Alex and Jacky must be in the loop)
5. Log any CRM notes

RESPONSE FORMAT:
**Classification:** <type>
**Priority:** <low|normal|high|critical>
**Draft Response:** <the email text you'd send>
**Next Steps:** <what we need to do>
**CRM Notes:** <notes for the file>`

: agentId === "alex" ? `YOUR TASK (as COO):
1. Assess this inquiry from a business development perspective
2. Is this a potential customer? Partnership? What's the revenue opportunity?
3. Per first-contact rule: should Jacky be looped in directly?
4. Set priority and assign follow-up owner

Keep it to 3-5 sentences.`

: agentId === "amy" ? `YOUR TASK (as CFO):
This inquiry may involve pricing/financial questions. Review and advise:
1. What pricing model applies? (free consulting + embedded margins)
2. Any financial considerations or risks?
3. Recommended quote structure if applicable

Keep it to 3-5 sentences.`

: `Review this inquiry from your domain perspective. 2-3 sentences max.`}`;

  return invokeAgent({
    agentId,
    prompt,
    threadMessages: [],
    recentDecisions: [],
    standupSummary: "",
    gitLog: "",
    mode: "plan",
  });
}

/**
 * Store triage result in the AgentLog table.
 */
function storeTriageResult(inquiry, responses) {
  const content = responses.map(r =>
    `**${r.agent}:** ${r.response.substring(0, 500)}`
  ).join("\n\n---\n\n");

  const id = `triage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  updateDb(`
    INSERT INTO AgentLog (id, agent, type, priority, title, content, status, assignedTo, relatedTo, createdAt, updatedAt)
    VALUES ('${id}', 'tiffany', 'action', 'high',
      'Contact triage: ${inquiry.name.replace(/'/g, "''")} — ${inquiry.subject?.replace(/'/g, "''")?.substring(0, 50)}',
      '${content.replace(/'/g, "''")}',
      'open', 'tiffany,alex',
      'contact:${inquiry.id}',
      datetime('now'), datetime('now'))
  `);
}

/**
 * Log triage to the daily log file.
 */
function logTriage(inquiry, responses) {
  const today = new Date().toISOString().split("T")[0];
  const logFile = resolve(LOGS_DIR, `${today}.md`);
  const timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  const entry = `
## Contact Triage — ${timestamp}

**From:** ${inquiry.name} <${inquiry.email}>
**Subject:** ${inquiry.subject}
**Agents:** ${responses.map(r => r.agent).join(", ")}

${responses.map(r => `### ${r.agent}\n${r.response.substring(0, 500)}`).join("\n\n")}

---
`;

  const existing = existsSync(logFile) ? readFileSync(logFile, "utf8") : "";
  writeFileSync(logFile, existing + entry, "utf8");
}

// CLI entry point
if (process.argv[1]?.includes("contact-triage")) {
  console.log("📨 Running contact triage...");
  triageNewContacts().then(({ processed }) => {
    console.log(`✅ Done. Processed ${processed} inquiries.`);
  });
}
