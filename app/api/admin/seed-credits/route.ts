import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, DomainError } from '@/lib/http/errors'
import { z } from 'zod'
import { validateWith } from '@/lib/validation/zod-helpers'

// Padronização: somente administradores podem semear créditos.
// Em produção, exige ALLOW_SEED_CREDITS=true. Em dev/test, liberado.

const bodySchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  credits: z.number().int().positive('credits deve ser inteiro positivo'),
  reason: z.string().min(3).max(200).optional(),
})

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    // Checagem de admin — ajuste conforme seu domínio (ex.: auth.roles?.includes('ADMIN'))
    {
      // Tipagem segura evitando any explícito
      const role = (auth as { role?: 'USER' | 'ADMIN'; isAdmin?: boolean } | undefined)?.role
      const isAdminFlag = (auth as { role?: 'USER' | 'ADMIN'; isAdmin?: boolean } | undefined)?.isAdmin
      const isAdmin = role === 'ADMIN' || isAdminFlag === true
      if (!isAdmin) {
        throw new DomainError('FORBIDDEN', 'Acesso restrito a administradores')
      }
    }

    // Guard de ambiente
    const isAllowed =
      process.env.NODE_ENV !== 'production' || process.env.ALLOW_SEED_CREDITS === 'true'
    if (!isAllowed) {
      throw new DomainError(
        'FORBIDDEN',
        'Endpoint de seed permitido apenas fora de produção (defina ALLOW_SEED_CREDITS=true para habilitar em produção)'
      )
    }

    // Rate limit em memória por IP + adminId
    const { extractClientIp, applyRateLimit } = await import('@/lib/auth/guards')
    const ip = extractClientIp(request.headers)
    const rl = await applyRateLimit([ip, auth.userId, 'admin_seed_credits'], { windowMs: 60_000, max: 3 })
    if (rl) {
      setNoStore(rl)
      return rl
    }

    // Parse body
    let json: unknown = null
    try {
      json = await request.json()
    } catch {
      // segue para validação
    }

    const parsed = await validateWith(bodySchema, json)
    if (parsed instanceof Response) {
      return parsed
    }
    const { userId, credits, reason } = parsed

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, creditBalance: true },
    })
    if (!user) {
      throw new DomainError('NOT_FOUND', 'Usuário não encontrado')
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { creditBalance: (user.creditBalance ?? 0) + credits },
      select: { id: true, creditBalance: true },
    })

    const res = NextResponse.json(
      {
        success: true,
        userId: updated.id,
        newBalance: typeof updated.creditBalance === 'number' ? updated.creditBalance : 0,
        reason: reason ?? null,
      },
      { status: 201 }
    )
    setNoStore(res)
    return res
  })
}
