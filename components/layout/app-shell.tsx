import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'

interface AppShellProps {
  children: React.ReactNode
  userEmail?: string
  currentStage?: number
  completedStages?: number[]
}

export function AppShell({ 
  children, 
  userEmail, 
  currentStage, 
  completedStages 
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        currentStage={currentStage} 
        completedStages={completedStages} 
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-muted/20">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
