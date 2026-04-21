import { getRequestContext } from '@cloudflare/next-on-pages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Clock, History, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDb } from '@/db';
import { users, authSessions, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('nxt_session')?.value

  const { env } = getRequestContext();
  const db = getDb(env);
  
  // Get authenticated user
  let userId = ''
  if (sessionToken) {
    const [authSession] = await db.select()
      .from(authSessions)
      .where(eq(authSessions.token, sessionToken))
      .limit(1)
    if (authSession) {
      userId = authSession.userId
    }
  }

  const [session] = await db.select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .limit(1);

  // Parse payload if it exists
  const parsedPayload = session?.payload ? JSON.parse(session.payload as string) : {};

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage and scale your cold email infrastructure.</p>
        </div>
        <Link href="/stage/1">
          <Button size="lg" className="h-12 px-8 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            <Plus className="mr-2 h-5 w-5" /> Create New Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {session ? (
          <Card className="lg:col-span-2 border-border/50 shadow-xl shadow-black/5 relative overflow-hidden group bg-card">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <Rocket className="h-48 w-48 text-primary" />
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-primary mb-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Session</span>
              </div>
              <CardTitle className="text-3xl font-bold">Resume Forge Process</CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                You were at Stage {session.stage}: <span className="text-foreground font-semibold">{getStageName(session.stage || 1)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Overall Completion</span>
                  <span className="text-foreground">{Math.round(((session.stage || 1) / 6) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                    style={{ width: `${((session.stage || 1) / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
              <Link href={`/stage/${session.stage}`} className="block">
                <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90">
                  Continue Setup <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 border-border/50 border-dashed bg-muted/20 flex flex-col items-center justify-center py-16 text-center space-y-6">
            <div className="rounded-full bg-card shadow-sm h-20 w-20 flex items-center justify-center text-muted-foreground/40">
              <Rocket className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">No Active Sessions</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">Start a new infrastructure planning session to begin building your SMTP network.</p>
            </div>
            <Link href="/stage/1">
              <Button variant="outline" size="lg" className="border-border hover:bg-card shadow-sm">
                Initialize Session
              </Button>
            </Link>
          </Card>
        )}

        <Card className="border-border/50 shadow-xl shadow-black/5 bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <History className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Recent Activity</span>
            </div>
            <CardTitle className="text-xl">History</CardTitle>
            <CardDescription>Your historical deployments.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
               <Clock className="h-8 w-8 text-muted/30" />
               <p className="text-muted-foreground italic text-sm">No completed plans found yet.</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStageName(stage: number) {
  const names = [
    '',
    'Domain & IP Input',
    'Subdomain & Inbox Planning',
    'DNS & Cloudflare',
    'Mailbox Name Generation',
    'VPS Mailbox Creation',
    'DKIM & Summary'
  ]
  return names[stage] || 'Unknown'
}
