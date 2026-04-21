'use client'

import { Globe, Server, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DomainEntry } from './manual-entry'
import { getDuplicates } from '@/lib/validators'

interface DomainSummaryProps {
  entries: DomainEntry[]
}

export function DomainSummary({ entries }: DomainSummaryProps) {
  const uniqueDomains = new Set(entries.map(e => e.domain.toLowerCase().trim())).size
  const uniqueIps = new Set(entries.map(e => e.ip.trim())).size
  const duplicates = getDuplicates(entries.map(e => e.domain))

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Domains</p>
              <p className="text-2xl font-bold text-foreground">{entries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <Server className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique IPs</p>
              <p className="text-2xl font-bold text-foreground">{uniqueIps}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {duplicates.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-600">Duplicate Domains</p>
                <p className="text-2xl font-bold text-foreground">{duplicates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
