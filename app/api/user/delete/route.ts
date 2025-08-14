import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, applyRateLimit, extractClientIp } from '@/lib/auth/guards'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'
import { setNoStore } from '@/lib/cache/headers'

/**
 * DELETE /api/user/delete
 * Padrão: handleRoute + requireAuth + respostas consistentes + no-store
 * Observações:
 * - Verifica existência do usuário antes de excluir.
 * - Retorna 204 No Content para operações idempotentes e sem payload.
 */
export async function DELETE(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized(auth.error?.message ?? 'Não autorizado')
    }

    // Rate limit por IP + userId para operação sensível
    const ip = extractClientIp(request.headers)
    const rl = await applyRateLimit([ip, auth.userId, 'user_delete'], { windowMs: 60_000, max: 2 })
    if (rl) {
      setNoStore(rl)
      return rl
    }

    // Verifica se o usuário existe (evita erro genérico do Prisma)
    const exists = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true },
    })
    if (!exists) {
      return NotFound('Usuário não encontrado')
    }

    await prisma.user.delete({
      where: { id: auth.userId },
    })

    // Sem corpo de resposta; apenas confirma operação
    const res = new NextResponse(null, { status: 204 })
    setNoStore(res)
    return res
  })
}