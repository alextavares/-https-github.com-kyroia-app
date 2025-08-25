import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, DomainError } from '@/lib/http/errors'

export const GET = handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    // Buscar usuário básico
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        planType: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new DomainError('NOT_FOUND', 'Usuário não encontrado')
    }

    // Buscar assinatura ativa mais recente SEM acessar prisma.subscription diretamente (workaround tipagem)
    const subscriptionRecords = await prisma.$queryRaw<
      Array<{
        id: string
        status: string
        plan: string | null
        currentPeriodStart: string | null
        currentPeriodEnd: string | null
        createdAt: string
        updatedAt: string
      }>
    >`
      SELECT id, status, plan, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt
      FROM Subscription
      WHERE userId = ${user.id} AND status = 'ACTIVE'
      ORDER BY createdAt DESC
      LIMIT 1
    `

    let subscription = subscriptionRecords[0]
      ? {
          id: subscriptionRecords[0].id,
          status: subscriptionRecords[0].status,
          plan: subscriptionRecords[0].plan,
          currentPeriodStart: subscriptionRecords[0].currentPeriodStart ? new Date(subscriptionRecords[0].currentPeriodStart) : null,
          currentPeriodEnd: subscriptionRecords[0].currentPeriodEnd ? new Date(subscriptionRecords[0].currentPeriodEnd) : null,
          createdAt: new Date(subscriptionRecords[0].createdAt),
          updatedAt: new Date(subscriptionRecords[0].updatedAt),
        }
      : null

    if (!subscription) {
      if (user.planType === 'FREE') {
        const res = NextResponse.json({
          subscription: {
            id: 'free-plan-active',
            planType: 'FREE',
            status: 'ACTIVE' as const,
            startedAt: user.createdAt || new Date().toISOString(),
            expiresAt: null,
            stripeSubscriptionId: null,
          },
        })
        setNoStore(res)
        return res
      } else {
        const res = NextResponse.json({ subscription: null })
        setNoStore(res)
        return res
      }
    }

    // Verificação de expiração c/ schema: currentPeriodEnd
    const now = new Date()
    const periodEnd = subscription?.currentPeriodEnd ?? null
    if (periodEnd && new Date(periodEnd) < now) {
      // Atualiza status via delegate
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' }
      })
      await prisma.user.update({
        where: { id: user.id },
        data: { planType: 'FREE' },
      })
      subscription = null
    }

    if (!subscription) {
      const currentUserPlanType =
        (await prisma.user.findUnique({ where: { id: user.id }, select: { planType: true } }))?.planType ?? user.planType

      if (currentUserPlanType === 'FREE') {
        const res = NextResponse.json({
          subscription: {
            id: 'free-plan-active',
            planType: 'FREE',
            status: 'ACTIVE' as const,
            startedAt: user.createdAt || new Date().toISOString(),
            expiresAt: null,
            stripeSubscriptionId: null,
          },
        })
        setNoStore(res)
        return res
      }
      return NextResponse.json({ subscription: null })
    }

    // Normaliza payload público da assinatura ativa
    const res = NextResponse.json({
      subscription: {
        id: subscription.id,
        planType: subscription.plan ?? user.planType ?? 'FREE',
        status: subscription.status,
        startedAt: subscription.currentPeriodStart ?? subscription.createdAt,
        expiresAt: subscription.currentPeriodEnd ?? null,
        stripeSubscriptionId: null,
      },
    })
    setNoStore(res)
    return res
  })
