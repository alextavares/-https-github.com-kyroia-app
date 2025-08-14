import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const limit = Math.min(Number(searchParams.get('limit') || 20), 100)
  const logs = await prisma.mercadoPagoWebhookLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json({ logs })
}

