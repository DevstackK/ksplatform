# Setup Guide

## Steps

```bash
# 1. Copy to your project root (outside any existing repo)
cp -r kloudstack-agents/ ~/kloudstack/
cd ~/kloudstack

# 2. Fill in your tokens
cp .env.example .env
# Edit .env with your values

# 3. Fill in company details in agents/docs-agent.md
# Replace the three placeholder lines with KloudStack Ltd's actual
# company number, VAT number, and registered address.

# 4. Start Claude Code
claude
```

Claude Code automatically reads `CLAUDE.md` and `.mcp.json` on startup.

---

## MCP Package Status (tested 2026-06-13)

### Official npm packages — ready to use

| Server | Package | Version |
|---|---|---|
| GitHub | `ghcr.io/github/github-mcp-server` (Docker) | latest — requires Docker |
| Vercel | `@vercel/mcp-adapter` (npm) | 0.3.2 |
| Netlify | `@netlify/mcp` (npm) | 1.15.1 |
| Stripe | `@stripe/agent-toolkit` (npm) | 0.9.0 |
| PayPal | `@paypal/mcp` (npm) | 1.8.1 |

### Community npm packages — functional but unverified by vendor

| Server | Package | Version | Risk |
|---|---|---|---|
| HeyGen | `heygen-mcp-server` | 1.1.0 | Low — actively maintained |
| Lucid | `lucid-mcp-server` | 0.1.5 | Low |
| Atlassian | `atlassian-mcp` | 0.1.5 | Medium — community, not Atlassian official |
| Microsoft 365 | `microsoft-mcp-server` | 0.1.0 | Medium — community |

### HTTP/SSE — need endpoint URL from provider

These providers don't publish an npm MCP package. They either expose an
HTTP endpoint or require connecting through their platform (e.g. claude.ai
connected apps). The `.mcp.json` has placeholder URLs for each.

| Server | What to do |
|---|---|
| Google Workspace | Check workspace.google.com/products/apis or use the Google MCP Claude.ai integration |
| Canva | Check canva.com/developers for an MCP endpoint |
| Adobe | Check developer.adobe.com — Firefly Services has REST APIs; MCP endpoint TBC |
| Miro | Check developers.miro.com for MCP endpoint URL |
| Descript | Check descript.com/developers or use the Claude.ai integration |
| DocuSign | Check developer.docusign.com — no npm MCP found; REST API only for now |

**Tip:** If you added these as Claude.ai Connected Apps (in claude.ai settings),
they're already available when using Claude Code via the web — you don't need
to configure them in `.mcp.json` at all in that case.

---

## Quickest path to a working setup

Start with just the five official npm servers (GitHub, Vercel, Netlify, Stripe, PayPal)
plus whichever community ones you want. Comment out the HTTP ones in `.mcp.json`
until you have their endpoint URLs.

---

## Fill in before using docs-agent

Open `agents/docs-agent.md` and replace:

```
Company number (fill in: ________________)
VAT number (fill in: ________________)
Registered address (fill in: ________________)
```

with KloudStack Ltd's actual details.
