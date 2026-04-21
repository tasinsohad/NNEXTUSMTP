'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, BadgeAlert, CheckCircle2, Clock } from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DNSRecord } from '@/types'
import { cn } from '@/lib/utils'

interface DNSPreviewProps {
  records: Partial<DNSRecord>[]
  domains: { id: string, domain: string }[]
}

export function DNSPreview({ records, domains }: DNSPreviewProps) {
  const [expandedDomains, setExpandedDomains] = useState<string[]>(domains.map(d => d.id))

  const toggleExpand = (id: string) => {
    setExpandedDomains(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">DNS Records Preview</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setExpandedDomains(domains.map(d => d.id))} className="text-xs text-blue-400">Expand All</Button>
          <Button variant="ghost" size="sm" onClick={() => setExpandedDomains([])} className="text-xs text-slate-400">Collapse All</Button>
        </div>
      </div>

      <div className="space-y-4">
        {domains.map((d) => {
          const domainRecords = records.filter(r => r.domain_id === d.id)
          const isExpanded = expandedDomains.includes(d.id)

          return (
            <div key={d.id} className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden shadow-sm">
              <div 
                className="flex items-center justify-between px-4 py-3 bg-slate-900/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
                onClick={() => toggleExpand(d.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <span className="font-bold text-slate-100">{d.domain}</span>
                  <Badge variant="outline" className="text-[10px] bg-slate-800 border-slate-700 text-slate-400 uppercase">
                    {domainRecords.length} Records
                  </Badge>
                </div>
              </div>

              {isExpanded && (
                <Table>
                  <TableHeader className="bg-slate-950/20">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Name</TableHead>
                      <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Type</TableHead>
                      <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Content</TableHead>
                      <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domainRecords.map((r, i) => (
                      <TableRow key={i} className="border-slate-800 hover:bg-slate-800/30">
                        <TableCell className="py-2 text-xs font-mono text-slate-300">{r.record_name}</TableCell>
                        <TableCell className="py-2 text-xs">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold",
                            r.record_type === 'A' && "bg-blue-900/30 text-blue-400",
                            r.record_type === 'MX' && "bg-purple-900/30 text-purple-400",
                            r.record_type === 'TXT' && "bg-slate-700 text-slate-300",
                            r.record_type === 'CNAME' && "bg-amber-900/30 text-amber-400"
                          )}>
                            {r.record_type}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-slate-400 max-w-md truncate font-mono">
                          {r.record_content}
                        </TableCell>
                        <TableCell className="py-2">
                          {r.is_dkim ? (
                            <Badge variant="outline" className="bg-amber-900/20 text-amber-500 border-amber-900/50 text-[9px] uppercase gap-1">
                              <Clock className="h-3 w-3" /> Stage 6
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-900/50 text-slate-500 border-slate-800 text-[9px] uppercase">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
