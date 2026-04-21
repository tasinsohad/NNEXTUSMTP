import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { dnsRecords, planDomains } from '@/db/schema';
import { eq, and, notLike } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { planId } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);

    // 1. Fetch DKIM records with content
    const records = await db.select({
      id: dnsRecords.id
    })
    .from(dnsRecords)
    .innerJoin(planDomains, eq(dnsRecords.domainId, planDomains.id))
    .where(and(
      eq(dnsRecords.isDkim, true),
      eq(planDomains.planId, planId),
      notLike(dnsRecords.recordContent, '%PENDING%')
    ));

    if (!records || records.length === 0) throw new Error('No ready DKIM keys found. Fetch them first.');

    // 2. Push to Cloudflare (Mock)
    for (const record of records) {
      await new Promise(r => setTimeout(r, 400));
      
      await db.update(dnsRecords).set({ 
        status: 'created',
        cfRecordId: `mock_dkim_${record.id}` 
      }).where(eq(dnsRecords.id, record.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
