import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { handleRoute, Unauthorized } from '@/lib/http/errors'

type DailyPoint = {
  date: string
  messages: number
  tokens: number
  cost: number
}

/**
 * Observações importantes (alinhadas ao schema atual):
 * - Não existe tabela Message nem UserUsage no schema atual.
 * - Conversation possui campo messages: Json[] e modelUsed: string | null.
 * - Portanto, métricas são derivadas diretamente de Conversation.messages (Json[]).
 */
type JsonMessage = {
  role?: string
  content?: unknown
  tokensUsed?: number
  createdAt?: string | number | Date
} | null

export async function GET() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized('Não autorizado')
    }
    const userId = auth.userId

    // Coleta dados relevantes das conversas do usuário
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        modelUsed: true,
        messages: true,
      },
      take: 200, // limite razoável para cálculo rápido; ajuste conforme necessidade
    })

    // Agrega métricas a partir de messages: Json[]
    let totalMessages = 0
    let totalTokens = 0 // se tokensUsed existir nos itens Json; caso não, permanece 0
    const dailyMap = new Map<string, DailyPoint>()

    conversations.forEach((conv) => {
      const msgs = Array.isArray(conv.messages) ? conv.messages : []
      msgs.forEach((m) => {
        const msg = m as unknown as JsonMessage
        if (!msg || typeof msg !== 'object') return
        totalMessages += 1

        // tokensUsed é opcional; se presente e numérico, acumula
        const tu = (msg as Record<string, unknown>)['tokensUsed']
        const tokens = typeof tu === 'number' ? tu : 0
        totalTokens += tokens

        // data do ponto diário: usa createdAt da mensagem se existir, senão createdAt da conversa
        const createdVal = msg?.createdAt
        let dt: Date
        if (createdVal instanceof Date) {
          dt = createdVal
        } else if (typeof createdVal === 'string' || typeof createdVal === 'number') {
          const d = new Date(createdVal)
          dt = d
        } else {
          dt = new Date(conv.createdAt)
        }

        if (!isNaN(dt.getTime())) {
          const key = dt.toISOString().split('T')[0]
          if (!dailyMap.has(key)) {
            dailyMap.set(key, { date: key, messages: 0, tokens: 0, cost: 0 })
          }
          const dp = dailyMap.get(key)!
          dp.messages += 1
          dp.tokens += tokens
          // custo não é rastreado no schema atual → permanece 0
        }
      })
    })

    // Conversas recentes (top 5)
    const recentActivity = conversations.slice(0, 5).map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      modelUsed: c.modelUsed,
      // Em ausência de tabela Message, aproximamos "qtd de mensagens" pelo length do Json[]
      _count: { messages: Array.isArray(c.messages) ? c.messages.length : 0 },
    }))

    // Uso por modelo (contagem de conversas por modelUsed)
    const modelUsageMap = new Map<string, { count: number; tokens: number }>()
    conversations.forEach((c) => {
      const model = c.modelUsed ?? 'unknown'
      const prev = modelUsageMap.get(model) ?? { count: 0, tokens: 0 }
      const msgs = Array.isArray(c.messages) ? c.messages : []
      const tokensFromConv = msgs.reduce<number>((acc, m) => {
        const jm = m as unknown as Record<string, unknown>
        const tu = jm['tokensUsed']
        return acc + (typeof tu === 'number' ? tu : 0)
      }, 0)
      modelUsageMap.set(model, { count: prev.count + 1, tokens: prev.tokens + tokensFromConv })
    })

    const chartData = Array.from(dailyMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const res = NextResponse.json({
      overview: {
        totalMessages,
        totalConversations: conversations.length,
        totalCost: 0, // custo não disponível no schema atual
        totalTokens,
      },
      chartData,
      recentActivity,
      modelUsage: Array.from(modelUsageMap.entries()).map(([model, v]) => ({
        model,
        count: v.count,
        tokens: v.tokens,
      })),
    })
    setNoStore(res)
    return res
  })
}
