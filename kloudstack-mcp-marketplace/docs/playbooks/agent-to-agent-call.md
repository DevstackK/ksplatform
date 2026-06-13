# Playbook: Agent-to-Agent Call

How one agent triggers another through the marketplace — the core of the orchestration model.

## The pattern

```
Claude Code
  → marketplace.call_agent_tool(agentId="payments-agent", tool="create_payment_link", args={...})
    → Marketplace proxies → payments-agent /api/mcp
      → payments-agent calls Stripe API
        → returns payment link URL
      → Marketplace logs call
    → Returns result to Claude Code
```

## Example: Onboarding a new client

Claude receives: "Onboard Genesis Communications — £5,000 website project"

### Step 1 — Discover available agents
Claude calls `list_agents` → gets ids for docs-agent, payments-agent, comms-agent

### Step 2 — Create the proposal (docs-agent)
```json
{
  "agentId": "docs-agent-id",
  "tool": "create_proposal",
  "args": {
    "clientName": "Genesis Communications",
    "projectTitle": "Website Redesign",
    "amount": 5000,
    "currency": "GBP"
  }
}
```

### Step 3 — Create payment link (payments-agent)
```json
{
  "agentId": "payments-agent-id",
  "tool": "create_stripe_payment_link",
  "args": {
    "amount": 5000,
    "currency": "gbp",
    "description": "Genesis Communications — Website Redesign",
    "customerEmail": "contact@genesis-comms.com"
  }
}
```

### Step 4 — Draft welcome email (comms-agent)
```json
{
  "agentId": "comms-agent-id",
  "tool": "draft_email",
  "args": {
    "to": "contact@genesis-comms.com",
    "subject": "Welcome to KloudStack — Genesis Communications",
    "bodyContext": "Include the payment link: https://buy.stripe.com/..."
  }
}
```

## Building an agent that calls the marketplace

If your agent itself needs to call other agents, it can call the marketplace's REST API:

```typescript
// Inside your agent's tool handler
const res = await fetch('https://kloudstack-marketplace.vercel.app/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.MARKETPLACE_API_KEY!,
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: '1',
    method: 'tools/call',
    params: {
      name: 'call_agent_tool',
      arguments: { agentId: 'payments-agent-id', tool: 'create_payment_link', args: { ... } }
    }
  })
});
```

This creates true agent-to-agent communication without any direct coupling between agents.
