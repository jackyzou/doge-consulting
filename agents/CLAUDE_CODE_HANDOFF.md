# Claude Code ↔ VS Code Copilot CLI — Coordination & System Guide

**Last updated:** March 25, 2026 (Session 6 — all 5 phases complete)
**Updated by:** Claude Code CLI (Opus 4.6)
**Branch:** `feature/agent-chat-v2`
**Project:** Doge Consulting (`C:\Users\jiaqizou\doge-consulting`)

---

## Purpose

Two AI development tools work on this codebase simultaneously:
1. **VS Code GitHub Copilot Chat** — CEO's primary tool for feature development, bug fixes, UI work
2. **Claude Code CLI** — Powers each agent's independent thinking, execution, and automation

This document keeps both tools in sync and serves as the complete system reference.

---

## System Status

```
Status:  ALL 5 PHASES COMPLETE — full autonomous agent system operational
Branch:  feature/agent-chat-v2
Model:   Claude Code Opus 4.6 (1M context)
Tested:  3 live standup runs, 5/5 agents producing LLM reports
Build:   Clean (all modules load, Next.js build passes)
```

---

## Agent Team

| ID | Name | Role | Standup Mode | Execute Mode |
|----|------|------|-------------|-------------|
| alex | Alex Chen | Co-CEO/COO | Synthesizes all reports, approves decisions | — (read-only) |
| amy | Amy Lin | CFO | Finance, pricing, outreach | — (read-only) |
| seth | Seth Parker | CTO | Site health, tech priorities | Code changes, deployments (bypassPermissions, 10 turns) |
| rachel | Rachel Morales | CMO | SEO, channels, content strategy | — (read-only) |
| seto | Seto Nakamura | PRO/Editor | Blog content, research, news | Blog seeding/publishing (bypassPermissions, 5 turns) |
| tiffany | Tiffany Wang | CSO | CRM, quotes, customer followup | — (read-only) |
| jacky | Jacky Zou | CEO | Final decision-maker | N/A |

---

## CLI Reference

### Standup (daily operations)

```bash
node agents/run-fleet.mjs                      # Full standup (all 7 phases)
node agents/run-fleet.mjs --agent seth         # Single agent report
node agents/run-fleet.mjs --mode evening       # Evening summary
node agents/run-fleet.mjs --no-execute         # Skip autonomous execution (Phase 3b)
node agents/run-fleet.mjs --list               # List all agents
```

### Workstreams (alternative to standup)

```bash
node agents/run-fleet.mjs --workstream content  # Content pipeline (Seto+Rachel+Seth)
node agents/run-fleet.mjs --workstream sales    # Sales pipeline (Amy+Tiffany+Alex)
node agents/run-fleet.mjs --workstream tech     # Tech operations (Seth solo)
node agents/run-fleet.mjs --workstreams         # All 3 in parallel
```

### Individual tools

```bash
node agents/lib/contact-triage.mjs              # Triage new contact form submissions
node agents/lib/quote-lifecycle.mjs             # Run Day 3/7/14 quote followups
node agents/lib/health-check.mjs                # Site health check (production)
node agents/lib/health-check.mjs --local        # Site health check (localhost)
node agents/lib/memory-manager.mjs              # All memory tasks
node agents/lib/memory-manager.mjs compact      # Just compaction
node agents/lib/memory-manager.mjs learn        # Just CEO feedback learning
node agents/lib/memory-manager.mjs performance  # Just performance tracking
node agents/lib/workstreams.mjs content         # Run one workstream standalone
node agents/lib/workstreams.mjs all             # All workstreams standalone
node agents/lib/agent-chain.mjs jacky "@seth @rachel What should we prioritize?"
node agents/lib/execute-decision.mjs "implement og:image meta tags" code
node agents/lib/execute-decision.mjs "publish alibaba guide" blog --dry-run
node agents/lib/process-chat.mjs                # Process pending chat messages
```

---

## Standup Flow (what happens when you run `run-fleet.mjs`)

