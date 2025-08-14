import { handleRoute, BadRequest, Unauthorized } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { CreditService } from '@/lib/credit-service'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const POST = handleRoute(async (req) => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  // For safety, only allow in development unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MANUAL_CREDIT_ADD !== 'true') {
    return BadRequest('Operação não permitida em produção')
  }

  const body = await req.json().catch(() => null as any)
  const amount = Number(body?.amount)
  const type = typeof body?.type === 'string' ? body.type : 'PURCHASE'

  if (!Number.isFinite(amount) || amount <= 0) {
    return BadRequest('Quantidade de créditos inválida')
  }

  // Ensure user exists
  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return BadRequest('Usuário não encontrado')

  const res = await CreditService.addCredits(auth.userId, amount, 'Manual add', undefined, type)
  if (!res.success) {
    return BadRequest(res.message || 'Falha ao adicionar créditos')
  }
  return { ok: true, newBalance: res.newBalance }
})

