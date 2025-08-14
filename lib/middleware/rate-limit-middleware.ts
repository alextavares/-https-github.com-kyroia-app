import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for dev/local usage only
// In production, replace with Redis or similar shared store
const ipToCounter: Record<string, { count: number; resetAt: number }> = {}

const WINDOW_MS = 15_000
const MAX_REQUESTS = 20

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
    const now = Date.now()
    const entry = ipToCounter[ip]

    if (!entry || entry.resetAt < now) {
      ipToCounter[ip] = { count: 1, resetAt: now + WINDOW_MS }
      return null
    }

    entry.count += 1
    if (entry.count > MAX_REQUESTS) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    return null
  } catch {
    return null
  }
}