```
Phase 1    Setup
           Load config, DB stats, yesterday's log, CEO directives

Phase 1b   Chat processing
           Find pending CEO messages in ChatThread/ChatMessage tables
           Spawn agent LLM sessions to respond (parallel)
           Parse @mentions, [DECISION] tags, [MEMORY] notes

Phase 1c   Production triggers
           • Contact triage — polls ContactInquiry for status='new'
             → Routes to Tiffany (always) + Alex (first-contact) + domain experts
             → Parallel agent sessions: draft response, classify, set priority
           • Quote lifecycle — checks aging quotes:
             Day 3:  Tiffany warm followup ("any questions?")
             Day 7:  Tiffany urgency email + Alex escalation
             Day 14: Tiffany close-the-loop email, archive as expired
           • Health check (morning only) — build, uptime, 12 pages, APIs, DB integrity
             Critical failures auto-escalate to Seth via LLM

Phase 2    Round 1 — Agent reports (parallel LLM)
           Amy, Seth, Rachel, Seto, Tiffany spawn 5 parallel Opus 4.6 sessions
           Each gets: project state + commits + DB stats + CEO feedback + memory
           Must produce: Report, Decisions (min 1), Requests, Status
           Template fallback per-agent if LLM fails

Phase 2b   Decision thread replies (per-owner LLM)
           Each in-progress ticket owner spawns a session for [REPLY] update
           Format: what DONE, what NEXT, what BLOCKING

Phase 3    Round 2 — Alex synthesis (LLM)
           Receives all Round 1 reports + ticket updates + project context
           Produces: Business Assessment, Top 3, Decisions table (APPROVED/REJECTED/
           MODIFIED/NEEDS_CEO), CEO Items, KPIs, Action Items with deadlines

Phase 3b   Autonomous execution
           Parses Alex's decisions table for APPROVED/MODIFIED items
           Classifies each as: code → Seth, blog → Seto, other → skip
           Guard rails:
             • Feature branch only (refuses on master/main)
             • Clean working tree required
             • Build verification after code changes
             • Auto-revert on build failure
             • All execution logged to agents/logs/

Phase 4    Active TODOs from CEO (from sync-fleet pull data)

Phase 5    CEO Brief — KPIs, decisions table, action items, cross-team requests

Phase 6    Log everything
           Write full transcript to agents/logs/YYYY-MM-DD.md
           Write decisions to AgentLog table in local DB

Phase 7    Memory management
           • Compaction: if agent memory >30 entries, LLM summarizes old ones
           • CEO feedback learning: extract approval/rejection patterns → agent memory
           • Performance tracking: per-agent acceptance rate, velocity → performance.json
```

---

## Workstreams (alternative operating mode)

Instead of the sequential standup, workstreams group agents by function:

| Workstream | Agents | Lead | Goal |
|------------|--------|------|------|
| **Content** | Seto + Rachel + Seth | Seto | Research → write → SEO optimize → publish → verify |
| **Sales** | Amy + Tiffany + Alex | Alex | Leads → outreach → quote → close |
| **Tech** | Seth (solo) | Seth | Bugs, features, deployments, health |

Each workstream: agents run in parallel → lead synthesizes → cross-workstream @mentions auto-chain.

---

## Agent-to-Agent Chains

When agent A @mentions agent B in any response (standup, chat, workstream):
1. Agent B's Claude session auto-spawns with the conversation context
2. B responds and may @mention agent C → C spawns
3. Chains recurse up to 5 rounds deep
4. Alex auto-synthesizes when 3+ agents are involved
5. Source agent excluded from re-mention to prevent ping-pong

---

## Memory System

### Per-agent memory (`agents/memory/{agent}.md`)
- Append-only entries from [MEMORY] tags in LLM responses
- Compacted when >30 entries (LLM summarizes old, keeps last 10 verbatim)
- Injected into agent context for every invocation

### Cross-agent sharing
| Agent | Can read memories of |
|-------|---------------------|
| Alex | Everyone (COO reads all) |
| Amy | Tiffany, Alex |
| Seth | Rachel, Seto |
| Rachel | Seto, Seth |
| Seto | Rachel, Seth |
| Tiffany | Amy, Alex |

### CEO feedback learning
- Scans AgentLog for approved/rejected/modified decisions (last 7 days)
- Writes learned patterns to agent memory ("CEO rejected X because Y")
- Tracks per-agent acceptance rate

### Performance tracking (`agents/logs/performance.json`)
- Proposal acceptance rate (who proposes well vs. who gets rejected)
- Execution velocity (avg days to close tickets)
- Cross-team collaboration (how often @mentioned by others)
- 90-day rolling history

---

## File Inventory (12 modules)

```
agents/lib/
├── invoke-agent.mjs       # Core: spawn Claude CLI per agent (plan/execute modes)
├── build-context.mjs       # Context: profile + CoC + memory + cross-agent memory
├── route-message.mjs       # Route: domain keywords → agent selection
├── process-chat.mjs        # Chat: thread processing with LLM
├── execute-decision.mjs    # Execute: Seth code / Seto blog with guard rails
├── contact-triage.mjs      # Trigger: auto-triage contact form → agents
├── quote-lifecycle.mjs     # Trigger: Day 3/7/14 quote followup automation
├── health-check.mjs        # Monitor: build + uptime + pages + DB integrity
├── memory-manager.mjs      # Memory: compaction + learning + performance tracking
├── workstreams.mjs          # Orchestrate: parallel content/sales/tech streams
├── agent-chain.mjs          # Chain: auto-spawn on @mention, 5-round depth
└── db-helper.mjs            # Shared: Node version auto-detection + DB access
```

---

## Coordination Rules (Claude Code ↔ VS Code)

### File Ownership

| Zone | Owner | Other CLI |
|------|-------|-----------|
| `agents/lib/*.mjs` | Claude Code | Read-only |
| `agents/profiles/*.md` | Claude Code | Read-only |
| `agents/memory/*.md` | Claude Code | Read-only |
| `agents/run-fleet.mjs` | Claude Code | Read-only |
| `src/app/admin/chat/` | VS Code Copilot | Read-only |
| `src/app/api/admin/fleet/chat/` | **Shared** | Both can edit, pull first |
| `src/app/**` (other pages) | VS Code Copilot | Read-only |
| `prisma/schema.prisma` | **Shared** | Both can edit, pull first |

