# Estratégia de Cache para app/api

Objetivo: padronizar políticas de cache por categoria de endpoint (público, autenticado, mutação, streaming, webhooks, download), definindo TTLs, headers, pontos de invalidação e recomendações de implementação.

Regras transversais
- 401/403/404/422/429/5xx em rotas autenticadas: sempre no-store.
- 2xx em rotas autenticadas: no-store por padrão (dados sensíveis/variáveis).
- GETs públicos (sem auth) que são catálogos/sem dados sensíveis: usar [TypeScript.setPublicCache()](lib/cache/headers.ts:1) com TTL=300 e SWR=600.
- SSE e downloads: usar headers dedicados ([TypeScript.setSSEHeaders()](lib/cache/headers.ts:1), [TypeScript.setDownloadHeaders()](lib/cache/headers.ts:1)).
- Todos os helpers de cache aplicam automaticamente headers de segurança (HSTS, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy).

Princípios:
- Segurança e consistência têm prioridade sobre latência: dados sensíveis e mutáveis não devem ser servidos de cache não intencional.
- Mutations (POST/PATCH/DELETE) nunca devem ser cacheadas; devem invalidar dados correlatos.
- GET autenticado: se usado cache, deve ser privado, com TTLs curtos e invalidação explícita. Na dúvida, use no-store.
- Endpoints públicos e estáveis podem usar cache público com TTL moderado e SWR.
- Streaming e Webhooks: no-store, sem revalidação.
- Downloads: no-store e headers adequados de attachment/Content-Type.

Categorias e Padrões de Headers:
- Público estático
  - Cache-Control: public, max-age=300, stale-while-revalidate=600
- Público diagnóstico (health/public-test)
  - Cache-Control: public, max-age=60
- Autenticado sensível (usage, profile, subscription)
  - Cache-Control: private, max-age=0, no-store
- Autenticado pouco volátil (lists/overview não críticas)
  - Cache-Control: private, max-age=60
- Mutations (POST/PATCH/DELETE)
  - Cache-Control: no-store
- Streaming (SSE)
  - Cache-Control: no-store
  - Content-Type: text/event-stream
  - Connection: keep-alive
- Webhooks
  - Cache-Control: no-store
- Downloads/Export
  - Cache-Control: no-store
  - Content-Disposition: attachment; filename=...

Exemplos práticos
- Autenticadas (erro e sucesso):
  - Sempre aplicar [TypeScript.setNoStore()](lib/cache/headers.ts:1) na Response (inclui headers de segurança).
  - Em early-returns de auth falha, setar no-store explicitamente antes de retornar.
- Públicas (catálogos):
  - Usar [TypeScript.setPublicCache()](lib/cache/headers.ts:1) com TTL=300 e SWR=600.

Observações
- O wrapper [TypeScript.handleRoute()](lib/http/errors.ts:1) oferece defaults consistentes (inclui `X-Correlation-Id` e tratamento de erros). Respostas criadas manualmente devem respeitar esta política.
- Para SSE e downloads, preferir os helpers dedicados para evitar cabeçalhos incompletos (incluem headers de segurança).
- Em respostas 429 (rate limiting), o guard adiciona `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining` e `X-RateLimit-Reset`; aplicar [TypeScript.setNoStore()](lib/cache/headers.ts:1) quando retornar o `Response` do guard.

