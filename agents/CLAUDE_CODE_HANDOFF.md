# Claude Code ↔ VS Code Copilot CLI — Coordination Protocol

**Last updated:** March 25, 2026
**Updated by:** VS Code Copilot CLI (GitHub Copilot)
**Branch:** `feature/agent-chat-v2`
**Project:** Doge Consulting (`c:\Users\jiaqizou\doge-consulting`)

---

## Purpose

Two AI development tools work on this codebase simultaneously:
1. **VS Code GitHub Copilot Chat** (this session) — used by the CEO directly for feature development, bug fixes, standup management
2. **Claude Code CLI** — planned to power each agent's independent thinking/execution during standups and chat responses

This document keeps both tools in sync to prevent conflicts, lost work, or duplicate effort.

---

## Current State (March 25, 2026)

### Git
- **Active branch:** `feature/agent-chat-v2` (4 commits ahead of master)
- **Master:** `f0a54c0` — production-deployed, v1.5.0
- **Feature branch HEAD:** `0d3bbff`
- **Feature branch commits:**
  1. `b2dfe68` — Thread-based chat data model, API, intelligence engine, UI
  2. `5994453` — Auth fix for agent respond endpoint
  3. `de7299a` — Standalone `/admin/chat` page, trigger endpoint, scroll fix
  4. `0d3bbff` — Chat scroll fix, blog preview, SEO content audit tab

### What's New on This Branch (vs master)
| Area | Files | Summary |
|------|-------|---------|
| **Data model** | `prisma/schema.prisma` | New `ChatThread` + `ChatMessage` models |
| **Chat API** | `src/app/api/admin/fleet/chat/route.ts` | Thread-based GET/POST/PATCH |
| **Agent respond** | `src/app/api/admin/fleet/chat/respond/route.ts` | POST endpoint for agent replies |
| **Agent trigger** | `src/app/api/admin/fleet/chat/trigger/route.ts` | Triggers agent responses with template fallback |
| **Chat UI** | `src/app/admin/chat/page.tsx` | Full standalone chat page with threads |
| **Fleet page** | `src/app/admin/fleet/page.tsx` | Chat tab removed (now at /admin/chat) |
| **Blog preview** | `src/app/blog/[slug]/page.tsx` | `?preview=1` shows unpublished drafts |
| **SEO page** | `src/app/admin/seo-monitor/page.tsx` | Content Audit merged as 5th tab |
| **Admin nav** | `src/app/admin/layout.tsx` | "Agent Chat" added, SEO entries combined |

### Agent Intelligence Engine (agents/lib/)
These files are the core of the agent chat system:
- `agents/lib/invoke-agent.mjs` — Invokes Claude CLI with full context per agent. Parses @mentions, [DECISION] tags, [MEMORY] notes from responses.
- `agents/lib/build-context.mjs` — Assembles context: agent profile + CoC excerpts + thread history + decisions + standup + git log + memory
- `agents/lib/route-message.mjs` — Routes messages to agents by domain keywords or @mentions
- `agents/lib/process-chat.mjs` — Processes pending threads, chains responses, creates decision tickets

### Database Tables
Production DB (`data/production.db`) has these tables relevant to agents:
- `AgentLog` — standups, decisions, chat (legacy), CoC (101 rows)
- `ChatThread` — new thread-based conversations
- `ChatMessage` — messages within threads
- `BlogPost` — 26 published (24 on live site, 2 pending deploy)

---

## Agent Architecture

### Team (6 agents + CEO)
| ID | Name | Role | Profile | Domain |
|----|------|------|---------|--------|
| alex | Alex Chen | Co-CEO/COO | `agents/profiles/alex-chen.md` | Strategy, coordination, decisions |
| amy | Amy Lin | CFO | `agents/profiles/amy-lin.md` | Finance, pricing, sales ops |
| seth | Seth Parker | CTO | `agents/profiles/seth-parker.md` | Engineering, DevOps, SEO tech |
| rachel | Rachel Morales | CMO | `agents/profiles/rachel-morales.md` | Marketing, SEO strategy, Reddit |
| seto | Seto Nakamura | PRO/Editor | `agents/profiles/seto-nakamura.md` | Content, blog, PR, research |
| tiffany | Tiffany Wang | CSO | `agents/profiles/tiffany-wang.md` | Customer service, CRM, quotes |
| jacky | Jacky Zou | CEO | N/A | Final decision-maker |

