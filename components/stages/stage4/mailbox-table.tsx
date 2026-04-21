'use client'

import { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Copy,
  CheckCircle2,
  Clock
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
import { Badge } from '@/components/ui/badge'
import { MailboxData } from '@/lib/mailbox-generator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MailboxTableProps {
  subdomain: string
  mailboxes: MailboxData[]
}

export function MailboxTable({ subdomain, mailboxes }: MailboxTableProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showPasswords, setShowPasswords] = useState<string[]>([])

  const togglePassword = (email: string) => {
    setShowPasswords(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden shadow-sm">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-slate-900/50 cursor-pointer hover:bg-slate-900/80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
          <span className="font-bold text-slate-100">{subdomain}</span>
          <Badge variant="outline" className="text-[10px] bg-blue-900/20 text-blue-400 border-blue-900/50">
            {mailboxes.length} Mailboxes
          </Badge>
        </div>
      </div>

      {isExpanded && (
        <Table>
          <TableHeader className="bg-slate-950/20">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Full Name</TableHead>
              <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Email Address</TableHead>
              <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold">Password</TableHead>
              <TableHead className="h-8 text-[10px] uppercase text-slate-500 font-bold text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mailboxes.map((m) => (
              <TableRow key={m.email} className="border-slate-800 hover:bg-slate-800/30">
                <TableCell className="py-2 text-sm text-slate-300">{m.fullName}</TableCell>
                <TableCell className="py-2 text-sm font-mono text-slate-400 flex items-center gap-2">
                  {m.email}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 hover:text-slate-300" onClick={() => copyToClipboard(m.email)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </TableCell>
                <TableCell className="py-2 text-sm font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-32 truncate">
                      {showPasswords.includes(m.email) ? m.password : '••••••••••••••••'}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-600 hover:text-slate-300" onClick={() => togglePassword(m.email)}>
                      {showPasswords.includes(m.email) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="py-2 text-center">
                  <Badge variant="outline" className="bg-slate-900/50 text-slate-600 border-slate-800 text-[9px] uppercase gap-1">
                    <Clock className="h-3 w-3" /> Pending
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