### Branch Protocol
- Both CLIs work on `feature/agent-chat-v2`
- Always `git pull` before changes, always `git add + commit + push` after
- Small focused commits with descriptive messages

### Communication
- This file is the primary communication channel
- VS Code updates "VS Code Status" section after each session
- Claude Code updates "Claude Code Status" section after each session

---

## Development Status

### Completed (5 phases)

| Phase | What | Status |
|-------|------|--------|
| 1. Foundation | All 6 agents think via Opus 4.6 in standups + chat | Done + tested (3 live runs) |
| 2. Autonomous Execution | Seth executes code, Seto publishes blogs, guard rails | Done, Phase 3b parsing fixed |
| 3. Production Triggers | Contact triage, quote lifecycle, site health monitoring | Done, wired into Phase 1c |
| 4. Memory & Learning | Compaction, cross-agent sharing, CEO feedback, performance | Done, wired into Phase 7 |
| 5. Multi-Agent Orchestration | Parallel workstreams, agent-to-agent chains | Done, workstream CLI mode added |

### Live test results (3 standup runs)
- 5/5 agents produce real LLM reports (after fixing Seth's permission mode)
- Alex synthesizes 13-16 decisions per standup with real judgment
- Agents hold each other accountable (Amy flags overdue items, Tiffany corrects misconceptions)
- Template fallback works cleanly when any single agent fails

### Bugs fixed during testing
1. `CLAUDECODE` env var blocked nested sessions → unset in child process env
2. `--permission-mode full` invalid → use `bypassPermissions`
3. `shell: true` deprecation warning → removed
4. Node v22/v24 mismatch for better-sqlite3 → auto-detecting `db-helper.mjs`
5. Phase 3b not parsing Alex's approved decisions → `parseAlexDecisions()` added

### What hasn't been live-tested yet
1. **Phase 3b execution** — Seth implementing an approved decision and committing code
2. **Workstreams** — `--workstream content/sales/tech` mode
3. **Agent chains** — @mention auto-spawning in a live standup
4. **Quote lifecycle** — no real aging quotes to trigger Day 3/7/14
5. **Contact triage** — no new contact form submissions
6. **Memory compaction** — no agent has hit 30 entries yet

### Recommended next steps
1. **Test Phase 3b** — let Seth implement an approved decision end-to-end
2. **Test workstreams** — run `--workstream content` to see collaborative output
3. **Set up cron** — wire `setup-schedule.ps1` for 8AM/5PM standups + hourly triggers
4. **Merge to master** — ~30 commits of agent infrastructure, ready after testing
5. **First real customer test** — submit contact form on live site, watch triage respond

---

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (Turbopack) |
| Language | TypeScript |
| Database | SQLite via Prisma 7 + better-sqlite3 adapter |
| Agent Model | Claude Code Opus 4.6 (1M context) |
| Auth | JWT in `doge_session` cookie |
| Payments | Airwallex (live, verified) |
| Email | Gmail SMTP via nodemailer (7 branded templates, 5 languages) |
| CSS | Tailwind v4 + shadcn/ui |
| Testing | Vitest (201 unit tests) + Playwright (E2E) |
| Deploy | Docker Compose + Cloudflare Tunnel, zero-downtime blue-green |

---

## Key Config Files (all gitignored/confidential)

| File | Purpose |
|------|---------|
| `agents/CODE-OF-CONDUCT.md` | Single source of truth for agent behavior (~700 lines) |
| `agents/config.mjs` | Team roster, KPIs, schedule, email config |
| `agents/profiles/*.md` | Individual agent personas (system prompts) |
| `agents/memory/*.md` | Persistent agent memory (append-only, compacted) |
| `agents/logs/*.md` | Daily standup logs, execution logs, triage logs |
| `agents/logs/performance.json` | 90-day agent performance metrics |
| `.env.local` | Secrets: JWT, SMTP, Airwallex, Google OAuth, Fleet sync |

---

## Quick Test Commands

```bash
# Verify all modules load
node -e "Promise.all([
  import('./agents/lib/invoke-agent.mjs'),
  import('./agents/lib/build-context.mjs'),
  import('./agents/lib/execute-decision.mjs'),
  import('./agents/lib/contact-triage.mjs'),
  import('./agents/lib/quote-lifecycle.mjs'),
  import('./agents/lib/health-check.mjs'),
  import('./agents/lib/memory-manager.mjs'),
  import('./agents/lib/workstreams.mjs'),
  import('./agents/lib/agent-chain.mjs'),
  import('./agents/lib/db-helper.mjs'),
]).then(() => console.log('All modules OK'))"

# Test single agent invocation
node -e "import('./agents/lib/invoke-agent.mjs').then(async m => {
  const r = await m.invokeAgent({ agentId: 'alex', prompt: 'What are our top 3 priorities?' });
  console.log(r.response);
})"

# Verify build
npx next build

# Run full standup
node agents/run-fleet.mjs

# Run workstream
node agents/run-fleet.mjs --workstream content
```
