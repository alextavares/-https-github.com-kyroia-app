# Plano Detalhado de Refatoração – API InnerAI

## 🎯 Objetivo
Transformar a API atual em uma arquitetura **modular, testável e escalável**, seguindo princípios SOLID e Clean Architecture.

---

## 📁 Estrutura de Pastas Alvo

```
src/
├── app/api/v1/                 # Versionamento explícito
│   ├── credits/
│   │   ├── route.ts            # GET /api/v1/credits
│   │   ├── [id]/route.ts       # GET /api/v1/credits/:id
│   │   └── packages/route.ts   # GET /api/v1/credits/packages
│   ├── payments/
│   │   ├── mp/
│   │   │   ├── checkout/
│   │   │   └── webhook/route.ts
│   └── ...
├── lib/
│   ├── api/
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── cache.ts
│   │   │   ├── rate-limit.ts
│   │   │   └── validate.ts
│   │   ├── handlers/
│   │   │   └── route-handler.ts
│   │   └── errors/
│   │       └── api-error.ts
│   ├── services/
│   │   ├── payments/
│   │   │   ├── mercadopago.service.ts
│   │   │   └── stripe.service.ts
│   │   ├── credits.service.ts
│   │   └── user.service.ts
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   └── payment.repository.ts
│   └── schemas/
│       └── api-schemas.ts
├── types/
│   ├── api.ts
│   └── models.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 🔧 Difs Sugeridos (Exemplo: `/credits/packages`)

### Antes: `app/api/credits/packages/route.ts`
```ts
export async function GET() {
  try {
    const packages = await prisma.creditPackage.findMany();
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Depois: `src/app/api/v1/credits/packages/route.ts`
```ts
import { createRoute } from '@/lib/api/handlers/route-handler';
import { cacheHeaders } from '@/lib/api/middlewares/cache';
import { CreditPackageService } from '@/lib/services/credits.service';

export const GET = createRoute()
  .use(cacheHeaders({ maxAge: 300, swr: 600 }))
  .handle(async () => {
    const packages = await CreditPackageService.getAll();
    return { data: packages };
  });
```

---

## 🧩 Padrões Transversais

### 1. **Middleware Chain**
```ts
// lib/api/middlewares/index.ts
export const createRoute = () => ({
  use: (middleware) => ({ handle }),
  handle: (handler) => async (req: NextRequest) => {
    // Execução sequencial de middlewares
  }
});
```

### 2. **Error Handling**
```ts
// lib/api/errors/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}
```

### 3. **Validação com Zod**
```ts
// lib/schemas/api-schemas.ts
export const checkoutSchema = z.object({
  packageId: z.string().uuid(),
  paymentMethod: z.enum(['pix', 'card', 'boleto'])
});
```

---

## 🗂️ Migração por Fases

### Fase 1 – Setup (Dia 1)
```bash
# Criar estrutura base
mkdir -p src/{app/api/v1,lib/{api,services,repositories,schemas},types,tests}

# Mover arquivos
git mv app/api/credits/packages/route.ts src/app/api/v1/credits/packages/route.ts
```

### Fase 2 – Core Services (Dias 2-3)
- [ ] Criar `CreditPackageService`
- [ ] Criar `PaymentService`
- [ ] Criar `UserService`
- [ ] Implementar testes unitários

### Fase 3 – Middlewares (Dias 4-5)
- [ ] Extrair `requireAuth` → `auth.middleware.ts`
- [ ] Extrair `validateSchema` → `validate.middleware.ts`
- [ ] Criar `cache.middleware.ts`
- [ ] Criar `rate-limit.middleware.ts`

### Fase 4 – Rotas (Dias 6-7)
- [ ] Migrar `/credits/*`
- [ ] Migrar `/payments/*`
- [ ] Migrar `/conversations/*`
- [ ] Adicionar testes de integração

---

## 🧪 Testes

### Exemplo: Teste de Integração
```ts
// tests/integration/credits.test.ts
describe('GET /api/v1/credits/packages', () => {
  it('should return cached packages', async () => {
    const res = await request(app)
      .get('/api/v1/credits/packages')
      .expect(200);
    
    expect(res.headers['cache-control']).toMatch(/max-age=300/);
  });
});
```

---

## 📊 Métricas de Sucesso

| Métrica | Atual | Alvo |
|---------|--------|------|
| Cobertura de testes | ~15% | >80% |
| Tempo de build | 45s | <30s |
| Erros de TypeScript | 47 | 0 |
| Duplicação de código | 35% | <10% |
| Tempo médio de resposta | 800ms | <200ms |

---

## 🚀 Comando de Migração
```bash
# Executar após cada fase
npm run type-check
npm run test:unit
npm run test:integration
```

## ✅ Checklist Final
- [ ] Todas as rotas migradas para nova estrutura
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Performance medida
- [ ] Rollback plan preparado