### Operating Document
- `agents/CODE-OF-CONDUCT.md` — The single source of truth for agent behavior. ~1000 lines. Sections: Philosophy, Organization, Agent Definitions, Standup Execution, Collaboration Rules, Security, Technical Implementation.
- **CONFIDENTIAL** — gitignored, never committed to git.

### Standup System
- `agents/run-fleet.mjs` — Main standup runner. Loads context, processes chats, generates agent reports, writes logs.
- `agents/sync-fleet.mjs` — Bidirectional sync between local and production server.
- `scripts/sync-fleet-local.mjs` — Direct local DB sync (reads markdown logs → writes to AgentLog table).
- Logs written to `agents/logs/YYYY-MM-DD.md` (gitignored, local only).

### Key Config Files (all gitignored/confidential)
- `agents/config.mjs` — Team roster, KPIs, schedule
- `agents/profiles/*.md` — Individual agent personas
- `agents/CODE-OF-CONDUCT.md` — Operating rules
- `.env.local` — All secrets (JWT, SMTP, Airwallex, Google OAuth, Fleet sync)

---

## Coordination Rules

### 1. Branch Protocol
- **Both CLIs work on the same branch** (`feature/agent-chat-v2` currently)
- Before making changes, **always `git pull`** to get the latest
- After making changes, **always `git add + commit + push`** immediately
- Use descriptive commit messages so the other CLI can understand what changed

### 2. File Ownership
To avoid conflicts, respect these ownership zones:

| Zone | Owner | Other CLI |
|------|-------|-----------|
| `agents/lib/*.mjs` | Claude Code (agent runtime) | Read-only, suggest changes |
| `agents/profiles/*.md` | Claude Code (agent management) | Read-only |
| `agents/memory/*.md` | Claude Code (agent memory updates) | Read-only |
| `agents/run-fleet.mjs` | Claude Code (standup orchestration) | Read-only |
| `src/app/admin/chat/` | VS Code Copilot (UI) | Read-only |
| `src/app/api/admin/fleet/chat/` | Shared — coordinate | Both can edit, pull first |
| `src/app/**` (other pages) | VS Code Copilot (frontend) | Read-only |
| `prisma/schema.prisma` | Shared — coordinate | Both can edit, pull first |

### 3. Conflict Prevention
- **Never edit the same file simultaneously** — check git status first
- If you need to edit a shared file, commit your changes quickly and push
- Use small, focused commits — not monolithic ones
- If conflict detected: the CLI that detects it should `git stash`, `git pull`, then `git stash pop` and resolve

### 4. Communication Protocol
- **This file (`CLAUDE_CODE_HANDOFF.md`)** is the primary communication channel
- VS Code Copilot updates the "Current State" section after each work session
- Claude Code updates the "Claude Code Status" section after each standup run
- Both CLIs should read this file at the start of every session

### 5. Testing
- After any change, run `npx next build` to verify compilation
- If build breaks, fix it before committing
- Never push broken code

---

## What Claude Code Should Do

### Immediate Tasks
1. **Read this document** to understand the current state
2. **Read `agents/CODE-OF-CONDUCT.md`** — the operating rules for all agents
3. **Read `agents/lib/invoke-agent.mjs`** — understand the invocation architecture
4. **Read `agents/lib/process-chat.mjs`** — understand chat processing flow
5. **Read the latest standup log** (`agents/logs/2026-03-25.md`)

### Your Role: Agent Runtime
Claude Code powers each agent's independent thinking during:
1. **Chat responses** — When CEO sends a message in `/admin/chat`, the trigger endpoint calls agent logic. Currently using template responses. Claude Code should implement real LLM-powered responses via `agents/lib/invoke-agent.mjs`.
2. **Standup execution** — `run-fleet.mjs` runs morning/evening standups. Each agent should use Claude Code to generate intelligent reports.
3. **Task execution** — When a standup approves a technical decision, Seth (CTO agent) should use Claude Code to actually make code changes.

