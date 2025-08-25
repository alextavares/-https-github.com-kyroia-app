import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'

const paramsSchema = z.object({ id: z.string().min(1) })

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (!auth.ok) return NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })

  const parsed = paramsSchema.safeParse(params)
  if (!parsed.success) return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const variables: Record<string, string> = body?.variables ?? {}

  const template = await (prisma as any).template.findUnique({ where: { id: parsed.data.id } })
  if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

  // Validar variáveis necessárias
  const requiredVars = Array.from(String(template.content ?? '').matchAll(/\{\{(.*?)\}\}/g)).map((m) => m[1])
  const missing = requiredVars.filter((v) => !(v in variables))
  if (missing.length > 0) {
    return NextResponse.json({ error: `Variáveis faltando: ${missing.join(', ')}` }, { status: 400 })
  }

  // Render
  let content = String(template.content ?? '')
  for (const [k, v] of Object.entries(variables)) {
    const re = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
    content = content.replace(re, String(v))
  }

  // Incrementar uso
  try {
    await (prisma as any).template.update({ where: { id: parsed.data.id }, data: { usageCount: { increment: 1 } } })
  } catch {}

  return NextResponse.json({ content })
}
