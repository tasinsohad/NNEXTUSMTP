'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Globe, 
  Map, 
  Cloud, 
  Users, 
  Server, 
  ShieldCheck, 
  CheckCircle2,
  Circle,
  Clock,
  Sparkles
} from 'lucide-react'

const stages = [
  { id: 1, name: 'Domain & IP Input', icon: Globe, path: '/stage/1' },
  { id: 2, name: 'Subdomain Planning', icon: Map, path: '/stage/2' },
  { id: 3, name: 'DNS & Cloudflare', icon: Cloud, path: '/stage/3' },
  { id: 4, name: 'Mailbox Names', icon: Users, path: '/stage/4' },
  { id: 5, name: 'VPS Creation', icon: Server, path: '/stage/5' },
  { id: 6, name: 'DKIM Injection', icon: ShieldCheck, path: '/stage/6' },
]

interface SidebarProps {
  currentStage?: number
  completedStages?: number[]
}

export function Sidebar({ currentStage = 1, completedStages = [] }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-72 flex-col border-r border-border bg-card text-foreground transition-all">
      <div className="flex h-16 items-center px-6 gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight leading-none">NXT FORGE</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">Infrastructure</span>
        </div>
      </div>
      
      <div className="px-4 py-2">
        <div className="h-px bg-border/50 w-full" />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {stages.map((stage) => {
          const isActive = pathname.startsWith(stage.path)
          const isCompleted = completedStages.includes(stage.id)
          const isPending = stage.id > (Math.max(0, ...completedStages) + 1) && !isActive

          return (
            <Link
              key={stage.id}
              href={stage.path}
              className={cn(
                "group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                isPending && "opacity-40 pointer-events-none grayscale"
              )}
            >
              <div className="flex items-center">
                <stage.icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
                )} />
                <span className="truncate">{stage.name}</span>
              </div>
              <div className="flex items-center ml-2">
                {isCompleted ? (
                  <CheckCircle2 className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-primary")} />
                ) : isActive ? (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-muted/30" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Progress</span>
            <span className="font-bold text-foreground">{Math.round((completedStages.length / stages.length) * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${(completedStages.length / stages.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-muted-foreground font-medium">
            {completedStages.length} of {stages.length} steps forged
          </p>
        </div>
      </div>
    </div>
  )
}
