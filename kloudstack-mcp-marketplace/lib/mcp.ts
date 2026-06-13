export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

export interface MCPContent {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function ok(id: string | number, result: unknown): MCPResponse {
  return { jsonrpc: '2.0', id, result };
}

export function err(id: string | number, code: number, message: string): MCPResponse {
  return { jsonrpc: '2.0', id, error: { code, message } };
}

export function text(value: unknown): MCPContent {
  return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] };
}

export function errorContent(message: string): MCPContent {
  return { content: [{ type: 'text', text: message }], isError: true };
}

export const SERVER_INFO = {
  protocolVersion: '2024-11-05',
  capabilities: { tools: {} },
  serverInfo: { name: 'kloudstack-marketplace', version: '1.0.0' },
};

export async function fetchRemoteTools(endpoint: string, authHeader?: string | null): Promise<MCPTool[]> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return [];
    const data = await res.json() as MCPResponse;
    return (data.result as { tools?: MCPTool[] })?.tools ?? [];
  } catch {
    return [];
  }
}

export async function callRemoteTool(
  endpoint: string,
  toolName: string,
  args: Record<string, unknown>,
  authHeader?: string | null,
): Promise<MCPContent> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authHeader) headers['Authorization'] = authHeader;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Agent returned HTTP ${res.status}`);

  const data = await res.json() as MCPResponse;
  if (data.error) throw new Error(data.error.message);
  return data.result as MCPContent;
}
