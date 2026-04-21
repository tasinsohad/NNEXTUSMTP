import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { mailboxes as mailboxesTable, planSubdomains, planDomains, vpsConfigs } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { planId, vpsMapping } = await req.json();
    const { env } = getRequestContext();
    const db = getDb(env);

    // 1. Fetch all mailboxes for this plan with joins
    // We join mailboxes -> subdomains -> domains
    const mailboxes = await db.select({
      id: mailboxesTable.id,
      email: mailboxesTable.email,
      fullName: mailboxesTable.fullName,
      password: mailboxesTable.password,
      domainId: planDomains.id,
      fullSubdomain: planSubdomains.fullSubdomain
    })
    .from(mailboxesTable)
    .innerJoin(planSubdomains, eq(mailboxesTable.subdomainId, planSubdomains.id))
    .innerJoin(planDomains, eq(planSubdomains.domainId, planDomains.id))
    .where(eq(planDomains.planId, planId));

    if (!mailboxes || mailboxes.length === 0) throw new Error('No mailboxes found for plan');

    // 2. Group by domain to process per VPS
    const domainIds = Array.from(new Set(mailboxes.map(m => m.domainId!)));
    
    for (const domainId of domainIds) {
      const configId = vpsMapping[domainId];
      if (!configId) continue;

      const [vpsConfig] = await db.select()
        .from(vpsConfigs)
        .where(eq(vpsConfigs.id, configId))
        .limit(1);

      if (!vpsConfig) continue;

      const apiKey = vpsConfig.apiKey || 'mock_key';
      const domainMailboxes = mailboxes.filter(m => m.domainId === domainId);

      for (const m of domainMailboxes) {
        await db.update(mailboxesTable).set({ status: 'processing' }).where(eq(mailboxesTable.id, m.id));

        try {
          await new Promise(r => setTimeout(r, 500));

          await db.update(mailboxesTable).set({ status: 'created' }).where(eq(mailboxesTable.id, m.id));
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error'
          await db.update(mailboxesTable).set({ 
            status: 'failed',
            errorMessage: errorMsg 
          }).where(eq(mailboxesTable.id, m.id));
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mailbox Create API error:', error);
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
