'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { VPSConfig } from '@/components/stages/stage5/vps-config'
import { CreationProgress } from '@/components/stages/stage5/creation-progress'
import { useSession } from '@/hooks/useSession'
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs'
import { PlanDomain, Mailbox } from '@/types'
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Loader2, 
  Server,
  Play
} from 'lucide-react'
import { toast } from 'sonner'

export default function Stage5Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [planDomains, setPlanDomains] = useState<PlanDomain[]>([])
  const [vpsMapping, setVpsMapping] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  
  const { jobs, mailboxes } = useRealtimeJobs(planId || undefined)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    async function loadPlanData() {
      if (!session?.id) return

      try {
        const res = await fetch(`/api/plan-details?sessionId=${session.id}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.plan) setPlanId(data.plan.id)
        if (data.domains) setPlanDomains(data.domains)
      } catch (error) {
        console.error('Error loading plan data:', error)
      }
    }

    if (session && !initialized.current) {
      loadPlanData()
      initialized.current = true
    }
  }, [session])

  useEffect(() => {
    if (!initialized.current && session?.payload?.stage5?.vpsMapping) {
      setVpsMapping(session.payload.stage5.vpsMapping)
      initialized.current = true
    }
  }, [session])

  const handleStartCreation = async () => {
    const missing = planDomains.some(d => !vpsMapping[d.id])
    if (missing) {
      toast.error('Please map all domains to a VPS configuration.')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/mailboxes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          vpsMapping 
        })
      })

      if (!res.ok) throw new Error('Failed to start mailbox creation')
      
      toast.success('Mailbox creation process started!')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Creation failed'
      toast.error(err)
      setIsCreating(false)
    }
  }

  const handleNext = async () => {
    const total = mailboxes.length
    const created = mailboxes.filter(m => m.status === 'created').length
    
    if (created < total && !confirm(`${total - created} mailboxes are not created yet. Proceed to DKIM injection?`)) {
      return
    }

    try {
      const payload = {
        ...session?.payload,
        stage5: { vpsMapping },
        completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 5]))
      }
      await updateSession(6, payload)
      router.push('/stage/6')
    } catch (error) {
      // handled
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">VPS Mailbox Creation</h1>
          <p className="text-slate-400 mt-1">Connect to your VPS servers and automate mailbox provisioning.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/stage/4')}
            className="text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            Next Stage <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <VPSConfig 
            domainEntries={planDomains.map(d => ({ id: d.id, domain: d.domain, vpsProvider: d.vps_provider ?? 'mailcow' }))} 
            onConfigChange={setVpsMapping}
          />

          <Button 
            onClick={handleStartCreation}
            disabled={isCreating || Object.keys(vpsMapping).length < planDomains.length}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
            Start Auto-Creation
          </Button>
          
          <p className="text-[11px] text-center text-slate-500 px-4">
            This will connect to {Object.keys(vpsMapping).length} servers and create {mailboxes.length} mailboxes.
            Progress is updated in real-time.
          </p>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <CreationProgress 
            jobs={jobs.filter(j => j.job_type === 'mailbox_create')} 
            mailboxes={mailboxes} 
          />
        </div>
      </div>
    </div>
  )
}
