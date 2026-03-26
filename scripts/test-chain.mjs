// Test: agent chains — Rachel @mentions Seth and Seto
import { chainAgentMentions } from "../agents/lib/agent-chain.mjs";

console.log("=== Testing Agent Chain ===");
const results = await chainAgentMentions(
  ["seth", "seto"],
  "Rachel: We need to verify our blog post cover images aren't broken and the sitemap includes all 26 posts.",
  { maxDepth: 1, verbose: true, sourceAgent: "rachel", currentDepth: 0 }
);

console.log("\n=== CHAIN RESULT ===");
console.log("Responses:", results.length);
results.forEach((r, i) => {
  console.log(`  ${i + 1}. [${r.agentId || "unknown"}] ${(r.response || r.value?.response || "no response").substring(0, 100)}...`);
});
