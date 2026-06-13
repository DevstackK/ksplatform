# API Reference

## Authentication

All API calls require the `x-api-key` header:

```
x-api-key: your_MARKETPLACE_API_KEY
```

---

## MCP Server

**Endpoint:** `POST /api/mcp`

Standard JSON-RPC 2.0. Connect via Claude Code `.mcp.json`:

```json
{
  "mcpServers": {
    "marketplace": {
      "type": "http",
      "url": "https://your-marketplace.vercel.app/api/mcp",
      "headers": { "x-api-key": "${MARKETPLACE_API_KEY}" }
    }
  }
}
```

### Tools

#### `list_agents`
```json
{ "tag": "deploy" }  // optional filter
```
Returns all active registered agents.

#### `get_agent_tools`
```json
{ "agentId": "clx..." }
```
Fetches live tool list from the agent's own MCP endpoint.

#### `call_agent_tool`
```json
{ "agentId": "clx...", "tool": "deploy_preview", "args": { "branch": "main" } }
```
Proxies the tool call to the registered agent and returns its response.

#### `register_agent`
```json
{
  "name": "my-agent",
  "endpoint": "https://my-agent.vercel.app/api/mcp",
  "description": "What it does",
  "authHeader": "Bearer sk-...",
  "tags": ["deploy", "github"]
}
```

---

## REST API

### Agents

| Method | Path | Description |
|---|---|---|
| GET | `/api/agents` | List all agents (including inactive) |
| POST | `/api/agents` | Register a new agent |
| GET | `/api/agents/:id` | Get agent by id |
| PATCH | `/api/agents/:id` | Update agent fields |
| DELETE | `/api/agents/:id` | Delete agent and its call logs |
| GET | `/api/agents/:id/tools` | Fetch live tools from agent's endpoint |

### POST /api/agents body
```json
{
  "name": "string (required)",
  "endpoint": "string (required, must be valid URL)",
  "description": "string (optional)",
  "authHeader": "string (optional)",
  "tags": ["string"] // optional array
}
```

### PATCH /api/agents/:id body
Any subset of the registration fields, plus:
```json
{ "active": false }  // soft-disable
```
