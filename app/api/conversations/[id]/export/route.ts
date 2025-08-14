import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/guards'
import { setDownloadHeaders } from '@/lib/cache/headers'
import { prisma } from '@/lib/prisma'
import { handleRoute, Unauthorized, NotFound, BadRequest } from '@/lib/http/errors'

/**
 * GET /api/conversations/[id]/export
 * Alinha ao padrão: handleRoute + DomainError + no-store + headers de download.
 * Ajuste importante: params é síncrono no App Router.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleRoute(async () => {
    const auth = await requireAuth()
    if (!auth.ok) {
      // Padroniza via helper de erro
      return Unauthorized('Não autorizado')
    }

    const { id } = params
    if (!id) {
      return BadRequest('Parâmetro "id" ausente')
    }

    const { searchParams } = new URL(request.url)
    const format = (searchParams.get('format') || 'json').toLowerCase()

    // Helper simples para identificar o usuário a partir do contexto
    function userIdentifierFromAuth(a: { ok: true; userId: string }): string {
      return a.userId
    }

    // Leitura alinhada ao schema relacional atual (Conversation 1-N Message)
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId: auth.userId },
      select: {
        id: true,
        title: true,
        modelUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!conversation) {
      return NotFound('Conversa não encontrada')
    }

    // Buscar mensagens ordenadas cronologicamente
    const dbMessages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      select: {
        role: true,
        content: true,
        createdAt: true,
      },
    })

    // Normalizar payload para export mantendo compatibilidade
    const messages = dbMessages.map((m) => ({
      role: typeof m.role === 'string' ? m.role : 'ASSISTANT',
      content: typeof m.content === 'string' ? m.content : String((m as unknown as { content?: unknown }).content ?? ''),
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : undefined,
    }))

    const exportData = {
      title: conversation.title,
      model: conversation.modelUsed,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      user: userIdentifierFromAuth(auth),
      messages,
    }

    const baseFilename = `${(conversation.title || 'conversa').replace(/[^\p{L}\p{N}\-_ ]/gu, '').trim() || 'conversa'}-${new Date().toISOString().split('T')[0]}`

    if (format === 'json') {
      const res = NextResponse.json(exportData)
      setDownloadHeaders(res, `${baseFilename}.json`, 'application/json')
      return res
    }

    if (format === 'md' || format === 'markdown') {
      let markdown = `# ${exportData.title}\n\n`
      markdown += `**Modelo:** ${exportData.model}\n`
      markdown += `**Data:** ${new Date(exportData.createdAt).toLocaleDateString('pt-BR')}\n`
      markdown += `**Usuário:** ${exportData.user}\n\n`
      markdown += `---\n\n`

      exportData.messages.forEach((msg) => {
        const timestamp = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('pt-BR') : ''
        if (msg.role === 'USER') {
          markdown += `### 👤 Usuário${timestamp ? ` (${timestamp})` : ''}\n\n${msg.content}\n\n`
        } else {
          markdown += `### 🤖 Assistente${timestamp ? ` (${timestamp})` : ''}\n\n${msg.content}\n\n`
        }
      })

      const res = new NextResponse(markdown)
      setDownloadHeaders(res, `${baseFilename}.md`, 'text/markdown; charset=utf-8')
      return res
    }

    if (format === 'txt') {
      let text = `${exportData.title}\n`
      text += `${'='.repeat(exportData.title?.length || 10)}\n\n`
      text += `Modelo: ${exportData.model}\n`
      text += `Data: ${new Date(exportData.createdAt).toLocaleDateString('pt-BR')}\n`
      text += `Usuário: ${exportData.user}\n\n`
      text += `${'-'.repeat(50)}\n\n`

      exportData.messages.forEach((msg) => {
        const timestamp = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('pt-BR') : ''
        if (msg.role === 'USER') {
          text += `[USUÁRIO${timestamp ? ` - ${timestamp}` : ''}]\n${msg.content}\n\n`
        } else {
          text += `[ASSISTENTE${timestamp ? ` - ${timestamp}` : ''}]\n${msg.content}\n\n`
        }
      })

      const res = new NextResponse(text)
      setDownloadHeaders(res, `${baseFilename}.txt`, 'text/plain; charset=utf-8')
      return res
    }

    // Formato inválido → DomainError/BadRequest padronizado
    return BadRequest('Formato não suportado. Use: json, md, markdown ou txt')
  })
}