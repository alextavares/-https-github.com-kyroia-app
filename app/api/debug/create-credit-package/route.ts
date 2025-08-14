import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const isDebugMode = process.env.NODE_ENV === 'development' || 
      request.headers.get('x-debug-key') === process.env.DEBUG_KEY

    if (!isDebugMode) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({})) as any
    const name: string = body.name || `Pacote Dev ${Date.now()}`
    const credits: number = typeof body.credits === 'number' ? body.credits : 1000
    const price: number = typeof body.price === 'number' ? body.price : 9.9
    const currency: string = body.currency || 'BRL'
    const planType: string | undefined = body.planType

    const created = await prisma.creditPackage.upsert({
      where: { name },
      update: { credits, price, currency, planType },
      create: { name, credits, price, currency, planType },
    })

    return NextResponse.json({ package: created })
  } catch (error) {
    console.error('[debug.create-credit-package] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


