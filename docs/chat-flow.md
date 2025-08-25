# Fluxo de Chat — API e Streaming

Este documento detalha o fluxo de requisições do chat (não‑stream e SSE) com verificação de limites e rastreio de uso.

```mermaid
sequenceDiagram
  participant U as Usuário
  participant UI as Next.js UI (app/*)
  participant API as Route /api/chat
  participant SESS as next-auth (sessão)
  participant LIM as lib/usage-limits
  participant AI as aiService (lib/ai/*)
  participant PRV as OpenRouter/OpenAI
  participant DB as Prisma/DB

  U->>UI: Digita mensagem
  UI->>API: POST /api/chat { model, messages, stream? }
  API->>SESS: getServerSession(authOptions)
  alt usuário autenticado
    API->>LIM: checkUsageLimits(userId, model)
    LIM-->>API: { allowed | reason/usage }
    opt limite excedido
      API-->>UI: 429 { errorCode: LIMIT_REACHED, ... }
      UI-->>U: Aviso de limite
      return
    end
  end

  API->>AI: generateResponse(messages, model, opts)
  AI->>PRV: Chamada ao provedor (OpenRouter preferencial)
  PRV-->>AI: Resposta (conteúdo + uso)
  AI-->>API: { content, tokensUsed }

  alt stream=false
    API->>DB: trackUsage(userId, model, tokensUsed)
    DB-->>API: OK (ou ignorado se tabela ausente)
    API-->>UI: 200 JSON { choices:[{message}], usage }
    UI-->>U: Exibe resposta
  else stream=true (SSE)
    API-->>UI: text/event-stream (data: { delta })
    loop tokens
      UI-->>U: Atualiza resposta incrementalmente
    end
    API-->>UI: data: [DONE]
    opt pós-stream
      API->>DB: trackUsage(userId, model, tokens)
      DB-->>API: OK (ou ignorado)
    end
  end
```

Erros padronizados
- Chave do provedor não configurada: 503 `{ error: "OpenRouter API key não configurada" }`.
- Rate limit/quota do provedor: 429.
- Timeout: 408.
- Demais falhas: 500 com `{ error, details }`.

Endpoints e referências
- Implementação principal: `app/api/chat/route.ts`.
- Serviço AI: `lib/ai/ai-service.ts` e providers (`openrouter-provider.ts`, `openai-provider.ts`).
- Limites e rastreio: `lib/usage-limits.ts`.

