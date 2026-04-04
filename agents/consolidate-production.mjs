/**
 * Consolidate open decisions on PRODUCTION database via API.
 * 
 * - Fetches all open decisions from production
 * - Deduplicates by topic (keeps most recent per topic)
 * - Auto-completes stale decisions (>3 days)
 * - Cleans titles (strip ** markdown)
 * 
 * Usage: node agents/consolidate-production.mjs
 */
import "dotenv/config";

const PROD_URL = "https://doge-consulting.com";
const SYNC_SECRET = process.env.FLEET_SYNC_SECRET;

// Get admin session cookie
const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN || "";

async function apiGet(path) {
  // Try with sync secret first (used by fleet sync)
  const res = await fetch(`${PROD_URL}${path}`, {
    headers: {
      "x-sync-secret": SYNC_SECRET || "",
      Cookie: SESSION_TOKEN ? `doge_session=${SESSION_TOKEN}` : "",
    },
  });
  if (!res.ok) {
    // Try the sync endpoint which has its own auth
    if (path.includes("decisions")) {
      const syncRes = await fetch(`${PROD_URL}/api/admin/fleet/sync`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-sync-secret": SYNC_SECRET || "",
        },
        body: JSON.stringify({ action: "pull-decisions" }),
      });
      if (syncRes.ok) return syncRes.json();
    }
    throw new Error(`GET ${path}: ${res.status}`);
  }
  return res.json();
}

async function apiPatch(id, status) {
  // Use sync endpoint to update decision status
  const res = await fetch(`${PROD_URL}/api/admin/fleet/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-sync-secret": SYNC_SECRET || "",
    },
    body: JSON.stringify({ 
      action: "update-decision",
      decisionId: id,
      status: status,
    }),
  });
  if (!res.ok) {
    // Fallback to direct PATCH
    const patchRes = await fetch(`${PROD_URL}/api/admin/fleet`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: SESSION_TOKEN ? `doge_session=${SESSION_TOKEN}` : "",
        "x-sync-secret": SYNC_SECRET || "",
      },
      body: JSON.stringify({ id, status }),
    });
    return patchRes.ok;
  }
  return true;
}

async function main() {
  console.log("Fetching decisions from production...\n");
  
  // Get all decisions including open ones
  const data = await apiGet("/api/admin/fleet?section=decisions");
  const allDecisions = data.decisions || [];
  const openDecisions = allDecisions.filter(d => d.status === "open" || d.status === "proposed");
  
  console.log(`Total decisions: ${allDecisions.length}`);
  console.log(`Open decisions: ${openDecisions.length}\n`);
  
  if (openDecisions.length === 0) {
    console.log("No open decisions to consolidate.");
    return;
  }

  // Step 1: Group by topic
  const topicGroups = {};
  for (const d of openDecisions) {
    const t = (d.title || "").toLowerCase();
    let topic = "other";
    if (t.includes("cta") || t.includes("click track") || t.includes("eventtype")) topic = "cta";
    else if (t.includes("search console") || t.includes("google_site") || t.includes("verification")) topic = "gsc";
    else if (t.includes("bank wire") || t.includes("payment") || t.includes("airwallex") || t.includes("invoice")) topic = "payment";
    else if (t.includes("quote") && (t.includes("logan") || t.includes("s-power") || t.includes("lead"))) topic = "leads";
    else if (t.includes("reddit") || t.includes("linkedin") || t.includes("distribution") || t.includes("quora")) topic = "distribution";
    else if (t.includes("seed data") || t.includes("test data") || t.includes("purge")) topic = "seed";
    else if (t.includes("accessib") || t.includes("wcag") || t.includes("hotfix") || t.includes("aria")) topic = "a11y";
    else if (t.includes("subscriber") || t.includes("newsletter") || t.includes("broadcast")) topic = "newsletter";
    else if (t.includes("pricing") || t.includes("margin") || t.includes("consultation")) topic = "pricing";
    
    if (!topicGroups[topic]) topicGroups[topic] = [];
    topicGroups[topic].push(d);
  }

  // Step 2: Keep most recent per topic, close rest
  let closed = 0;
  for (const [topic, decisions] of Object.entries(topicGroups)) {
    // Sort by createdAt DESC (most recent first)
    decisions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`  ${topic}: ${decisions.length} decisions → keeping 1`);
    
    // Close all but the most recent
    for (let i = 1; i < decisions.length; i++) {
      const ok = await apiPatch(decisions[i].id, "completed");
      if (ok) closed++;
    }
  }
  console.log(`\nClosed ${closed} duplicate decisions.`);

  // Step 3: Auto-complete stale decisions (>5 days)
  const staleDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  let staleClosed = 0;
  for (const d of openDecisions) {
    if (new Date(d.createdAt) < staleDate) {
      const ok = await apiPatch(d.id, "completed");
      if (ok) staleClosed++;
    }
  }
  console.log(`Auto-completed ${staleClosed} stale decisions (>5 days).`);

  // Final count
  const finalData = await apiGet("/api/admin/fleet?section=decisions");
  const finalOpen = (finalData.decisions || []).filter(d => d.status === "open" || d.status === "proposed");
  console.log(`\nRemaining open: ${finalOpen.length}`);
}

main().catch(e => {
  console.error("Error:", e.message);
  console.log("\nIf auth fails, you may need to set ADMIN_SESSION_TOKEN in .env.local");
  console.log("Get it from the doge_session cookie after logging into the admin panel.");
});
