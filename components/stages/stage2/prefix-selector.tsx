'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { SubdomainPrefix } from '@/types'
import { Check, X, Plus, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrefixSelectorProps {
  selectedPrefixes: string[]
  onChange: (prefixes: string[]) => void
}

export function PrefixSelector({ selectedPrefixes, onChange }: PrefixSelectorProps) {
  const [bank, setBank] = useState<SubdomainPrefix[]>([])
  const [mode, setMode] = useState<'bank' | 'custom'>('bank')
  const [customText, setCustomText] = useState('')

  useEffect(() => {
    async function fetchBank() {
      try {
        const res = await fetch('/api/prefixes')
        if (res.ok) {
          const data = await res.json()
          setBank(data.prefixes || [])
        }
      } catch (error) {
        console.error('Error fetching prefixes:', error)
      }
    }
    fetchBank()
  }, [])

  const togglePrefix = (prefix: string) => {
    if (selectedPrefixes.includes(prefix)) {
      onChange(selectedPrefixes.filter(p => p !== prefix))
    } else {
      onChange([...selectedPrefixes, prefix])
    }
  }

  const handleCustomApply = () => {
    const newPrefixes = customText
      .split(/[\n,]/)
      .map(p => p.trim().toLowerCase())
      .filter(p => p.length > 0)
    
    onChange(Array.from(new Set([...selectedPrefixes, ...newPrefixes])))
    setCustomText('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Subdomain Prefix Pool</h3>
          <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900/50">
            {selectedPrefixes.length} Selected
          </Badge>
        </div>
        <ToggleGroup value={[mode]} onValueChange={(v: string[]) => { if (v.length > 0) setMode(v[0] as 'bank' | 'custom') }} className="bg-slate-800 border border-slate-700 p-1 rounded-lg">
          <ToggleGroupItem value="bank" className="text-xs px-3 data-[state=on]:bg-slate-700 data-[state=on]:text-white">Preset Bank</ToggleGroupItem>
          <ToggleGroupItem value="custom" className="text-xs px-3 data-[state=on]:bg-slate-700 data-[state=on]:text-white">Custom List</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {mode === 'bank' ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
          <div className="flex flex-wrap gap-2">
            {bank.map((p) => (
              <Badge
                key={p.id}
                variant={selectedPrefixes.includes(p.prefix) ? 'default' : 'outline'}
                onClick={() => togglePrefix(p.prefix)}
                className={cn(
                  "cursor-pointer px-3 py-1 transition-all",
                  selectedPrefixes.includes(p.prefix) 
                    ? "bg-blue-600 hover:bg-blue-500" 
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                )}
              >
                {p.prefix}
                {selectedPrefixes.includes(p.prefix) ? <Check className="ml-1.5 h-3 w-3" /> : <Plus className="ml-1.5 h-3 w-3 opacity-50" />}
              </Badge>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onChange(bank.map(p => p.prefix))} className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20">
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange([])} className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20">
              Clear All
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Textarea 
            placeholder="Enter prefixes separated by commas or new lines..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-100 min-h-[100px]"
          />
          <Button onClick={handleCustomApply} disabled={!customText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            Add to Pool
          </Button>
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-blue-900/10 border border-blue-900/30 p-3 text-xs text-blue-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Your plan will randomly select from this pool for each domain. Ensure you have enough prefixes selected to cover your maximum subdomain count.</p>
      </div>
    </div>
  )
}
