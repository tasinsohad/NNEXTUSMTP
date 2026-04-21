'use client'

import { useState } from 'react'
import { Plus, Trash2, AlertCircle, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isValidDomain, isValidIPv4 } from '@/lib/validators'
import { cn } from '@/lib/utils'

export interface DomainEntry {
  id: string
  domain: string
  ip: string
  vpsProvider: string
}

interface ManualEntryProps {
  entries: DomainEntry[]
  onChange: (entries: DomainEntry[]) => void
}

export function ManualEntry({ entries, onChange }: ManualEntryProps) {
  const addRow = () => {
    onChange([...entries, { id: crypto.randomUUID(), domain: '', ip: '', vpsProvider: 'mailcow' }])
  }

  const removeRow = (id: string) => {
    onChange(entries.filter(e => e.id !== id))
  }

  const updateRow = (id: string, field: keyof DomainEntry, value: string) => {
    onChange(entries.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground font-bold py-4 pl-6">Domain Name</TableHead>
              <TableHead className="text-foreground font-bold py-4">IP Address</TableHead>
              <TableHead className="text-foreground font-bold py-4">VPS Provider</TableHead>
              <TableHead className="w-[80px] text-right pr-6 py-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Database className="h-10 w-10 text-muted/20" />
                    <span>No domains added yet. Click "Add Row" to begin the forge.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="border-border hover:bg-muted/10 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="space-y-1.5">
                      <Input
                        placeholder="example.com"
                        value={entry.domain}
                        onChange={(e) => updateRow(entry.id, 'domain', e.target.value)}
                        className={cn(
                          "bg-muted/50 border-border/50 focus-visible:bg-card transition-all",
                          entry.domain && !isValidDomain(entry.domain) && "border-destructive/50 ring-destructive/20 ring-2"
                        )}
                      />
                      {entry.domain && !isValidDomain(entry.domain) && (
                        <p className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Invalid domain format
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="space-y-1.5">
                      <Input
                        placeholder="1.2.3.4"
                        value={entry.ip}
                        onChange={(e) => updateRow(entry.id, 'ip', e.target.value)}
                        className={cn(
                          "bg-muted/50 border-border/50 focus-visible:bg-card transition-all",
                          entry.ip && !isValidIPv4(entry.ip) && "border-destructive/50 ring-destructive/20 ring-2"
                        )}
                      />
                      {entry.ip && !isValidIPv4(entry.ip) && (
                        <p className="text-[10px] text-destructive font-semibold flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Invalid IPv4 address
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Select 
                      value={entry.vpsProvider} 
                      onValueChange={(v) => updateRow(entry.id, 'vpsProvider', v ?? '')}
                    >
                      <SelectTrigger className="bg-muted/50 border-border/50 h-10 font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border shadow-xl">
                        <SelectItem value="mailcow">Mailcow</SelectItem>
                        <SelectItem value="mailu">Mailu</SelectItem>
                        <SelectItem value="iredmail">iRedMail</SelectItem>
                        <SelectItem value="custom">Custom API</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(entry.id)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Button 
        variant="outline" 
        onClick={addRow}
        className="w-full h-16 border-dashed border-border bg-muted/10 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-base font-bold rounded-2xl"
      >
        <Plus className="mr-2 h-5 w-5" /> Add New Domain Row
      </Button>
    </div>
  )
}
