import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { processMercadoPagoPaymentWebhook } from '@/lib/payments/mercadopago-webhook-processor'

export async function POST(request: NextRequest) {
  try {
    const isDebugMode = process.env.NODE_ENV === 'development' ||
      request.headers.get('x-debug-key') === process.env.DEBUG_KEY

    if (!isDebugMode) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({})) as any
    const userId: string | undefined = body.userId
    const amount: number = typeof body.amount === 'number' ? body.amount : 0
    const currency: string = body.currency || 'BRL'
    const creditPackageId: string | undefined = body.creditPackageId
    const paymentMethod: string = body.paymentMethod || 'pix'
    const provider: string = body.provider || 'mercadopago'
    const externalId: string = body.externalId || randomUUID()
    const setCompleted: boolean = !!body.setCompleted

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        currency,
        status: 'pending',
        provider,
        paymentMethod,
        externalId,
        creditPackageId,
      },
    })

    let processed: any = null
    if (setCompleted) {
      processed = await processMercadoPagoPaymentWebhook({
        type: 'payment',
        data: { id: externalId, status: 'approved', payer: { id: userId } },
      })
    }

    const latest = await prisma.payment.findUnique({ where: { id: payment.id } })
    return NextResponse.json({ payment: latest, processed })
  } catch (error) {
    console.error('[debug.create-payment] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


