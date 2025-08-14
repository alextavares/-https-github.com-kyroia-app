import { requireAuth } from "@/lib/auth/guards"
import { handleRoute, Unauthorized } from "@/lib/http/errors"
import { ConversationsService, ConversationCreateInput } from "@/services/conversations"

/**
 * Padronização App Router:
 * - export const GET/POST = handleRoute(async (req) => { ... })
 * - requireAuth para 401 estável
 * - evitar retornar Promise diretamente em export
 */

export const GET = handleRoute(async () => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const payload = await ConversationsService.listByUser(auth.userId)
  return payload
})

export const POST = handleRoute(async (req: Request) => {
  const auth = await requireAuth()
  if (!auth.ok) return Unauthorized()

  const body = (await req.json().catch(() => ({}))) as Omit<ConversationCreateInput, "userId">
  const created = await ConversationsService.create({
    userId: auth.userId,
    title: body.title,
    modelUsed: body.modelUsed,
  })
  return created
})