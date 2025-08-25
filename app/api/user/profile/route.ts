import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { handleRoute, DomainError } from '@/lib/http/errors'
import { setNoStore } from '@/lib/cache/headers'
import { z } from 'zod'
import { validateWith } from '@/lib/validation/zod-helpers'

export const GET = handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new DomainError('NOT_FOUND', 'Usuário não encontrado')
    }

    const res = NextResponse.json(user)
    setNoStore(res)
    return res
  })


const patchSchema = z.object({
  name: z.string().min(2).max(120),
})

export const PATCH = handleRoute(async (request: Request) => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Não autorizado' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    const json = await request.json()
    const input = await validateWith(patchSchema, json)
    if (input instanceof Response) {
      return input
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: { name: input.name },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const res = NextResponse.json(updatedUser)
    setNoStore(res)
    return res
  })
