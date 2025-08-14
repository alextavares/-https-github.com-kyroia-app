# Diagrama de Fluxo de Requisição – API InnerAI

```mermaid
flowchart TD
    subgraph Client [Cliente]
        A[Requisição HTTP] --> B{Autenticada?}
    end

    subgraph Middleware [Camada Middleware]
        B -->|Sim| C[requireAuth]
        B -->|Não| D[Cache Público]
        C --> E[validateSchema]
        E --> F[rateLimit]
        F --> G[handleRoute]
    end

    subgraph API [Rotas API]
        G --> H{Endpoint}
        H -->|GET /credits/packages| I[Cache 5min + SWR]
        H -->|POST /payments/mp/checkout| J[Auth + Validação]
        H -->|GET /conversations| K[no-store]
        H -->|POST /webhook| L[Verificar Assinatura]
    end

    subgraph Services [Camada Services]
        J --> M[paymentsService.create]
        M --> N[MercadoPago API]
        L --> O[paymentsService.update]
        O --> P[Prisma DB]
    end

    subgraph Cache [Cache Strategy]
        I --> Q{Cache Hit?}
        Q -->|Sim| R[Retorna 200]
        Q -->|Não| S[Busca DB]
        S --> T[Salva Cache]
        T --> R
    end

    subgraph Errors [Error Handling]
        C -->|401| U[AppError: Unauthorized]
        E -->|400| V[AppError: Validation]
        F -->|429| W[AppError: Rate Limit]
        N -->|500| X[AppError: External]
    end
```

## 🧩 Pontos de Cache & Validação

| Endpoint | Cache | Validação | Auth | Observações |
|----------|-------|-----------|------|-------------|
| `GET /credits/packages` | `public, max-age=300, stale-while-revalidate=600` | Zod | ❌ | Catálogo público |
| `GET /credits/balance` | `no-store` | — | ✅ | Dados sensíveis |
| `POST /payments/mp/checkout/*` | `no-store` | Zod | ✅ | Transação única |
| `GET /conversations` | `no-store` | — | ✅ | Lista privada |
| `POST /webhook` | `no-store` | Assinatura MP | ❌ | Externo |
| `GET /templates` | `public, max-age=300` | — | ❌ | Catálogo público |
| `POST /templates` | `no-store` | Zod | ✅ | Criação autenticada |

## 🔐 Fluxo de Autenticação

```mermaid
sequenceDiagram
    Client->>NextAuth: POST /api/auth/[...nextauth]
    NextAuth->>Google: OAuth Flow
    Google-->>NextAuth: Token + Profile
    NextAuth-->>Client: Session Cookie
    Client->>API: GET /api/credits/balance
    API->>requireAuth: Verificar JWT
    requireAuth->>Prisma: Buscar User
    Prisma-->>API: User Data
    API-->>Client: { credits: 100 }
```

## 🔄 Invalidação de Cache

- **Pagamento aprovado** → Invalida `GET /credits/balance`
- **Template criado** → Invalida `GET /templates`
- **Perfil atualizado** → Invalida `GET /api/user/profile`

## 📊 Métricas de Observabilidade

| Métrica | Local | Tipo |
|---------|-------|------|
| Tempo de resposta | `handleRoute` | Histogram |
| Erros por endpoint | `AppError` | Counter |
| Cache hit ratio | `cacheHeaders` | Gauge |
| Rate limit hits | `rateLimit` | Counter |
| Webhook processados | `webhook/route.ts` | Counter |