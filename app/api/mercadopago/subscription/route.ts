import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { PaymentStatus, normalizePaymentStatus } from '@/lib/constants/payment-status'

// Initialize MercadoPago
function getMercadoPagoPayment(): Payment {
  const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    options: { timeout: 5000 }
  })
  return new Payment(client)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, externalReference } = body

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Parse external reference
    let parsedRef: any = {}
    try {
      parsedRef = typeof externalReference === 'string' ? JSON.parse(externalReference) : externalReference
    } catch (e) {
      console.error('[MercadoPago Subscription] Failed to parse external_reference:', externalReference)
    }

    // Verify that the payment belongs to the current user
    if (parsedRef.userId && parsedRef.userId !== session.user.id) {
      return NextResponse.json({ error: 'Payment does not belong to current user' }, { status: 403 })
    }

    // Fetch payment details from MercadoPago
    const payment = await getMercadoPagoPayment().get({ id: paymentId })
    
    console.log('[MercadoPago Subscription] Payment details:', {
      id: payment.id,
      status: payment.status,
      external_reference: payment.external_reference,
      parsed_ref: parsedRef
    })

    const normalizedStatus = normalizePaymentStatus(payment.status)
    if (normalizedStatus !== PaymentStatus.COMPLETED) {
      return NextResponse.json({ 
        error: 'Payment not completed', 
        status: payment.status 
      }, { status: 400 })
    }

    // Check if payment was already processed (by externalId or mercadoPagoPaymentId)
    const existingPayment = await prisma.payment.findFirst({
      where: {
        OR: [
          { externalId: String(paymentId) },
          { mercadoPagoPaymentId: String(paymentId) }
        ]
      }
    })

    if (existingPayment) {
      console.log('[MercadoPago Subscription] Payment already processed')
      return NextResponse.json({ 
        message: 'Payment already processed',
        planType: parsedRef.planId?.toUpperCase() || 'PRO'
      })
    }

    // Update user subscription
    const planType = (parsedRef?.planId && typeof parsedRef.planId === 'string'
      ? parsedRef.planId.toUpperCase()
      : 'PRO') as 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
    const billingCycle = parsedRef.billingCycle || 'monthly'
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { planType }
    })

    // Create subscription record
    const startDate = new Date()
    const expiresDate = new Date(startDate)
    
    if (billingCycle === 'yearly') {
      expiresDate.setFullYear(startDate.getFullYear() + 1)
    } else {
      expiresDate.setMonth(startDate.getMonth() + 1)
    }

    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        // Schema usa 'plan'
        plan: planType,
        status: 'ACTIVE',
        currentPeriodStart: startDate,
        currentPeriodEnd: expiresDate,
        mercadoPagoPaymentId: String(paymentId)
      }
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: payment.transaction_details?.total_paid_amount || 1.0,
        currency: payment.currency_id || 'BRL',
        status: PaymentStatus.COMPLETED,
        provider: 'mercadopago',
        paymentMethod: payment.payment_method_id || 'pix',
        externalId: String(paymentId),
        mercadoPagoPaymentId: String(paymentId)
      }
    })

    console.log('[MercadoPago Subscription] Payment processed successfully for user:', session.user.id)

    return NextResponse.json({ 
      success: true,
      planType,
      message: 'Subscription activated successfully'
    })

  } catch (error) {
    console.error('[MercadoPago Subscription] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}

// GET endpoint to check subscription status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { planType: true }
    })

    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        status: 'ACTIVE'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      planType: user?.planType || 'FREE',
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd
      } : null
    })

  } catch (error) {
    console.error('[MercadoPago Subscription] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}