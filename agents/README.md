# Doge Consulting — AI Agent Fleet

An internal AI agent team that handles daily operations, content strategy, outreach, and technical execution.

## Invocation

```bash
# Run the full fleet (all agents)
node agents/run-fleet.mjs

# Run individual agent
node agents/run-fleet.mjs --agent alex

# List agents
node agents/run-fleet.mjs --list

# Watch GitHub issues for auto-routing
node agents/watch-issues.mjs

# Bump version (patch/minor/major)
node agents/bump-version.mjs patch
```

## Scheduled Runs

Configured via Windows Task Scheduler (`setup-schedule.ps1`):
- **8:00 AM PST** — Morning standup
- **5:00 PM PST** — End-of-day summary

## File Structure

```
agents/
├── README.md                 # This file (public)
├── run-fleet.mjs             # Fleet runner script (public)
├── watch-issues.mjs          # GitHub issue watcher (public)
├── bump-version.mjs          # Version bumper (public)
├── setup-schedule.ps1        # Task Scheduler setup (public)
│
│   ⬇ LOCAL ONLY — not tracked in git ⬇
│
├── CODE-OF-CONDUCT.md        # THE operating document (consolidated from ARCHITECTURE + SKILLS)
├── config.mjs                # Team roster, KPIs, email config
├── profiles/                 # Agent persona definitions
├── logs/                     # Daily logs, outreach plans, calendars
└── templates/                # Meeting & report templates
```

## Confidentiality

The **Code of Conduct** (`CODE-OF-CONDUCT.md`) is the single operating document for the fleet. It consolidates all agent definitions, behavioral rules, decision authority, channel strategy, and operational procedures.

All confidential files (Code of Conduct, agent profiles, skills, logs, strategies, configurations) are **local-only** and excluded from version control. They contain business intelligence and must be treated with the same sensitivity as API keys.

New machine setup: copy these files manually from an existing environment.
