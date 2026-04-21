'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Check, 
  X 
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DomainPlan, SubdomainPlan } from '@/lib/planner'
import { cn } from '@/lib/utils'

interface PlanTableProps {
  plans: DomainPlan[]
  onUpdate: (plans: DomainPlan[]) => void
  onReRandomize: (domain: string) => void
}

export function PlanTable({ plans, onUpdate, onReRandomize }: PlanTableProps) {
  const [expandedDomains, setExpandedDomains] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const toggleExpand = (domain: string) => {
    setExpandedDomains(prev => 
      prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]
    )
  }

  const handleUpdateSubdomain = (domainIndex: number, subIndex: number, field: keyof SubdomainPlan, value: any) => {
    const newPlans = [...plans]
    const subdomain = newPlans[domainIndex].subdomains[subIndex]
    
    if (field === 'inboxCount') {
      const diff = value - subdomain.inboxCount
      subdomain.inboxCount = value
      newPlans[domainIndex].totalInboxes += diff
    } else {
      (subdomain as any)[field] = value
    }
    
    onUpdate(newPlans)
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="w-[40px]"></TableHead>
            <TableHead className="text-slate-300 font-semibold">Domain</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">Subdomains</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">Total Inboxes</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">IP Address</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan, domainIndex) => (
            <>
              <TableRow key={plan.domain} className="border-slate-700 hover:bg-slate-800/80 transition-colors group">
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleExpand(plan.domain)}
                    className="h-8 w-8 text-slate-500"
                  >
                    {expandedDomains.includes(plan.domain) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell className="font-medium text-slate-100">{plan.domain}</TableCell>
                <TableCell className="text-center">
                  <span className="rounded-full bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-900/50">
                    {plan.subdomainCount}
                  </span>
                </TableCell>
                <TableCell className="text-center font-bold text-slate-200">{plan.totalInboxes}</TableCell>
                <TableCell className="text-center text-slate-400 font-mono text-xs">{plan.ip}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onReRandomize(plan.domain)}
                    className="h-8 w-8 text-slate-500 hover:text-blue-400"
                    title="Re-randomize domain"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              {expandedDomains.includes(plan.domain) && (
                <TableRow className="border-slate-700 bg-slate-900/30">
                  <TableCell colSpan={6} className="p-0">
                    <div className="px-12 py-4">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-800 hover:bg-transparent">
                            <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Prefix</TableHead>
                            <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Full Subdomain</TableHead>
                            <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold text-center">Inboxes</TableHead>
                            <TableHead className="h-8 w-[60px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {plan.subdomains.map((sub, subIndex) => (
                            <TableRow key={sub.fullSubdomain} className="border-slate-800 hover:bg-slate-800/30">
                              <TableCell className="py-2 text-sm text-slate-300 font-mono">{sub.prefix}</TableCell>
                              <TableCell className="py-2 text-sm text-slate-400 italic">{sub.fullSubdomain}</TableCell>
                              <TableCell className="py-2 text-center">
                                <Input 
                                  type="number" 
                                  value={sub.inboxCount}
                                  onChange={(e) => handleUpdateSubdomain(domainIndex, subIndex, 'inboxCount', parseInt(e.target.value) || 0)}
                                  className="h-7 w-16 mx-auto bg-slate-900 border-slate-700 text-center text-xs text-slate-100"
                                />
                              </TableCell>
                              <TableCell className="py-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-6 w-6 text-slate-600 hover:text-red-400"
                                  onClick={() => {
                                     const newPlans = [...plans]
                                     newPlans[domainIndex].subdomains.splice(subIndex, 1)
                                     newPlans[domainIndex].subdomainCount--
                                     newPlans[domainIndex].totalInboxes -= sub.inboxCount
                                     onUpdate(newPlans)
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
