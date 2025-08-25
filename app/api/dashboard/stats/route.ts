import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized } from '@/lib/http/errors'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth } from 'date-fns'

// GET /api/dashboard/stats
// Padrão: handleRoute + requireAuth + setNoStore
// Métricas derivadas do schema atual:
// - Conversation.messages: Json[] (contagem de mensagens)
// - Payment: total de pagamentos do usuário
// - lastActivityAt: maior createdAt entre conversas e pagamentos
export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized('Não autorizado')

  // User details
  const user = await (prisma.user.findUnique as any)({ where: { id: auth.userId } })
  const memberSince = user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString()
  const daysActive = user?.createdAt ? Math.round((Date.now() - new Date(user.createdAt).getTime()) / (24 * 60 * 60 * 1000)) : 0

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  // Monthly aggregates and today's usage
  const usageMonthAgg = await (prisma as any).usage.aggregate({
    where: { userId: auth.userId, date: { gte: monthStart, lte: monthEnd } },
    _sum: { messageCount: true, tokenCount: true, cost: true },
  })
  const todayUsage = await (prisma as any).usage.findFirst({
    where: { userId: auth.userId },
    orderBy: { date: 'desc' },
  })

  const monthMessages = Number(usageMonthAgg?._sum?.messageCount ?? 0)
  const monthTokens = Number(usageMonthAgg?._sum?.tokenCount ?? 0)
  const monthCost = Number(usageMonthAgg?._sum?.cost ?? 0)
  const todayMessages = Number(todayUsage?.messageCount ?? 0)
  const todayTokens = Number(todayUsage?.tokenCount ?? 0)
  const todayCost = Number(todayUsage?.cost ?? 0)

  // Limits per plan
  const plan = (user?.plan || user?.planType || 'FREE') as string
  const dailyMessagesLimit = plan === 'PRO' ? 50 : 10
  const dailyTokensLimit = plan === 'PRO' ? 100000 : 10000
  const monthlyMessagesLimit = plan === 'PRO' ? 1500 : 300
  const monthlyTokensLimit = plan === 'PRO' ? 3000000 : 300000

  const percentDailyMessages = dailyMessagesLimit ? Math.round((todayMessages / dailyMessagesLimit) * 100) : 0
  const percentDailyTokens = dailyTokensLimit ? Number(((todayTokens / dailyTokensLimit) * 100).toFixed(1)) : 0
  const percentMonthlyMessages = monthlyMessagesLimit ? Math.round((monthMessages / monthlyMessagesLimit) * 100) : 0
  const percentMonthlyTokens = monthlyTokensLimit ? Number(((monthTokens / monthlyTokensLimit) * 100).toFixed(2)) : 0

  // Activity
  const totalConversations: number = await (prisma as any).conversation.count({ where: { userId: auth.userId } })
  const recentMessages = await (prisma as any).message.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { conversation: { select: { title: true } } },
  })

  const res = Response.json({
    user: {
      name: user?.name,
      email: user?.email,
      plan: plan,
      memberSince,
      daysActive,
    },
    usage: {
      today: {
        messages: todayMessages,
        tokens: todayTokens,
        cost: todayCost,
        percentOfDailyLimit: {
          messages: percentDailyMessages,
          tokens: percentDailyTokens,
        },
      },
      month: {
        messages: monthMessages,
        tokens: monthTokens,
        cost: monthCost,
        percentOfMonthlyLimit: {
          messages: percentMonthlyMessages,
          tokens: percentMonthlyTokens,
        },
      },
    },
    activity: {
      totalConversations,
      recentMessages: (recentMessages as Array<any>).map((m) => ({
        content: m.content,
        role: m.role,
        conversationTitle: m.conversation?.title ?? '',
        timestamp: new Date(m.createdAt).toISOString(),
      })),
    },
    subscription: {
      status: 'active',
      plan,
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      features: [
        `${dailyMessagesLimit} mensagens por dia`,
        `${dailyTokensLimit.toLocaleString('pt-BR')} tokens por dia`,
        'Acesso a modelos avançados',
      ],
    },
    ...(plan === 'FREE' && (percentDailyMessages >= 80 || percentDailyTokens >= 80)
      ? {
          upgradePrompt: {
            show: true,
            message: 'Você está usando 80% do seu limite diário. Faça upgrade para o plano Pro!',
            benefits: [
              '5x mais mensagens por dia',
              '10x mais tokens',
              'Acesso a modelos avançados como GPT-4',
            ],
          },
        }
      : {}),
  })
  setNoStore(res)
  return res
})
