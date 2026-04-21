import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { registerUser, createSession, getSessionCookieName, getSessionDurationDays } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { env } = getRequestContext();

    let userId: string;
    try {
      userId = await registerUser(env, email, password);
    } catch (error) {
      const err = error instanceof Error ? error.message : String(error)
      if (err.includes('UNIQUE') || err.includes('unique')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
      throw error;
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
    const err = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
