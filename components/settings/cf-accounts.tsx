'use client'

import { useState, useEffect } from 'react'
import { CloudflareAccount } from '@/types'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, Loader2, ShieldCheck, Cloud } from 'lucide-react'
import { toast } from 'sonner'

export function CFAccounts() {
  const [accounts, setAccounts] = useState<CloudflareAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newAccount, setNewAccount] = useState({ label: '', email: '', apiKey: '' })

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/cloudflare-accounts')
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  const handleAdd = async () => {
    if (!newAccount.label || !newAccount.apiKey) return
    setIsAdding(true)

    try {
      const res = await fetch('/api/cloudflare-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })

      if (!res.ok) throw new Error('Failed to add account')

      toast.success('Cloudflare account added')
      setNewAccount({ label: '', email: '', apiKey: '' })
      fetchAccounts()
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to add account'
      toast.error(err)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/cloudflare-accounts?id=${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to remove account')

      toast.success('Account removed')
      fetchAccounts()
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Failed to remove account'
      toast.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Cloudflare Accounts</h3>
          <p className="text-sm text-muted-foreground">Manage your Cloudflare API tokens for DNS automation.</p>
        </div>
        <Dialog>
          <DialogTrigger
            render={<Button className="shadow-lg shadow-primary/20" />}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </DialogTrigger>
          <DialogContent className="bg-card border-border shadow-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Cloudflare Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Account Label</Label>
                <Input
                  placeholder="e.g. My Primary Account"
                  value={newAccount.label}
                  onChange={(e) => setNewAccount({ ...newAccount, label: e.target.value })}
                  className="bg-muted/50 border-border/50 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Email (Optional)</Label>
                <Input
                  placeholder="user@example.com"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="bg-muted/50 border-border/50 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">API Token</Label>
                <Input
                  type="password"
                  value={newAccount.apiKey}
                  onChange={(e) => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                  className="bg-muted/50 border-border/50 focus-visible:ring-primary/20"
                  placeholder="Paste your Cloudflare API Token"
                />
                <p className="text-[10px] text-muted-foreground italic">Requires &quot;Zone.DNS&quot; and &quot;Zone.Zone&quot; permissions.</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-[10px] text-primary/80 font-medium">
                  Your API keys are stored securely in your Cloudflare D1 database.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd} disabled={isAdding} className="w-full h-11 font-bold">
                {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-xl shadow-black/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-foreground font-bold py-4">Label</TableHead>
              <TableHead className="text-foreground font-bold py-4">Email</TableHead>
              <TableHead className="text-foreground font-bold py-4">API Token Status</TableHead>
              <TableHead className="w-[80px] text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((acc) => (
              <TableRow key={acc.id} className="border-border hover:bg-muted/20 transition-colors">
                <TableCell className="font-semibold text-foreground py-4">{acc.label}</TableCell>
                <TableCell className="text-muted-foreground py-4">{acc.email || '-'}</TableCell>
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-xs font-mono text-muted-foreground">{'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(acc.id)}
                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Cloud className="h-8 w-8 text-muted/20" />
                    <span>No Cloudflare accounts added yet</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
