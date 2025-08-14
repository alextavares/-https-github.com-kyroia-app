# Inventário de Rotas API (app/api)

Resumo das rotas encontradas em app/api/, categorizadas por método HTTP, com indicadores de autenticação e hints de cache/invalidação.

Legenda:
- Auth: uso de sessão NextAuth (getServerSession/authOptions) identificado nas rotas analisadas.
- Cache: sugestões iniciais. "No-cache" para mutações/webhooks/streaming; "Public cache" onde aplicável; "Private cache" para dados autenticados com curto TTL; "force-dynamic" quando já definido.

Observação importante:
Este inventário foi construído com base nos arquivos listados e em amostras lidas. Algumas rotas podem ter múltiplos métodos nos respectivos route.ts (GET/POST/PATCH/DELETE). Onde o conteúdo não foi inspecionado neste passo, inferimos métodos comuns pelo contexto do diretório ou deixamos como "TBD" para confirmação posterior.

## Tabela por método

### GET
| Endpoint | Auth | Cache | Observações |
|---|---|---|---|
| /api/analytics/overview | Provável | Private cache (curto TTL) | Dashboard analytics costuma depender de usuário/plano. |
| /api/chat | Provável | No-cache | Endpoint de teste/health de chat em alguns casos, confirmar. |
| /api/chat/stream | Não (teste público) | No-cache / Streaming | SSE/text/event-stream; desabilitar cache. |
| /api/conversations | Provável | Private cache (curto TTL) | Lista conversas por usuário. |
| /api/conversations/[id] | Provável | No-cache | Detalhe conversa; dados sensíveis. |
| /api/conversations/[id]/export | Provável | No-cache | Download/stream de export (desabilitar cache; headers de attachment). |
| /api/credits/balance | Provável | No-cache | Saldo por usuário; mudar frequentemente. |
| /api/credits/history | Provável | Private cache (curto TTL) | Histórico; pode ter TTL curto por usuário. |
| /api/credits/packages | Não | Public cache (médio TTL) | Catálogo de pacotes, público. |
| /api/dashboard/plan | Provável | Private cache (curto TTL) | Plano do usuário. |
| /api/dashboard/stats | Provável | Private cache (curto TTL) | Estatísticas por usuário. |
| /api/debug-usage | Não | No-cache | Endpoint de debug; sem cache. |
| /api/debug-user | Não | No-cache | Endpoint de debug; sem cache. |
| /api/debug/auth | Não | No-cache | Diagnóstico de auth; sem cache. |
| /api/debug/create-test-user | Não | No-cache | Criação/diagnóstico; evitar cache. |
| /api/debug/manual-upgrade | Não | No-cache | Operação de upgrade de teste; sem cache. |
| /api/debug/payment-config | Não | No-cache | Diagnóstico de gateway; sem cache. |
| /api/debug/payment-status | Não | No-cache | Diagnóstico; sem cache. |
| /api/demo-stream | Não | No-cache / Streaming | Streaming de teste; sem cache. |
| /api/getThemeColors | Não | Public cache (médio TTL) | Dados estáticos da UI. |
| /api/health | Não | Public cache (curto TTL) | Healthcheck pode ser sem cache; opcional curto TTL. |
| /api/health-check | Não | Public cache (curto TTL) | Similar ao /health. |
| /api/knowledge | Provável | Private cache (curto TTL) | Conhecimento do usuário; confirmar. |
| /api/knowledge/[id] | Provável | No-cache | Detalhe/sensível. |
| /api/models/usage | Provável | Private cache (curto TTL) | Uso de modelos por usuário. |
| /api/onboarding | Provável | Private cache (curto TTL) | Estado de onboarding por usuário. |
| /api/profile | Provável | Private cache (curto TTL) | Perfil do usuário. |
| /api/public/env-check | Não | Public cache (curto TTL) | Diagnóstico público; curto TTL se necessário. |
| /api/public/manual-upgrade | Não | No-cache | Operação de teste; sem cache. |
| /api/public/payment-debug | Não | No-cache | Debug de pagamento; sem cache. |
| /api/public/payment-status | Não | No-cache | Status de pagamento; sem cache. |
| /api/public-test-chat | Não | No-cache | Teste público; sem cache. |
| /api/stripe/cancel | Stripe | No-cache | Fluxo de cancelamento; sem cache. |
| /api/stripe/checkout | Stripe | No-cache | Inicia checkout; sem cache. |
| /api/stripe/checkout/success | Stripe | No-cache | Callback; sem cache. |
| /api/stripe/mock-checkout | Não | No-cache | Mock; sem cache. |
| /api/stripe/mock-checkout/success | Não | No-cache | Mock callback; sem cache. |
| /api/stripe/webhook | Stripe | No-cache | Webhook server-side; desabilitar cache; validação de assinatura. |
| /api/subscription | Provável | Private cache (curto TTL) | Dados de assinatura do usuário. |
| /api/templates | Provável | Public cache (curto TTL) | Lista pública; filtra por categoria; validar auth se exigida. |
| /api/templates/[id] | Provável | Private cache (curto TTL) | Detalhe; público vs privado com regra. |
| /api/test/ai-status | Não | No-cache | Diagnóstico AI; sem cache. |
| /api/test-auth | Não | No-cache | Diagnóstico auth; sem cache. |
| /api/test-ai | Não | No-cache | Teste aiService; sem cache. |
| /api/test-ai-public | Não | No-cache | Público; sem cache. |
| /api/test-chat | Não | No-cache | Teste chat; sem cache. |
| /api/test-stream-public | Não | No-cache / Streaming | SSE público; sem cache. |
| /api/test-webhook | Não | No-cache | Teste de webhook; sem cache. |
| /api/usage/stats | Sim | Private cache (curto TTL) | Usa getUserUsageStats. |
| /api/usage/today | Sim | No-cache | Limites diários mudam frequentemente. |
| /api/user/profile | Sim | Private cache (curto TTL) | Perfil autenticado. |
| /api/user/export-data | Sim | No-cache | Download de dados; attachment. |
| /api/user/subscription | Sim | Private cache (curto TTL) | Retorna assinatura ou plano FREE; expiração tratada. |

