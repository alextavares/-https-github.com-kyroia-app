import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (!auth.ok) {
    const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
    setNoStore(res)
    return res
  }
  const id = params.id
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    await prisma.templateFavorite.upsert({
      where: { userId_templateId: { userId: auth.userId!, templateId: id } },
      update: {},
      create: { userId: auth.userId!, templateId: id },
    } as any)
    const res = NextResponse.json({ ok: true, favorite: true })
    setNoStore(res)
    return res
  } catch {
    return NextResponse.json({ error: 'Falha ao favoritar' }, { status: 500 })
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
    await prisma.templateFavorite.delete({ where: { userId_templateId: { userId: auth.userId!, templateId: id } } } as any)
  } catch {}
  const res = NextResponse.json({ ok: true, favorite: false })
  setNoStore(res)
  return res
}

