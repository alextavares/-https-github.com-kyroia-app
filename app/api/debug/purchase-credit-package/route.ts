import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreditService } from '@/lib/credit-service'
import { PaymentStatus } from '@/lib/constants/payment-status'

export async function POST(request: NextRequest) {
  try {
    const isDebugMode = process.env.NODE_ENV === 'development' || 
      request.headers.get('x-debug-key') === process.env.DEBUG_KEY

    if (!isDebugMode) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({})) as any
    const userId: string | undefined = body.userId
    const packageId: string | undefined = body.packageId

    if (!userId || !packageId) {
      return NextResponse.json({ error: 'Missing userId or packageId' }, { status: 400 })
    }

    const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: pkg.price,
        currency: pkg.currency,
        status: PaymentStatus.COMPLETED,
        provider: 'manual',
        paymentMethod: 'debug',
        externalId: `debug_${Date.now()}`,
        creditPackageId: pkg.id,
      },
    })

    const added = await CreditService.addCredits(userId, pkg.credits, `Compra de créditos: ${pkg.name}`, pkg.id, 'PURCHASE')

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, creditBalance: true, planType: true } })

    return NextResponse.json({ payment, added, user })
  } catch (error) {
    console.error('[debug.purchase-credit-package] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


