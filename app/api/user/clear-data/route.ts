import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, applyRateLimit, extractClientIp } from '@/lib/auth/guards'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'
import { setNoStore } from '@/lib/cache/headers'

/**
 * POST /api/user/clear-data
 * Padrão: handleRoute + requireAuth + respostas consistentes + no-store
 * Observações:
 * - Alinhado ao schema Prisma atual (User, Conversation, CreditPackage, Payment).
 * - Remove dados relacionais do usuário, preservando a conta.
 * - Idempotente: responde 200 com relatório do que foi apagado.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized(auth.error?.message ?? 'Não autorizado')
    }

    // Rate limit por IP + userId para operação sensível de limpeza
    const ip = extractClientIp(request.headers)
    const rl = await applyRateLimit([ip, auth.userId, 'user_clear_data'], { windowMs: 60_000, max: 3 })
    if (rl) {
      setNoStore(rl)
      return rl
    }

    // Verifica existência do usuário
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true },
    })
    if (!user) {
      return NotFound('Usuário não encontrado')
    }

    // Executa deleções em paralelo quando possível
    const [
      conversationsResult,
      // No schema atual não existem PromptTemplate/UserUsage
      // Mantemos apenas o que de fato existe.
    ] = await Promise.all([
      prisma.conversation.deleteMany({ where: { userId: auth.userId } }),
    ])

    const res = NextResponse.json({
      message: 'Dados limpos com sucesso',
      deleted: {
        conversations: conversationsResult.count,
        // Campos mantidos por compatibilidade, porém sempre 0 no schema atual
        privateTemplates: 0,
        usageStatistics: 0,
      },
    })
    setNoStore(res)
    return res
  })
}