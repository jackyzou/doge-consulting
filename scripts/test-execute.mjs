// Test: Phase 3b — Seth executes a decision (dry run)
import { executeDecision } from "../agents/lib/execute-decision.mjs";

const result = await executeDecision(
  {
    title: "Add og:image meta tags to blog posts",
    agent: "seth",
    status: "approved",
    rationale: "Improves social sharing when links are shared on Reddit/social",
    type: "code",
  },
  { dryRun: true, verbose: true }
);

console.log("\n=== RESULT ===");
console.log("Success:", result.success);
console.log("Reason:", result.reason || "executed");
console.log("Type:", result.decision?.type);
