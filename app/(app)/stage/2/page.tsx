'use client'

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RangeControls, RangeSettings } from '@/components/stages/stage2/range-controls'
import { PrefixSelector } from '@/components/stages/stage2/prefix-selector'
import { PlanTable } from '@/components/stages/stage2/plan-table'
import { useSession } from '@/hooks/useSession'
import { generatePlan, DomainPlan } from '@/lib/planner'
import { ChevronRight, ChevronLeft, Save, Loader2, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { DomainEntry } from '@/types'

export default function Stage2Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [plans, setPlans] = useState<DomainPlan[]>([])
  const [settings, setSettings] = useState<RangeSettings>({
    minSubdomains: 6,
    maxSubdomains: 10,
    minInboxes: 24,
    maxInboxes: 40
  })
  const [selectedPrefixes, setSelectedPrefixes] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      if (session?.payload?.stage2?.plans) {
        setPlans(session.payload.stage2.plans)
      }
      if (session?.payload?.stage2?.settings) {
        setSettings(session.payload.stage2.settings)
      }
      if (session?.payload?.stage2?.selectedPrefixes) {
        setSelectedPrefixes(session.payload.stage2.selectedPrefixes)
      }
      initialized.current = true
    }
  }, [session])

  const handleGenerateAll = () => {
    const domainEntries = session?.payload?.stage1?.entries || []
    if (domainEntries.length === 0) {
      toast.error('No domains found. Please go back to Stage 1.')
      return
    }

    if (selectedPrefixes.length < settings.maxSubdomains) {
      toast.error(`Not enough prefixes selected. Need at least ${settings.maxSubdomains}.`)
      return
    }

    const newPlans = domainEntries.map((e: DomainEntry) => 
      generatePlan(
        e.domain, 
        e.ip, 
        e.vpsProvider || '', 
        settings.minSubdomains, 
        settings.maxSubdomains, 
        settings.minInboxes, 
        settings.maxInboxes, 
        selectedPrefixes
      )
    )
    setPlans(newPlans)
    toast.success(`Generated plan for ${newPlans.length} domains.`)
  }

  const handleReRandomizeDomain = (domain: string) => {
    const entry = session?.payload?.stage1?.entries.find((e: DomainEntry) => e.domain === domain)
    if (!entry) return

    const newPlan = generatePlan(
      entry.domain, 
      entry.ip, 
      entry.vpsProvider, 
      settings.minSubdomains, 
      settings.maxSubdomains, 
      settings.minInboxes, 
      settings.maxInboxes, 
      selectedPrefixes
    )

    setPlans(plans.map(p => p.domain === domain ? newPlan : p))
  }

  const handleNext = async () => {
    if (plans.length === 0) {
      toast.error('Please generate a plan first.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...session?.payload,
        stage2: { plans, settings, selectedPrefixes },
        completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 2]))
      }
      await updateSession(3, payload)
      
      // Also save the plan to the plans/plan_domains/plan_subdomains tables via API
      const res = await fetch('/api/plans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: session?.id,
          plans 
        })
      })
      
      if (!res.ok) throw new Error('Failed to save official plan')
      
      router.push('/stage/3')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to proceed'
      toast.error(err)
    } finally {
      setSaving(false)
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
          <h1 className="text-3xl font-bold text-slate-100">Subdomain & Inbox Planning</h1>
          <p className="text-slate-400 mt-1">Configure how many subdomains and mailboxes you want per domain.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/stage/1')}
            className="text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => updateSession(2, { ...session?.payload, stage2: { plans, settings, selectedPrefixes } })}
            disabled={saving}
            className="text-slate-400 hover:text-slate-100"
          >
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={saving || plans.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next Stage <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <RangeControls 
        settings={settings} 
        onChange={setSettings} 
        onApplyAll={handleGenerateAll} 
      />

      <PrefixSelector 
        selectedPrefixes={selectedPrefixes} 
        onChange={setSelectedPrefixes} 
      />

      {plans.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Infrastructure Plan Preview</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGenerateAll}
              className="border-slate-700 text-slate-300 hover:bg-slate-700"
            >
              <Wand2 className="mr-2 h-4 w-4" /> Re-randomize All
            </Button>
          </div>
          <PlanTable 
            plans={plans} 
            onUpdate={setPlans} 
            onReRandomize={handleReRandomizeDomain} 
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/20 p-12 text-center">
          <Wand2 className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-300">Ready to Generate Plan</h3>
          <p className="text-sm text-slate-500 mt-2 mb-6">Select your prefix pool and click &quot;Apply &amp; Randomize&quot; above to create your infrastructure layout.</p>
        </div>
      )}
    </div>
  )
}
