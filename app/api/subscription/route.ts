import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'

/**
 * Lógica de Assinaturas compatível com o client atual.
 * Observado nos tipos gerados: User não expõe 'subscriptions' em select/include
 * e não há delegate prisma.subscription tipado. Porém o schema possui Subscription.
 * Para compatibilidade, consultamos Subscription diretamente por userId.
 */

type ActiveSubDTO = {
  id: string
  userId: string
  status: string
  plan: string | null
  currentPeriodStart: Date | null
  currentPeriodEnd: Date | null
  createdAt: Date
  updatedAt: Date
} | null

async function findActiveSubscription(userId: string): Promise<ActiveSubDTO> {
  // Acessar via $queryRaw como fallback para evitar dependência de delegate gerado
  // SQLite: tabela "Subscription" com colunas conforme schema.
  type Row = {
    id: string
    userId: string
    status: string
    plan: string | null
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    createdAt: string | null
    updatedAt: string | null
  }
  const rows = await prisma.$queryRaw<Row[]>`
    SELECT id, userId, status, plan, currentPeriodStart, currentPeriodEnd, createdAt, updatedAt
    FROM Subscription
    WHERE userId = ${userId} AND status = 'ACTIVE'
    ORDER BY datetime(createdAt) DESC
    LIMIT 1
  `
  if (!rows || rows.length === 0) return null
  const r = rows[0]
  return {
    id: String(r.id),
    userId: String(r.userId),
    status: String(r.status),
    plan: r.plan !== null ? String(r.plan) : null,
    currentPeriodStart: r.currentPeriodStart ? new Date(r.currentPeriodStart) : null,
    currentPeriodEnd: r.currentPeriodEnd ? new Date(r.currentPeriodEnd) : null,
    createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
  }
}

export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  })

  if (!user) {
    return NotFound('User not found')
  }

  const active = await findActiveSubscription(user.id)
  const res = NextResponse.json({
    planType: user.planType,
    subscription: active,
  })
  setNoStore(res)
  return res
})

export const DELETE = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  })
  if (!user) return NotFound('User not found')

  const active = await findActiveSubscription(user.id)
  if (!active) {
    const res404 = NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    setNoStore(res404)
    return res404
  }

  // Executar cancelamento via SQL direto para evitar falta de delegate subscription
  await prisma.$transaction([
    prisma.$executeRawUnsafe(
      `UPDATE Subscription SET status = 'CANCELED', updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      active.id
    ),
    prisma.user.update({
      where: { id: user.id },
      data: { planType: 'FREE' },
    }),
  ])

  const res = NextResponse.json({ ok: true })
  setNoStore(res)
  return res
})