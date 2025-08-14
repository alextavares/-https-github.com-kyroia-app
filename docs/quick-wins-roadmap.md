# Quick Wins & Roadmap Incremental

## 🎯 Quick Wins (Impacto Alto / Esforço Baixo)

| # | Tarefa | Arquivo(s) | Impacto | Esforço |
|---|--------|------------|---------|---------|
| 1 | **Remover `any` do Prisma** | `app/api/payments/mp/webhook/route.ts` | 🔴 Segurança | 15 min |
| 2 | **Atualizar Stripe API version** | `lib/stripe.ts` | 🔴 Compatibilidade | 10 min |
| 3 | **Fix LRU Map.delete** | `lib/cache/lru.ts` | 🟡 Performance | 5 min |
| 4 | **Adicionar `@ts-expect-error` comentários** | Vários arquivos | 🟡 DX | 20 min |
| 5 | **Padronizar headers de cache faltantes** | `app/api/credits/balance/route.ts` | 🟡 UX | 10 min |

## 🗺️ Roadmap por Fases

### Fase 1 – Estabilidade (Semana 1)
- [ ] Executar `npx prisma migrate dev`
- [ ] Configurar `NEXTAUTH_URL=http://localhost:3025`
- [ ] Adicionar `MERCADOPAGO_WEBHOOK_SECRET` ao `.env`
- [ ] Rodar `npm run type-check` e corrigir erros restantes

### Fase 2 – Padrões (Semana 2)
- [ ] Extrair `handleRoute` para `lib/api/route-handler.ts`
- [ ] Criar `lib/validations/schemas.ts` com Zod
- [ ] Mover lógica de pagamento para `services/payments.ts`
- [ ] Criar middleware `withAuth` unificado

### Fase 3 – Cache & Performance (Semana 3)
- [ ] Implementar `cacheService` com Redis
- [ ] Adicionar `stale-while-revalidate` em catálogos públicos
- [ ] Cachear `GET /api/credits/packages` com invalidação via webhook
- [ ] Implementar rate limit por IP/user

### Fase 4 – Observabilidade (Semana 4)
- [ ] Adicionar `pino` para logs estruturados
- [ ] Criar `lib/metrics.ts` com Prometheus
- [ ] Dashboard Grafana básico
- [ ] Health check detalhado

## 📁 Estrutura Alvo (Refatoração)

```
src/
├── app/api/
│   ├── v1/                    # Versionamento
│   │   ├── credits/
│   │   ├── payments/
│   │   └── ...
├── lib/
│   ├── api/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   └── handlers/
│   ├── services/
│   ├── cache/
│   └── db/
├── services/
│   ├── payments/
│   ├── auth/
│   └── usage/
└── types/
    ├── api.ts
    └── models.ts
```

## 🧪 Testes Prioritários

1. **E2E**: Fluxo completo de compra via PIX
2. **Integration**: Webhook com assinatura inválida
3. **Unit**: Validação de schemas Zod
4. **Load**: `/api/credits/packages` com 100 req/s

## 🚀 Próximo passo imediato
Executar `npx prisma migrate dev` e rodar `npm run build` para validar.