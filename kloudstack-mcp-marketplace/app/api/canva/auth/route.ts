import { NextResponse } from 'next/server';
import crypto from 'crypto';

function base64url(buffer: Buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export async function GET() {
  const verifier = base64url(crypto.randomBytes(32));
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest());

  const params = new URLSearchParams({
    code_challenge_method: 's256',
    response_type: 'code',
    client_id: process.env.CANVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/canva/callback`,
    scope: 'design:content:read design:content:write asset:read asset:write',
    code_challenge: challenge,
  });

  const response = NextResponse.redirect(
    `https://www.canva.com/api/oauth/authorize?${params.toString()}`
  );

  response.cookies.set('canva_verifier', verifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  return response;
}
