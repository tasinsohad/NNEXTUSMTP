'use client'

import { Job, DNSRecord } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Search, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PushProgressProps {
  jobs: Job[]
  dnsRecords: DNSRecord[]
  domains: { id: string, domain: string }[]
}

export function PushProgress({ jobs, dnsRecords, domains }: PushProgressProps) {
  const totalDomains = domains.length
  const completedJobs = jobs.filter(j => j.status === 'done').length
  const progressPercent = totalDomains > 0 ? (completedJobs / totalDomains) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Deployment Progress
                {progressPercent === 100 ? (
                  <Badge className="bg-green-900/30 text-green-400 border-green-900/50 ml-2">Complete</Badge>
                ) : (
                  <Badge className="bg-blue-900/30 text-blue-400 border-blue-900/50 ml-2">In Progress</Badge>
                )}
              </h3>
              <p className="text-sm text-slate-400">Pushed {completedJobs} of {totalDomains} domains to Cloudflare</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-500">{Math.round(progressPercent)}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 bg-slate-900" />
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {domains.map((d) => {
          const job = jobs.find(j => j.entity_id === d.id && j.job_type === 'dns_push')
          const domainRecords = dnsRecords.filter(r => r.domain_id === d.id && !r.is_dkim)
          const createdCount = domainRecords.filter(r => r.status === 'created').length
          const skippedCount = domainRecords.filter(r => r.status === 'skipped').length
          const failedCount = domainRecords.filter(r => r.status === 'failed').length
          
          return (
            <div key={d.id} className="flex items-center justify-between rounded-lg bg-slate-800/30 border border-slate-700 p-3">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/50">
                  {job?.status === 'done' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  ) : job?.status === 'failed' ? (
                    <XCircle className="h-6 w-6 text-red-400" />
                  ) : job?.status === 'processing' ? (
                    <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                  ) : (
                    <Clock className="h-6 w-6 text-slate-600" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-200">{d.domain}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center text-[10px] text-slate-500 uppercase font-bold gap-1">
                      <Search className="h-3 w-3" /> Zone: {job?.result?.zone_id ? <span className="text-green-400">Found</span> : <span className="text-slate-600">Checking</span>}
                    </span>
                    <span className="flex items-center text-[10px] text-slate-500 uppercase font-bold gap-1">
                      <Zap className="h-3 w-3" /> Created: <span className="text-blue-400">{createdCount}</span>
                    </span>
                    {skippedCount > 0 && (
                      <span className="text-[10px] text-slate-500 uppercase font-bold">
                        Skipped: <span className="text-amber-500">{skippedCount}</span>
                      </span>
                    )}
                    {failedCount > 0 && (
                      <span className="text-[10px] text-slate-500 uppercase font-bold">
                        Failed: <span className="text-red-500">{failedCount}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                {job?.status === 'failed' && (
                   <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-900/50">
                     {job.error_message || 'Push failed'}
                   </Badge>
                )}
                {job?.status === 'done' && (
                   <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900/50">
                     Success
                   </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { Clock } from 'lucide-react'
