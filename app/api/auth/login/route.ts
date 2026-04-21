import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { authenticateUser, createSession, getSessionCookieName, getSessionDurationDays } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { env } = getRequestContext();
    const userId = await authenticateUser(env, email, password);

    if (!userId) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createSession(env, userId);

    const response = NextResponse.json({ success: true, userId });
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: getSessionDurationDays() * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Login failed'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
