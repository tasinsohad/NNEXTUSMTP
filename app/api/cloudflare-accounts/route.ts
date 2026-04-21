import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { cloudflareAccounts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { env } = getRequestContext();
    const db = getDb(env);
    const userId = authResult.userId;

    const accounts = await db.select()
      .from(cloudflareAccounts)
      .where(eq(cloudflareAccounts.userId, userId));

    return NextResponse.json({ accounts });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { label, email, apiKey } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);
    const userId = authResult.userId;

    const [inserted] = await db.insert(cloudflareAccounts).values({
      userId,
      label,
      email,
      apiKey
    }).returning();

    return NextResponse.json({ account: inserted });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { env } = getRequestContext();
    const db = getDb(env);

    // Ensure user can only delete their own accounts
    await db.delete(cloudflareAccounts).where(
      and(
        eq(cloudflareAccounts.id, id),
        eq(cloudflareAccounts.userId, authResult.userId)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
