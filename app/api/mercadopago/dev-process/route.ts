import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { CreditService } from '@/lib/credit-service'

export const dynamic = 'force-dynamic'

async function fetchPayment(id: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN
  if (!accessToken) throw new Error('Missing MercadoPago access token')
  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  return payment.get({ id })
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const { paymentId } = await req.json()
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const mpPayment = await fetchPayment(String(paymentId))
    const externalId = String(mpPayment?.id)

    if (mpPayment?.status !== 'approved') {
      return NextResponse.json({ ok: true, ignored: true, status: mpPayment?.status, externalId })
    }

    let meta: any = {}
    try { if (mpPayment?.external_reference) meta = JSON.parse(String(mpPayment.external_reference)) } catch {}
    const userId = String(meta?.userId || '')
    const planId = String(meta?.planId || 'pro')
    if (!userId) return NextResponse.json({ error: 'Missing userId in external_reference' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 })

    await prisma.payment.upsert({
      where: { externalId },
      update: {},
      create: {
        userId,
        amount: Number(mpPayment?.transaction_amount || 0),
        currency: 'BRL',
        status: String(mpPayment?.status || 'approved'),
        provider: 'mercadopago',
        paymentMethod: String(mpPayment?.payment_method_id || ''),
        externalId,
        mercadoPagoPaymentId: externalId,
      },
    })

    await prisma.user.update({ where: { id: userId }, data: { planType: planId.toUpperCase() } })
    const creditsToAdd = planId === 'enterprise' ? 20000 : 7000
    const res = await CreditService.addCredits(userId, creditsToAdd, `Purchase via MercadoPago (dev-process): ${planId.toUpperCase()}`, undefined, 'PURCHASE')

    return NextResponse.json({ ok: true, externalId, userId, planId, credited: res.success, newBalance: res.newBalance })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to process payment', message: err?.message }, { status: 500 })
  }
}

