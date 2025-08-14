import { handleRoute, BadRequest, Unauthorized } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession, PAYMENT_PLANS } from '@/lib/payment-service'

export const dynamic = 'force-dynamic'

export const POST = handleRoute(async (req) => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const body = await req.json().catch(() => null as any)
  const planId = String(body?.planId || '')
  const paymentMethod = String(body?.paymentMethod || 'pix') as 'card' | 'pix' | 'boleto'
  const installments = body?.installments ? Number(body.installments) : undefined
  const billingCycle = (body?.billingCycle === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly'

  const plan = PAYMENT_PLANS.find(p => p.id === planId)
  if (!plan || plan.price === 0) {
    return BadRequest('Plano inválido')
  }

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return BadRequest('Usuário não encontrado')

  // Build return URLs (fallback to localhost)
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3025'
  const successUrl = `${baseUrl}/payment/success`
  const cancelUrl = `${baseUrl}/payment/failure`

  const session = await createCheckoutSession({
    planId,
    userId: auth.userId,
    email: user.email,
    paymentMethod,
    installments,
    successUrl,
    cancelUrl,
    billingCycle,
  })

  // Normalize to a common response shape
  if ('checkoutUrl' in session) {
    return { url: (session as any).checkoutUrl, provider: session.provider, ...(session as any) }
  }

  return session
})

