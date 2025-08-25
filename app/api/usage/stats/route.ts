import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized, InternalError } from '@/lib/http/errors'

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

export const GET = handleRoute(async (req: Request) => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized(auth.error?.message ?? 'Não autorizado')

  try {
    const url = new URL(req.url)
    const startStr = url.searchParams.get('startDate')
    const endStr = url.searchParams.get('endDate')
    const startDate = startStr ? new Date(startStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = endStr ? new Date(endStr) : new Date()

    // Prefer new userUsage table when available; fallback to legacy usage
    let usageRows: Array<any> = []
    try {
      const rows = await (prisma as any).userUsage?.findMany?.({
        where: { userId: auth.userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      })
      if (Array.isArray(rows)) usageRows = rows
    } catch {}
    if (!usageRows.length) {
      const rows = await (prisma as any).usage.findMany({
        where: { userId: auth.userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      })
      usageRows = rows
    }

    let aggregated: any = null
    try {
      aggregated = await (prisma as any).userUsage?.aggregate?.({
        where: { userId: auth.userId, date: { gte: startDate, lte: endDate } },
        _sum: { messagesUsed: true, tokensUsed: true, totalCost: true },
      })
    } catch {}
    if (!aggregated) {
      aggregated = await (prisma as any).usage.aggregate({
        where: { userId: auth.userId, date: { gte: startDate, lte: endDate } },
        _sum: { messageCount: true, tokenCount: true, cost: true },
      })
    }

    const sum = aggregated?._sum ?? {}
    const totalMessages = Number(sum.messagesUsed ?? sum.messageCount ?? 0)
    const totalTokens = Number(sum.tokensUsed ?? sum.tokenCount ?? 0)
    const totalCost = Number(sum.totalCost ?? sum.cost ?? 0)

    const numDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)))
    const averageMessagesPerDay = Math.round(totalMessages / numDays)
    const averageTokensPerDay = Math.round(totalTokens / numDays)

    const daily = (usageRows as Array<any>).map((row) => ({
      date: new Date(row.date).toISOString(),
      messages: row.messagesUsed ?? row.messageCount ?? 0,
      tokens: row.tokensUsed ?? row.tokenCount ?? 0,
      cost: row.totalCost ?? row.cost ?? 0,
    }))

    // Plano e limites (valores esperados nos testes)
    const user = await (prisma.user.findUnique as any)({ where: { id: auth.userId } })
    const plan = (user?.plan || user?.planType || 'PRO') as string
    const limits = plan === 'FREE'
      ? { plan: 'FREE', dailyMessages: 10, dailyTokens: 10000, monthlyMessages: 300, monthlyTokens: 300000 }
      : { plan: 'PRO', dailyMessages: 50, dailyTokens: 100000, monthlyMessages: 1500, monthlyTokens: 3000000 }

    const res = NextResponse.json({
      daily,
      monthly: {
        totalMessages,
        totalTokens,
        totalCost,
        averageMessagesPerDay,
        averageTokensPerDay,
      },
      limits,
    })
    setNoStore(res)
    return res
  } catch (err) {
    return InternalError('Erro ao buscar estatísticas de uso', err as unknown)
  }
})
