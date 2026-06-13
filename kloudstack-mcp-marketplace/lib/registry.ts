import { db } from '@/lib/db';

export type AgentRow = {
  id: string;
  name: string;
  description: string | null;
  endpoint: string;
  authHeader: string | null;
  tags: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function parseTags(raw: string): string[] {
  try { return JSON.parse(raw) as string[]; } catch { return []; }
}

function toAgentRow(raw: Awaited<ReturnType<typeof db.agent.findFirst>>): AgentRow | null {
  if (!raw) return null;
  return { ...raw, tags: parseTags(raw.tags) };
}

export async function listAgents(activeOnly = true): Promise<AgentRow[]> {
  const rows = await db.agent.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { name: 'asc' },
  });
  return rows.map(r => ({ ...r, tags: parseTags(r.tags) }));
}

export async function getAgent(id: string): Promise<AgentRow | null> {
  const row = await db.agent.findUnique({ where: { id } });
  return toAgentRow(row);
}

export async function createAgent(input: {
  name: string;
  description?: string;
  endpoint: string;
  authHeader?: string;
  tags?: string[];
}): Promise<AgentRow> {
  const row = await db.agent.create({
    data: {
      name: input.name,
      description: input.description ?? null,
      endpoint: input.endpoint,
      authHeader: input.authHeader ?? null,
      tags: JSON.stringify(input.tags ?? []),
    },
  });
  return { ...row, tags: parseTags(row.tags) };
}

export async function updateAgent(
  id: string,
  input: Partial<{
    name: string;
    description: string;
    endpoint: string;
    authHeader: string;
    tags: string[];
    active: boolean;
  }>,
): Promise<AgentRow> {
  const row = await db.agent.update({
    where: { id },
    data: {
      ...input,
      tags: input.tags !== undefined ? JSON.stringify(input.tags) : undefined,
    },
  });
  return { ...row, tags: parseTags(row.tags) };
}

export async function deleteAgent(id: string): Promise<void> {
  await db.agent.delete({ where: { id } });
}

export async function logCall(input: {
  agentId: string;
  tool: string;
  args: unknown;
  result?: unknown;
  error?: string;
  durationMs?: number;
}): Promise<void> {
  await db.callLog.create({
    data: {
      agentId: input.agentId,
      tool: input.tool,
      args: JSON.stringify(input.args),
      result: input.result !== undefined ? JSON.stringify(input.result) : null,
      error: input.error ?? null,
      durationMs: input.durationMs ?? null,
    },
  });
}

export async function getCallLogs(agentId?: string, limit = 50) {
  return db.callLog.findMany({
    where: agentId ? { agentId } : undefined,
    orderBy: { calledAt: 'desc' },
    take: limit,
    include: { agent: { select: { name: true } } },
  });
}
