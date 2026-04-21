import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { deleteSession, getSessionCookieName } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { env } = getRequestContext();
    const token = req.headers.get('cookie')?.match(new RegExp(`${getSessionCookieName()}=([^;]+)`))?.[1];

    if (token) {
      await deleteSession(env, token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(getSessionCookieName(), '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Logout failed'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
