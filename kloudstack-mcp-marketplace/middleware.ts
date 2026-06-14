import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const key = req.headers.get('x-api-key');
  const expected = process.env.MARKETPLACE_API_KEY;

  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/((?!canva/).*)'],
};
