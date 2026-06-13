import { NextRequest, NextResponse } from 'next/server';
import { ok, err, text, errorContent, SERVER_INFO, fetchRemoteTools, callRemoteTool, type MCPRequest } from '@/lib/mcp';
import { listAgents, getAgent, logCall } from '@/lib/registry';

const TOOLS = [
  {
    name: 'list_agents',
    description: 'List all active agents registered in the marketplace. Returns their id, name, description, endpoint, and tags.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        tag: { type: 'string', description: 'Optional tag to filter agents by' },
      },
      required: [],
    },
  },
  {
    name: 'get_agent_tools',
    description: 'Fetch the full list of MCP tools that a specific registered agent exposes.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentId: { type: 'string', description: 'Agent id from list_agents' },
      },
      required: ['agentId'],
    },
  },
  {
    name: 'call_agent_tool',
    description: 'Call a specific tool on a registered agent. The marketplace proxies the call and returns the result.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agentId: { type: 'string', description: 'Agent id from list_agents' },
        tool: { type: 'string', description: 'Tool name to call' },
        args: { type: 'object', description: 'Arguments to pass to the tool' },
      },
      required: ['agentId', 'tool'],
    },
  },
  {
    name: 'register_agent',
    description: 'Register a new MCP agent in the marketplace.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Unique name for the agent' },
        description: { type: 'string', description: 'What this agent does' },
        endpoint: { type: 'string', description: 'MCP endpoint URL' },
        authHeader: { type: 'string', description: 'Optional auth header value e.g. "Bearer sk-..."' },
        tags: { type: 'array', description: 'Capability tags e.g. ["deploy","github"]' },
      },
      required: ['name', 'endpoint'],
    },
  },
];

async function handleTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'list_agents': {
      const agents = await listAgents(true);
      const tag = typeof args.tag === 'string' ? args.tag.toLowerCase() : null;
      const filtered = tag ? agents.filter(a => a.tags.some(t => t.toLowerCase() === tag)) : agents;
      return text(filtered.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        endpoint: a.endpoint,
        tags: a.tags,
      })));
    }

    case 'get_agent_tools': {
      const agentId = args.agentId as string;
      const agent = await getAgent(agentId);
      if (!agent) return errorContent(`Agent "${agentId}" not found`);
      const tools = await fetchRemoteTools(agent.endpoint, agent.authHeader);
      return text({ agentId, agentName: agent.name, tools });
    }

    case 'call_agent_tool': {
      const agentId = args.agentId as string;
      const toolName = args.tool as string;
      const toolArgs = (args.args ?? {}) as Record<string, unknown>;

      const agent = await getAgent(agentId);
      if (!agent) return errorContent(`Agent "${agentId}" not found`);
      if (!agent.active) return errorContent(`Agent "${agent.name}" is inactive`);

      const start = Date.now();
      try {
        const result = await callRemoteTool(agent.endpoint, toolName, toolArgs, agent.authHeader);
        const durationMs = Date.now() - start;
        await logCall({ agentId, tool: toolName, args: toolArgs, result, durationMs });
        return result;
      } catch (e) {
        const error = String(e);
        await logCall({ agentId, tool: toolName, args: toolArgs, error });
        return errorContent(`Call to ${agent.name}.${toolName} failed: ${error}`);
      }
    }

    case 'register_agent': {
      const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
      const res = await fetch(`${base}/api/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.MARKETPLACE_API_KEY ?? '',
        },
        body: JSON.stringify(args),
      });
      if (!res.ok) {
        const { error } = await res.json() as { error: string };
        return errorContent(`Registration failed: ${error}`);
      }
      const agent = await res.json();
      return text({ message: 'Agent registered successfully', agent });
    }

    default:
      return errorContent(`Unknown tool: ${name}`);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as MCPRequest;
  const { id, method, params = {} } = body;

  switch (method) {
    case 'initialize':
      return NextResponse.json(ok(id, SERVER_INFO));

    case 'notifications/initialized':
      return new NextResponse(null, { status: 204 });

    case 'tools/list':
      return NextResponse.json(ok(id, { tools: TOOLS }));

    case 'tools/call': {
      const { name, arguments: args = {} } = params as { name: string; arguments?: Record<string, unknown> };
      try {
        const result = await handleTool(name, args);
        return NextResponse.json(ok(id, result));
      } catch (e) {
        return NextResponse.json(err(id, -32000, String(e)));
      }
    }

    default:
      return NextResponse.json(err(id, -32601, `Method not found: ${method}`));
  }
}

// SSE endpoint for clients that open a persistent connection
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(': ping\n\n'));
      // Keep alive — real events would be pushed here
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
