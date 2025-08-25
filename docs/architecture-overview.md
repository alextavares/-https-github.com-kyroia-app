# Arquitetura — Visão Geral

Este documento resume camadas, módulos e integrações externas do sistema.

```mermaid
flowchart TD
  subgraph Client
    U[Usuário no Navegador]
  end

  subgraph Next.js App (app/*)
    UI[Camada de UI\ncomponents/* + pages em app/*]
    MW[middleware.ts\nproteções/redirects]
  end

  subgraph API Routes (app/api/*)
    APIChat[/api/chat/]
    APICredits[/api/credits/*]
    APIModels[/api/models/*]
    APIPayments[/api/payments/*]
    APIStripe[/api/stripe/*]
    APIMP[/api/mercadopago/*]
    APIAuth[/api/auth/*]
    APIOthers[[demais rotas]]
  end

  subgraph Lib (lib/*)
    Auth[lib/auth\nNextAuth]
    AIService[lib/ai/*\naiService + providers]
    Usage[lib/usage-limits]
    Payments[lib/payments/*\npayment-service]
    Models[lib/ai-models + innerai-models-config]
    Prisma[lib/prisma]
    Perf[lib/performance]
  end

  subgraph Persistência
    ORM[Prisma ORM]
    DB[(Database)]
  end

  subgraph Provedores Externos
    OpenRouter[(OpenRouter / OpenAI)]
    Stripe[(Stripe)]
    MP[(Mercado Pago)]
    Supabase[(Supabase - opcional)]
  end

  U --> UI
  UI -->|fetch/POST| APIChat
  UI -->|fetch/GET| APIModels
  UI -->|auth| APIAuth
  UI -->|checkout| APIPayments
  UI -->|webhooks indiretos| APIStripe
  UI -->|webhooks indiretos| APIMP

  APIChat --> AIService
  APIChat --> Usage
  APIChat --> Prisma

  AIService --> OpenRouter
  AIService -.fallback .-> OpenRouter

  Payments --> Stripe
  Payments --> MP

  Prisma --> ORM
  ORM --> DB
```

Notas importantes
- Autenticação: `next-auth` com provedores OAuth e credenciais; sessão acessível nas rotas API.
- Chat: preferencial via OpenRouter; fallback configurável; suporta resposta normal e SSE.
- Limites de uso: verificação por plano (`FREE|LITE|PRO|ENTERPRISE`) e rastreamento diário/mensal quando a tabela de uso existir.
- Pagamentos: Stripe (global) e Mercado Pago (BR) com webhooks dedicados.
- Banco: Prisma configurado; o schema atual aponta `sqlite` no `schema.prisma`, porém o `.env.example` sugere PostgreSQL em produção.

