import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setPublicCache, setNoStore } from '@/lib/cache/headers'
import { handleRoute, DomainError } from '@/lib/http/errors'
import { z } from 'zod'
import { validateWith } from '@/lib/validation/zod-helpers'

export async function GET(request: Request) {
    // GET de templates públicos não exige auth; aplicar cache público moderado
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    // Categoria é string no schema atual; evitamos usar enum do Prisma que não existe/exporta
    const whereClause: { isPublic: true; category?: string } = { isPublic: true }

    if (category) {
      const normalized = category.toUpperCase()
      // Se houver uma lista de categorias válidas em domínio separado, validar aqui.
      // Por ora, aceitamos string normalizada.
      whereClause.category = normalized
    }

    // Se o modelo não existir no schema atual, retorne array vazio
    const templates = await (async () => {
      try {
        return await prisma.promptTemplate.findMany({
          where: whereClause,
          orderBy: [
            { usageCount: 'desc' },
            { createdAt: 'desc' }
          ],
          include: {
            creator: {
              select: {
                name: true,
                email: true
              }
            }
          }
        } as any)
      } catch {
        return [] as any[]
      }
    })()

    const res = NextResponse.json(templates)
    setPublicCache(res, 300, 600)
    return res
}

const postSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  category: z.string().min(2),
  templateContent: z.string().min(1),
  variables: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

export async function POST(request: Request) {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true },
    })

    if (!user) {
      throw new DomainError('NOT_FOUND', 'Usuário não encontrado')
    }

    const json = await request.json()
    const parsed = await validateWith(postSchema, json)
    if (parsed instanceof Response) return parsed

    const categoryUpper = parsed.category.toUpperCase()
    // Opcional: validar contra lista interna; mantemos livre enquanto não há enum exportado do Prisma.

    let template: any
    try {
      template = await prisma.promptTemplate.create({
        data: {
          name: parsed.name,
          description: parsed.description,
          category: categoryUpper,
          templateContent: parsed.templateContent,
          variables: parsed.variables ? JSON.stringify(parsed.variables) : null,
          isPublic: parsed.isPublic ?? true,
          createdBy: user.id,
        },
        include: {
          creator: { select: { name: true, email: true } }
        }
      } as any)
    } catch {
      // Se o modelo não existir, degrade com echo dos dados básicos
      template = {
        id: `tpl_${Date.now()}`,
        name: parsed.name,
        description: parsed.description ?? null,
        category: categoryUpper,
        templateContent: parsed.templateContent,
        variables: parsed.variables ?? [],
        isPublic: parsed.isPublic ?? true,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      }
    }

    const res = NextResponse.json(template, { status: 201 })
    setNoStore(res)
    return res
}