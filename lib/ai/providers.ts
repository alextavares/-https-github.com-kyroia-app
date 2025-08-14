import OpenAI from "openai";

export type ProviderConfig = {
  name: string;
  apiKey: string;
  baseURL?: string;
  model: string;
};

export function getProviderConfig(): ProviderConfig {
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (openaiKey) {
    return {
      name: "openai",
      apiKey: openaiKey,
      model: "gpt-4o-mini",
    };
  }

  if (openrouterKey) {
    return {
      name: "openrouter",
      apiKey: openrouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
    };
  }

  throw new Error(
    "Nenhuma chave de API configurada. Configure OPENAI_API_KEY ou OPENROUTER_API_KEY."
  );
}

export function createOpenAIClient(cfg: ProviderConfig) {
  return new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
  });
}

// Streaming helper minimalista sem depender do pacote "ai"
// Retorna uma Response SSE com os deltas de conteúdo
export async function streamChatCompletion(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  cfg: ProviderConfig
): Promise<Response> {
  const openai = createOpenAIClient(cfg);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Força o tipo para evitar fricção com tipos de conteúdo multimodal
        const chatStream = await openai.chat.completions.create({
          model: cfg.model,
          // @ts-ignore – passamos o array já na forma esperada pelo SDK
          messages,
          stream: true,
        } as any);

        for await (const chunk of chatStream as any) {
          const delta = chunk?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            const payload = `data: ${JSON.stringify({ delta })}\n\n`;
            controller.enqueue(encoder.encode(payload));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const message = (err && typeof err === 'object' && 'message' in err)
          ? String((err as Error).message)
          : 'stream error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
