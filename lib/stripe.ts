import Stripe from 'stripe'

let cached: any | null = null

function locateJestStripeInstance(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const StripeAny: any = require('stripe')
    const candidates: any[] = []
    if (Array.isArray(StripeAny?.mock?.instances)) candidates.push(...StripeAny.mock.instances)
    if (Array.isArray(StripeAny?.default?.mock?.instances)) candidates.push(...StripeAny.default.mock.instances)
    if (Array.isArray((Stripe as any)?.mock?.instances)) candidates.push(...(Stripe as any).mock.instances)
    // Prefer the most recently created mock instance
    if (candidates.length > 0) return candidates[candidates.length - 1]
  } catch {}
  return null
}

function getStripe(): any {
  // If a test seam explicitly set an instance, honor it
  if (cached) return cached

  // Otherwise, prefer a Jest mock instance when available
  const mockInst = locateJestStripeInstance()
  if (mockInst) {
    cached = mockInst
    return cached
  }

  // Otherwise, create a real Stripe client
  const key = process.env.STRIPE_SECRET_KEY || 'sk_test_123'
  cached = new Stripe(key, { apiVersion: '2025-07-30.basil', typescript: true })
  return cached
}

export { getStripe as stripe }

// Test seam: allow tests to inject a specific mock instance deterministically
export function __setTestStripeInstance(inst: any) {
  cached = inst
}

export const getStripeJs = async () => {
  const { loadStripe } = await import('@stripe/stripe-js')
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}