### POST
| Endpoint | Auth | Cache | Observações |
|---|---|---|---|
| /api/auth/register | Público | No-cache | Criação de usuário. |
| /api/auth/register-mock | Público | No-cache | Registro mock para dev. |
| /api/chat | TBD | No-cache | Se aceitar POST para chat; confirmar. |
| /api/conversations | Sim | No-cache | Criação de conversa. |
| /api/credits/purchase | Sim | No-cache | Compra de créditos. |
| /api/mercadopago/checkout | Sim/Público | No-cache | Inicia checkout MercadoPago. |
| /api/mercadopago/mock-checkout | Público | No-cache | Mock. |
| /api/mercadopago/subscription | Sim | No-cache | Gerenciar assinatura. |
| /api/mercadopago/webhook | Público (webhook) | No-cache | Webhook de gateway; validação necessária. |
| /api/stripe/checkout | Público/Privado | No-cache | Inicia checkout Stripe. |
| /api/stripe/mock-checkout | Público | No-cache | Mock. |
| /api/test/simulate-payment | Sim | No-cache | Simula pagamento autenticado. |
| /api/test/simulate-payment-public | Público | No-cache | Simula pagamento público (teste). |
| /api/test/upgrade-plan | Sim (com guard para prod) | No-cache | Atualiza plano em ambiente de teste. |
| /api/templates | Sim | No-cache | Cria template. |
| /api/templates/[id]/use | Sim | No-cache | Incrementa uso; possui rollback se sem permissão. |
| /api/user/change-password | Sim | No-cache | Muda senha; bcrypt. |
| /api/user/clear-data | Sim | No-cache | Limpa dados do usuário. |

### PATCH
| Endpoint | Auth | Cache | Observações |
|---|---|---|---|
| /api/user/profile | Sim | No-cache | Atualiza nome do perfil. |

### DELETE
| Endpoint | Auth | Cache | Observações |
|---|---|---|---|
| /api/user/delete | Sim | No-cache | Exclui conta (cascade). |

## Observações por rota (seleção com base nas leituras)

- /api/user/subscription [GET] (app/api/user/subscription/route.ts):
  - Auth: getServerSession(authOptions).
  - Lógica de fallback para plano FREE quando não há subscription ativa; tratamento de expiração com update de status e plano do usuário.
  - Cache: Private cache curto se necessário, mas cuidado com expiração e consistência; idealmente no-cache e computar server-side a cada request.
  - Sugestão: headers Cache-Control: no-store para eliminar inconsistências; considerar revalidate via eventos de pagamento.

