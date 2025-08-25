import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/ai/ai-service'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function planDailyMessageLimit(plan: string | undefined): number | 'unlimited' {
  const p = String(plan || 'FREE').toUpperCase()
  if (p === 'ENTERPRISE' || p === 'PRO') return 'unlimited'
  if (p === 'LITE') return 100 // example
  return 50 // FREE default
}

export class UsageTracker {
  private userId: string
  constructor(userId: string) {
    this.userId = userId
  }

  async checkUsageLimit(_model?: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({ where: { id: this.userId } })
      const limit = planDailyMessageLimit((user as any)?.plan || (user as any)?.planType)
      if (limit === 'unlimited') return true
      const usage = await (prisma as any).userUsage.findFirst?.({ where: { userId: this.userId, date: today() } })
      const used = usage?.messagesUsed ?? usage?.messagesCount ?? 0
      return used < (typeof limit === 'number' ? limit : Number.MAX_SAFE_INTEGER)
    } catch {
      // Fail-open if tracking is unavailable
      return true
    }
  }

  async trackMessage(modelId: string, inputTokens: number, outputTokens: number, cost?: number) {
    const date = today()
    const totalTokens = (inputTokens || 0) + (outputTokens || 0)

    let totalCost = cost ?? 0
    if (totalCost === 0) {
      try {
        const perInput = aiService.getAllAvailableModels().find(m => m.id === modelId)?.costPerInputToken ?? 0
        const perOutput = aiService.getAllAvailableModels().find(m => m.id === modelId)?.costPerOutputToken ?? 0
        totalCost = (inputTokens * perInput) + (outputTokens * perOutput)
      } catch {
        totalCost = 0
      }
    }

    const modelMsgKey = `${modelId}Messages`
    const modelTokKey = `${modelId}Tokens`

    // Prefer atomic upsert with increments when available in schema/tests
    try {
      const upsert = (prisma as any).userUsage.upsert
      if (typeof upsert === 'function') {
        return await upsert({
          where: { userId_date: { userId: this.userId, date } },
          create: {
            userId: this.userId,
            date,
            messagesUsed: 1,
            tokensUsed: totalTokens,
            totalCost,
            [modelMsgKey]: 1,
            [modelTokKey]: totalTokens,
          },
          update: {
            messagesUsed: { increment: 1 },
            tokensUsed: { increment: totalTokens },
            totalCost: { increment: totalCost },
            [modelMsgKey]: { increment: 1 },
            [modelTokKey]: { increment: totalTokens },
          },
        })
      }
    } catch {
      // fallthrough to find/update
    }

    try {
      const existing = await (prisma as any).userUsage.findFirst?.({ where: { userId: this.userId, date } })
      if (existing) {
        return await (prisma as any).userUsage.update({
          where: { id: existing.id },
          data: {
            messagesUsed: (existing.messagesUsed ?? existing.messagesCount ?? 0) + 1,
            tokensUsed: (existing.tokensUsed ?? existing.tokenCount ?? 0) + totalTokens,
            totalCost: (existing.totalCost ?? 0) + totalCost,
            [modelMsgKey]: (existing[modelMsgKey] ?? 0) + 1,
            [modelTokKey]: (existing[modelTokKey] ?? 0) + totalTokens,
          },
        })
      }
      return await (prisma as any).userUsage.create({
        data: {
          userId: this.userId,
          date,
          messagesUsed: 1,
          tokensUsed: totalTokens,
          totalCost,
          [modelMsgKey]: 1,
          [modelTokKey]: totalTokens,
        },
      })
    } catch {
      // swallow tracking errors
      return null
    }
  }
}
