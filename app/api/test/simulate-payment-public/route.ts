import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@/lib/constants/payment-status'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, planType: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Create a simulated payment
    const simulatedPaymentId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 49.90, // Basic plan
        currency: 'BRL',
        status: PaymentStatus.COMPLETED,
        mercadoPagoPaymentId: simulatedPaymentId
      }
    })
    
    // Update user to basic plan
    await prisma.user.update({
      where: { id: userId },
      data: { planType: 'BASIC' }
    })
    
    // Create subscription
    const startDate = new Date()
    const expiresDate = new Date(startDate)
    expiresDate.setMonth(startDate.getMonth() + 1)
    
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType: 'BASIC',
        status: 'ACTIVE',
        mercadoPagoPaymentId: simulatedPaymentId,
        startedAt: startDate,
        expiresAt: expiresDate
      }
    })
    
    console.log('✅ Simulated payment created:', {
      paymentId: simulatedPaymentId,
      userId,
      amount: payment.amount,
      subscriptionId: subscription.id
    })
    
    return NextResponse.json({
      success: true,
      paymentId: simulatedPaymentId,
      payment,
      subscription,
      message: 'Payment simulation completed successfully'
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Simulate payment error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}