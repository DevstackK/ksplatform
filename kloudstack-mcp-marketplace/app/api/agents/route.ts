import { NextRequest, NextResponse } from 'next/server';
import { createAgent, listAgents } from '@/lib/registry';

export async function GET() {
  const agents = await listAgents(false);
  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    name?: string;
    description?: string;
    endpoint?: string;
    authHeader?: string;
    tags?: string[];
  };

  if (!body.name?.trim() || !body.endpoint?.trim()) {
    return NextResponse.json({ error: 'name and endpoint are required' }, { status: 400 });
  }

  try {
    new URL(body.endpoint);
  } catch {
    return NextResponse.json({ error: 'endpoint must be a valid URL' }, { status: 400 });
  }

  const agent = await createAgent({
    name: body.name.trim(),
    description: body.description?.trim(),
    endpoint: body.endpoint.trim(),
    authHeader: body.authHeader?.trim(),
    tags: body.tags ?? [],
  });

  return NextResponse.json(agent, { status: 201 });
}
