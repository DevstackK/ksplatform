# High Level Design — KloudStack MCP Marketplace

## Overview

The MCP Marketplace is a web application that acts as a **central MCP server** through which AI agents can discover and call each other. Instead of hardwiring agent-to-agent connections, every agent registers once with the marketplace, and any Claude Code instance (or any MCP client) can reach all of them through a single endpoint.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      MCP Client (Claude Code)                │
│  .mcp.json → { "marketplace": { url: ".../api/mcp" } }       │
└────────────────────────────┬─────────────────────────────────┘
                             │  JSON-RPC 2.0 over HTTPS POST
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                  KloudStack MCP Marketplace                   │
│                    (Next.js / Vercel)                         │
│                                                              │
│  ┌─────────────────┐    ┌──────────────────────────────────┐ │
│  │   /api/mcp      │    │          Agent Registry          │ │
│  │  MCP Server     │◄──►│  (Prisma + SQLite/Postgres)      │ │
│  │                 │    │                                  │ │
│  │ tools:          │    │  Agent { id, name, endpoint,     │ │
│  │  list_agents    │    │          authHeader, tags }      │ │
│  │  get_agent_tools│    │  CallLog { agentId, tool, args,  │ │
│  │  call_agent_tool│    │            result, durationMs }  │ │
│  │  register_agent │    └──────────────────────────────────┘ │
│  └────────┬────────┘                                         │
│           │  proxies call                                    │
└───────────┼──────────────────────────────────────────────────┘
            │  JSON-RPC 2.0 over HTTPS POST
     ┌──────┴──────────────────────┐
     │                             │
     ▼                             ▼
┌──────────┐                 ┌──────────┐
│ Agent A  │                 │ Agent B  │
│ /api/mcp │                 │ /api/mcp │
│ (Vercel) │                 │ (any MCP │
└──────────┘                 │  server) │
                             └──────────┘
```

---

## Data Model

### Agent
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| name | string (unique) | Human-readable identifier |
| description | string? | What the agent does |
| endpoint | string | MCP server URL |
| authHeader | string? | Authorization header value passed when calling this agent |
| tags | string[] | Capability labels for filtering (stored as JSON) |
| active | boolean | Soft-disable without deleting |
| createdAt / updatedAt | datetime | Audit fields |

### CallLog
| Field | Type | Notes |
|---|---|---|
| id | cuid | Primary key |
| agentId | FK → Agent | |
| tool | string | Tool name called |
| args | JSON string | Input arguments |
| result | JSON string? | Response from agent |
| error | string? | Error message if call failed |
| durationMs | int? | Round-trip time |
| calledAt | datetime | |

---

## MCP Protocol

The marketplace speaks **JSON-RPC 2.0 over HTTP POST**. No WebSocket, no SSE subscription required. This is the simplest MCP transport and works with all Claude Code versions.

### Request format
```json
{ "jsonrpc": "2.0", "id": "1", "method": "tools/call", "params": { "name": "list_agents", "arguments": {} } }
```

### Methods supported
| Method | Description |
|---|---|
| `initialize` | Handshake — returns server info and capabilities |
| `tools/list` | Returns the four marketplace tools |
| `tools/call` | Executes a tool |
| `notifications/initialized` | No-op acknowledgement (returns 204) |

### Tools exposed
| Tool | Args | Returns |
|---|---|---|
| `list_agents` | `tag?` | Array of registered agents |
| `get_agent_tools` | `agentId` | Tool schema from the agent's own MCP server |
| `call_agent_tool` | `agentId`, `tool`, `args?` | Proxied result from the agent |
| `register_agent` | `name`, `endpoint`, `description?`, `authHeader?`, `tags?` | Created agent record |

---

## Authentication

### Protecting the marketplace
All `/api/*` routes require the `x-api-key` header to match `MARKETPLACE_API_KEY` (enforced by Next.js middleware). The UI pages are public (local use only).

When adding to Claude Code `.mcp.json`:
```json
{
  "marketplace": {
    "type": "http",
    "url": "https://your-marketplace.vercel.app/api/mcp",
    "headers": { "x-api-key": "${MARKETPLACE_API_KEY}" }
  }
}
```

### Calling registered agents
Each agent stores its own `authHeader` value. The marketplace forwards this as the `Authorization` header when proxying calls. Agents don't need to know about each other's credentials.

---

## Agent Communication Flow

```
Claude Code                 Marketplace              Agent B
    │                           │                       │
    │── tools/call ────────────►│                       │
    │   call_agent_tool(        │                       │
    │     agentId="agent-b",    │                       │
    │     tool="deploy",        │                       │
    │     args={...}            │                       │
    │   )                       │                       │
    │                           │── POST /api/mcp ─────►│
    │                           │   tools/call          │
    │                           │   { name: "deploy",   │
    │                           │     arguments: {...} } │
    │                           │                       │
    │                           │◄── result ────────────│
    │                           │                       │
    │                           │ log to CallLog table  │
    │                           │                       │
    │◄── result ────────────────│                       │
```

---

## Deployment

### Local development
```bash
cp .env.example .env      # fill in MARKETPLACE_API_KEY
npm install
npm run db:push           # creates dev.db
npm run dev               # starts on localhost:3000
```

### Vercel production
1. Push to GitHub
2. Import in Vercel → auto-detects Next.js
3. Set env vars: `DATABASE_URL` (Neon/Supabase postgres URL), `MARKETPLACE_API_KEY`, `NEXT_PUBLIC_BASE_URL`
4. Change `prisma/schema.prisma` provider from `sqlite` to `postgresql`

### Switching to Postgres
Edit `prisma/schema.prisma`:
```diff
- provider = "sqlite"
+ provider = "postgresql"
```
Then run `npm run db:push` — schema is identical, only the provider changes.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| JSON-RPC over plain HTTP POST | Simplest transport; no SSE/WebSocket complexity; works everywhere |
| No auth library (just middleware) | Single-user tool; one API key in env is sufficient |
| SQLite default | Zero infrastructure for local dev; one-line switch to Postgres for production |
| No state management library | Next.js Server Components fetch data directly; no client state needed |
| 2 runtime dependencies | `next` + `@prisma/client` — nothing else |
| Tags as JSON string | SQLite has no array type; JSON.stringify/parse is trivial and avoids a join table |
| Proxy via fetch, not MCP SDK | Direct JSON-RPC fetch is 20 lines; avoids SDK transport complexity in serverless |
