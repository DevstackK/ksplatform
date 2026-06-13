# Playbook: KloudStack Client Onboarding

End-to-end example: onboarding a new client using the full agent stack.

## Trigger

You say to Claude Code:

> "Onboard Genesis Communications — proposal for a £15k website, send for signature, and set up their Stripe account"

## What happens

### 1. Claude discovers agents (automatic)
Claude calls `list_agents` → finds docs-agent, payments-agent, comms-agent

### 2. Sequential workflow begins

Claude recognises that:
- docs-agent must run **first** (proposal must exist before DocuSign can be sent)
- payments-agent runs **second** (needs client email from proposal context)
- comms-agent runs **last** (needs both signature URL and payment link)

### 3. docs-agent — Create proposal

Claude calls:
```
call_agent_tool(
  agentId="docs-agent",
  tool="create_proposal",
  args={
    clientName: "Genesis Communications",
    projectTitle: "Website Design & Development",
    amount: 15000,
    vatRate: 0.20,
    deliverables: ["Homepage", "5 inner pages", "CMS setup", "3 months support"],
    paymentTerms: "50% deposit, 50% on completion"
  }
)
```

**Returns:** PDF URL + document id

### 4. docs-agent — Send for signature

```
call_agent_tool(
  agentId="docs-agent",
  tool="send_docusign",
  args={
    documentId: "...",
    signerEmail: "ceo@genesis-comms.com",
    signerName: "John Smith"
  }
)
```

**Returns:** DocuSign envelope id + signing URL

### 5. payments-agent — Create Stripe customer + payment link

```
call_agent_tool(
  agentId="payments-agent",
  tool="create_payment_link",
  args={
    customerEmail: "ceo@genesis-comms.com",
    customerName: "Genesis Communications",
    amount: 7500,
    description: "Website project — 50% deposit",
    currency: "gbp"
  }
)
```

**Returns:** Stripe payment link URL

### 6. comms-agent — Draft welcome email

```
call_agent_tool(
  agentId="comms-agent",
  tool="draft_email",
  args={
    to: "ceo@genesis-comms.com",
    subject: "Welcome to KloudStack — next steps for your website project",
    context: {
      signingUrl: "https://docusign.com/...",
      paymentUrl: "https://buy.stripe.com/...",
      projectTitle: "Website Design & Development"
    }
  }
)
```

**Returns:** Draft email for review

### 7. Claude presents summary

Claude shows:
- Proposal created → [PDF link]
- DocuSign sent → envelope id, signing URL
- Stripe payment link → [pay link]
- Email drafted → [preview]
- Asks: "Ready to send the email? [y/n]"

## Total agent calls: 4
## Human interventions: 1 (email send confirmation)

---

## Parallel example: Campaign launch

> "Launch the Kloud eSIM summer campaign — update the homepage and create an Instagram carousel"

These are **independent** — Claude spawns both simultaneously:

| Agent | Tool | Args |
|---|---|---|
| deploy-agent | `update_file` | homepage banner content |
| content-agent | `create_canva_carousel` | summer campaign brief |

Both run in parallel. Claude waits for both, then:
- Reports staging URL from deploy-agent
- Shows carousel preview from content-agent
- Asks: "Deploy to production and publish carousel? [y/n]"
