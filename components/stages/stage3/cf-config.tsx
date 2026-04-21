'use client'

import { useState, useEffect } from 'react'
import { CloudflareAccount } from '@/types'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Plus, Settings2, ShieldCheck, AlertCircle } from 'lucide-react'

interface CFConfigProps {
  selectedAccountId: string | null
  onAccountSelect: (id: string) => void
  overwriteExisting: boolean
  onOverwriteToggle: (val: boolean) => void
}

export function CFConfig({ 
  selectedAccountId, 
  onAccountSelect, 
  overwriteExisting, 
  onOverwriteToggle 
}: CFConfigProps) {
  const [accounts, setAccounts] = useState<CloudflareAccount[]>([])

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const res = await fetch('/api/cloudflare-accounts')
        if (res.ok) {
          const data = await res.json()
          setAccounts(data.accounts || [])
        }
      } catch (error) {
        console.error('Error fetching Cloudflare accounts:', error)
      }
    }
    fetchAccounts()
  }, [])

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-blue-400" />
          Cloudflare Configuration
        </CardTitle>
        <CardDescription className="text-slate-400">Select the account and push behavior.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-300">Cloudflare Account</Label>
          <div className="flex gap-2">
            <Select value={selectedAccountId || undefined} onValueChange={(v) => onAccountSelect(v ?? '')}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-100 flex-1">
                <SelectValue placeholder="Select an account..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.label}</SelectItem>
                ))}
                {accounts.length === 0 && <SelectItem disabled value="none">No accounts saved</SelectItem>}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-700">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-900/50 p-4 border border-slate-700">
          <div className="space-y-0.5">
            <Label className="text-slate-200 flex items-center gap-2">
              Overwrite Existing Records
              <AlertCircle className="h-3 w-3 text-slate-500" />
            </Label>
            <p className="text-xs text-slate-500">If enabled, existing records with the same name/type will be updated.</p>
          </div>
          <Switch 
            checked={overwriteExisting} 
            onCheckedChange={onOverwriteToggle} 
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-900/10 border border-blue-900/30">
          <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Cloudflare API Token Requirements</p>
            <p className="text-[11px] text-blue-400/80 leading-relaxed">
              Ensure your API token has <span className="text-blue-200">Zone:Read</span> and <span className="text-blue-200">DNS:Edit</span> permissions for all zones.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
