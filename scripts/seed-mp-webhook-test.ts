/*
  Seed a test user and payment, then simulate a MercadoPago webhook
  for the internal endpoint /api/payments/mp/webhook which validates
  HMAC signature using MERCADOPAGO_WEBHOOK_SECRET and updates Payment.

  Usage:
    npx tsx scripts/seed-mp-webhook-test.ts
*/

import crypto from 'crypto'

// Ensure env defaults for local dev/testing before importing prisma
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db'
}
if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'your-mercadopago-webhook-secret'
}

// Import prisma normally (avoid top-level await for tsx)
import { prisma } from '../lib/prisma'

async function main() {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-mercadopago-webhook-secret'

  // 1) Ensure a test user exists
  const user = await prisma.user.create({
    data: {
      email: `mp-test-${Date.now()}@example.com`,
      name: 'MP Test User',
      planType: 'FREE',
    },
  })
  console.log('Created test user:', user.id)

  // 2) Seed a Payment with externalId matching the MP payment id we will send
  const paymentId = 'mp_seed_123456789'
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      amount: 10.0,
      currency: 'BRL',
      status: 'pending',
      provider: 'mercadopago',
      paymentMethod: 'pix',
      externalId: paymentId,
      mercadoPagoPaymentId: paymentId,
    },
    select: { id: true, userId: true, status: true, externalId: true },
  })
  console.log('Seeded payment:', payment)

  // 3) Build webhook payload and signature
  const body = JSON.stringify({
    type: 'payment',
    data: { id: paymentId, status: 'approved' },
  })
  const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex')

  // 4) POST to local webhook endpoint
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/payments/mp/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-signature': hmac,
    },
    body,
  })
  const text = await res.text()
  console.log('Webhook response status:', res.status)
  console.log('Webhook response body:', text)

  // 5) Verify payment updated
  const updated = await prisma.payment.findUnique({ where: { externalId: paymentId } })
  console.log('Updated payment:', updated)

  // 6) Debug API check
  try {
    const dbg = await fetch(`${baseUrl}/api/debug/payment-status?paymentId=${encodeURIComponent(paymentId)}&userId=${encodeURIComponent(user.id)}`)
    const dbgText = await dbg.text()
    console.log('Debug API status:', dbg.status)
    console.log('Debug API body:', dbgText)
  } catch (e) {
    console.warn('Debug API request failed:', e)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


