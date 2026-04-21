import { redirect } from 'next/navigation'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { AppShell } from '@/components/layout/app-shell'
import { getDb } from '@/db'
import { users, authSessions, sessions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify session from cookie
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('nxt_session')?.value

  if (!sessionToken) {
    redirect('/login')
  }

  const { env } = getRequestContext()
  const db = getDb(env)

  // Look up session and user
  const [authSession] = await db.select()
    .from(authSessions)
    .where(eq(authSessions.token, sessionToken))
    .limit(1)

  if (!authSession || new Date(authSession.expiresAt) < new Date()) {
    redirect('/login')
  }

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, authSession.userId))
    .limit(1)

  if (!user) {
    redirect('/login')
  }

  // Fetch current app session to determine completed stages
  const [appSession] = await db.select()
    .from(sessions)
    .where(eq(sessions.userId, user.id))
    .limit(1)

  const parsedPayload = appSession?.payload ? JSON.parse(appSession.payload as string) : {}
  const completedStages = parsedPayload.completedStages || []
  const currentStage = appSession?.stage || 1

  return (
    <AppShell 
      userEmail={user.email} 
      currentStage={currentStage} 
      completedStages={completedStages}
    >
      {children}
    </AppShell>
  )
}
