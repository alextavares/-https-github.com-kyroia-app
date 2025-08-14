import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized } from '@/lib/http/errors'

/**
 * GET /api/usage/stats
 * Padrão: handleRoute + requireAuth + setNoStore
 * Observação: Schema atual não possui UserUsage; agregações derivadas de Conversation.messages (Json[])
 * Janela padrão: últimos 30 dias, agregando por dia (UTC).
 */
type JsonMessage = {
  createdAt?: string | number | Date
  tokensUsed?: number
  [k: string]: unknown
} | null

type DailyStat = {
  date: string
  messages: number
  tokens: number
}

export async function GET() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized(auth.error?.message ?? 'Não autorizado')
    }

    const userId = auth.userId
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Coleta conversas recentes do usuário
    const conversations = await prisma.conversation.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      select: { messages: true, createdAt: true },
      take: 500, // limite para performance
    })

    // Agregação diária
    const byDay = new Map<string, DailyStat>()
    let totalMessages = 0
    let totalTokens = 0

    conversations.forEach((c) => {
      const msgs = Array.isArray(c.messages) ? c.messages : []
      msgs.forEach((m) => {
        const jm = m as unknown as JsonMessage
        if (!jm || typeof jm !== 'object') return

        // Mensagens + tokens (opcional)
        totalMessages += 1
        const tu = (jm as Record<string, unknown>)['tokensUsed']
        const tokens = typeof tu === 'number' ? tu : 0
        totalTokens += tokens

        // Data (usa createdAt da msg ou da conversa)
        const createdVal = jm.createdAt
        let dt: Date
        if (createdVal instanceof Date) dt = createdVal
        else if (typeof createdVal === 'string' || typeof createdVal === 'number') dt = new Date(createdVal)
        else dt = new Date(c.createdAt)
        if (isNaN(dt.getTime())) return

        const key = dt.toISOString().split('T')[0]
        const current = byDay.get(key) ?? { date: key, messages: 0, tokens: 0 }
        current.messages += 1
        current.tokens += tokens
        byDay.set(key, current)
      })
    })

    const daily = Array.from(byDay.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const res = NextResponse.json({
      window: { since: since.toISOString(), days: 30 },
      totals: { messages: totalMessages, tokens: totalTokens },
      daily,
    })
    setNoStore(res)
    return res
  })
}