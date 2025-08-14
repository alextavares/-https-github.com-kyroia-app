import { NextRequest } from 'next/server'
import { handleRoute, BadRequest, InternalError } from '@/lib/http/errors'
import { prisma } from '@/lib/prisma'
import { isValidMercadoPagoRequest } from '@/lib/mercadopago-validation'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { CreditService } from '@/lib/credit-service'

export const dynamic = 'force-dynamic'

async function processPaymentById(paymentId: string) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('MercadoPago access token not configured')
  }

  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)
  const mpPayment = await payment.get({ id: paymentId })

  return mpPayment
}

export const POST = handleRoute(async (req: NextRequest) => {
  // Read raw body first for signature validation
  const raw = await req.text()
  let json: any
  try {
    json = raw ? JSON.parse(raw) : {}
  } catch {
    json = {}
  }

  // Store initial webhook log for observability
  const log = await prisma.mercadoPagoWebhookLog.create({
    data: {
      body: raw || JSON.stringify(json),
      headers: JSON.stringify(Object.fromEntries(req.headers.entries())),
      status: 'PENDING',
    },
  })

  try {
    // Optional signature validation (enable when MERCADOPAGO_WEBHOOK_SECRET is set)
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const valid = isValidMercadoPagoRequest(req, raw)
      if (!valid) {
        await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'FAILED' } })
        return BadRequest('Assinatura inválida do webhook')
      }
    }

    const paymentId = String(json?.data?.id || json?.id || '')
    const topic = String(json?.topic || json?.type || '')

    if (!paymentId || !(topic.includes('payment') || topic === '')) {
      await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'FAILED' } })
      return BadRequest('Payload inválido do webhook')
    }

    // Fetch payment details from MercadoPago
    const mpPayment = await processPaymentById(paymentId)

    // Only handle approved payments
    if (mpPayment?.status !== 'approved') {
      await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'PROCESSED' } })
      return { ok: true, ignored: true, status: mpPayment?.status }
    }

    // Extract our metadata to identify user & plan
    let meta: any = {}
    try {
      if (mpPayment?.external_reference) {
        meta = JSON.parse(String(mpPayment.external_reference))
      }
    } catch {/* ignore */}

    const userId = String(meta?.userId || '')
    const planId = String(meta?.planId || 'pro')

    if (!userId) {
      await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'FAILED' } })
      return BadRequest('Não foi possível identificar o usuário do pagamento')
    }

    // Upsert subscription/basic user flags, then add credits purchase transaction
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'FAILED' } })
      return BadRequest('Usuário não encontrado')
    }

    // Create Payment record idempotently (by externalId)
    const externalId = String(mpPayment?.id)
    const amount = Number(mpPayment?.transaction_amount || 0)

    await prisma.payment.upsert({
      where: { externalId },
      update: {},
      create: {
        userId,
        amount,
        currency: 'BRL',
        status: String(mpPayment?.status || 'approved'),
        provider: 'mercadopago',
        paymentMethod: String(mpPayment?.payment_method_id || ''),
        externalId,
        mercadoPagoPaymentId: externalId,
      },
    })

    // Upgrade plan and set period placeholders
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: planId.toUpperCase(),
      },
    })

    // Add initial credits for the plan (example: Pro gives 7000 credits)
    const creditsToAdd = planId === 'enterprise' ? 20000 : 7000
    await CreditService.addCredits(userId, creditsToAdd, `Purchase via MercadoPago: ${planId.toUpperCase()}`, undefined, 'PURCHASE')

    await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'PROCESSED' } })
    return { ok: true }
  } catch (err) {
    await prisma.mercadoPagoWebhookLog.update({ where: { id: log.id }, data: { status: 'FAILED' } })
    return InternalError('Falha ao processar webhook do MercadoPago', err)
  }
})

export const GET = handleRoute(async () => ({ ok: true }))
