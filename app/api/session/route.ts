import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { env } = getRequestContext();
    const db = getDb(env);
    const userId = authResult.userId;

    const [session] = await db.select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .limit(1);

    if (session && typeof session.payload === 'string') {
      session.payload = JSON.parse(session.payload);
    }

    return NextResponse.json({ session: session || null });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { stage, payload } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);
    const userId = authResult.userId;

    const existing = await db.select().from(sessions).where(eq(sessions.userId, userId)).limit(1);

    let session;
    const payloadStr = JSON.stringify(payload);

    if (existing.length > 0) {
      const [updated] = await db.update(sessions)
        .set({ 
          stage, 
          payload: payloadStr,
          updatedAt: new Date().toISOString()
        })
        .where(eq(sessions.id, existing[0].id))
        .returning();
      session = updated;
    } else {
      const [inserted] = await db.insert(sessions).values({
        userId,
        stage,
        payload: payloadStr,
      }).returning();
      session = inserted;
    }

    if (session && typeof session.payload === 'string') {
      session.payload = JSON.parse(session.payload);
    }

    return NextResponse.json({ session });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
