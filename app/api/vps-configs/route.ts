import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { vpsConfigs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { env } = getRequestContext();
    const db = getDb(env);

    const configs = await db.select()
      .from(vpsConfigs)
      .where(eq(vpsConfigs.userId, authResult.userId));

    return NextResponse.json({ configs });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
