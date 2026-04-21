'use client'

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DNSPreview } from '@/components/stages/stage3/dns-preview'
import { CFConfig } from '@/components/stages/stage3/cf-config'
import { PushProgress } from '@/components/stages/stage3/push-progress'
import { useSession } from '@/hooks/useSession'
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs'
import { generateDNSRecords } from '@/lib/dns-generator'
import { DNSRecord, PlanDomain, PlanSubdomain } from '@/types'
import { ChevronRight, ChevronLeft, Save, Loader2, CloudIcon, Send } from 'lucide-react'
import { toast } from 'sonner'

interface DomainWithSubdomains extends PlanDomain {
  plan_subdomains: PlanSubdomain[]
}

export default function Stage3Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [planDomains, setPlanDomains] = useState<DomainWithSubdomains[]>([])
  const [allRecords, setAllRecords] = useState<Partial<DNSRecord>[]>([])
  const [cfAccountId, setCfAccountId] = useState<string | null>(null)
  const [overwrite, setOverwrite] = useState(false)
  const [isPushing, setIsPushing] = useState(false)
  const [planId, setPlanId] = useState<string | null>(null)
  
  const { jobs, dnsRecords } = useRealtimeJobs(planId || undefined)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    async function loadPlanData() {
      if (!session?.id) return

      try {
        const res = await fetch(`/api/plan-details?sessionId=${session.id}`)
        if (!res.ok) return
        const data = await res.json()

        if (!data.plan) return
        setPlanId(data.plan.id)

        if (data.domains) {
          const domains = data.domains.map((d: DomainWithSubdomains) => ({
            ...d,
            plan_subdomains: d.plan_subdomains || []
          }))
          setPlanDomains(domains)
          
          const generated: Partial<DNSRecord>[] = []
          domains.forEach((d: DomainWithSubdomains) => {
            const subs = d.plan_subdomains.map(s => ({ id: s.id, subdomain: s.subdomain, fullSubdomain: s.full_subdomain }))
            const domainRecords = generateDNSRecords(d.id, d.domain, d.ip, subs)
            generated.push(...domainRecords)
          })
          setAllRecords(generated)
        }
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
    if (!initialized.current && session?.payload?.stage3?.cfAccountId) {
      setCfAccountId(session.payload.stage3.cfAccountId)
    }
    if (!initialized.current && session?.payload?.stage3?.overwrite !== undefined) {
      setOverwrite(session.payload.stage3.overwrite)
    }
  }, [session])

  const handleStartPush = async () => {
    if (!cfAccountId) {
      toast.error('Please select a Cloudflare account.')
      return
    }

    setIsPushing(true)
    try {
      // 1. Save all pending records to the dns_records table via API
      const nonDkimRecords = allRecords.filter(r => !r.is_dkim)
      const saveRes = await fetch('/api/dns-records/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: nonDkimRecords.map(r => ({
            domain_id: r.domain_id,
            subdomain_id: r.subdomain_id,
            record_name: r.record_name,
            record_type: r.record_type,
            record_content: r.record_content,
            status: 'pending',
            is_dkim: false
          }))
        })
      })

      if (!saveRes.ok) throw new Error('Failed to save DNS records')

      // 2. Trigger the API to start processing jobs
      const res = await fetch('/api/dns/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId, 
          cfAccountId, 
          overwrite 
        })
      })

      if (!res.ok) throw new Error('Failed to start Cloudflare push')
      
      toast.success('Cloudflare deployment started!')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Push failed'
      toast.error(err)
      setIsPushing(false)
    }
  }

  const handleNext = async () => {
    const totalJobs = planDomains.length
    const completedJobs = jobs.filter(j => j.status === 'done' && j.job_type === 'dns_push').length
    
    if (completedJobs < totalJobs && !confirm('Some domains are not finished yet. Proceed anyway?')) {
      return
    }

    try {
      const payload = {
        ...session?.payload,
        stage3: { cfAccountId, overwrite },
        completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 3]))
      }
      await updateSession(4, payload)
      router.push('/stage/4')
    } catch (error) {
      // error handled in hook
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
          <h1 className="text-3xl font-bold text-slate-100">DNS & Cloudflare</h1>
          <p className="text-slate-400 mt-1">Generate records and push them to Cloudflare zones.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/stage/2')}
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
        <div className="lg:col-span-2 space-y-6">
          {isPushing || (jobs.length > 0) ? (
            <PushProgress 
              jobs={jobs.filter(j => j.job_type === 'dns_push')} 
              dnsRecords={dnsRecords} 
              domains={planDomains.map(d => ({ id: d.id, domain: d.domain }))} 
            />
          ) : (
            <DNSPreview 
              records={allRecords} 
              domains={planDomains.map(d => ({ id: d.id, domain: d.domain }))} 
            />
          )}
        </div>

        <div className="space-y-6">
          <CFConfig 
            selectedAccountId={cfAccountId} 
            onAccountSelect={setCfAccountId} 
            overwriteExisting={overwrite}
            onOverwriteToggle={setOverwrite}
          />

          <Button 
            onClick={handleStartPush}
            disabled={isPushing || !cfAccountId}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {isPushing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CloudIcon className="mr-2 h-5 w-5" />}
            Deploy to Cloudflare
          </Button>
          
          <p className="text-[11px] text-center text-slate-500 px-4">
            This will create/update up to {allRecords.length} DNS records across {planDomains.length} zones. 
            DKIM records are deferred to Stage 6.
          </p>
        </div>
      </div>
    </div>
  )
}
