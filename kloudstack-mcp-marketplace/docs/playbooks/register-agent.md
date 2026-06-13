# Playbook: Register an Agent

Register any MCP-compatible server so Claude Code can discover and call it through the marketplace.

## Requirements
- Your agent must accept `POST` requests with JSON-RPC 2.0 payloads
- It must respond to `tools/list` and `tools/call` methods
- The marketplace must be able to reach it over HTTPS

## Via the web UI

1. Go to `http://localhost:3000/register` (or your deployed URL)
2. Fill in:
   - **Name** — unique identifier, no spaces (e.g. `deploy-agent`)
   - **Endpoint** — full URL to your agent's MCP route (e.g. `https://my-agent.vercel.app/api/mcp`)
   - **Auth Header** — if your agent requires authentication, provide the full value e.g. `Bearer sk-live-...`
   - **Tags** — comma-separated capability labels e.g. `deploy, github, vercel`
3. Click **Register Agent**

## Via REST API

```bash
curl -X POST https://your-marketplace.vercel.app/api/agents \
  -H "Content-Type: application/json" \
  -H "x-api-key: $MARKETPLACE_API_KEY" \
  -d '{
    "name": "deploy-agent",
    "endpoint": "https://deploy-agent.vercel.app/api/mcp",
    "description": "Handles Vercel and Netlify deployments",
    "authHeader": "Bearer sk-live-...",
    "tags": ["deploy", "vercel", "netlify"]
  }'
```

## Via Claude Code (MCP tool)

Once you're connected to the marketplace:

> "Register a new agent called deploy-agent at https://deploy-agent.vercel.app/api/mcp with tags deploy and vercel"

Claude will call `register_agent` on your behalf.

## Verify registration

After registering, go to `/agents` in the UI or ask Claude:

> "List all agents in the marketplace"
