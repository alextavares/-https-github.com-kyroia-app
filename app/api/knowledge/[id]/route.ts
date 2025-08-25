import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateKnowledgeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório').optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledge = await prisma.knowledgeBase.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        // description removido se não existir no schema
        type: true,
        content: true,
        // remover campos inexistentes no schema atual para SELECT
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!knowledge) {
      return NextResponse.json({ error: 'Knowledge not found' }, { status: 404 })
    }

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error('Error fetching knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateKnowledgeSchema.parse(body)

    const existing = await prisma.knowledgeBase.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Knowledge not found' }, { status: 404 })
    if ('userId' in (existing as any) && (existing as any).userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.knowledgeBase.update({ where: { id }, data: validatedData })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to update knowledge' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.knowledgeBase.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge' },
      { status: 500 }
    )
  }
}

// Compatibility: tests import PUT; map to PATCH
export { PATCH as PUT }
