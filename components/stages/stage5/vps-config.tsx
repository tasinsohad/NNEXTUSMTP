'use client'

import { useState, useEffect } from 'react'
import { VPSConfig as VPSConfigType } from '@/types'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Server, Activity, ShieldCheck } from 'lucide-react'

interface VPSConfigProps {
  onConfigChange: (configs: Record<string, string>) => void
  domainEntries: { id: string, domain: string, vpsProvider: string }[]
}

export function VPSConfig({ onConfigChange, domainEntries }: VPSConfigProps) {
  const [configs, setConfigs] = useState<VPSConfigType[]>([])
  const [selectedMapping, setSelectedMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchConfigs() {
      try {
        const res = await fetch('/api/vps-configs')
        if (res.ok) {
          const data = await res.json()
          setConfigs(data.configs || [])
        }
      } catch (error) {
        console.error('Error fetching VPS configs:', error)
      }
    }
    fetchConfigs()
  }, [])

  const handleSelect = (domainId: string, configId: string) => {
    const newMapping = { ...selectedMapping, [domainId]: configId }
    setSelectedMapping(newMapping)
    onConfigChange(newMapping)
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-400" />
          VPS API Connections
        </CardTitle>
        <CardDescription className="text-slate-400">Map each domain to a specific VPS server API.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {domainEntries.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">{d.domain}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{d.vpsProvider}</p>
            </div>
            <div className="flex items-center gap-2 w-2/3">
              <Select 
                value={selectedMapping[d.id] || undefined} 
                onValueChange={(v) => handleSelect(d.id, v ?? '')}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100 text-xs h-8">
                  <SelectValue placeholder="Select VPS Config..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                  {configs.map(cfg => (
                    <SelectItem key={cfg.id} value={cfg.id}>{cfg.label} ({cfg.ip})</SelectItem>
                  ))}
                  {configs.length === 0 && <SelectItem disabled value="none">No VPS saved</SelectItem>}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-400">
                <Activity className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex items-start gap-3 p-3 mt-4 rounded-lg bg-blue-900/10 border border-blue-900/30">
          <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-400/80 leading-relaxed">
            Ensure the VPS API is reachable and the API Key has permissions to create users and retrieve DKIM keys.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