- /api/user/profile [GET, PATCH] (app/api/user/profile/route.ts):
  - Auth: requerido.
  - GET: dados básicos; PATCH: validação mínima do name.
  - Cache: GET pode ter private cache curto (eTag/Last-Modified) mas PATCH deve invalidar.

- /api/user/export-data [GET]:
  - Auth: requerido.
  - Resposta é attachment JSON; desabilitar cache e garantir streaming/timeout adequados.

- /api/user/change-password [POST]:
  - Auth: requerido; bcrypt compare/hash; atualização de passwordHash.
  - Cache: no-cache; adicionar rate limit.

- /api/user/clear-data [POST]:
  - Auth: requerido; deleteMany em várias coleções.
  - Cache: no-cache; auditar impacto e logs.

- /api/usage/today [GET]:
  - Auth: requerido; calcula uso do dia e monthly tokens.
  - Cache: no-cache (dados variam constantemente).
  - Observabilidade: bom candidato a métricas.

- /api/usage/stats [GET]:
  - Auth: requerido; usa lib getUserUsageStats.
  - Cache: private curto TTL opcional; invalidar em mutações.

- /api/templates [GET, POST]:
  - GET: público com filtro por categoria, inclui creator minimal; ideal aplicar cache público moderado e paginação.
  - POST: cria template; validação schema recomendada.

- /api/templates/[id] [GET]:
  - Auth: valida visibilidade: público vs criado pelo usuário.
  - Cache: private cache curto para casos privados; público pode ter cache público curto.

- /api/templates/[id]/use [POST]:
  - Incrementa usageCount; se sem permissão, reverte incremento.
  - Cache: no-cache; usar transação se necessário.

- /api/test-webhook [GET, POST]:
  - Público; POST imprime cuerpo e retorna echo.
  - Cache: no-cache.
  - Segurança: restringir em produção.

- /api/test-* e /api/public-*:
  - Uso de teste/diagnóstico.
  - Em produção: proteger por env flags e limitadores.

- /api/chat/stream [GET]:
  - Streaming SSE; forçar no-store, Connection keep-alive.
  - Implementado com aiService.streamResponseWithCallbacks.

## Recomendações de organização e padrões (resumo inicial)

- Estrutura em camadas:
  - app/api/**/route.ts: controller fino (parse de params, chamada de service, retorno).
  - lib/services/**: regras de negócio (ex.: subscriptionService, usageService, templatesService).
  - lib/validators/**: esquemas Zod para validação dos bodies/params.
  - lib/auth/**: helpers para auth guards (requireAuth, requireRole).
  - lib/cache/**: utilitários para políticas de cache por endpoint.

- Padrões transversais:
  - Auth guard reutilizável: requireAuth() no topo dos handlers.
  - Validação com Zod: schema.parse para POST/PATCH.
  - Error handling padronizado: mapeamento de erros conhecidos para 4xx/5xx.
  - Observabilidade: logs estruturados e métricas por endpoint (latência, taxa de erro).
  - Rate limiting em endpoints sensíveis (senha, webhooks, checkout).
  - Idempotência para webhooks e criação de recursos (chave idempotency).

- Cache policy proposta:
  - GET público estático (ex.: templates públicos, theme colors): public, max-age=300, stale-while-revalidate=600.
  - GET autenticado: private, max-age=60 ou no-store para dados altamente voláteis (usage).
  - Streaming e webhooks: no-store, no-cache, revalidate=0.
  - Downloads: no-store, headers de attachment.

- Invalidação de cache:
  - Ao atualizar perfil, usage ou subscription, invalidar entradas relacionadas do cliente (SWR/React Query) via tags ou revalidatePath em páginas.
  - Webhooks de pagamento disparam invalidações de subscription/usage.

## Próximos passos

1) Mapear acoplamento e duplicações: concentrar lógicas repetidas (auth + prisma lookups + validação) em utilities e serviços.
2) Propor diffs para:
   - Criação de requireAuth em lib/auth/guards.ts.
   - Adição de schemas Zod em lib/validators/*.
   - Padronizar headers de cache por endpoint (middleware ou helpers).
   - Rate limiter simples (ex.: lib/rate-limit) para POST críticos.
3) Diagrama de fluxo: request → middleware (auth/ratelimit) → controller → service → prisma → response + cache headers.