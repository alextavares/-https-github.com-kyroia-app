import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getUserUsageStats } from '@/lib/usage-limits'
import { FeatureGrid } from '@/components/dashboard/feature-grid'
import { PlanStatusCard } from '@/components/dashboard/plan-status-card'
import { ModelSelector } from '@/components/dashboard/model-selector'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CreditService } from '@/lib/credit-service'
import { ChatInput } from '@/components/dashboard/chat-input'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

type UsageStats = {
  planType: string
  daily: { messages: { used: number; limit: number | null } }
  monthly: { tokens: { used: number; limit: number | null }; cost: number }
}

async function getDashboardData(userId: string) {
  // Dados mínimos necessários para renderização; evitar dependências inexistentes
  let usageStats: UsageStats = {
    planType: 'FREE',
    daily: { messages: { used: 0, limit: 20 } },
    monthly: { tokens: { used: 0, limit: 50000 }, cost: 0 },
  }

  try {
    usageStats = await getUserUsageStats(userId) as unknown as UsageStats
  } catch (error) {
    console.error('Error fetching usage stats:', error)
  }

  // Créditos
  let creditBalance = 0
  let creditStats = { consumed: 0, purchased: 0 }
  try {
    const [balance, stats] = await Promise.all([
      CreditService.getBalance(userId),
      CreditService.getMonthlyStats(userId),
    ])
    creditBalance = balance
    creditStats = stats
  } catch (err) {
    console.error('Error fetching credit data:', err)
  }

  return { usageStats, creditBalance, creditStats }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Garantir existência do usuário sem usar campos inexistentes no Client atual
  let user: { onboardingCompleted: boolean; name: string | null } = {
    onboardingCompleted: true,
    name: session!.user!.name || 'Usuário',
  }

  try {
    const found = await prisma.user.findUnique({
      where: { id: session!.user!.id },
      select: { onboardingCompleted: true, name: true },
    })
    if (found) user = found as typeof user
    else {
      try {
        await prisma.user.create({
          data: {
            id: session!.user!.id,
            email: session!.user!.email!,
            name: session!.user!.name || 'Usuário',
            // creditBalance existe no schema; manter default do schema, não sobrescrever
            onboardingCompleted: true,
          },
        })
        user = {
          onboardingCompleted: true,
          name: session!.user!.name || 'Usuário',
        }
      } catch (createErr) {
        console.error('Error creating user from OAuth:', createErr)
      }
    }
  } catch (err) {
    console.error('Error fetching/ensuring user:', err)
  }

  // Evitar loop: se /onboarding redireciona para /dashboard sempre, nunca mandar de volta
  // Só redirecionar quando explicitamente for necessário e a página de onboarding não for "redirect-only"
  // Evitar loop de redirecionamento: não enviar para /onboarding pois a página já redireciona de volta
  // e queremos estabilizar o dashboard mesmo sem onboarding completo
  // if (user && user.onboardingCompleted === false) {
  //   redirect('/onboarding')
  // }

  const { usageStats, creditBalance } = await getDashboardData(session!.user!.id)

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between px-1">
        <nav className="text-sm text-muted-foreground">
          <span>Início</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Dashboard</span>
        </nav>
        <Link href="/dashboard/credits/purchase" className="text-sm px-3 py-1 rounded-md border border-border/50 hover:bg-accent">
          Adicionar Créditos
        </Link>
      </div>
      <div className="flex flex-col space-y-3">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold text-text-primary">
            Olá {user?.name || 'Usuário'}
          </h1>
          <p className="text-lg text-text-secondary mt-1">
            Como posso ajudar hoje?
          </p>
          <div className="mt-3 flex items-center gap-2 justify-center lg:justify-start">
            <Badge variant="outline" className="border-border/50">
              Plano: {usageStats?.planType ?? 'FREE'}
            </Badge>
            <Badge className="bg-primary/10 text-primary border border-primary/30">
              Créditos: {typeof creditBalance === 'number' ? creditBalance.toLocaleString('pt-BR') : '—'}
            </Badge>
            {usageStats?.planType === 'FREE' && (
              <Button asChild size="sm" className="ml-1">
                <Link href="/pricing">Upgrade</Link>
              </Button>
            )}
          </div>
          {/* Indicador de consumo diário (mensagens) */}
          <div className="mt-4 max-w-xl mx-auto lg:mx-0">
            {typeof usageStats?.daily?.messages?.limit === 'number' ? (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Mensagens hoje</span>
                  <span>
                    {usageStats.daily.messages.used}/{usageStats.daily.messages.limit}
                  </span>
                </div>
                <Progress value={Math.min(100, Math.round((usageStats.daily.messages.used / usageStats.daily.messages.limit) * 100))} />
              </div>
            ) : null}
            {/* Indicador de custo/tokens mensais quando disponível */}
            {typeof usageStats?.monthly?.tokens?.limit === 'number' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Tokens no mês</span>
                  <span>
                    {usageStats.monthly.tokens.used?.toLocaleString('pt-BR')}/{usageStats.monthly.tokens.limit?.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Progress value={Math.min(100, Math.round((usageStats.monthly.tokens.used / Math.max(1, usageStats.monthly.tokens.limit)) * 100))} />
              </div>
            )}
            {typeof usageStats?.monthly?.cost === 'number' && (
              <div className="mt-2 text-xs text-muted-foreground">
                Custo acumulado no mês: R$ {usageStats.monthly.cost.toFixed(2)}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center lg:justify-start">
          <ModelSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlanStatusCard />
        <FeatureGrid />
      </div>
      <ChatInput />
    </div>
  )
}