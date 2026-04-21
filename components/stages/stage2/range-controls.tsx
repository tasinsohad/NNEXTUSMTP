'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export interface RangeSettings {
  minSubdomains: number
  maxSubdomains: number
  minInboxes: number
  maxInboxes: number
}

interface RangeControlsProps {
  settings: RangeSettings
  onChange: (settings: RangeSettings) => void
  onApplyAll: () => void
}

export function RangeControls({ settings, onChange, onApplyAll }: RangeControlsProps) {
  const updateSetting = (field: keyof RangeSettings, value: string) => {
    const num = parseInt(value) || 0
    onChange({ ...settings, [field]: num })
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          Global Planning Ranges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Subdomains / Domain</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={settings.minSubdomains}
                onChange={(e) => updateSetting('minSubdomains', e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100" 
                placeholder="Min"
              />
              <span className="text-slate-600">-</span>
              <Input 
                type="number" 
                value={settings.maxSubdomains}
                onChange={(e) => updateSetting('maxSubdomains', e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100" 
                placeholder="Max"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Inboxes / Domain</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                value={settings.minInboxes}
                onChange={(e) => updateSetting('minInboxes', e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100" 
                placeholder="Min"
              />
              <span className="text-slate-600">-</span>
              <Input 
                type="number" 
                value={settings.maxInboxes}
                onChange={(e) => updateSetting('maxInboxes', e.target.value)}
                className="bg-slate-900 border-slate-700 text-slate-100" 
                placeholder="Max"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={onApplyAll}
              className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Apply & Randomize
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
