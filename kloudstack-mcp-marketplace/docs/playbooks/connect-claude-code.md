# Playbook: Connect Claude Code

Connect Claude Code to the marketplace so it can discover and orchestrate all registered agents.

## Step 1 — Get your marketplace URL

- **Local:** `http://localhost:3000`
- **Deployed:** your Vercel URL e.g. `https://kloudstack-marketplace.vercel.app`

## Step 2 — Add to .mcp.json

In your project's `.mcp.json` (or `~/.claude/mcp.json` for global):

```json
{
  "mcpServers": {
    "marketplace": {
      "type": "http",
      "url": "https://kloudstack-marketplace.vercel.app/api/mcp",
      "headers": {
        "x-api-key": "${MARKETPLACE_API_KEY}"
      }
    }
  }
}
```

Set `MARKETPLACE_API_KEY` in your shell environment or `.env` file.

## Step 3 — Restart Claude Code

```bash
claude
```

On startup, Claude Code will connect to the marketplace and load the four marketplace tools.

## Step 4 — Test the connection

In Claude Code:

> "List all agents in the marketplace"

You should see all registered agents returned.

## Using agents through the marketplace

Once connected, you can talk naturally:

> "Use the deploy-agent to deploy the main branch to Vercel staging"

Claude will call `list_agents` (or already know the agent id), then `call_agent_tool` with the right args.

Or you can be explicit:

> "Call the `deploy_preview` tool on the deploy-agent with branch=main"

## Using from the KloudStack orchestrator

If you have `kloudstack-agents/CLAUDE.md` as your orchestrator, add the marketplace connection to your `kloudstack-agents/.mcp.json` so the orchestrator can use marketplace tools to discover which agents are available before spawning them.
