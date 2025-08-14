import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateSubscriptionFromWebhook } from '@/lib/subscription-service'
import { processMercadoPagoPaymentWebhook } from '@/lib/payments/mercadopago-webhook-processor'

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get('x-worker-token') || ''
  const expected = process.env.WEBHOOK_WORKER_TOKEN || ''
  if (process.env.NODE_ENV !== 'production') return true
  return expected.length > 0 && token === expected
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pending = await prisma.mercadoPagoWebhookLog.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: 100,
    })

    let processed = 0
    let failed = 0

    for (const row of pending) {
      try {
        const payload = JSON.parse(row.body)
        if (payload && payload.type && payload.data && payload.data.id) {
          // Primeiro tenta processar como compra de créditos/pagamento interno
          const result = await processMercadoPagoPaymentWebhook(payload)
          if (!result.handled) {
            // Fallback para fluxo de assinatura (mantém compatibilidade)
            await updateSubscriptionFromWebhook(payload)
          }
          await prisma.mercadoPagoWebhookLog.update({
            where: { id: row.id },
            data: { status: 'PROCESSED' },
          })
          processed++
        } else {
          throw new Error('Invalid payload shape')
        }
      } catch (e) {
        console.error('[process-pending] Failed to process', row.id, e)
        await prisma.mercadoPagoWebhookLog.update({
          where: { id: row.id },
          data: { status: 'FAILED' },
        })
        failed++
      }
    }

    return NextResponse.json({ ok: true, processed, failed })
  } catch (error) {
    console.error('[process-pending] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const limitParam = new URL(request.url).searchParams.get('limit')
  const limit = Math.min(Math.max(Number(limitParam) || 50, 1), 200)
  const items = await prisma.mercadoPagoWebhookLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ items })
}


