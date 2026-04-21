'use client'

import { useState, useEffect } from 'react'
import { NameBankEntry } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, FileText, Info, Database } from 'lucide-react'

interface NameSourceProps {
  onNamesSelected: (names: { first_name: string, full_name: string }[]) => void
}

export function NameSource({ onNamesSelected }: NameSourceProps) {
  const [bank, setBank] = useState<NameBankEntry[]>([])
  const [mode, setMode] = useState<'bank' | 'custom'>('bank')
  const [customText, setCustomText] = useState('')

  useEffect(() => {
    async function fetchBank() {
      try {
        const res = await fetch('/api/name-bank')
        if (res.ok) {
          const data = await res.json()
          const names = data.names || []
          setBank(names)
          if (mode === 'bank') onNamesSelected(names)
        }
      } catch (error) {
        console.error('Error fetching name bank:', error)
      }
    }
    fetchBank()
  }, [])

  const handleCustomApply = () => {
    const lines = customText.split('\n').filter(l => l.trim().length > 0)
    const customNames = lines.map(line => {
      const parts = line.trim().split(/\s+/)
      return {
        first_name: parts[0],
        full_name: line.trim()
      }
    })
    onNamesSelected(customNames)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Name Source</h3>
        <ToggleGroup value={[mode]} onValueChange={(v: string[]) => { if (v.length > 0) setMode(v[0] as 'bank' | 'custom') }} className="bg-slate-800 border border-slate-700 p-1 rounded-lg">
          <ToggleGroupItem value="bank" className="text-xs px-3 data-[state=on]:bg-slate-700 data-[state=on]:text-white">
            <Database className="mr-2 h-3 w-3" /> Preset Bank
          </ToggleGroupItem>
          <ToggleGroupItem value="custom" className="text-xs px-3 data-[state=on]:bg-slate-700 data-[state=on]:text-white">
            <FileText className="mr-2 h-3 w-3" /> Custom List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === 'bank' ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-900/30 p-3">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Name bank contains</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-slate-100">{bank.length} entries</p>
                  <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900/50">Ready</Badge>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 opacity-40 h-8 overflow-hidden">
              {bank.slice(0, 10).map(b => (
                <span key={b.id} className="text-[10px] text-slate-500">{b.full_name} •</span>
              ))}
              <span className="text-[10px] text-slate-500">...and {bank.length - 10} more</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Textarea 
            placeholder="Enter names one per line (e.g., Alonza Reed)..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100 min-h-[120px]"
          />
          <Button onClick={handleCustomApply} disabled={!customText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Confirm Custom Names
          </Button>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-blue-900/10 border border-blue-900/30 p-3 text-xs text-blue-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Names are used without replacement within a subdomain. If the inbox count exceeds the pool size, numeric suffixes (e.g. Alonza2) will be added automatically.</p>
      </div>
    </div>
  )
}
