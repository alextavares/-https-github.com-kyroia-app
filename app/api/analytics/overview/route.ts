import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized } from '@/lib/http/errors'

type DailyPoint = {
  date: string
  messages: number
  tokens: number
  cost: number
}

/**
 * Observações importantes (alinhadas ao schema atual):
 * - Não existe tabela Message nem UserUsage no schema atual.
 * - Conversation possui campo messages: Json[] e modelUsed: string | null.
 * - Portanto, métricas são derivadas diretamente de Conversation.messages (Json[]).
 */
type JsonMessage = {
  role?: string
  content?: unknown
  tokensUsed?: number
  createdAt?: string | number | Date
} | null

export const GET = handleRoute(async (req: Request) => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized('Não autorizado')

  const url = new URL(req.url)
  const includeProjections = url.searchParams.get('includeProjections') === 'true'

  const totalMessages: number = await (prisma as any).message.count({ where: { userId: auth.userId } })
  const totalConversations: number = await (prisma as any).conversation.count({ where: { userId: auth.userId } })

  const grouped = await (prisma as any).message.groupBy({
    by: ['modelId'],
    _count: { id: true },
    where: { userId: auth.userId },
  })

  const usageRows = await (prisma as any).usage.findMany({ where: { userId: auth.userId }, orderBy: { date: 'desc' }, take: 14 })
  const conversations = await (prisma as any).conversation.findMany({ where: { userId: auth.userId }, orderBy: { createdAt: 'desc' }, take: 10 })

  const mostUsed = grouped.reduce((acc: any, it: any) => (it._count.id > acc._count.id ? it : acc), grouped[0] || { modelId: 'unknown', _count: { id: 0 } })
  const modelUsage = grouped.map((g: any) => ({
    model: g.modelId,
    count: g._count.id,
    percentage: totalMessages ? Math.round((g._count.id / totalMessages) * 100) : 0,
  }))

  const costTrends = (usageRows as Array<any>).map((u) => ({
    date: new Date(u.date).toISOString(),
    cost: u.cost ?? 0,
    tokens: u.tokenCount ?? 0,
  }))

  const topConversations = (conversations as Array<any>).map((c) => ({
    title: c.title,
    messageCount: c.messageCount ?? 0,
    lastActive: new Date(c.lastMessageAt ?? c.createdAt).toISOString(),
    model: c.modelId ?? 'unknown',
  }))

  const response: any = {
    summary: {
      totalMessages,
      totalConversations,
      averageMessagesPerConversation: totalConversations ? totalMessages / totalConversations : 0,
      mostUsedModel: mostUsed?.modelId ?? 'unknown',
    },
    modelUsage,
    costTrends,
    topConversations,
  }

  if (includeProjections) {
    const last7 = usageRows.slice(0, 7)
    const dailyAvg = last7.length ? last7.reduce((s: number, d: any) => s + (d.cost ?? 0), 0) / last7.length : 0
    response.projections = {
      dailyAverage: Number(dailyAvg.toFixed(2)),
      weeklyEstimate: Number((dailyAvg * 7).toFixed(2)),
      monthlyEstimate: Number((dailyAvg * 30).toFixed(2)),
      recommendation: dailyAvg > 5 ? 'Considere otimizar custos de modelos' : 'Uso dentro do esperado',
    }
  }

  const res = NextResponse.json(response)
  setNoStore(res)
  return res
})
