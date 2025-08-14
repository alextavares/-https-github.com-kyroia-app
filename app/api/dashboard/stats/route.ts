import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute } from '@/lib/http/errors'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/stats
// Padrão: handleRoute + requireAuth + setNoStore
// Métricas derivadas do schema atual:
// - Conversation.messages: Json[] (contagem de mensagens)
// - Payment: total de pagamentos do usuário
// - lastActivityAt: maior createdAt entre conversas e pagamentos
export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return auth.error

  // Carrega conversas e pagamentos recentes (limite para performance)
  const [conversations, payments] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, messages: true },
      take: 500,
    }),
    prisma.payment.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, amount: true, status: true },
      take: 200,
    }),
  ])

  // Conversas e mensagens
  const totalConversations = conversations.length
  const totalMessages = conversations.reduce((acc, c) => {
    const arr = Array.isArray(c.messages) ? c.messages : []
    return acc + arr.length
  }, 0)

  // Pagamentos
  const totalPayments = payments.length

  // Última atividade
  const lastConvAt = conversations[0]?.createdAt ?? null
  const lastPayAt = payments[0]?.createdAt ?? null
  const lastActivityAt =
    lastConvAt && lastPayAt
      ? new Date(Math.max(lastConvAt.getTime(), lastPayAt.getTime())).toISOString()
      : (lastConvAt ?? lastPayAt)?.toISOString() ?? null

  const res = Response.json({
    totals: {
      conversations: totalConversations,
      messages: totalMessages,
      payments: totalPayments,
    },
    lastActivityAt,
    recent: {
      conversations: conversations.slice(0, 10).map((c) => ({
        id: c.id,
        createdAt: c.createdAt.toISOString(),
        messagesCount: Array.isArray(c.messages) ? c.messages.length : 0,
      })),
      payments: payments.slice(0, 10).map((p) => ({
        id: p.id,
        createdAt: p.createdAt.toISOString(),
        amount: p.amount,
        status: p.status,
      })),
    },
  })
  setNoStore(res)
  return res
})
