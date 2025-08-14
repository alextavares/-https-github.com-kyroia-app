import { NextResponse } from 'next/server'
import { setPublicCache } from '@/lib/cache/headers'
import { CreditsService } from '@/services/credits'
import { handleRoute, BadRequest } from '@/lib/http/errors'
import { validateWith } from '@/lib/validation/zod-helpers'
import { z } from 'zod'

/**
 * GET /api/credits/packages
 * Público: catálogo de pacotes com cache público.
 * Suporta query opcional `planType` (ex.: 'free' | 'pro' | 'enterprise') via filtragem client-side,
 * pois CreditsService.getAvailablePackages() não aceita parâmetros.
 */
const querySchema = z.object({
  planType: z.string().min(1).max(50).optional(),
})

export async function GET(req: Request) {
  return handleRoute(async () => {
    // Validação de query params
    const url = new URL(req.url)
    const qp = Object.fromEntries(url.searchParams.entries())
    const parsed = await validateWith(querySchema, qp)
    if (parsed instanceof Response) return parsed
    const { planType } = parsed

    // Obtenção de pacotes
    const allPackages = await CreditsService.getAvailablePackages()

    if (!Array.isArray(allPackages)) {
      return BadRequest('Falha ao obter catálogo de pacotes de créditos')
    }

    // Filtragem opcional por planType no servidor (client-side filter)
    // Usa narrowing por inspeção de propriedade sem alterar o tipo do array
    const packages = planType
      ? allPackages.filter((p) => {
          const plan = (p as Record<string, unknown>)['planType']
          return typeof plan === 'string' && plan.toLowerCase() === planType.toLowerCase()
        })
      : allPackages

    const res = NextResponse.json({ packages })
    // Política: público 300s + SWR 600s
    setPublicCache(res, 300, 600)
    return res
  })
}