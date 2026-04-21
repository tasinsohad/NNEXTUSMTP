'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  LogOut, 
  User, 
  LayoutDashboard,
  Search,
  Bell
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export function TopBar({ userEmail }: { userEmail?: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors — we'll redirect regardless
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-8 sticky top-0 z-10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search plans, domains, or mailboxes..." 
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-card focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-card" />
        </Button>

        <div className="h-6 w-px bg-border mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="relative h-10 w-auto gap-3 px-3 rounded-full hover:bg-secondary transition-colors" />}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col items-start text-left hidden sm:flex">
              <span className="text-xs font-bold truncate max-w-[120px]">
                {userEmail?.split('@')[0] || 'User'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Administrator</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border bg-card shadow-xl rounded-xl">
            <DropdownMenuLabel className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Account Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/')} className="rounded-lg py-2.5">
              <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-lg py-2.5">
              <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="rounded-lg py-2.5 text-destructive focus:text-destructive focus:bg-destructive/5">
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-bold">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
