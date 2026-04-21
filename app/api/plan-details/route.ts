import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { plans, planDomains, planSubdomains } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const planId = searchParams.get('planId');

    const { env } = getRequestContext();
    const db = getDb(env);

    // Get plan by sessionId or planId
    let plan;
    if (planId) {
      const [p] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
      plan = p;
    } else if (sessionId) {
      const [p] = await db.select().from(plans).where(eq(plans.sessionId, sessionId)).limit(1);
      plan = p;
    }

    if (!plan) {
      return NextResponse.json({ plan: null, domains: [] });
    }

    // Get domains
    const domains = await db.select().from(planDomains).where(eq(planDomains.planId, plan.id));

    // Get subdomains for each domain
    const domainsWithSubdomains = await Promise.all(
      domains.map(async (d) => {
        const subdomains = await db.select()
          .from(planSubdomains)
          .where(eq(planSubdomains.domainId, d.id));
        return { ...d, plan_subdomains: subdomains };
      })
    );

    return NextResponse.json({
      plan,
      domains: domainsWithSubdomains,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
