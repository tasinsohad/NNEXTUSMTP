'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DKIMList } from '@/components/stages/stage6/dkim-list'
import { FinalSummary } from '@/components/stages/stage6/final-summary'
import { useSession } from '@/hooks/useSession'
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs'
import { DNSRecord, PlanDomain, PlanSubdomain, Mailbox } from '@/types'
import { 
  ChevronLeft, 
  Save, 
  Loader2, 
  Key,
  ShieldAlert,
  Zap,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

export default function Stage6Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [isForged, setIsForged] = useState(false)
  const [isInjecting, setIsInjecting] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  const [stats, setStats] = useState({ domains: 0, subdomains: 0, mailboxes: 0, dnsRecords: 0 })
  
  const { jobs, dnsRecords, mailboxes } = useRealtimeJobs(planId || undefined)
  const router = useRouter()

  const dkimRecords = dnsRecords.filter(r => r.is_dkim)

  useEffect(() => {
    async function loadPlanData() {
      if (!session?.id) return

      try {
        // Get plan details
        const planRes = await fetch(`/api/plan-details?sessionId=${session.id}`)
        if (!planRes.ok) return
        const planData = await planRes.json()

        if (!planData.plan) return
        setPlanId(planData.plan.id)

        // Get full plan data (jobs, mailboxes, dns records)
        const dataRes = await fetch(`/api/plan-data?planId=${planData.plan.id}`)
        if (dataRes.ok) {
          const fullData = await dataRes.json()

          const domains = planData.domains || []
          const subdomains = domains.reduce((acc: number, d: PlanDomain & { plan_subdomains?: PlanSubdomain[] }) => acc + (d.plan_subdomains?.length || 0), 0)
          const totalMailboxes = fullData.mailboxes?.length || 0
          const totalDnsRecords = fullData.dnsRecords?.length || 0

          setStats({
            domains: domains.length,
            subdomains,
            mailboxes: totalMailboxes,
            dnsRecords: totalDnsRecords
          })
        }
      } catch (error) {
        console.error('Error loading plan data:', error)
      }
    }

    if (session) loadPlanData()
  }, [session])

  const handleFetchDKIM = async () => {
    setIsInjecting(true)
    try {
      const res = await fetch('/api/dkim/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      if (!res.ok) throw new Error('Failed to fetch DKIM keys')
      toast.success('DKIM keys retrieved successfully!')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to fetch DKIM keys'
      toast.error(err)
    } finally {
      setIsInjecting(false)
    }
  }

  const handleInjectDKIM = async () => {
    setIsInjecting(true)
    try {
      const res = await fetch('/api/dkim/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      if (!res.ok) throw new Error('Failed to inject DKIM records')
      toast.success('DKIM records injected into Cloudflare!')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to inject DKIM records'
      toast.error(err)
    } finally {
      setIsInjecting(false)
    }
  }

  const handleFinish = async () => {
    setIsForged(true)
    // Update session to completed
    const payload = {
      ...session?.payload,
      completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 6])),
      isFinished: true
    }
    await updateSession(6, payload)
  }

  if (sessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (isForged) {
    return <FinalSummary stats={stats} />
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">DKIM & Final Summary</h1>
          <p className="text-slate-400 mt-1">Retrieve generated DKIM keys from VPS and inject them into Cloudflare.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/stage/5')}
            className="text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleFinish} 
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
          >
            Finish Setup <CheckCircle2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <DKIMList 
            records={dkimRecords} 
            onFetchOne={(id) => {}} 
            isFetching={isInjecting}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Automated Actions
            </h3>
            
            <Button 
              onClick={handleFetchDKIM}
              disabled={isInjecting}
              className="w-full h-11 bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              {isInjecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
              Fetch DKIM Keys from VPS
            </Button>

            <Button 
              onClick={handleInjectDKIM}
              disabled={isInjecting || dkimRecords.every(r => r.record_content.includes('PENDING'))}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isInjecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              Inject DKIM to Cloudflare
            </Button>
            
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Keys are fetched from each domain&apos;s designated VPS. These are then added as TXT records to your Cloudflare zones.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
