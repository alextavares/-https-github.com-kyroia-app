import { requireAuth } from '@/lib/auth/guards'
import { setPrivateCache } from '@/lib/cache/headers'
import { handleRoute, DomainError } from '@/lib/http/errors'
import { prisma } from '@/lib/prisma'
import { CreditsService } from '@/services/credits'

// GET /api/dashboard/plan
// Padrão: handleRoute + requireAuth + setPrivateCache
// Retorna visão do plano atual, saldo de créditos e recomendações de upgrade
export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return auth.error

  // Limites padrão por plano (schema atual sem tabela planLimit)
  const DEFAULT_LIMITS = {
    FREE: {
      dailyMessagesLimit: 20,
      monthlyTokensLimit: 200_000,
      featuresEnabled: [] as string[],
      recommendedMinCredits: 50,
    },
    PRO: {
      dailyMessagesLimit: 500,
      monthlyTokensLimit: 5_000_000,
      featuresEnabled: ['prioritySupport', 'higherLimits'] as string[],
      recommendedMinCredits: 200,
    },
    BUSINESS: {
      dailyMessagesLimit: 5000,
      monthlyTokensLimit: 50_000_000,
      featuresEnabled: ['prioritySupport', 'team', 'sso'] as string[],
      recommendedMinCredits: 1000,
    },
  } as const

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, planType: true },
  })

  if (!user) {
    throw new DomainError('NOT_FOUND', 'Usuário não encontrado')
  }

  const planKey = (user.planType as keyof typeof DEFAULT_LIMITS) ?? 'FREE'
  const planLimits = DEFAULT_LIMITS[planKey]
  if (!planLimits) {
    throw new DomainError('NOT_FOUND', 'Plano não encontrado')
  }

  // Saldo de créditos atual
  const balance = await CreditsService.getUserBalance(user.id)
  const isLowBalance = balance < planLimits.recommendedMinCredits

  // Pacotes disponíveis para recomendação (pode não existir no SQLite local)
  // Fallback seguro quando a tabela não existe em dev
  let packages: Array<{ id: string; name: string; credits: number; price: number }> = []
  try {
    packages = await prisma.creditPackage.findMany({
      orderBy: { credits: 'asc' },
      select: { id: true, name: true, credits: true, price: true },
      take: 5,
    })
  } catch (e) {
    packages = []
  }

  // Estratégia simples de recomendação baseada no saldo
  const recommendations = isLowBalance && packages.length > 0
    ? packages.slice(0, 3).map((p) => ({
        packageId: p.id,
        name: p.name,
        credits: p.credits,
        price: p.price,
        reason: `Saldo baixo (${balance}) — adquira ${p.credits} créditos`,
      }))
    : []

  const res = Response.json({
    plan: {
      type: user.planType,
      dailyLimit: planLimits.dailyMessagesLimit,
      monthlyLimit: planLimits.monthlyTokensLimit,
      features: planLimits.featuresEnabled,
    },
    credits: {
      balance,
      currency: 'CREDITS',
      isLowBalance,
      recommendedMin: planLimits.recommendedMinCredits,
    },
    recommendations,
    packages, // opcional, útil para UI montar a vitrine
  })
  setPrivateCache(res, 60) // cache privado curto para melhorar UX sem vazar dados
  return res
})
