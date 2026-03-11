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
├── config.mjs                # Team roster, KPIs, email config
├── SKILLS.md                 # Agent skills matrix & behavior rules
├── profiles/                 # Agent persona definitions
├── logs/                     # Daily logs, outreach plans, calendars
└── templates/                # Meeting & report templates
```

## Confidentiality

Agent profiles, skills definitions, operational logs, outreach strategies, and internal configurations are **local-only** and excluded from version control via `.gitignore`. These files contain business intelligence and should be treated with the same sensitivity as API keys.

If you're setting up a new development machine, these files must be copied manually from an existing environment — they are never pulled from the repo.
