'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CFAccounts } from '@/components/settings/cf-accounts'
import { 
  Settings, 
  CloudIcon, 
  Server, 
  Users, 
  Type,
  ShieldCheck,
  Database
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="h-10 w-10 text-primary/40" />
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">Manage your API integrations, name pools, and infrastructure templates.</p>
      </div>

      <Tabs defaultValue="cloudflare" className="w-full">
        <TabsList className="bg-muted/50 border border-border p-1 w-full justify-start overflow-x-auto h-14 mb-8 rounded-2xl">
          <TabsTrigger value="cloudflare" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl gap-2 py-2 px-6 h-full font-bold transition-all">
            <CloudIcon className="h-4 w-4" /> Cloudflare
          </TabsTrigger>
          <TabsTrigger value="vps" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl gap-2 py-2 px-6 h-full font-bold transition-all">
            <Server className="h-4 w-4" /> VPS Servers
          </TabsTrigger>
          <TabsTrigger value="names" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl gap-2 py-2 px-6 h-full font-bold transition-all">
            <Users className="h-4 w-4" /> Name Bank
          </TabsTrigger>
          <TabsTrigger value="prefixes" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl gap-2 py-2 px-6 h-full font-bold transition-all">
            <Type className="h-4 w-4" /> Prefixes
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-xl gap-2 py-2 px-6 h-full font-bold transition-all">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="cloudflare" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <CFAccounts />
          </TabsContent>

          <TabsContent value="vps" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-24 text-center">
              <Server className="mx-auto h-12 w-12 text-muted/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">VPS Manager Coming Soon</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">Server connection management for Mailcow, Mailu, and iRedMail is being forged.</p>
            </div>
          </TabsContent>

          <TabsContent value="names" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-24 text-center">
              <Database className="mx-auto h-12 w-12 text-muted/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Name Bank Editor</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">Bulk import and edit your mailbox names for automated generation.</p>
            </div>
          </TabsContent>

          <TabsContent value="prefixes" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-24 text-center">
              <Type className="mx-auto h-12 w-12 text-muted/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">Subdomain Prefixes</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">Manage your pool of random prefixes for unique subdomain planning.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="rounded-2xl border border-border bg-card p-10 shadow-xl shadow-black/5 space-y-6">
              <div className="flex items-start gap-6">
                <div className="rounded-2xl bg-primary/10 p-5">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Secure Credential Storage</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    All API keys and tokens are protected using high-grade encryption and stored in your private **Cloudflare D1** database. 
                    Credentials never leave the Cloudflare Edge runtime during automation tasks.
                  </p>
                </div>
              </div>
              <div className="h-px bg-border w-full" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium italic">Database: Cloudflare D1 (SQLite)</span>
                <span className="text-primary font-bold">Edge Optimized</span>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
