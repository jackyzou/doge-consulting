// agents/lib/route-message.mjs — Determines which agents should respond to a message
// Maps message content to relevant agents based on domain keywords and @mentions

const AGENT_DOMAINS = {
  alex: {
    keywords: ["strategy", "priority", "pipeline", "revenue", "business", "team", "coordinate", "standup", "decision", "approval", "escalate", "block", "milestone", "okr", "overall", "summary", "plan", "review"],
    role: "Co-CEO/COO — orchestrator, strategy, cross-team coordination",
  },
  amy: {
    keywords: ["budget", "pricing", "expense", "invoice", "payment", "airwallex", "margin", "profit", "cost", "finance", "accounting", "p&l", "revenue", "tax", "cash", "refund", "wire", "pricing", "discount", "fee"],
    role: "CFO — finance, pricing, sales operations, expenses",
  },
  seth: {
    keywords: ["code", "bug", "deploy", "build", "test", "feature", "api", "database", "prisma", "docker", "website", "site", "page", "component", "css", "javascript", "typescript", "next", "react", "seo", "sitemap", "schema", "smtp", "email", "tech", "server", "performance", "security", "git", "commit", "branch", "migration"],
    role: "CTO — engineering, features, DevOps, SEO technical, frontend design",
  },
  rachel: {
    keywords: ["marketing", "content", "seo", "reddit", "social", "channel", "blog", "traffic", "conversion", "subscriber", "newsletter", "keyword", "backlink", "analytics", "google", "search", "campaign", "brand", "growth"],
    role: "CMO — marketing, SEO strategy, content distribution, analytics",
  },
  seto: {
    keywords: ["blog", "article", "post", "write", "research", "news", "tariff", "shipping", "freight", "trade", "industry", "report", "journalism", "pr", "press", "publish", "content", "cover image", "unsplash"],
    role: "PRO/Editor — content creation, deep research, news monitoring, PR",
  },
  tiffany: {
    keywords: ["customer", "quote", "order", "onboarding", "support", "crm", "followup", "sop", "tracking", "inquiry", "shipment", "delivery", "satisfaction", "call", "message"],
    role: "CSO — customer service, quote management, onboarding, CRM",
  },
};

/**
 * Route a message to the most relevant agents.
 * 
 * @param {string} content - The message content
 * @param {string[]} explicitMentions - Agents explicitly @mentioned
 * @returns {string[]} Array of agent IDs that should respond
 */
export function routeMessage(content, explicitMentions = []) {
  // If explicit mentions, those agents MUST respond
  if (explicitMentions.length > 0) {
    return [...new Set(explicitMentions)];
  }

  // Auto-route based on content analysis
  const text = content.toLowerCase();
  const scores = {};

  for (const [agentId, domain] of Object.entries(AGENT_DOMAINS)) {
    let score = 0;
    for (const keyword of domain.keywords) {
      if (text.includes(keyword)) {
        score += 1;
      }
    }
    if (score > 0) {
      scores[agentId] = score;
    }
  }

  // Sort by relevance score, take top 2 agents (or 1 if clear winner)
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length === 0) {
    // No domain match — route to Alex (COO handles general)
    return ["alex"];
  }

  if (sorted.length === 1 || sorted[0][1] > sorted[1][1] * 2) {
    // Clear winner — just that agent
    return [sorted[0][0]];
  }

  // Top 2 agents when relevance is close
  return sorted.slice(0, 2).map(([id]) => id);
}

/**
 * Parse @mentions from message content.
 * Returns array of agent IDs mentioned.
 */
export function parseMentions(content) {
  const regex = /@(alex|amy|seth|rachel|seto|tiffany)\b/gi;
  const matches = [...content.matchAll(regex)];
  return [...new Set(matches.map(m => m[1].toLowerCase()))];
}

/**
 * Determine if Alex should synthesize (3+ agents involved).
 */
export function shouldAlexSynthesize(respondingAgents) {
  return respondingAgents.length >= 3 && !respondingAgents.includes("alex");
}

/**
 * Check if the conversation has reached max depth.
 */
export function isMaxDepth(threadMessages, maxRounds = 5) {
  // Count rounds of inter-agent conversation (exclude user messages)
  const agentMessages = threadMessages.filter(m => m.sender !== "jacky" && m.sender !== "system");
  return agentMessages.length >= maxRounds * 2; // ~2 messages per round
}
