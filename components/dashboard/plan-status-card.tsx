"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type PlanResponse = {
  plan: {
    type: string
    dailyLimit: number
    monthlyLimit: number
    features: string[]
  }
  credits: {
    balance: number
    currency: string
    isLowBalance: boolean
    recommendedMin: number
  }
  recommendations?: Array<{
    packageId: string
    name: string
    credits: number
    price: number
    reason: string
  }>
  packages?: Array<{
    id: string
    name: string
    credits: number
    price: number
  }>
}

export function PlanStatusCard() {
  const [data, setData] = useState<PlanResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard/plan', { cache: 'no-store' })
        if (res.ok) {
          const json = (await res.json()) as PlanResponse
          setData(json)
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading || !data) return null

  const { plan, credits, recommendations } = data
  const showLow = credits.isLowBalance === true

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status do Plano</CardTitle>
          <Badge variant="outline" className="border-border/50">
            {plan.type || 'FREE'}
          </Badge>
        </div>
        <CardDescription>
          Limites: {plan.dailyLimit} msgs/dia · {plan.monthlyLimit.toLocaleString('pt-BR')} tokens/mês
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Créditos</span>
          <span className={`${showLow ? 'text-yellow-400' : 'text-foreground'}`}>
            {credits.balance.toLocaleString('pt-BR')} {credits.currency}
          </span>
        </div>

        {showLow && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-300">
            Seu saldo está baixo (mínimo recomendado: {credits.recommendedMin}).
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-border/50">
            <Link href={showLow && recommendations && recommendations[0] ? `/dashboard/credits/purchase#${encodeURIComponent(recommendations[0].packageId)}` : "/dashboard/credits/purchase"}>
              Adicionar créditos
            </Link>
          </Button>
          {plan.type === 'FREE' && (
            <Button asChild size="sm">
              <Link href="/pricing">Upgrade</Link>
            </Button>
          )}
        </div>

        {showLow && recommendations && recommendations.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-muted-foreground mb-1">Sugestões</div>
            <ul className="space-y-1 text-sm">
              {recommendations.slice(0, 3).map((r) => (
                <li key={r.packageId} className="flex items-center justify-between">
                  <a href={`/dashboard/credits/purchase#${encodeURIComponent(r.packageId)}`} className="truncate pr-2 hover:underline">
                    {r.name} · {r.credits.toLocaleString('pt-BR')} créditos
                  </a>
                  <span className="text-muted-foreground">R$ {r.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


