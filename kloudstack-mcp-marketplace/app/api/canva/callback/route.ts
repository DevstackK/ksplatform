import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.json({ error: error ?? 'Missing code' }, { status: 400 });
  }

  const verifier = req.cookies.get('canva_verifier')?.value;
  if (!verifier) {
    return NextResponse.json({ error: 'Missing code verifier — try authorizing again' }, { status: 400 });
  }

  const credentials = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
  ).toString('base64');

  const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/canva/callback`,
      code_verifier: verifier,
    }),
  });

  const token = await tokenRes.json();

  if (!tokenRes.ok) {
    return NextResponse.json({ error: 'Token exchange failed', details: token }, { status: 400 });
  }

  const response = NextResponse.json({
    message: 'Canva connected successfully',
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_in: token.expires_in,
    instruction: 'Add CANVA_TOKEN to your .env file with the access_token value above',
  });

  response.cookies.delete('canva_verifier');
  return response;
}
