import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { dnsRecords, planDomains } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { planId } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);

    // 1. Fetch DKIM records with joins
    const records = await db.select({
      id: dnsRecords.id,
      domainId: dnsRecords.domainId
    })
    .from(dnsRecords)
    .innerJoin(planDomains, eq(dnsRecords.domainId, planDomains.id))
    .where(and(
      eq(dnsRecords.isDkim, true),
      eq(planDomains.planId, planId)
    ));

    if (!records || records.length === 0) throw new Error('No DKIM records found');

    const domainIds = Array.from(new Set(records.map(r => r.domainId!)));

    for (const dId of domainIds) {
      const mockKey = `v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${Math.random().toString(36).substring(2)}...`;
      
      await db.update(dnsRecords)
        .set({ 
          recordContent: mockKey,
          status: 'pending' 
        })
        .where(and(
          eq(dnsRecords.domainId, dId),
          eq(dnsRecords.isDkim, true)
        ));
      
      await new Promise(r => setTimeout(r, 500));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
