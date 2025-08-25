import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'
import { startOfDay, endOfDay } from 'date-fns'

/**
 * GET /api/usage/today
 * Padrão: handleRoute + requireAuth + setNoStore
 * Observação: Schema atual não possui UserUsage; cálculo via Conversation.messages (Json[])
 */
type JsonMessage = {
  createdAt?: string | number | Date
  [k: string]: unknown
} | null

export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) {
    return Unauthorized(auth.error?.message ?? 'Não autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, plan: true, planType: true, createdAt: true },
  })
  if (!user) {
    return NotFound('Usuário não encontrado')
  }

  // Janela de hoje usando date-fns para alinhar com testes
  const now = new Date()
  const start = startOfDay(now)
  const end = endOfDay(now)

  // Limites por plano (valores esperados nos testes)
  const plan = (user.plan || user.planType || 'FREE') as string
  const dailyMessagesLimit = plan === 'PRO' ? 50 : 10
  const dailyTokensLimit = plan === 'PRO' ? 100000 : 10000

  // Busca registro de uso do dia (prefer new userUsage, fallback to legacy usage)
  let todayUsage: any = null
  try {
    todayUsage = await (prisma as any).userUsage?.findFirst?.({
      where: { userId: auth.userId, date: String(new Date().toISOString().split('T')[0]) },
    })
  } catch {}
  if (!todayUsage) {
    todayUsage = await (prisma as any).usage.findFirst({
      where: { userId: auth.userId, date: { gte: start, lte: end } },
    })
  }

  const messages = Number(todayUsage?.messagesUsed ?? todayUsage?.messageCount ?? 0)
  const tokens = Number(todayUsage?.tokensUsed ?? todayUsage?.tokenCount ?? 0)
  const cost = Number(todayUsage?.totalCost ?? todayUsage?.cost ?? 0)

  const percentMessages = dailyMessagesLimit ? Number(((messages / dailyMessagesLimit) * 100).toFixed(0)) : 0
  const percentTokens = dailyTokensLimit ? Number(((tokens / dailyTokensLimit) * 100).toFixed(1)) : 0

  const alerts: Array<{ type: 'warning' | 'danger'; message: string }> = []
  if (plan === 'FREE') {
    if (percentMessages >= 90) alerts.push({ type: 'warning', message: 'Você está próximo do limite diário de mensagens (90%)' })
    if (percentTokens >= 95) alerts.push({ type: 'danger', message: 'Você está muito próximo do limite diário de tokens (95%)' })
  }

  const res = NextResponse.json({
    messages,
    tokens,
    cost,
    limits: { dailyMessages: dailyMessagesLimit, dailyTokens: dailyTokensLimit },
    percentages: { messages: percentMessages, tokens: percentTokens },
    ...(alerts.length ? { alerts } : {}),
  })
  setNoStore(res)
  return res
})
