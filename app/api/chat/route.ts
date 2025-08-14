import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"

/**
 * Contrato:
 * - Entrada (POST JSON): { model: string, messages: [{role:'user'|'assistant'|'system', content:string}], stream?: boolean }
 * - Saída (200 non-stream): { id, model, created, choices:[{ message:{ role, content } }], usage:{ prompt_tokens, completion_tokens, total_tokens } }
 * - Saída stream (text/event-stream): eventos "data: { delta }" terminando com "data: [DONE]"
 * - Erros SEMPRE JSON: { error, code?, details? }
 * Observação: Nesta etapa NÃO dependemos de banco nem créditos para destravar o chat.
 */

type ChatMessage = { role: "user" | "assistant" | "system"; content: string }
type ChatBody = { model?: string; messages: ChatMessage[]; stream?: boolean }

const parseBodySafely = async (request: NextRequest): Promise<ChatBody | null> => {
  try {
    return (await request.json()) as ChatBody
  } catch {
    return null
  }
}

function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { error: message, details },
    { status }
  )
}

export async function POST(request: NextRequest) {
  // Autenticação opcional (mantemos se já houver login na app)
  // Mantemos autenticação opcional; remover variável evita aviso de unused
  await getServerSession(authOptions).catch(() => null)

  // Body
  const body = await parseBodySafely(request)
  if (!body) {
    return jsonError("JSON inválido no corpo da requisição", 400)
  }

  const {
    model = "gpt-4o-mini",
    messages,
    stream = false,
  } = body as {
    model?: string
    messages: { role: "user" | "assistant" | "system"; content: string }[]
    stream?: boolean
  }

  // Validação básica
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return jsonError("Campo 'messages' é obrigatório e deve ser um array não-vazio", 400)
  }

  // Mapeia para tipo interno
  const aiMessages: AIMessage[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  // Verificação de chave OpenRouter via aiService
  try {
    // generateResponse deverá utilizar OpenRouter como prioridade quando configurado
    if (!stream) {
      const result = await aiService.generateResponse(aiMessages, model)

      const response = {
        id: `chatcmpl_${Math.random().toString(36).slice(2)}`,
        model,
        created: Math.floor(Date.now() / 1000),
        choices: [
          {
            index: 0,
            finish_reason: "stop",
            message: {
              role: "assistant",
              content: result.content,
            },
          },
        ],
        usage: {
          prompt_tokens: result.tokensUsed.input ?? 0,
          completion_tokens: result.tokensUsed.output ?? 0,
          total_tokens: result.tokensUsed.total ?? ((result.tokensUsed.input ?? 0) + (result.tokensUsed.output ?? 0)),
        },
      }

      return NextResponse.json(response, { status: 200 })
    }

    // Streaming SSE
    const encoder = new TextEncoder()
    const streamBody = new ReadableStream({
      async start(controller) {
        try {
          // generateResponseStream deve ser implementado no aiService se ainda não existir
          // fallback: simulamos chunk único com generateResponse
          const maybeStream = (aiService as unknown as {
            generateResponseStream?: (msgs: AIMessage[], model: string) => AsyncIterable<string> | Promise<AsyncIterable<string>>
          }).generateResponseStream

          if (typeof maybeStream === "function") {
            const streamIter = await maybeStream(aiMessages, model)
            for await (const chunk of streamIter) {
              const payload = JSON.stringify({ delta: chunk })
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
            }
          } else {
            const result = await aiService.generateResponse(aiMessages, model)
            const payload = JSON.stringify({ delta: result.content })
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        } catch (err) {
          const message = (err && typeof err === "object" && "message" in err) ? String((err as Error).message) : "Falha ao gerar resposta"
          const payload = JSON.stringify({ error: message })
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`))
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
          controller.close()
        }
      },
    })

    return new NextResponse(streamBody, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    // Mapeamento padronizado de erros
    const msg = (error && typeof error === "object" && "message" in error)
      ? String((error as Error).message)
      : ""
    if (msg.toLowerCase().includes("not configured") || msg.toLowerCase().includes("api key")) {
      return jsonError("OpenRouter API key não configurada", 503, { hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY })
    }
    if (msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota")) {
      return jsonError("Limite de uso temporariamente excedido", 429)
    }
    if (msg.toLowerCase().includes("timeout")) {
      return jsonError("Tempo limite excedido", 408)
    }
    const safeMessage = (error && typeof error === "object" && "message" in error)
      ? String((error as Error).message)
      : undefined
    return jsonError("Falha ao processar chat", 500, { message: safeMessage })
  }
}
