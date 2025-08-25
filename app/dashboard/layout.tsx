import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import UsageIndicator from '@/components/usage/usage-indicator'
import { ModelSelectorBar } from '@/components/dashboard/model-selector-bar'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar sticky com trigger e theme toggle */}
          <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Exibe o trigger em todas as larguras e garante z-index alto */}
                <SidebarTrigger className="inline-flex z-50" />
                <span className="text-sm text-muted-foreground hidden sm:inline">Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                {/* @ts-expect-error Server/Client boundary – componente client-safe */}
                <UsageIndicator variant="minimal" />
                <ThemeToggle />
              </div>
            </div>
            {/* @ts-expect-error Server/Client boundary – componente client-safe */}
            <ModelSelectorBar />
          </header>
          <main className="flex-1 overflow-y-auto bg-background hide-scrollbar">
            <div className="w-full max-w-6xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
