import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute } from '@/lib/http/errors'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// GET /api/credits/history
// Padrão: handleRoute + requireAuth + setNoStore, paginação por query (page/pageSize), ordenação por createdAt desc
const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = Response.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    const query = Object.fromEntries(new URL(request.url).searchParams.entries())
    const parsed = querySchema.safeParse(query)
    if (!parsed.success) {
      const res = Response.json({ error: 'Parâmetros de paginação inválidos', issues: parsed.error.issues }, { status: 400 })
      setNoStore(res)
      return res
    }
    const { page, pageSize } = parsed.data

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          createdAt: true,
          creditPackageId: true,
        },
      }),
      prisma.payment.count({
        where: { userId: auth.userId },
      }),
    ])

    const res = Response.json({
      items,
      page,
      pageSize,
      total,
    })
    setNoStore(res)
    return res
  })
}