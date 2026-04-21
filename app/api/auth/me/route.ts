import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { verifySession, getSessionCookieName } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { env } = getRequestContext();
    const token = req.headers.get('cookie')?.match(new RegExp(`${getSessionCookieName()}=([^;]+)`))?.[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionUser = await verifySession(env, token);

    if (!sessionUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user: { id: sessionUser.userId, email: sessionUser.email } });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