### Architecture for Parallel Agent Execution
Each agent invocation should:
1. Load its profile (`agents/profiles/{agent}.md`)
2. Load relevant CoC sections
3. Load thread history / standup context
4. Load its persistent memory (`agents/memory/{agent}.md`)
5. Generate a response using the Claude CLI
6. Parse @mentions, [DECISION] tags, [MEMORY] updates
7. Store the response in the ChatMessage table
8. Update agent memory file

---

## Claude Code Status

_This section is updated by Claude Code after each session._

```
Last run: March 25, 2026 — initial setup + Opus 4.6 integration
Status: OPERATIONAL — all agent lib modules upgraded
Branch: feature/agent-chat-v2
```

### What Claude Code Did (March 25, 2026)

**Files modified (Claude Code ownership zone — safe, no conflicts):**

1. **`agents/lib/invoke-agent.mjs`** — Upgraded agent invocation engine:
   - All agents now use `--model claude-opus-4-6` (1M context, most capable model)
   - Seth (CTO) gets `--permission-mode full` + 5 max turns (can edit code, run builds)
   - All other agents get `--permission-mode plan` + 3 max turns (read-only analysis)
   - Timeout increased from 5min → 10min (Opus needs room for deep reasoning)
   - System prompt enhanced with capability awareness per agent role
   - Each agent spawn is a fully independent Claude Code CLI session

2. **`agents/lib/build-context.mjs`** — Fixed bug in `updateMemory()`:
   - Was using `await import("fs")` in non-async context — replaced with proper static import
   - Added `mkdirSync` to auto-create memory directory if missing
   - Agent names now used in memory file headers instead of raw IDs

3. **`agents/run-fleet.mjs`** — Wired LLM-powered chat responses:
   - Phase 1b now attempts real Claude Code Opus 4.6 invocation for each agent
   - Multiple agents spawn **in parallel** via `Promise.allSettled()` — true concurrent thinking
   - Graceful fallback: if LLM engine fails to load, falls back to template responses
   - Per-agent fallback: if one agent's LLM call fails, only that agent uses templates
   - Agent memory updates are persisted after each LLM response
   - Console output clearly shows `🧠 (LLM)` vs `📝 (template)` for each reply

4. **`agents/memory/*.md`** — Created persistent memory files for all 6 agents:
   - alex.md, amy.md, seth.md, rachel.md, seto.md, tiffany.md
   - Seeded with current state from March 25 standup (revenue, blog count, blockers)
   - These are append-only — each agent's LLM session adds [MEMORY] entries automatically

**Files NOT touched (VS Code ownership — no conflicts):**
- `src/app/**` — all frontend pages untouched
- `src/app/api/**` — all API routes untouched
- `prisma/schema.prisma` — no schema changes
- `src/app/admin/chat/` — chat UI untouched

### How to Sync (for VS Code CLI)

No action needed — all changes are in the agent runtime layer (gitignored files + agents/lib/).
The `agents/lib/*.mjs` files are git-tracked and safe to pull. Memory files are gitignored.

If VS Code wants to test the LLM-powered agent responses:
```bash
# Test a single agent's LLM invocation
node -e "import('./agents/lib/invoke-agent.mjs').then(async m => { const r = await m.invokeAgent({ agentId: 'alex', prompt: 'What are our top priorities?' }); console.log(r.response); })"

# Process pending chat messages with LLM
node agents/lib/process-chat.mjs

# Run full standup (includes LLM chat processing)
node agents/run-fleet.mjs
```

---

## Tech Stack Quick Reference
- **Framework:** Next.js 16.1.6 (Turbopack)
- **Language:** TypeScript
- **Database:** SQLite via Prisma 7 + better-sqlite3 adapter
- **Deployment:** Docker + Cloudflare Tunnel on local PC
- **Auth:** JWT in `doge_session` cookie
- **Payments:** Airwallex (live, verified working)
- **Email:** Gmail SMTP via nodemailer
- **CSS:** Tailwind v4 + shadcn/ui
- **Testing:** Vitest (201 unit tests) + Playwright (E2E)
