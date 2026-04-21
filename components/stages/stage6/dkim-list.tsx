'use client'

import { useState } from 'react'
import { DNSRecord } from '@/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Key, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DKIMListProps {
  records: DNSRecord[]
  onFetchOne: (id: string) => void
  isFetching: boolean
}

export function DKIMList({ records, onFetchOne, isFetching }: DKIMListProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-700 hover:bg-transparent">
            <TableHead className="text-slate-300 font-semibold">Record Name</TableHead>
            <TableHead className="text-slate-300 font-semibold">DKIM Public Key</TableHead>
            <TableHead className="text-slate-300 font-semibold text-center">Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id} className="border-slate-700 hover:bg-slate-800/80 transition-colors">
              <TableCell className="font-mono text-[11px] text-slate-300">{r.record_name}</TableCell>
              <TableCell className="max-w-md">
                <div className="font-mono text-[10px] text-slate-500 truncate bg-slate-900/50 px-2 py-1 rounded border border-slate-800">
                  {r.record_content.includes('PENDING') ? (
                    <span className="text-amber-600/50 italic">Key not retrieved yet...</span>
                  ) : (
                    r.record_content
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {r.status === 'created' ? (
                  <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-900/50 text-[9px] uppercase gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Pushed
                  </Badge>
                ) : r.status === 'pending' && !r.record_content.includes('PENDING') ? (
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-900/50 text-[9px] uppercase gap-1">
                    <Clock className="h-3 w-3" /> Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-900/20 text-amber-500 border-amber-900/50 text-[9px] uppercase gap-1">
                    <AlertCircle className="h-3 w-3" /> Missing Key
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onFetchOne(r.id)}
                  disabled={isFetching}
                  className="h-8 w-8 text-slate-500 hover:text-blue-400"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
