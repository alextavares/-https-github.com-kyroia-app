import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
  }

  try {
    const body = await req.json().catch(() => null as any)
    const userId = String(body?.userId || '')
    const planId = String(body?.planId || 'pro')
    const billingCycle = (body?.billingCycle === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly'
    const method = (body?.paymentMethod === 'boleto' ? 'boleto' : 'pix') as 'pix' | 'boleto'
    const email = String(body?.email || 'sandbox.tester@innerai.local')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: 'MercadoPago access token not configured' }, { status: 500 })
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } })
    const preference = new Preference(client)

    const isYearly = billingCycle === 'yearly'
    const price = isYearly ? (1.00 * 12 * 0.4) : 1.00 // match PAYMENT_PLANS test values
    const title = isYearly ? `Plano ${planId.toUpperCase()} Anual - Kyroia` : `Plano ${planId.toUpperCase()} - Kyroia`

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3025'
    const successUrl = `${baseUrl}/payment/success`
    const cancelUrl = `${baseUrl}/payment/failure`

    const pref = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          },
        ],
        payer: { email },
        payment_methods: {
          excluded_payment_types: method === 'pix' ? [{ id: 'bolbradesco' }, { id: 'ticket' }] : [{ id: 'account_money' }],
          installments: 1,
        },
        back_urls: { success: successUrl, failure: cancelUrl, pending: successUrl },
        auto_return: 'approved',
        external_reference: JSON.stringify({ userId, planId, billingCycle, timestamp: new Date().toISOString() }),
        metadata: { user_id: userId, plan_id: planId, billing_cycle: billingCycle },
      },
    })

    return NextResponse.json({ ok: true, checkoutUrl: pref.init_point, preferenceId: pref.id })
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to create preference', message: err?.message }, { status: 500 })
  }
}

