import { getRequestContext } from '@cloudflare/next-on-pages';
import { verifySession, getSessionCookieName } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Get the authenticated user ID from the request cookies.
 * Returns { userId, email } or a 401 NextResponse if not authenticated.
 * Use this in API routes that require authentication.
 */
export async function getAuthUser(req: Request): Promise<{ userId: string; email: string } | NextResponse> {
  const { env } = getRequestContext();
  const cookieHeader = req.headers.get('cookie') || '';
  const token = cookieHeader.match(new RegExp(`${getSessionCookieName()}=([^;]+)`))?.[1];

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const sessionUser = await verifySession(env, token);
  if (!sessionUser) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  return sessionUser;
}

/**
 * Type guard: check if the result is a NextResponse (auth failed) or user data
 */
export function isAuthError(result: { userId: string; email: string } | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
