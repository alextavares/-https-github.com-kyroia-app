import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { handleStripeWebhook } from '@/lib/payment-service'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'
import { PaymentStatus } from '@/lib/constants/payment-status'

// Helper function to map Stripe subscription status to internal status
function mapStripeStatusToSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'ACTIVE'
    case 'past_due':
      return 'PAST_DUE'
    case 'canceled':
    case 'unpaid': // unpaid often leads to canceled
    case 'incomplete_expired': // incomplete_expired means it was never completed
      return 'CANCELED'
    case 'incomplete': // Incomplete might not have a direct mapping yet or could be PENDING if we add it
      return 'CANCELED' // Not active
    default:
      return 'CANCELED'
  }
}

async function handleMockWebhook(event: any) {
  // Handle mock webhook events for development
  const mockResult = {
    userId: event.data?.object?.metadata?.userId,
    planId: event.data?.object?.metadata?.planType?.toLowerCase(),
    subscriptionId: event.data?.object?.subscription || `sub_mock_${Date.now()}`,
    customerId: event.data?.object?.customer || `cus_mock_${Date.now()}`,
    status: 'active'
  }
  
  // Process the mock event similar to production
  if (event.type === 'checkout.session.completed' && mockResult.userId && mockResult.planId) {
      const billingCycle = event.data?.object?.metadata?.billingCycle || 'monthly'
      const startDate = new Date()
      let expiresDate = new Date(startDate)

      if (billingCycle === 'yearly') {
        expiresDate.setFullYear(startDate.getFullYear() + 1)
      } else {
        expiresDate.setMonth(startDate.getMonth() + 1)
      }

    await prisma.user.update({
      where: { id: mockResult.userId },
      data: { planType: mockResult.planId.toUpperCase() as any }
    })
    
    await prisma.subscription.create({
      data: {
        userId: mockResult.userId,
        plan: mockResult.planId.toUpperCase(),
        status: 'ACTIVE',
        stripeSubscriptionId: mockResult.subscriptionId,
        currentPeriodStart: startDate,
        currentPeriodEnd: expiresDate,
      }
    })
  }
  
  return NextResponse.json({ received: true })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      // Development mode - parse body as JSON
      const event = JSON.parse(body)
      return handleMockWebhook(event)
    }

    // Production mode - verify signature
    const stripeInstance = stripe() // Call the function to get Stripe instance
    const event = stripeInstance.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    const result = await handleStripeWebhook(event)

    if (result) {
      if (event.type === 'checkout.session.completed' && result.userId && result.planId) {
        const session = event.data.object as Stripe.Checkout.Session
        const billingCycle = session.metadata?.billingCycle || 'monthly'
        const startDate = new Date()
        let expiresDate = new Date(startDate)

        if (billingCycle === 'yearly') {
          expiresDate.setFullYear(startDate.getFullYear() + 1)
        } else {
          // More robust way to add a month, handles month ends correctly
          expiresDate.setMonth(startDate.getMonth() + 1)
          // If the day of the month changed, it means we rolled over, e.g., Jan 31 + 1 month = Feb 28/29
          // So, set to the last day of the previous month to get the correct end of month for next month.
          // This is a bit complex, simpler is to use a library or ensure Stripe provides current_period_end
          // For now, direct month addition is mostly fine.
        }

        // Update user's plan
        await prisma.user.update({
          where: { id: result.userId },
          data: { planType: result.planId.toUpperCase() }
        })

        // Handle existing active subscriptions before creating a new one
        // This typically happens during an upgrade or downgrade
        const existingActiveSubscriptions = await prisma.subscription.findMany({
          where: {
            userId: result.userId,
            status: 'ACTIVE',
            // Ensure we don't try to cancel the one we are about to create if by some race condition it exists
            // Though, `result.subscriptionId` is the new one from Stripe.
            // stripeSubscriptionId: { not: result.subscriptionId as string } // This check might be redundant
          }
        })

        for (const sub of existingActiveSubscriptions) {
          // If the existing active subscription is different from the new one, mark it as cancelled.
          // Stripe usually cancels the old one and creates a new one for plan changes.
          if (sub.stripeSubscriptionId !== result.subscriptionId as string) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'CANCELED', currentPeriodEnd: new Date() }
            })
          }
        }

        // Create new subscription record
        await prisma.subscription.create({
          data: {
            userId: result.userId,
            plan: result.planId.toUpperCase(),
            status: 'ACTIVE',
            stripeSubscriptionId: result.subscriptionId as string,
            currentPeriodStart: startDate,
            currentPeriodEnd: expiresDate,
          }
        })

        // Create payment record
        const amount = result.planId === 'pro' ? 47 : 197 // TODO: derive from product/pricing
        await prisma.payment.create({
          data: {
            userId: result.userId,
            amount,
            currency: 'BRL',
            status: PaymentStatus.COMPLETED,
            provider: 'stripe',
            paymentMethod: 'card',
            externalId: (session as any).payment_intent || `pi_${Date.now()}`
          }
        })
      } else if (event.type === 'customer.subscription.updated') {
        const stripeSubscription = event.data.object as Stripe.Subscription
        const newStatus = mapStripeStatusToSubscriptionStatus(stripeSubscription.status)

        const dataToUpdate: any = { status: newStatus }

        if (stripeSubscription.cancel_at_period_end && stripeSubscription.status === 'active') {
          // Subscription is set to cancel at period end, but still active.
          // Update expiresAt to current_period_end. User retains access.
          dataToUpdate.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000)
          dataToUpdate.status = 'ACTIVE'
        } else {
           // For other status updates, if Stripe provides a current_period_end, use it.
           // This can be relevant if a subscription reactivates or changes.
           if ((stripeSubscription as any).current_period_end) {
             dataToUpdate.currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
           }
        }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubscription.id },
          data: dataToUpdate,
        })

        // If the new status is not ACTIVE (e.g., CANCELED, PAST_DUE), downgrade user
        // Consider if PAST_DUE should immediately downgrade or have a grace period.
        // For now, any non-ACTIVE status (after considering cancel_at_period_end) leads to FREE.
        const effectiveStatusForDowngrade = dataToUpdate.status;

        if (effectiveStatusForDowngrade !== 'ACTIVE' && stripeSubscription.metadata?.userId) {
          await prisma.user.update({
            where: { id: stripeSubscription.metadata.userId },
            data: { planType: 'FREE' },
          })
        }

      } else if (event.type === 'customer.subscription.deleted') {
        const stripeSubscription = event.data.object as Stripe.Subscription // This is the deleted subscription object
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubscription.id },
          data: {
            status: 'CANCELED',
            currentPeriodEnd: new Date(),
          },
        })

        if (stripeSubscription.metadata?.userId) {
          await prisma.user.update({
            where: { id: stripeSubscription.metadata.userId },
            data: { planType: 'FREE' },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}