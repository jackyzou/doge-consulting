# Doge Consulting — AI Agent Fleet

## Mission
Scale Doge Consulting to **$500K revenue by December 2026** through AI-powered operations, aggressive market expansion, and world-class execution across sourcing, shipping, and technology services.

## Organization Chart

```
┌───────────────────────────────────────────────────────────┐
│                 Jacky Zou — CEO & Founder                  │
│           Final decision-maker on ALL matters              │
│        All critical items escalated immediately            │
└────────────────────────┬──────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────┐
│            Alex Chen — Co-CEO / COO                        │
│      Commander-in-chief when Jacky is unavailable          │
│      20+ years scaling multi-million dollar businesses     │
└──┬────────┬────────┬────────┬────────────────────────────┘
   │        │        │        │
┌──▼───┐ ┌──▼───┐ ┌──▼────┐ ┌──▼────────┐
│ Amy  │ │ Seth │ │Rachel │ │   Seto    │
│ Lin  │ │Parker│ │Morales│ │ Nakamura  │
│ CFO  │ │ CTO  │ │  CMO  │ │PRO/Editor │
└──────┘ └──────┘ └───────┘ └───────────┘
```

## Team Roster

| Agent | Full Name | Role | Key Focus |
|-------|-----------|------|-----------|
| **jacky** | Jacky Zou | CEO & Founder | Vision, strategy, final approvals |
| **alex** | Alex Chen | Co-CEO / COO | Business scaling, goal-setting, team coordination |
| **amy** | Amy Lin | CFO | Finance, pricing, tax, accounting, expense tracking |
| **seth** | Seth Parker | CTO | Web dev, DevOps, security, feature development |
| **rachel** | Rachel Morales | CMO | Marketing, SEO, branding, community, DAU growth |
| **seto** | Seto Nakamura | PRO | News, PR, legal, daily blog content, industry analysis |

## Revenue Target

- **Goal:** $500,000 by December 31, 2026
- **Monthly run-rate needed:** ~$55K/month (10 months remaining)
- **KPIs tracked:** Revenue, DAU, conversion rate, quotes/month, newsletter subscribers

## Daily Operations

1. **Morning standup** — All agents convene, produce a daily brief
2. **Email brief → dogetech77@gmail.com** — Summary of priorities + recommended actions
3. **Decision log** — All decisions stored in database (`AgentLog` model) + `agents/logs/`
4. **Critical escalation** — Items marked `priority: critical` → immediately flagged to Jacky
5. **End-of-day summary** — Alex consolidates all reports

## Invocation

```bash
# Run the full agent fleet (all agents)
node agents/run-fleet.mjs

# Run individual agent
node agents/run-fleet.mjs --agent alex
node agents/run-fleet.mjs --agent seth
node agents/run-fleet.mjs --agent rachel

# Scheduled (add to Task Scheduler / cron for 2x daily)
# 8:00 AM PST — Morning standup
# 5:00 PM PST — End-of-day summary
```

## File Structure

```
agents/
├── README.md                 # This file
├── run-fleet.mjs             # Main invocation script
├── config.mjs                # Team roster, KPIs, email config
├── profiles/                 # Agent persona definitions
│   ├── alex-chen.md          # Co-CEO skills & responsibilities
│   ├── amy-lin.md            # CFO skills & responsibilities
│   ├── seth-parker.md        # CTO skills & responsibilities
│   ├── rachel-morales.md     # CMO skills & responsibilities
│   └── seto-nakamura.md      # PRO skills & responsibilities
├── SKILLS.md                 # Master skills matrix for deterministic behavior
├── logs/                     # Daily log files (backup, quick CLI context)
│   └── .gitkeep
└── templates/                # Meeting & report templates
    └── daily-brief.md
```
