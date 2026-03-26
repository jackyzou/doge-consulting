// agents/lib/quote-lifecycle.mjs — Automated quote lifecycle management
// Monitors pending quotes and triggers agent-powered followups:
// - Day 3: Tiffany sends first followup
// - Day 7: Tiffany sends urgency followup + escalates to Alex
// - Day 14: Alex decides — final offer or archive
//
// Also handles: new quote confirmations, quote-to-order celebrations

import { invokeAgent } from "./invoke-agent.mjs";
import { queryDb, updateDb } from "./db-helper.mjs";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const LOGS_DIR = resolve(__dirname, "../logs");

/**
 * Run the full quote lifecycle check.
 * Called by cron or run-fleet.mjs.
 */
export async function processQuoteLifecycle({ verbose = true } = {}) {
  if (verbose) {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`📋 Quote Lifecycle Automation`);
    console.log(`${"═".repeat(60)}`);
  }

  const results = {
    newQuotes: await processNewQuotes({ verbose }),
    day3Followups: await processDay3Followups({ verbose }),
    day7Escalations: await processDay7Escalations({ verbose }),
    day14Archives: await processDay14Archives({ verbose }),
  };

  const total = Object.values(results).reduce((sum, r) => sum + r.processed, 0);
  if (verbose) console.log(`\n   ✅ Quote lifecycle: ${total} actions taken`);
  return results;
}

/**
 * Process new quotes (created in last 24h, status = "draft").
 * Tiffany sends a confirmation and logs CRM notes.
 */