Matriz por rota (resumo inicial):
| Endpoint | Método | Categoria | Headers | TTL | Invalidação |
|---|---|---|---|---|---|
| /api/getThemeColors | GET | Público estático | public, max-age=300, s-w-r=600 | 5m | manual (deploy) |
| /api/templates | GET | Público estático/semipúblico | public, max-age=300, s-w-r=600 | 5m | ao criar/editar templates |
| /api/templates/[id] | GET | Público/Autenticado | público: public, max-age=120; privado: private, max-age=60 | 2m/1m | ao editar template/visibilidade |
| /api/public/* | GET | Público diagnóstico | public, max-age=60 | 1m | não crítico |
| /api/health, /api/health-check | GET | Público diagnóstico | public, max-age=30 | 30s | não crítico |
| /api/user/profile | GET | Autenticado sensível | private, no-store | — | após PATCH profile |
| /api/user/subscription | GET | Autenticado sensível | private, no-store | — | webhooks pagamento/mutações |
| /api/usage/today | GET | Autenticado sensível | private, no-store | — | novo uso, reset diário |
| /api/usage/stats | GET | Autenticado pouco volátil | private, max-age=60 | 1m | eventos de uso |
| /api/credits/balance | GET | Autenticado sensível | private, no-store | — | após compra/uso |
| /api/credits/history | GET | Autenticado pouco volátil | private, max-age=60 | 1m | após compra/uso |
| /api/conversations | GET | Autenticado sensível | private, no-store | — | ao criar/editar mensagens |
| /api/conversations/[id] | GET | Autenticado sensível | private, no-store | — | idem |
| /api/conversations/[id]/export | GET | Download | no-store + attachment | — | — |
| /api/chat/stream | GET | Streaming | no-store + SSE headers | — | — |
| /api/test-stream-public | GET | Streaming | no-store + SSE headers | — | — |
| /api/stripe/* (GET) | GET | Callbacks | no-store | — | — |
| /api/mercadopago/* (GET) | GET | Callbacks | no-store | — | — |
| /api/onboarding, /api/dashboard/* | GET | Autenticado pouco volátil | private, max-age=60 | 1m | em mutações relacionadas |

Mutations e Webhooks (sempre no-store):
- /api/templates [POST]
- /api/templates/[id]/use [POST] (incremento; considerar transação)
- /api/user/change-password [POST]
- /api/user/clear-data [POST]
- /api/user/delete [DELETE]
- /api/user/profile [PATCH]
- /api/credits/purchase [POST]
- /api/test/simulate-payment [POST]
- /api/test/simulate-payment-public [POST]
- /api/test/upgrade-plan [POST]
- /api/mercadopago/* [POST] (webhook/checkout/subscription)
- /api/stripe/* [POST] (webhook/checkout)

Pontos de Invalidação sugeridos:
- Pagamentos/Assinatura (Stripe/MercadoPago webhooks):
  - Invalidar: /api/user/subscription, /api/usage/*, /dashboard plan/stats
- Perfil:
  - Invalidar: /api/user/profile
- Conversas/Mensagens:
  - Invalidar: /api/conversations, /api/conversations/[id]
- Templates:
  - Invalidar: /api/templates, /api/templates/[id]
- Créditos:
  - Invalidar: /api/credits/balance, /api/credits/history, usage

Helpers em lib/cache/headers.ts:
- setPublicCache(res, seconds: number, swr?: number) // aplica Cache-Control + headers de segurança
- setPrivateCache(res, seconds: number) // aplica Cache-Control + headers de segurança
- setNoStore(res) // aplica Cache-Control + headers de segurança
- setSSEHeaders(res) // aplica SSE + no-store + headers de segurança
- setDownloadHeaders(res, filename: string, contentType: string) // aplica attachment + no-store + headers de segurança

Exemplo de uso em route handlers:
- TypeScript pseudo-código

lib/cache/headers.ts
export function setPublicCache(res: Response, seconds: number, swr?: number) {
  const extras = swr ? ", stale-while-revalidate=" + swr : "";
  res.headers.set("Cache-Control", "public, max-age=" + seconds + extras);
}
export function setPrivateCache(res: Response, seconds: number) {
  res.headers.set("Cache-Control", "private, max-age=" + seconds);
}
export function setNoStore(res: Response) {
  res.headers.set("Cache-Control", "no-store");
}
export function setSSEHeaders(res: Response) {
  res.headers.set("Content-Type", "text/event-stream");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Connection", "keep-alive");
}
export function setDownloadHeaders(res: Response, filename: string, contentType = "application/octet-stream") {
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Content-Type", contentType);
  res.headers.set("Content-Disposition", "attachment; filename=" + filename);
}

Exemplos aplicados:
- GET /api/templates (público)
const res = NextResponse.json(templates);
setPublicCache(res, 300, 600); // também aplica headers de segurança
return res;

- GET /api/user/subscription (autenticado sensível)
const res = NextResponse.json({ subscription });
setNoStore(res); // também aplica headers de segurança
return res;

- GET /api/test-stream-public (SSE)
const res = new Response(stream);
setSSEHeaders(res); // inclui no-store e headers de segurança
return res;

- GET /api/user/export-data (download)
const res = new NextResponse(JSON.stringify(exportData, null, 2));
setDownloadHeaders(res, "innerai-export-" + new Date().toISOString().split("T")[0] + ".json", "application/json"); // inclui headers de segurança
return res;

Notas para Next.js App Router:
- Para respostas NextResponse/Response, os headers podem ser setados no objeto antes do retorno, como ilustrado.
- Em casos de páginas/rotas que se beneficiam de dynamic rendering, considerar export const dynamic = 'force-dynamic' quando necessário para evitar caching de build.
- No lado do cliente (SWR/React Query), adotar chaves de cache e invalidation tags coerentes com estes endpoints.

Roadmap incremental:
1) Aplicar helpers de cache + segurança em:
   - /api/user/subscription, /api/usage/today, /api/templates, /api/test-stream-public, /api/user/export-data.
2) Estender para demais GETs sensíveis e públicos conforme matriz.
3) Padronizar mutations com setNoStore e adicionar rate limiting onde relevante (guard central).
4) Implementar invalidação cliente (SWR/React Query) nos pontos críticos após mutações e webhooks.
5) Auditar logs e métricas (latência, taxa de HIT/MISS de cache no edge/browser quando aplicável).
6) Considerar CSP no futuro conforme necessidades de UI (comentado no helper).

Riscos e mitigação:
- Stale data em endpoints autenticados: prefira no-store para usage/credits/subscription; onde aplicar private cache, manter TTL curto (≤60s).
- Cache indevido em streaming e webhooks: reforçar setSSEHeaders e setNoStore; considerar testes E2E.
- Regressões por headers faltantes: criar testes de contrato simples (supertest/Playwright) verificando Cache-Control por rota.