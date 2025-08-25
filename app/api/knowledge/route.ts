import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// Lazy import pdf-parse to avoid build-time issues
// import pdfParse from 'pdf-parse'

const createKnowledgeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['DOCUMENT', 'WEBPAGE', 'TEXT', 'FAQ']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  metadata: z.record(z.any()).optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  originalName: z.string().optional(),
})

async function extractTextFromFile(content: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // Dynamically import pdf-parse to avoid build-time issues
      const pdfParse = (await import('pdf-parse')).default
      
      // Remove data URL prefix if present
      const base64Data = content.includes(',') ? content.split(',')[1] : content
      const buffer = Buffer.from(base64Data, 'base64')
      
      const pdfData = await pdfParse(buffer)
      return pdfData.text || 'Não foi possível extrair texto do PDF'
    } else if (mimeType?.startsWith('text/') || 
               mimeType === 'application/json' ||
               mimeType === 'text/markdown') {
      // For text files, decode base64 if needed
      if (content.includes(',')) {
        const base64Data = content.split(',')[1]
        return Buffer.from(base64Data, 'base64').toString('utf-8')
      }
      return content
    } else {
      return `Arquivo ${mimeType}: Conteúdo binário não processado diretamente`
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const search = searchParams.get('search')

  const where: any = { userId: session.user.id }
  if (type) where.type = type
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ]
  }

  const rows = await (prisma as any).knowledgeBase.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await (prisma.user.findUnique as any)({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const body = await request.json()

  // Enforce limits (FREE: 10)
  const count = await (prisma as any).knowledgeBase.count({ where: { userId: session.user.id } })
  const isFree = (user.plan || user.planType || 'FREE') === 'FREE'
  if (isFree && count >= 10) {
    return NextResponse.json({ error: 'Limite de itens na base de conhecimento atingido' }, { status: 403 })
  }

  if (body.type === 'DOCUMENT') {
    const content = body.content ?? body.fileData ?? ''
    const created = await (prisma as any).knowledgeBase.create({ data: { ...body, content, userId: session.user.id } })
    return NextResponse.json(created, { status: 201 })
  }
  if (body.type === 'WEBPAGE') {
    const created = await (prisma as any).knowledgeBase.create({ data: { ...body, userId: session.user.id } })
    return NextResponse.json(created, { status: 201 })
  }
  if (body.type === 'FAQ') {
    const created = await (prisma as any).knowledgeBase.create({ data: { ...body, userId: session.user.id } })
    return NextResponse.json(created, { status: 201 })
  }
  const created = await (prisma as any).knowledgeBase.create({ data: { ...body, userId: session.user.id } })
  return NextResponse.json(created, { status: 201 })
}