async function processNewQuotes({ verbose }) {
  const quotes = queryDb(`
    SELECT id, quoteNumber, customerName, customerEmail, customerPhone,
           totalAmount, currency, shippingMethod, originCity, destinationCity,
           notes, createdAt
    FROM Quote
    WHERE status = 'draft'
      AND createdAt > datetime('now', '-24 hours')
      AND id NOT IN (
        SELECT REPLACE(relatedTo, 'quote:confirmation:', '')
        FROM AgentLog WHERE type = 'action' AND title LIKE '%confirmation%'
      )
    ORDER BY createdAt ASC
  `);

  if (!quotes || quotes.length === 0) {
    if (verbose) console.log("\n   📭 No new quotes to confirm.");
    return { processed: 0 };
  }

  if (verbose) console.log(`\n   🆕 ${quotes.length} new quote(s) to confirm`);

  let processed = 0;
  for (const quote of quotes) {
    if (verbose) console.log(`      ${quote.quoteNumber}: ${quote.customerName} — $${quote.totalAmount || "TBD"}`);

    const result = await invokeAgent({
      agentId: "tiffany",
      prompt: `A new quote request just came in. Draft a warm confirmation email.

QUOTE: ${quote.quoteNumber}
CUSTOMER: ${quote.customerName} <${quote.customerEmail}>
PHONE: ${quote.customerPhone || "not provided"}
AMOUNT: $${quote.totalAmount || "pending calculation"} ${quote.currency || "USD"}
SHIPPING: ${quote.shippingMethod || "TBD"} from ${quote.originCity || "China"} to ${quote.destinationCity || "USA"}
NOTES: ${quote.notes || "none"}

Draft a professional confirmation email (2-3 paragraphs) that:
1. Thanks them for their interest
2. Confirms we received their request and are reviewing it
3. Sets expectations: they'll receive a detailed quote within 24-48 hours
4. Mentions our free tools (duty calculator, freight calculator) they can use while waiting
5. Includes your contact info for questions

Also note: per first-contact rule, @alex and Jacky should be looped in on this customer.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    // Log the confirmation
    logAgentAction("tiffany", "action", "high",
      `Quote confirmation: ${quote.quoteNumber} — ${quote.customerName}`,
      result.response,
      "tiffany,alex",
      `quote:confirmation:${quote.id}`
    );

    processed++;
  }

  return { processed };
}

/**
 * Process Day 3 followups — quotes sent 3+ days ago with no response.
 */
async function processDay3Followups({ verbose }) {
  const quotes = queryDb(`
    SELECT id, quoteNumber, customerName, customerEmail, totalAmount, currency,
           sentAt, createdAt
    FROM Quote
    WHERE status = 'sent'
      AND sentAt < datetime('now', '-3 days')
      AND sentAt > datetime('now', '-7 days')
      AND id NOT IN (
        SELECT REPLACE(relatedTo, 'quote:day3:', '')
        FROM AgentLog WHERE type = 'action' AND title LIKE '%Day 3%'
      )
    ORDER BY sentAt ASC
  `);

  if (!quotes || quotes.length === 0) {
    if (verbose) console.log("   📭 No Day 3 followups needed.");
    return { processed: 0 };
  }

  if (verbose) console.log(`\n   📅 ${quotes.length} quote(s) need Day 3 followup`);

  let processed = 0;
  for (const quote of quotes) {
    const daysSinceSent = Math.floor((Date.now() - new Date(quote.sentAt).getTime()) / 86400000);
    if (verbose) console.log(`      ${quote.quoteNumber}: ${quote.customerName} — sent ${daysSinceSent} days ago`);

    const result = await invokeAgent({
      agentId: "tiffany",
      prompt: `FOLLOWUP NEEDED — Day 3 after quote was sent.

QUOTE: ${quote.quoteNumber}
CUSTOMER: ${quote.customerName} <${quote.customerEmail}>
AMOUNT: $${quote.totalAmount || "pending"} ${quote.currency || "USD"}
SENT: ${quote.sentAt} (${daysSinceSent} days ago)

Draft a Day 3 followup email that:
1. Is warm and helpful, not pushy
2. Asks if they have any questions about the quote
3. Mentions you're available to walk through the pricing
4. Gently reminds them of the quote validity period (30 days)
5. Offers to adjust the quote if their requirements changed

Keep it 2-3 short paragraphs. Professional but personable.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    logAgentAction("tiffany", "action", "normal",
      `Day 3 followup: ${quote.quoteNumber} — ${quote.customerName}`,
      result.response,
      "tiffany",
      `quote:day3:${quote.id}`
    );

    processed++;
  }

  return { processed };
}

/**
 * Process Day 7 escalations — quotes sent 7+ days ago, still pending.
 */
async function processDay7Escalations({ verbose }) {
  const quotes = queryDb(`
    SELECT id, quoteNumber, customerName, customerEmail, totalAmount, currency,
           sentAt, createdAt
    FROM Quote
    WHERE status = 'sent'
      AND sentAt < datetime('now', '-7 days')
      AND sentAt > datetime('now', '-14 days')
      AND id NOT IN (
        SELECT REPLACE(relatedTo, 'quote:day7:', '')
        FROM AgentLog WHERE type = 'action' AND title LIKE '%Day 7%'
      )
    ORDER BY sentAt ASC
  `);

  if (!quotes || quotes.length === 0) {
    if (verbose) console.log("   📭 No Day 7 escalations needed.");
    return { processed: 0 };
  }

  if (verbose) console.log(`\n   ⚠️ ${quotes.length} quote(s) need Day 7 escalation`);

  let processed = 0;
  for (const quote of quotes) {
    const daysSinceSent = Math.floor((Date.now() - new Date(quote.sentAt).getTime()) / 86400000);
    if (verbose) console.log(`      ${quote.quoteNumber}: ${quote.customerName} — sent ${daysSinceSent} days ago`);

    // Tiffany sends urgency followup
    const tiffanyResult = await invokeAgent({
      agentId: "tiffany",
      prompt: `URGENCY FOLLOWUP — Day 7, quote going cold.

QUOTE: ${quote.quoteNumber}
CUSTOMER: ${quote.customerName} <${quote.customerEmail}>
AMOUNT: $${quote.totalAmount || "pending"} ${quote.currency || "USD"}
SENT: ${quote.sentAt} (${daysSinceSent} days ago)

Draft a Day 7 email that:
1. Creates gentle urgency — "I wanted to check in before your quote expires"
2. Offers a specific value-add: free consultation call, adjusted pricing, or bonus service
3. Asks directly: "Is this still something you're considering?"
4. Provides an easy way to say no (reduces friction)

Also escalate to @alex: this quote is aging and may need CEO intervention.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    // Alex reviews for strategic intervention
    const alexResult = await invokeAgent({
      agentId: "alex",
      prompt: `ESCALATION — Quote aging at Day 7.

QUOTE: ${quote.quoteNumber}
CUSTOMER: ${quote.customerName} <${quote.customerEmail}>
AMOUNT: $${quote.totalAmount || "pending"} ${quote.currency || "USD"}
DAYS SINCE SENT: ${daysSinceSent}

As COO, decide:
1. Should Jacky make a personal call? (per first-contact rule)
2. Should we offer a discount or incentive to close?
3. Is this prospect worth pursuing or should we archive?

Give a 2-3 sentence recommendation.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    logAgentAction("tiffany", "action", "high",
      `Day 7 escalation: ${quote.quoteNumber} — ${quote.customerName}`,
      `**Tiffany's followup:**\n${tiffanyResult.response}\n\n**Alex's recommendation:**\n${alexResult.response}`,
      "tiffany,alex",
      `quote:day7:${quote.id}`
    );

    processed++;
  }

  return { processed };
}

/**
 * Process Day 14 archives — quotes sent 14+ days ago, no response.
 */
async function processDay14Archives({ verbose }) {
  const quotes = queryDb(`
    SELECT id, quoteNumber, customerName, customerEmail, totalAmount, sentAt
    FROM Quote
    WHERE status = 'sent'
      AND sentAt < datetime('now', '-14 days')
      AND id NOT IN (
        SELECT REPLACE(relatedTo, 'quote:day14:', '')
        FROM AgentLog WHERE type = 'action' AND title LIKE '%Day 14%'
      )
    ORDER BY sentAt ASC
  `);

  if (!quotes || quotes.length === 0) {
    if (verbose) console.log("   📭 No Day 14 archives needed.");
    return { processed: 0 };
  }

  if (verbose) console.log(`\n   🔴 ${quotes.length} quote(s) at Day 14 — archiving`);

  let processed = 0;
  for (const quote of quotes) {
    if (verbose) console.log(`      ${quote.quoteNumber}: ${quote.customerName} — archiving`);

    // Tiffany sends final "closing the loop" email
    const result = await invokeAgent({
      agentId: "tiffany",
      prompt: `FINAL FOLLOWUP — Day 14, closing the loop.

QUOTE: ${quote.quoteNumber}
CUSTOMER: ${quote.customerName} <${quote.customerEmail}>

Draft a brief, graceful "closing the loop" email:
1. Thank them for considering Doge Consulting
2. Let them know their quote is being archived but can be reactivated anytime
3. Leave the door open for future business
4. No hard sell — maintain the relationship

2 short paragraphs max.`,
      threadMessages: [],
      recentDecisions: [],
      standupSummary: "",
      gitLog: "",
      mode: "plan",
    });

    logAgentAction("tiffany", "action", "normal",
      `Day 14 archive: ${quote.quoteNumber} — ${quote.customerName}`,
      result.response,
      "tiffany",
      `quote:day14:${quote.id}`
    );

    // Mark quote as expired
    updateDb(`UPDATE Quote SET status = 'expired', updatedAt = datetime('now') WHERE id = '${quote.id}'`);

    processed++;
  }

  return { processed };
}

function logAgentAction(agent, type, priority, title, content, assignedTo, relatedTo) {
  const id = `lifecycle_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  updateDb(`INSERT INTO AgentLog (id,agent,type,priority,title,content,status,assignedTo,relatedTo,createdAt,updatedAt) VALUES ('${id}','${agent}','${type}','${priority}','${title.replace(/'/g, "''")}','${content.replace(/'/g, "''")}','open','${assignedTo}','${relatedTo}',datetime('now'),datetime('now'))`);
}

// CLI entry point
if (process.argv[1]?.includes("quote-lifecycle")) {
  console.log("📋 Running quote lifecycle automation...");
  processQuoteLifecycle().then(results => {
    const total = Object.values(results).reduce((sum, r) => sum + r.processed, 0);
    console.log(`\n✅ Done. ${total} total actions.`);
  });
}
