import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'

/**
 * GET /api/usage/today
 * Padrão: handleRoute + requireAuth + setNoStore
 * Observação: Schema atual não possui UserUsage; cálculo via Conversation.messages (Json[])
 */
type JsonMessage = {
  createdAt?: string | number | Date
  [k: string]: unknown
} | null

export async function GET() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized(auth.error?.message ?? 'Não autorizado')
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, planType: true, createdAt: true },
    })
    if (!user) {
      return NotFound('Usuário não encontrado')
    }

    // Janela de hoje (UTC)
    const startOfDay = new Date()
    startOfDay.setUTCHours(0, 0, 0, 0)
    const endOfDay = new Date()
    endOfDay.setUTCHours(23, 59, 59, 999)

    // Limites (defaults simples; ajustar conforme política de planos)
    const dailyLimit: number | null = 10
    const monthlyTokenLimit: number | null = null

    // Busca conversas do usuário (limite razoável para performance)
    const conversations = await prisma.conversation.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: { messages: true, createdAt: true },
      take: 200,
    })

    // Contabiliza mensagens de hoje
    let todayMessages = 0
    conversations.forEach((c) => {
      const msgs = Array.isArray(c.messages) ? c.messages : []
      msgs.forEach((m) => {
        const jm = m as unknown as JsonMessage
        if (!jm || typeof jm !== 'object') return
        const createdVal = jm.createdAt
        let dt: Date
        if (createdVal instanceof Date) dt = createdVal
        else if (typeof createdVal === 'string' || typeof createdVal === 'number') dt = new Date(createdVal)
        else dt = new Date(c.createdAt)
        if (!isNaN(dt.getTime()) && dt >= startOfDay && dt <= endOfDay) {
          todayMessages += 1
        }
      })
    })

    // Tokens mensais indisponíveis sem UserUsage; definimos como 0 (placeholder)
    const monthlyTokensUsed = 0

    const res = NextResponse.json({
      dailyMessages: {
        used: todayMessages,
        limit: dailyLimit === -1 ? null : dailyLimit,
      },
      monthlyTokens: {
        used: monthlyTokensUsed,
        limit: monthlyTokenLimit === -1 ? null : monthlyTokenLimit,
      },
      planType: user.planType,
      remainingMessages:
        dailyLimit === null || dailyLimit === -1 ? null : Math.max(0, dailyLimit - todayMessages),
    })
    setNoStore(res)
    return res
  })
}