# KloudStack MCP Marketplace

Next.js 15 app (App Router, TypeScript). An MCP server that acts as a central registry and proxy for AI agent-to-agent communication.

## Run

```bash
npm install
cp .env.example .env   # fill in MARKETPLACE_API_KEY and DATABASE_URL
npm run db:push        # creates/migrates the SQLite database
npm run dev            # http://localhost:3000
```

## Key files

| File | Purpose |
|---|---|
| `app/api/mcp/route.ts` | The MCP server — add new marketplace tools here |
| `lib/mcp.ts` | MCP protocol helpers (JSON-RPC types, remote fetch/call) |
| `lib/registry.ts` | Agent CRUD and call log operations |
| `prisma/schema.prisma` | Database schema |
| `middleware.ts` | API key auth for all /api/* routes |

## Adding a new marketplace tool

1. Add the tool definition to the `TOOLS` array in `app/api/mcp/route.ts`
2. Add a case to the `handleTool` switch statement
3. No other files need changing

## Database changes

```bash
# After editing prisma/schema.prisma:
npm run db:push
```

## Switch to Postgres (for production/Vercel)

In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"` and update `DATABASE_URL` to a Postgres connection string.
