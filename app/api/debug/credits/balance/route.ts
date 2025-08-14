import { NextRequest, NextResponse } from 'next/server'
import { CreditService } from '@/lib/credit-service'

export async function GET(request: NextRequest) {
  try {
    const isDebugMode = process.env.NODE_ENV === 'development' ||
      request.headers.get('x-debug-key') === process.env.DEBUG_KEY

    if (!isDebugMode) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || request.headers.get('x-debug-user-id') || undefined
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const balance = await CreditService.getUserBalance(userId)
    return NextResponse.json({ userId, balance, currency: 'CREDITS' })
  } catch (error) {
    console.error('[debug.credits.balance] error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


