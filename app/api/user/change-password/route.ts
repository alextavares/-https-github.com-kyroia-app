import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { handleRoute, Unauthorized, BadRequest, NotFound } from '@/lib/http/errors'
import { validateWith } from '@/lib/validation/zod-helpers'

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .max(128, 'Nova senha deve ter no máximo 128 caracteres')
    .refine((val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val), {
      message: 'Nova senha deve conter letras e números',
    }),
})

/**
 * POST /api/user/change-password
 * Padrão: handleRoute + Unauthorized/BadRequest/NotFound + no-store
 */
export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      return Unauthorized('Não autorizado')
    }

    // validação com helper padronizado
    const json = await request.json().catch(() => null)
    const parsed = await validateWith(ChangePasswordSchema, json)
    if (parsed instanceof Response) return parsed

    const { currentPassword, newPassword } = parsed

    // Buscar usuário com hash de senha (campo correto: password)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, password: true },
    })

    if (!user || !user.password) {
      return NotFound('Usuário não encontrado')
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return BadRequest('Senha atual incorreta')
    }

    // Evitar reutilização de mesma senha
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      return BadRequest('Nova senha não pode ser igual à atual')
    }

    // Gerar novo hash e atualizar (campo correto: password)
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword },
    })

    const res = NextResponse.json({ message: 'Senha alterada com sucesso' })
    setNoStore(res)
    return res
  })
}