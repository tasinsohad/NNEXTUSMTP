'use client'

export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { NameSource } from '@/components/stages/stage4/name-source'
import { MailboxTable } from '@/components/stages/stage4/mailbox-table'
import { useSession } from '@/hooks/useSession'
import { generateMailboxes, MailboxData } from '@/lib/mailbox-generator'
import { exportToCSV } from '@/lib/csv-export'
import { PlanDomain, PlanSubdomain } from '@/types'
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Loader2, 
  RefreshCw, 
  Download,
  Copy,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface DomainWithSubdomains extends PlanDomain {
  plan_subdomains: PlanSubdomain[]
}

export default function Stage4Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [planDomains, setPlanDomains] = useState<DomainWithSubdomains[]>([])
  const [subdomainMailboxes, setSubdomainMailboxes] = useState<Record<string, MailboxData[]>>({})
  const [availableNames, setAvailableNames] = useState<{ first_name: string, full_name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    async function loadPlanData() {
      if (!session?.id) return

      try {
        const res = await fetch(`/api/plan-details?sessionId=${session.id}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.domains) {
          const domains = data.domains.map((d: DomainWithSubdomains) => ({
            ...d,
            plan_subdomains: d.plan_subdomains || []
          }))
          setPlanDomains(domains)
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
    if (!initialized.current && session?.payload?.stage4?.subdomainMailboxes) {
      setSubdomainMailboxes(session.payload.stage4.subdomainMailboxes)
      initialized.current = true
    }
  }, [session])

  const handleGenerateAll = () => {
    if (availableNames.length === 0) {
      toast.error('Please select a name source first.')
      return
    }

    const newMailboxes: Record<string, MailboxData[]> = {}
    planDomains.forEach(domain => {
      domain.plan_subdomains.forEach(sub => {
        newMailboxes[sub.id] = generateMailboxes(
          sub.full_subdomain, 
          domain.domain, 
          sub.inbox_count, 
          availableNames
        )
      })
    })

    setSubdomainMailboxes(newMailboxes)
    toast.success(`Generated ${Object.values(newMailboxes).flat().length} mailboxes.`)
  }

  const handleExport = () => {
    const exportData: Record<string, string>[] = []
    for (const domain of planDomains) {
      for (const sub of domain.plan_subdomains) {
        const mailboxes = subdomainMailboxes[sub.id] || []
        mailboxes.forEach(m => {
          exportData.push({
            domain: domain.domain,
            subdomain: sub.subdomain,
            full_subdomain: sub.full_subdomain,
            email: m.email,
            password: m.password,
            first_name: m.firstName,
            full_name: m.fullName,
            ip: domain.ip,
            vps_provider: domain.vps_provider ?? ''
          })
        })
      }
    }
    exportToCSV(exportData, `NXT_Infrastructure_Mailboxes_${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleNext = async () => {
    if (Object.keys(subdomainMailboxes).length === 0) {
      toast.error('Please generate mailboxes first.')
      return
    }

    setSaving(true)
    try {
      // 1. Save mailboxes to the database via API
      const allMailboxesToSave = []
      for (const [subdomainId, mailboxes] of Object.entries(subdomainMailboxes)) {
        allMailboxesToSave.push(...mailboxes.map(m => ({
          subdomain_id: subdomainId,
          email: m.email,
          first_name: m.firstName,
          full_name: m.fullName,
          password: m.password,
          status: 'pending'
        })))
      }

      const saveRes = await fetch('/api/mailboxes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mailboxes: allMailboxesToSave })
      })

      if (!saveRes.ok) {
        const err = await saveRes.json()
        throw new Error(err.error || 'Failed to save mailboxes')
      }

      const payload = {
        ...session?.payload,
        stage4: { subdomainMailboxes },
        completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 4]))
      }
      await updateSession(5, payload)
      router.push('/stage/5')
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to save mailboxes'
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
          <h1 className="text-3xl font-bold text-slate-100">Mailbox Name Generation</h1>
          <p className="text-slate-400 mt-1">Generate unique email addresses and secure passwords for every subdomain.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/stage/3')}
            className="text-slate-400 hover:text-slate-100"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={saving || Object.keys(subdomainMailboxes).length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next Stage <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <NameSource onNamesSelected={setAvailableNames} />
          
          <Button 
            onClick={handleGenerateAll}
            disabled={availableNames.length === 0}
            className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Regenerate Names
          </Button>

          {Object.keys(subdomainMailboxes).length > 0 && (
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleExport}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Download className="mr-2 h-4 w-4" /> Export to CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  const allPasswords = Object.values(subdomainMailboxes).flat().map(m => `${m.email}: ${m.password}`).join('\n')
                  navigator.clipboard.writeText(allPasswords)
                  toast.success('All passwords copied to clipboard')
                }}
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy All Passwords
              </Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {planDomains.map((domain) => (
            <div key={domain.id} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{domain.domain}</span>
                <div className="h-px flex-1 bg-slate-800"></div>
              </div>
              <div className="grid gap-4">
                {domain.plan_subdomains.map((sub) => (
                  <MailboxTable 
                    key={sub.id} 
                    subdomain={sub.full_subdomain} 
                    mailboxes={subdomainMailboxes[sub.id] || []} 
                  />
                ))}
              </div>
            </div>
          ))}

          {Object.keys(subdomainMailboxes).length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/20 p-24 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No Mailboxes Generated</h3>
              <p className="text-sm text-slate-500 mt-2">Pick a name source and click &quot;Regenerate Names&quot; to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
