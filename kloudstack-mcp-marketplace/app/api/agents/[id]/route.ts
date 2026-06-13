import { NextRequest, NextResponse } from 'next/server';
import { getAgent, updateAgent, deleteAgent } from '@/lib/registry';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  const agent = await updateAgent(id, {
    name: typeof body.name === 'string' ? body.name : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
    endpoint: typeof body.endpoint === 'string' ? body.endpoint : undefined,
    authHeader: typeof body.authHeader === 'string' ? body.authHeader : undefined,
    tags: Array.isArray(body.tags) ? body.tags as string[] : undefined,
    active: typeof body.active === 'boolean' ? body.active : undefined,
  });

  return NextResponse.json(agent);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await deleteAgent(id);
  return new NextResponse(null, { status: 204 });
}
