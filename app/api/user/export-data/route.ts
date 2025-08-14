import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { handleRoute, Unauthorized, NotFound } from '@/lib/http/errors'
import { setDownloadHeaders } from '@/lib/cache/headers'

/**
 * GET /api/user/export-data
 * Padrão: handleRoute + Unauthorized/NotFound + download headers
 * Observação: Alinhado ao schema Prisma atual (User, Conversation, CreditPackage, Payment).
 */
export async function GET() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized('Não autorizado')
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NotFound('Usuário não encontrado')
    }

    // Modelos existentes no schema:
    // - Conversation (messages: Json[])
    // - Payment (relacionado a CreditPackage e User)
    // - CreditPackage (catálogo de pacotes)
    const [conversations, payments, creditPackages] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.creditPackage.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const statistics = {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((acc, conv) => {
        const msgs = Array.isArray((conv as any).messages) ? (conv as any).messages : []
        return acc + msgs.length
      }, 0),
      totalPayments: payments.length,
      totalCreditsPurchased: payments.reduce((acc, p) => {
        const pkg = creditPackages.find(cp => cp.id === p.creditPackageId)
        return acc + (pkg?.credits ?? 0)
      }, 0),
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      conversations,
      payments,
      creditPackages,
      statistics,
    }

    const body = JSON.stringify(exportData, null, 2)
    const res = new NextResponse(body)
    setDownloadHeaders(res, `innerai-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
    return res
  })
}