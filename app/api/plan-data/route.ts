import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { jobs, mailboxes, dnsRecords, planSubdomains, planDomains } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('planId');
    if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 });

    const { env } = getRequestContext();
    const db = getDb(env);

    const [jobsData, mailboxesData, dnsRecordsData] = await Promise.all([
      db.select().from(jobs).where(eq(jobs.planId, planId)),
      
      db.select({
        id: mailboxes.id,
        email: mailboxes.email,
        status: mailboxes.status,
        errorMessage: mailboxes.errorMessage
      })
      .from(mailboxes)
      .innerJoin(planSubdomains, eq(mailboxes.subdomainId, planSubdomains.id))
      .innerJoin(planDomains, eq(planSubdomains.domainId, planDomains.id))
      .where(eq(planDomains.planId, planId)),

      db.select({
        id: dnsRecords.id,
        recordName: dnsRecords.recordName,
        recordType: dnsRecords.recordType,
        recordContent: dnsRecords.recordContent,
        status: dnsRecords.status,
        isDkim: dnsRecords.isDkim
      })
      .from(dnsRecords)
      .innerJoin(planDomains, eq(dnsRecords.domainId, planDomains.id))
      .where(eq(planDomains.planId, planId))
    ]);

    return NextResponse.json({ 
      jobs: jobsData, 
      mailboxes: mailboxesData, 
      dnsRecords: dnsRecordsData 
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
