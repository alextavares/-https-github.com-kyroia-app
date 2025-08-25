import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore, setPublicCache } from '@/lib/cache/headers'
import { z } from 'zod'

const putSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  category: z.string().min(2).optional(),
  templateContent: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    const row = await (prisma as any).template.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

    const res = NextResponse.json(row)
    setPublicCache(res, 60, 300)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao buscar template' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (!auth.ok) {
    const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
    setNoStore(res)
    return res
  }

  const id = params.id
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', issues: parsed.error.flatten() }, { status: 400 })

  try {
    const existing = await (prisma as any).template.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
    if (existing.userId !== auth.userId) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

    const data: any = { ...parsed.data }

    const updated = await (prisma as any).template.update({ where: { id }, data })
    const res = NextResponse.json(updated)
    setNoStore(res)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao atualizar template' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (!auth.ok) {
    const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
    setNoStore(res)
    return res
  }

  const id = params.id
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  try {
    const existing = await (prisma as any).template.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
    if (existing.userId !== auth.userId) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

    await (prisma as any).template.delete({ where: { id } })
    const res = new Response(null, { status: 204 })
    setNoStore(res)
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Falha ao remover template' }, { status: 500 })
  }
}
