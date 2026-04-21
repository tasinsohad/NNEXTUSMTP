'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ManualEntry, DomainEntry } from '@/components/stages/stage1/manual-entry'
import { CSVUpload } from '@/components/stages/stage1/csv-upload'
import { DomainSummary } from '@/components/stages/stage1/domain-summary'
import { useSession } from '@/hooks/useSession'
import { ChevronRight, Save, Loader2, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { isValidDomain, isValidIPv4 } from '@/lib/validators'

export default function Stage1Page() {
  const { session, loading: sessionLoading, updateSession } = useSession()
  const [entries, setEntries] = useState<DomainEntry[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current && session?.payload?.stage1?.entries) {
      setEntries(session.payload.stage1.entries)
      initialized.current = true
    }
  }, [session])

  const handleNext = async () => {
    if (entries.length === 0) {
      toast.error('Please add at least one domain.')
      return
    }

    const invalid = entries.some(e => !isValidDomain(e.domain) || !isValidIPv4(e.ip))
    if (invalid) {
      toast.error('Please fix all errors in the table.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...session?.payload,
        stage1: { entries },
        completedStages: Array.from(new Set([...(session?.payload?.completedStages || []), 1]))
      }
      await updateSession(2, payload)
      router.push('/stage/2')
    } catch (error) {
      // toast shown in hook
    } finally {
      setSaving(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Stage 01</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Domain & IP Intake</h1>
          <p className="text-muted-foreground text-lg">Input your domains and target server IPs to begin the forge.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => updateSession(1, { ...session?.payload, stage1: { entries } })}
            disabled={saving}
            className="h-12 px-6 font-bold border-border hover:bg-muted/50 transition-all"
          >
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button 
            size="lg"
            onClick={handleNext} 
            disabled={saving || entries.length === 0}
            className="h-12 px-8 font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next Stage <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <DomainSummary entries={entries} />

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="bg-muted/50 border border-border p-1 w-full max-w-md justify-start h-12 mb-6 rounded-xl">
          <TabsTrigger value="manual" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg flex-1 font-bold">Manual Entry</TabsTrigger>
          <TabsTrigger value="csv" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg flex-1 font-bold">CSV Upload</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <ManualEntry entries={entries} onChange={setEntries} />
        </TabsContent>
        <TabsContent value="csv" className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
          <CSVUpload onUpload={(newEntries) => setEntries([...entries, ...newEntries])} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
