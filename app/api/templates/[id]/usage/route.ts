import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { setNoStore } from '@/lib/cache/headers'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  if (!id) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  try {
    const updated = await prisma.promptTemplate.update({ where: { id }, data: { usageCount: { increment: 1 } } })
    const res = NextResponse.json({ ok: true, usageCount: updated.usageCount })
    setNoStore(res)
    return res
  } catch {
    return NextResponse.json({ error: 'Falha ao incrementar uso' }, { status: 500 })
  }
}

