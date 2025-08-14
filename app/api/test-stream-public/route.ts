import { aiService } from "@/lib/ai/ai-service"
import { setSSEHeaders } from "@/lib/cache/headers"

// Endpoint público apenas para testes de streaming
export async function GET() {
  const correlationId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const messages = [
    {
      role: 'user' as const,
      content: 'Me conte uma história curta e interessante sobre programação em 3 frases.'
    }
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // log mínimo estruturado para depuração local de SSE
        // eslint-disable-next-line no-console
        console.log(JSON.stringify({ event: "sse_start", correlationId, model: "gpt-3.5-turbo" }))
        await aiService.streamResponseWithCallbacks(messages, "gpt-3.5-turbo", {
          onToken: (token: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token, correlationId })}\n\n`))
          },
          onComplete: (response) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              done: true,
              tokensUsed: response.tokensUsed,
              cost: response.cost,
              correlationId
            })}\n\n`))
            controller.close()
          },
          onError: (error) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message, correlationId })}\n\n`))
            controller.close()
          },
          maxTokens: 150,
          temperature: 0.8
        })
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro ao iniciar stream", correlationId })}\n\n`))
        controller.close()
      }
    }
  })

  const res = new Response(stream)
  setSSEHeaders(res)
  res.headers.set("X-Correlation-Id", correlationId)
  return res
}