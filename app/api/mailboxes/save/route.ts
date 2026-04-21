import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { mailboxes as mailboxesTable } from '@/db/schema';
import { getAuthUser, isAuthError } from '@/lib/api-auth';
import { inArray } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { mailboxes } = await req.json() as {
      mailboxes: {
        subdomain_id: string;
        email: string;
        first_name: string;
        full_name: string;
        password: string;
        status: string;
      }[]
    };

    if (!mailboxes || mailboxes.length === 0) {
      return NextResponse.json({ error: 'No mailboxes provided' }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = getDb(env);

    // Delete existing mailboxes for these subdomains to avoid duplicates
    const subdomainIds = [...new Set(mailboxes.map(m => m.subdomain_id))];
    
    // Insert all mailboxes
    const values = mailboxes.map(m => ({
      subdomainId: m.subdomain_id,
      email: m.email,
      firstName: m.first_name,
      fullName: m.full_name,
      password: m.password,
      status: m.status || 'pending',
    }));

    // D1 doesn't support bulk upsert easily, so we'll delete then insert
    await db.delete(mailboxesTable).where(inArray(mailboxesTable.subdomainId, subdomainIds));
    await db.insert(mailboxesTable).values(values);

    return NextResponse.json({ success: true, count: mailboxes.length });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
