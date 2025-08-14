"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"

interface UsageData {
  dailyMessages: number
  dailyLimit: number
  planType: string
}

type Variant = "minimal" | "detailed"

export default function UsageIndicator({ variant = "minimal" }: { variant?: Variant }) {
  const { data: session } = useSession()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchUsage = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/usage/today")
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchUsage()
    }
  }, [session, fetchUsage])

  if (loading || !usage) return null

  const percentage = usage.dailyLimit > 0 
    ? (usage.dailyMessages / usage.dailyLimit) * 100 
    : 0

  const isNearLimit = usage.dailyLimit > 0 && percentage >= 80
  const isAtLimit = usage.dailyLimit > 0 && usage.dailyMessages >= usage.dailyLimit

  // Minimal: mostrar apenas quando perto ou no limite, como um badge discreto
  if (variant === "minimal") {
    if (!isNearLimit && !isAtLimit) return null
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300">
        {isAtLimit ? "Limite diário atingido" : "Próximo do limite diário"}
      </div>
    )
  }

  // Detailed (opcional)
  return (
    <div className="p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Uso Diário</h3>
        <span className="text-xs text-muted-foreground">
          Plano {usage.planType}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Mensagens</span>
          <span className={isAtLimit ? "text-destructive" : ""}>
            {usage.dailyMessages} / {usage.dailyLimit === -1 ? "∞" : usage.dailyLimit}
          </span>
        </div>
        {usage.dailyLimit > 0 && (
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isAtLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
        {isAtLimit && (
          <p className="text-xs text-destructive mt-2">
            Limite diário atingido. Faça upgrade para continuar.
          </p>
        )}
      </div>
    </div>
  )
}