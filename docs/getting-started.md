# Getting Started — Setup e Execução

Stack principal
- Next.js 15 (App Router) + React 19 + Tailwind
- Autenticação: `next-auth`
- ORM: Prisma
- AI: OpenRouter/OpenAI via `lib/ai/*`
- Pagamentos: Stripe e Mercado Pago

Pré‑requisitos
- Node.js >= 22 e npm >= 10 (ver `package.json#engines`)
- Banco de dados (PostgreSQL recomendado em produção). O schema atual está com `sqlite` em `prisma/schema.prisma` — ajuste conforme seu ambiente.

Configuração
1) Copie `.env.example` para `.env` e preencha:
   - Banco: `DATABASE_URL` (e `DIRECT_URL` para Prisma) — use Postgres em prod ou ajuste provider para sqlite.
   - Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
   - AI: `OPENROUTER_API_KEY` e/ou `OPENAI_API_KEY`.
   - Pagamentos: Stripe (`STRIPE_*`) e/ou Mercado Pago (`MERCADOPAGO_*`).
   - OAuth opcionais (Google, GitHub, etc.).
2) Instale dependências: `npm install`
3) Gere cliente Prisma: `npm run postinstall` (ou `npx prisma generate`)
4) (Opcional) Migre/seed: ajuste migrations e rode `npx prisma migrate dev` e `npm run prisma:seed` se aplicável.

Scripts úteis (`package.json`)
- `npm run dev`: inicia Next em `:3000`
- `npm run dev:3025`: inicia Next exposto em 0.0.0.0:3025
- `npm run build` / `npm start`: build e serve produção
- `npm run test:*`: testes unit/integration/e2e
- `npm run diagnose`: diagnóstico do sistema de chat

Modelos e Providers de IA
- Catálogo em `lib/ai/innerai-models-config.*` com mapeamento de planos e custos.
- Serviço AI em `lib/ai/ai-service.*` com fallback e estimativa de tokens.

Limites de uso e créditos
- Limites por plano em `lib/usage-limits.ts`.
- Rastreio diário/mensal é opcional e é ignorado quando a tabela relacionada não existe.

Referências
- Arquitetura: `docs/architecture-overview.md`
- Dados: `docs/data-model.md`
- Chat: `docs/chat-flow.md`
- Pagamentos: `docs/payments-overview.md`

Captura e Animação do Chat
- Comandos prontos no README (seção "Captura e Animação do Chat"): `npm run capture:chat:anim`, `npm run capture:chat:anim:webp`, `npm run anim:chat`, `npm run anim:chat:webp`.
- Parâmetros via env: `FRAME_INTERVAL_MS`, `MAX_CAPTURE_MS`, `ANIM_FPS`, `ANIM_FORMAT`.
