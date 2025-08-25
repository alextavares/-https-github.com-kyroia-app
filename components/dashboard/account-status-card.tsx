"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export function AccountStatusCard() {
  const [loading, setLoading] = useState(true)
  const [planType, setPlanType] = useState<string>('FREE')
  const [credits, setCredits] = useState<number | null>(null)
  const [dailyUsed, setDailyUsed] = useState<number>(0)
  const [dailyLimit, setDailyLimit] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [planRes, usageRes] = await Promise.all([
          fetch('/api/dashboard/plan', { cache: 'no-store' }),
          fetch('/api/usage/today', { cache: 'no-store' }),
        ])
        if (!cancelled) {
          if (planRes.ok) {
            const plan = await planRes.json()
            setPlanType(plan.plan?.type || plan.planType || 'FREE')
            setCredits(typeof plan.credits?.balance === 'number' ? plan.credits.balance : null)
          }
          if (usageRes.ok) {
            const usage = await usageRes.json()
            setDailyUsed(Number(usage.used || 0))
            setDailyLimit(usage.limit === null || usage.limit === undefined ? null : Number(usage.limit))
          }
        }
      } catch (e) {
        // noop
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const percent = dailyLimit ? Math.min(100, Math.round((dailyUsed / Math.max(1, dailyLimit)) * 100)) : 0

  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card shadow-soft rounded-2xl">
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl"></div>
      
      <CardHeader className="relative z-10 pb-3 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold text-white">K</span>
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              Status da Conta
            </CardTitle>
          </div>
          <Badge variant="outline" className="border-border/60 bg-background/60 text-foreground font-medium rounded-md h-6">
            {planType}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground">
          {dailyLimit === null ? 'Mensagens ilimitadas por dia' : 'Limite diário de mensagens'}
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4 p-4">
        <div className="bg-background/60 rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium">Mensagens hoje</span>
            <span className="font-semibold text-foreground">{dailyUsed}/{dailyLimit === null ? '∞' : dailyLimit}</span>
          </div>
          <Progress value={dailyLimit ? percent : 0} className="h-2" />
        </div>

        <div className="bg-background/60 rounded-xl p-3 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Créditos disponíveis</span>
            <span className={`text-base font-semibold ${credits !== null && credits < 10 ? 'text-amber-600' : 'text-foreground'}`}>
              {credits === null ? '—' : credits.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button asChild variant="outline" size="sm" className="flex-1 border-border/60 hover:bg-background/80 rounded-lg font-medium h-9">
            <Link href="/dashboard/credits/purchase">Adicionar créditos</Link>
          </Button>
          {planType === 'FREE' && (
            <Button asChild size="sm" className="flex-1 gradient-primary rounded-lg font-medium h-9">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
