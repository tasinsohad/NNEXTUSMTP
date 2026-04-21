'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Server, 
  Mail, 
  ShieldCheck, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FinalSummaryProps {
  stats: {
    domains: number
    subdomains: number
    mailboxes: number
    dnsRecords: number
  }
}

export function FinalSummary({ stats }: FinalSummaryProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 py-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-900/20 border border-green-900/50 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-100">Infrastructure Forged!</h2>
        <p className="text-slate-400">Your cold email infrastructure has been successfully deployed and configured.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Domains', value: stats.domains, icon: Globe, color: 'blue' },
          { label: 'Subdomains', value: stats.subdomains, icon: Server, color: 'purple' },
          { label: 'Mailboxes', value: stats.mailboxes, icon: Mail, color: 'green' },
          { label: 'DNS Records', value: stats.dnsRecords, icon: ShieldCheck, color: 'amber' }
        ].map((item) => (
          <Card key={item.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-full bg-${item.color}-900/30 p-3`}>
                  <item.icon className={`h-6 w-6 text-${item.color}-400`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-100">{item.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-slate-700 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
            <div className="mt-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">1</div>
            <div>
              <p className="font-semibold text-slate-200">Warm up your mailboxes</p>
              <p className="text-sm text-slate-400 mt-1">Export your mailbox CSV and upload it to Instantly.ai or Smartlead.ai for warming.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
            <div className="mt-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">2</div>
            <div>
              <p className="font-semibold text-slate-200">Verify DNS Propagation</p>
              <p className="text-sm text-slate-400 mt-1">It may take up to 24 hours for all records to propagate worldwide.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Return to Dashboard
        </Button>
        <Button variant="outline" className="border-slate-700 text-slate-300">
          <ExternalLink className="mr-2 h-4 w-4" /> View Documentation
        </Button>
      </div>
    </div>
  )
}
