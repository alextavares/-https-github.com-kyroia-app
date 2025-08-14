import { NextRequest } from 'next/server'
import { z } from 'zod'
import { NotFound, BadRequest } from '@/lib/http/errors'
import { requireAuth } from '@/lib/auth/guards'
import { validateWith } from '@/lib/validation/zod-helpers'

// Padronização: não existe modelo Template no Prisma atual.
// Responderemos NotFound de forma consistente, com autenticação e validação.

const paramsSchema = z.object({
  id: z.string().min(1, 'id é obrigatório'),
})

export async function GET(_req: NextRequest, context: { params: unknown }) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.error

  const parsed = await validateWith(paramsSchema, context?.params ?? {})
  if (parsed instanceof Response) return parsed

  return NotFound('Template não disponível neste ambiente')
}

export async function DELETE(_req: NextRequest, context: { params: unknown }) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.error

  const parsed = await validateWith(paramsSchema, context?.params ?? {})
  if (parsed instanceof Response) return parsed

  return NotFound('Template não disponível neste ambiente')
}