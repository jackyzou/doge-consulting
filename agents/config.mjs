// Agent Fleet Configuration
// Used by run-fleet.mjs and individual agent scripts

export const CONFIG = {
  company: {
    name: "Doge Consulting Group Limited",
    website: "https://doge-consulting.com",
    email: "dogetech77@gmail.com",
    briefEmail: "dogetech77@gmail.com",
  },

  revenue: {
    target: 500_000,
    deadline: "2026-12-31",
    monthlyTarget: 55_000,
    currency: "USD",
  },

  agents: [
    {
      id: "alex",
      name: "Alex Chen",
      role: "Co-CEO / COO",
      profile: "agents/profiles/alex-chen.md",
      skills: ["strategy", "operations", "team-management", "business-development", "revenue-ops"],
      priority: 1,
    },
    {
      id: "amy",
      name: "Amy Lin",
      role: "CFO",
      profile: "agents/profiles/amy-lin.md",
      skills: ["accounting", "pricing", "tax", "cash-flow", "financial-reporting"],
      priority: 2,
    },
    {
      id: "seth",
      name: "Seth Parker",
      role: "CTO",
      profile: "agents/profiles/seth-parker.md",
      skills: ["nextjs", "devops", "database", "security", "seo-technical", "feature-dev"],
      priority: 2,
    },
    {
      id: "rachel",
      name: "Rachel Morales",
      role: "CMO",
      profile: "agents/profiles/rachel-morales.md",
      skills: ["seo", "social-media", "branding", "community", "conversion", "analytics"],
      priority: 2,
    },
    {
      id: "seto",
      name: "Seto Nakamura",
      role: "PRO / Editor-in-Chief",
      profile: "agents/profiles/seto-nakamura.md",
      skills: ["news-monitoring", "content-creation", "pr", "legal", "industry-analysis"],
      priority: 2,
    },
  ],

  kpis: {
    dau: { label: "Daily Active Users", target: 500, unit: "users" },
    monthlyRevenue: { label: "Monthly Revenue", target: 55_000, unit: "USD" },
    subscribers: { label: "Newsletter Subscribers", target: 5_000, unit: "subscribers" },
    quoteConversion: { label: "Quote Conversion Rate", target: 15, unit: "%" },
    searchImpressions: { label: "Google Search Impressions", target: 50_000, unit: "/month" },
    grossMargin: { label: "Gross Margin", target: 45, unit: "%" },
    blogPosts: { label: "Blog Posts Published", target: 30, unit: "/month" },
  },

  schedule: {
    morningBrief: "08:00",  // PST
    eveningSummary: "17:00", // PST
    timezone: "America/Los_Angeles",
  },

  paths: {
    logs: "agents/logs",
    profiles: "agents/profiles",
    skills: "agents/SKILLS.md",
  },
};
