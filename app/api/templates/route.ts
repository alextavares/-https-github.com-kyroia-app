import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setPublicCache, setNoStore } from '@/lib/cache/headers'
import { DomainError } from '@/lib/http/errors'
import { z } from 'zod'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  const auth = await requireAuth()
  const userId = auth.ok ? auth.userId : null

  const where: any = {
    OR: [
      ...(userId ? [{ userId }] as any[] : []),
      { isPublic: true },
    ],
  }
  if (category) where.category = category
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const rows = await (prisma as any).template.findMany({ where, orderBy: { createdAt: 'desc' } })
  const res = NextResponse.json(rows)
  setPublicCache(res, 60, 120)
  return res
}

const postSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  category: z.string().min(2),
  templateContent: z.string().min(1),
  variables: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.ok) {
    const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
    setNoStore(res)
    return res
  }

  const body = await request.json()
  const name = body?.name as string | undefined
  const content = body?.content as string | undefined
  const category = body?.category as string | undefined
  const variables = (body?.variables as string[] | undefined) ?? []
  const isPublic = Boolean(body?.isPublic)
  const description = body?.description as string | undefined

  if (!name || !content || !category) {
    const res = NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    setNoStore(res)
    return res
  }

  // Validar variáveis presentes no conteúdo
  const requiredVars = Array.from(content.matchAll(/\{\{(.*?)\}\}/g)).map((m) => m[1])
  const missing = requiredVars.filter((v) => !variables.includes(v))
  if (missing.length > 0) {
    const res = NextResponse.json({ error: `variáveis faltando: ${missing.join(', ')}` }, { status: 400 })
    setNoStore(res)
    return res
  }

  // Limite de templates para plano FREE
  let userRow: any = null
  try { userRow = await (prisma.user.findUnique as any)({ where: { id: auth.userId } }) } catch {}
  const plan = (userRow?.plan || userRow?.planType || 'FREE') as string
  if (plan === 'FREE') {
    const existing = await (prisma as any).template.findMany({ where: { userId: auth.userId } })
    if (existing.length >= 5) {
      const res = NextResponse.json({ error: 'Limite de templates atingido para o plano gratuito' }, { status: 403 })
      setNoStore(res)
      return res
    }
  }

  const created = await (prisma as any).template.create({
    data: { name, content, category, variables, isPublic, userId: auth.userId, ...(description ? { description } : {}) },
  })
  const res = NextResponse.json(created, { status: 201 })
  setNoStore(res)
  return res
}
