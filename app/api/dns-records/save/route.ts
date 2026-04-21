import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { dnsRecords } from '@/db/schema';
import { getAuthUser, isAuthError } from '@/lib/api-auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const authResult = await getAuthUser(req);
    if (isAuthError(authResult)) return authResult;

    const { records } = await req.json() as {
      records: {
        domain_id: string;
        subdomain_id?: string;
        record_name: string;
        record_type: string;
        record_content: string;
        status: string;
        is_dkim: boolean;
      }[]
    };

    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = getDb(env);

    const values = records.map(r => ({
      domainId: r.domain_id,
      subdomainId: r.subdomain_id || null,
      recordName: r.record_name,
      recordType: r.record_type,
      recordContent: r.record_content,
      status: r.status || 'pending',
      isDkim: r.is_dkim || false,
    }));

    await db.insert(dnsRecords).values(values);

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    const err = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
