import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/guards'
import { handleRoute, DomainError } from '@/lib/http/errors'
import { setNoStore } from '@/lib/cache/headers'
import { z } from 'zod'
import { validateWith } from '@/lib/validation/zod-helpers'

export async function GET() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: auth.error.status })
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
      },
    })

    if (!user) {
      throw new DomainError('NOT_FOUND', 'User not found')
    }

    const res = NextResponse.json(user)
    setNoStore(res)
    return res
  })
}

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  // Campos removidos do select por não existirem no schema atual
  profession: z.string().min(1).max(120).optional(),
  organization: z.string().min(1).max(120).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    const json = await request.json()
    const input = await validateWith(patchSchema, json)
    if (input instanceof Response) {
      const res = input
      setNoStore(res)
      return res
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        // Ignorados no schema atual
        // ...(input.profession !== undefined ? { profession: input.profession } : {}),
        // ...(input.organization !== undefined ? { organization: input.organization } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        createdAt: true,
      },
    })

    const res = NextResponse.json(updatedUser)
    setNoStore(res)
    return res
  })
}

export async function DELETE() {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: auth.error.status })
      setNoStore(res)
      return res
    }

    await prisma.user.delete({
      where: { id: auth.userId },
    })

    const res = NextResponse.json({ message: 'Account deleted successfully' })
    setNoStore(res)
    return res
  })
}