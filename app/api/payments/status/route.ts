import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/payments/status?paymentId=...&externalId=...&userId=...
// Retorna status do pagamento e, quando possível, o plano atual do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId') || undefined
    const externalId = searchParams.get('externalId') || undefined
    const userId = searchParams.get('userId') || undefined

    if (!paymentId && !externalId) {
      return NextResponse.json({ error: 'Missing paymentId or externalId' }, { status: 400 })
    }

    // Find payment by mercadoPagoPaymentId or externalId or internal id
    const payment = await prisma.payment.findFirst({
      where: {
        AND: [
          userId ? { userId } : {},
          {
            OR: [
              paymentId ? { mercadoPagoPaymentId: String(paymentId) } : undefined,
              paymentId ? { id: String(paymentId) } : undefined,
              externalId ? { externalId: String(externalId) } : undefined,
            ].filter(Boolean) as any,
          },
        ],
      },
      select: {
        id: true,
        userId: true,
        status: true,
        amount: true,
        currency: true,
        provider: true,
        paymentMethod: true,
        mercadoPagoPaymentId: true,
        externalId: true,
        createdAt: true,
      },
    })

    // Determine user for plan lookup
    const effectiveUserId = userId || payment?.userId || null

    const user = effectiveUserId
      ? await prisma.user.findUnique({
          where: { id: effectiveUserId },
          select: { id: true, planType: true },
        })
      : null

    // Optionally include current active subscription detail
    const subscription = effectiveUserId
      ? await prisma.subscription.findFirst({
          where: { userId: effectiveUserId, status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            plan: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
          },
        })
      : null

    return NextResponse.json({ payment, user, subscription })
  } catch (error) {
    console.error('[payments.status] error', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}


