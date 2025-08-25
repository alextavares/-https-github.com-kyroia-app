import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { setNoStore } from '@/lib/cache/headers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { handleRoute } from '@/lib/http/errors'

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
export const POST = handleRoute(async (request: NextRequest) => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
      setNoStore(res)
      return res
    }

    // validação com mensagens esperadas pelo teste
    const json = await request.json().catch(() => null)
    const parsed = ChangePasswordSchema.safeParse(json)
    if (!parsed.success) {
      const msg = parsed.error.errors?.[0]?.message || 'Dados inválidos'
      const res = NextResponse.json({ message: msg }, { status: 400 })
      setNoStore(res)
      return res
    }

    const { currentPassword, newPassword } = parsed.data

    // Buscar usuário com hash de senha (campo correto: password)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, password: true },
    })

    if (!user) {
      const res = NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 })
      setNoStore(res)
      return res
    }
    if (!user.password) {
      const res = NextResponse.json({ message: 'Usuário autenticado via OAuth não pode alterar senha' }, { status: 400 })
      setNoStore(res)
      return res
    }

    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      const res = NextResponse.json({ message: 'Senha atual incorreta' }, { status: 400 })
      setNoStore(res)
      return res
    }

    // Evitar reutilização de mesma senha
    const isSame = await bcrypt.compare(newPassword, user.password)
    if (isSame) {
      const res = NextResponse.json({ message: 'Nova senha não pode ser igual à atual' }, { status: 400 })
      setNoStore(res)
      return res
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
