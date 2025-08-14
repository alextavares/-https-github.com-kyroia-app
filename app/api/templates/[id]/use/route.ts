import { NextRequest } from 'next/server'
import { z } from 'zod'
import { NotFound } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { validateWith } from '@/lib/validation/zod-helpers'

// Padronização: não existe modelo Template no Prisma atual.
// Este endpoint retorna NotFound de forma consistente, mantendo validação e auth.

const paramsSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
})

const bodySchema = z
  .object({
    variables: z.record(z.any()).optional(),
  })
  .optional()

export async function POST(req: NextRequest, context: { params: unknown }) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.error

  const parsedParams = await validateWith(paramsSchema, context?.params ?? {})
  if (parsedParams instanceof Response) return parsedParams

  let body: unknown = undefined
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      body = await req.json()
    }
  } catch {}

  const parsedBody = await validateWith(bodySchema, body)
  if (parsedBody instanceof Response) return parsedBody

  return NotFound('Template não disponível neste ambiente')
}