import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get usage by model for the current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    // Our schema doesn't have a userUsage table; compute from messages
    const convs = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    })
    const convIds = convs.map(c => c.id)
    if (convIds.length === 0) {
      return NextResponse.json({ usage: [] })
    }

    const grouped = await prisma.message.groupBy({
      by: ['modelUsed'],
      where: {
        conversationId: { in: convIds },
        createdAt: { gte: startOfMonth },
      },
      _count: { _all: true },
      _sum: { tokensUsed: true },
    })

    const formattedUsage = grouped.map(u => ({
      modelId: (u as any).modelUsed || 'unknown',
      messagesCount: (u as any)._count?._all || 0,
      tokensUsed: Number((u as any)._sum?.tokensUsed || 0),
      cost: 0,
    }))

    return NextResponse.json({ usage: formattedUsage })
  } catch (error) {
    console.error('Get model usage error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar uso dos modelos' },
      { status: 500 }
    )
  }
}
