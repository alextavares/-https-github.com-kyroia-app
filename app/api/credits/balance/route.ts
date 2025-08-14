import { handleRoute, Unauthorized } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { CreditService } from '@/lib/credit-service'

export const dynamic = 'force-dynamic'

export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const balance = await CreditService.getUserBalance(auth.userId)
  return { balance }
})

