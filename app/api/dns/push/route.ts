import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { cloudflareAccounts, planDomains, jobs, dnsRecords } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { planId, cfAccountId } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);

    // 1. Get CF Account details
    const [cfAccount] = await db.select()
      .from(cloudflareAccounts)
      .where(eq(cloudflareAccounts.id, cfAccountId))
      .limit(1);

    if (!cfAccount || !cfAccount.apiKey) {
      return NextResponse.json({ error: 'Cloudflare account or API key missing' }, { status: 400 });
    }

    const apiKey = cfAccount.apiKey;

    // 2. Fetch all domains for this plan
    const domains = await db.select()
      .from(planDomains)
      .where(eq(planDomains.planId, planId));

    if (!domains || domains.length === 0) throw new Error('No domains found for plan');

    // 3. Create jobs for each domain
    for (const domain of domains) {
      const [job] = await db.insert(jobs).values({
        planId: planId,
        jobType: 'dns_push',
        entityType: 'plan_domains',
        entityId: domain.id,
        status: 'processing'
      }).returning();

      try {
        const zoneId = `mock_zone_${domain.id}`; // Mock for now

        await db.update(planDomains).set({ cfZoneId: zoneId }).where(eq(planDomains.id, domain.id));

        // Step B: Push Records
        const records = await db.select()
          .from(dnsRecords)
          .where(and(
            eq(dnsRecords.domainId, domain.id),
            eq(dnsRecords.isDkim, false)
          ));

        for (const record of records) {
          // Rate limiting: 300ms delay
          await new Promise(r => setTimeout(r, 300));

          await db.update(dnsRecords).set({ 
            status: 'created',
            cfRecordId: `mock_rec_${record.id}` 
          }).where(eq(dnsRecords.id, record.id));
        }

        // Complete job
        await db.update(jobs).set({ 
          status: 'done',
          result: JSON.stringify({ zone_id: zoneId })
        }).where(eq(jobs.id, job.id));

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        await db.update(jobs).set({ 
          status: 'failed', 
          errorMessage: errorMsg 
        }).where(eq(jobs.id, job.id));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push API error:', error);
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
