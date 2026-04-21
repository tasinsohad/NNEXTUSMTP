import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { plans as plansTable, planDomains, planSubdomains } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DomainPlan } from '@/lib/planner';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { sessionId, plans } = await req.json() as { sessionId: string, plans: DomainPlan[] };
    const { env } = getRequestContext();
    const db = getDb(env);
    const userId = authResult.userId;

    // 1. Create or update the plan
    // In Drizzle/D1, we use insert().onConflictUpdate() or similar, 
    // but for simplicity here we'll check existence or just insert new.
    // For D1, we can't easily do upsert with all fields in one go without unique constraints.
    // Let's assume session_id is unique for plans in this context.
    
    let plan;
    const existingPlans = await db.select().from(plansTable).where(eq(plansTable.sessionId, sessionId)).limit(1);
    
    const summary = {
      domainCount: plans.length,
      totalSubdomains: plans.reduce((acc, p) => acc + p.subdomainCount, 0),
      totalInboxes: plans.reduce((acc, p) => acc + p.totalInboxes, 0),
    };

    if (existingPlans.length > 0) {
      plan = existingPlans[0];
      await db.update(plansTable)
        .set({ 
          summary: JSON.stringify(summary)
        })
        .where(eq(plansTable.id, plan.id));
    } else {
      const inserted = await db.insert(plansTable).values({
        sessionId,
        userId,
        summary: JSON.stringify(summary),
      }).returning();
      plan = inserted[0];
    }

    // 2. Clear existing plan domains
    await db.delete(planDomains).where(eq(planDomains.planId, plan.id));

    // 3. Insert new domains and subdomains
    for (const p of plans) {
      const [domain] = await db.insert(planDomains).values({
        planId: plan.id,
        domain: p.domain,
        ip: p.ip,
        vpsProvider: p.vpsProvider,
        totalInboxes: p.totalInboxes
      }).returning();

      const subdomainsData = p.subdomains.map(s => ({
        domainId: domain.id,
        subdomain: s.prefix,
        fullSubdomain: s.fullSubdomain,
        inboxCount: s.inboxCount
      }));

      if (subdomainsData.length > 0) {
        await db.insert(planSubdomains).values(subdomainsData);
      }
    }

    return NextResponse.json({ success: true, planId: plan.id });
  } catch (error) {
    console.error('Plan save error:', error);
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
