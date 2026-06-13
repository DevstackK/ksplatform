import { NextRequest, NextResponse } from 'next/server';
import { getAgent } from '@/lib/registry';
import { fetchRemoteTools } from '@/lib/mcp';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tools = await fetchRemoteTools(agent.endpoint, agent.authHeader);
  return NextResponse.json({ agentId: id, tools });
}
