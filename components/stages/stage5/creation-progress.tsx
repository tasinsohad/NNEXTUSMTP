'use client'

import { Job, Mailbox } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'

interface CreationProgressProps {
  jobs: Job[]
  mailboxes: Mailbox[]
}

export function CreationProgress({ jobs, mailboxes }: CreationProgressProps) {
  const totalInboxes = mailboxes.length
  const completedInboxes = mailboxes.filter(m => m.status === 'created').length
  const progressPercent = totalInboxes > 0 ? (completedInboxes / totalInboxes) * 100 : 0

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                Infrastructure Creation
                {progressPercent === 100 ? (
                  <Badge className="bg-green-900/30 text-green-400 border-green-900/50 ml-2">Complete</Badge>
                ) : (
                  <Badge className="bg-blue-900/30 text-blue-400 border-blue-900/50 ml-2">In Progress</Badge>
                )}
              </h3>
              <p className="text-sm text-slate-400">Created {completedInboxes} of {totalInboxes} mailboxes</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-500">{Math.round(progressPercent)}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3 bg-slate-900" />
        </CardContent>
      </Card>

      <div className="grid gap-2 h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {mailboxes.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-800/30 border border-slate-700 p-2 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900/50">
                {m.status === 'created' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : m.status === 'failed' ? (
                  <XCircle className="h-4 w-4 text-red-400" />
                ) : m.status === 'processing' ? (
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 text-slate-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-200">{m.email}</p>
                <p className="text-[10px] text-slate-500 font-mono">ID: {m.id.substring(0, 8)}</p>
              </div>
            </div>
            <div>
              {m.status === 'created' ? (
                <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900/50 text-[9px]">ACTIVE</Badge>
              ) : m.status === 'failed' ? (
                <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-900/50 text-[9px]">FAILED</Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-900/50 text-slate-600 border-slate-800 text-[9px]">
                  {m.status === 'processing' ? 'PROCESSING' : 'PENDING'}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
