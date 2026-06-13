# KloudStack AI Agent Platform

Two components, one repo:

| Folder | What it is |
|---|---|
| `kloudstack-agents/` | Claude Code multi-agent setup — CLAUDE.md orchestrator + 6 specialist agents |
| `kloudstack-mcp-marketplace/` | Next.js web app — central MCP server for agent discovery and proxying |

---

## Quick Start

### 1. Clone your repo

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

### 2. Set up the MCP Marketplace (web app)

```bash
cd kloudstack-mcp-marketplace

# Install dependencies (only 2 runtime deps: next + prisma)
npm install

# Copy and fill in environment variables
cp .env.example .env
# Edit .env — generate a secret key:
#   openssl rand -hex 32

# Create the database
npm run db:push

# Start locally
npm run dev
# → http://localhost:3000
```

**Deploy to Vercel:**
1. Push this repo to GitHub
2. Import at vercel.com → auto-detects Next.js
3. Set these env vars in the Vercel dashboard:
   - `DATABASE_URL` → Neon or Supabase Postgres URL
   - `MARKETPLACE_API_KEY` → same secret key as above
   - `NEXT_PUBLIC_BASE_URL` → your Vercel URL e.g. `https://kloudstack-marketplace.vercel.app`
4. In `kloudstack-mcp-marketplace/prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`

---

### 3. Set up Claude Code agents

```bash
cd kloudstack-agents

# Copy and fill in all service tokens
cp .env.example .env
# Edit .env — sources for every token are listed in .env.example

# Fill in your company details in agents/docs-agent.md:
# Replace the three placeholder lines with KloudStack Ltd's
# company number, VAT number, and registered address
```

**Start Claude Code:**
```bash
claude
```

Claude Code reads `CLAUDE.md` and `.mcp.json` automatically on startup.

> **Before first use:** run the `npm view` checks in `kloudstack-agents/SETUP.md`
> to verify MCP package names. GitHub MCP requires Docker installed:
> `docker pull ghcr.io/github/github-mcp-server`

---

### 4. Connect Claude Code to the Marketplace

Add this entry to `kloudstack-agents/.mcp.json` under `mcpServers`:

```json
"marketplace": {
  "type": "http",
  "url": "https://YOUR_MARKETPLACE_URL/api/mcp",
  "headers": { "x-api-key": "${MARKETPLACE_API_KEY}" }
}
```

Then register your agents — see `kloudstack-mcp-marketplace/docs/playbooks/register-agent.md`.

---

## File Map

### `kloudstack-agents/`

```
CLAUDE.md              ← Orchestrator instructions (auto-read by Claude Code)
.mcp.json              ← MCP server connections
.env.example           ← Token template with sources
SETUP.md               ← Package verification steps
agents/
  deploy-agent.md      ← GitHub + Vercel + Netlify
  content-agent.md     ← Canva + HeyGen video
  comms-agent.md       ← Gmail + Outlook + Calendar
  docs-agent.md        ← Proposals + invoices + DocuSign
  payments-agent.md    ← Stripe + PayPal
  design-agent.md      ← Lucid + Miro + Adobe + Descript
```

### `kloudstack-mcp-marketplace/`

```
HLD.md                 ← Architecture, data model, design decisions
CLAUDE.md              ← Project instructions for Claude Code
app/
  api/mcp/route.ts     ← The MCP server (4 tools)
  api/agents/          ← REST CRUD for agent registry
  page.tsx             ← Dashboard
  agents/              ← Agent list + detail
  register/            ← Register agent form
lib/
  mcp.ts               ← JSON-RPC helpers
  registry.ts          ← Agent CRUD + call logs
  db.ts                ← Prisma client singleton
middleware.ts          ← API key auth on all /api/* routes
prisma/schema.prisma   ← Agent + CallLog tables
docs/
  api.md               ← REST + MCP API reference
  playbooks/
    register-agent.md
    connect-claude-code.md
    agent-to-agent-call.md
    onboarding-workflow.md
```

---

## MCP Marketplace — Tools

Once Claude Code is connected to `/api/mcp`:

| Say to Claude | What happens |
|---|---|
| "List all agents" | `list_agents` — shows registry |
| "What tools does deploy-agent have?" | `get_agent_tools` — fetches live from agent |
| "Deploy main branch via deploy-agent" | `call_agent_tool` — proxies to agent |
| "Register my new agent at https://..." | `register_agent` — adds to registry |

---

## Design Principles

- **2 runtime dependencies** — `next` + `@prisma/client` only
- **No auth library** — single `MARKETPLACE_API_KEY` checked in middleware
- **SQLite locally, Postgres in production** — one line change in schema.prisma
- **JSON-RPC over plain HTTP POST** — no WebSocket or SSE complexity
- **Draft mode default** — agents require explicit confirmation before sending emails, deploying to production, or creating live payments
