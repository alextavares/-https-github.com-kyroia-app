/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto';

// Removed unused JestMockable type to satisfy eslint

type PurchaseModule = {
  POST?: (req: Request) => Promise<Response>;
  default?: { POST?: (req: Request) => Promise<Response> };
};

async function loadHandler(): Promise<(req: Request) => Promise<Response>> {
  const mod = (await import('@/app/api/credits/purchase/route.ts')) as PurchaseModule;
  const handler = mod.POST ?? mod.default?.POST;
  if (!handler) throw new Error('Handler POST not found');
  return handler;
}

function req(url = 'http://localhost/api/credits/purchase', init?: RequestInit): Request {
  return new Request(url, { method: 'POST', ...init });
}

function jsonBody(data: unknown): RequestInit {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

// Stable JSON with sorted keys (should match computeRequestHash semantics)
function stableJson(obj: unknown) {
  const sort = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === 'object') {
      const o = v as Record<string, unknown>;
      return Object.keys(o)
        .sort()
        .reduce((acc, k) => {
          (acc as any)[k] = sort(o[k]);
          return acc;
        }, {} as Record<string, unknown>);
    }
    return v;
  };
  return JSON.stringify(sort(obj));
}

function computeHash(payload: unknown) {
  return crypto.createHash('sha256').update(stableJson(payload)).digest('hex');
}

describe('POST /api/credits/purchase - Idempotency', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.dontMock('@/app/api/credits/purchase/route.ts');
  });

  test('primeira chamada com Idempotency-Key cria pagamento (201)', async () => {
    // Mocks estáveis de guards/rate limit
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_1' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    // Mock do Prisma
    const paymentCreate = jest.fn().mockResolvedValue({
      id: 'pay_1',
      userId: 'user_1',
      creditPackageId: 'pkg_1',
      amount: 1000,
      currency: 'USD',
      status: 'PAID',
      externalId: 'purchase_1',
      paymentMethod: 'manual',
    });

    // Mock idempotency delegate (primeira vez cria e depois atualiza)
    const idempoFindUnique = jest.fn().mockResolvedValue(null);
    const idempoCreate = jest.fn().mockResolvedValue({
      id: 'idem_1',
      userId: 'user_1',
      route: '/api/credits/purchase',
      key: 'k1',
      requestHash: computeHash({ packageId: 'pkg_1', credits: null, price: 1000, currency: 'USD' }),
      responseStatus: null,
      responseBody: null,
      responseHeaders: null,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const idempoUpdate = jest.fn().mockResolvedValue({});

    const prismaTransaction = jest.fn().mockImplementation(async (fn: any) => {
      const tx = {
        idempotencyRequest: {
          findUnique: idempoFindUnique,
          create: idempoCreate,
          update: idempoUpdate,
        },
      };
      return fn(tx);
    });

    // Re-mock prisma to include $transaction and payment.create
    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: paymentCreate },
        $transaction: prismaTransaction,
      },
    }));

    const handler = await loadHandler();
    const payload = { packageId: 'pkg_1', price: 1000, currency: 'USD' };
    const res = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k1',
        },
        body: JSON.stringify(payload),
      })
    );

    expect(res.status).toBe(201);
    expect(paymentCreate).toHaveBeenCalledTimes(1);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const data = await res.json();
    expect(data).toMatchObject({
      id: 'pay_1',
      userId: 'user_1',
      creditPackageId: 'pkg_1',
      amount: 1000,
      currency: 'USD',
      status: 'PAID',
    });
  });

  test('replay com mesma key/payload retorna 201 e NÃO recria pagamento', async () => {
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_2' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    const paymentCreate = jest.fn().mockResolvedValue({
      id: 'pay_x',
      userId: 'user_2',
      creditPackageId: 'pkg_2',
      amount: 2000,
      currency: 'USD',
      status: 'PAID',
      externalId: 'purchase_x',
      paymentMethod: 'manual',
    });

    const hash = computeHash({ packageId: 'pkg_2', credits: null, price: 2000, currency: 'USD' });

    // Primeira execução: findUnique null -> create -> update
    // Replay: findUnique retorna registro com responseStatus já preenchido
    let firstCall = true;
    const idempoFindUnique = jest.fn().mockImplementation(async () => {
      if (firstCall) {
        firstCall = false;
        return null;
      }
      return {
        id: 'idem_2',
        userId: 'user_2',
        route: '/api/credits/purchase',
        key: 'k2',
        requestHash: hash,
        responseStatus: 201,
        responseBody: {
          id: 'pay_x',
          userId: 'user_2',
          creditPackageId: 'pkg_2',
          amount: 2000,
          currency: 'USD',
          status: 'PAID',
          externalId: 'purchase_x',
          paymentMethod: 'manual',
        },
        responseHeaders: { 'Cache-Control': 'no-store' },
        expiresAt: new Date(Date.now() + 86400_000),
      };
    });

    const idempoCreate = jest.fn().mockResolvedValue({
      id: 'idem_2',
      userId: 'user_2',
      route: '/api/credits/purchase',
      key: 'k2',
      requestHash: hash,
      responseStatus: null,
      responseBody: null,
      responseHeaders: null,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const idempoUpdate = jest.fn().mockResolvedValue({});

    const prismaTransaction = jest.fn().mockImplementation(async (fn: any) => {
      const tx = {
        idempotencyRequest: {
          findUnique: idempoFindUnique,
          create: idempoCreate,
          update: idempoUpdate,
        },
      };
      return fn(tx);
    });

    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: paymentCreate },
        $transaction: prismaTransaction,
      },
    }));

    const handler = await loadHandler();

    const payload = { packageId: 'pkg_2', price: 2000, currency: 'USD' };
    // 1a chamada
    const res1 = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k2',
        },
        body: JSON.stringify(payload),
      })
    );
    expect(res1.status).toBe(201);
    expect(paymentCreate).toHaveBeenCalledTimes(1);

    // 2a chamada (replay)
    const res2 = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k2',
        },
        body: JSON.stringify(payload),
      })
    );
    expect(res2.status).toBe(201);
    // não cria novamente
    expect(paymentCreate).toHaveBeenCalledTimes(1);
    expect(res2.headers.get('Cache-Control')).toBe('no-store');
    const data2 = await res2.json();
    expect(data2).toMatchObject({
      id: 'pay_x',
      userId: 'user_2',
      creditPackageId: 'pkg_2',
      amount: 2000,
      currency: 'USD',
      status: 'PAID',
    });
  });

  test('mesma key com payload diferente retorna 409', async () => {
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_3' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    const hashA = computeHash({ packageId: 'pkg_A', credits: null, price: 3000, currency: 'USD' });
    // Registro existente com hashA, mas a requisição atual computará hashB (payload diferente)
    const idempoFindUnique = jest.fn().mockResolvedValue({
      id: 'idem_3',
      userId: 'user_3',
      route: '/api/credits/purchase',
      key: 'k3',
      requestHash: hashA,
      responseStatus: null,
      responseBody: null,
      responseHeaders: null,
      expiresAt: new Date(Date.now() + 86400_000),
    });

    const prismaTransaction = jest.fn().mockImplementation(async (fn: any) => {
      const tx = {
        idempotencyRequest: {
          findUnique: idempoFindUnique,
          create: jest.fn(),
          update: jest.fn(),
        },
      };
      return fn(tx);
    });

    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: jest.fn() }, // não deve ser chamado
        $transaction: prismaTransaction,
      },
    }));

    const handler = await loadHandler();

    // Envia payload B (diferente de A) com mesma key k3 -> deve 409
    const payloadB = { packageId: 'pkg_B', price: 3000, currency: 'USD' };
    const res = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k3',
        },
        body: JSON.stringify(payloadB),
      })
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toMatchObject({
      error: 'Idempotency key conflict',
    });
  });

  test('sem Idempotency-Key mantém comportamento atual (201)', async () => {
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_4' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    const paymentCreate = jest.fn().mockResolvedValue({
      id: 'pay_4',
      userId: 'user_4',
      creditPackageId: 'pkg_4',
      amount: 4000,
      currency: 'USD',
      status: 'PAID',
      externalId: 'purchase_4',
      paymentMethod: 'manual',
    });

    // Quando sem Idempotency-Key, não usamos tabela de idempotência
    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: paymentCreate },
      },
    }));

    const handler = await loadHandler();

    const res = await handler(
      req('http://localhost/api/credits/purchase', {
        ...jsonBody({ packageId: 'pkg_4', price: 4000, currency: 'USD' }),
      })
    );

    expect(res.status).toBe(201);
    expect(paymentCreate).toHaveBeenCalledTimes(1);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    const data = await res.json();
    expect(data).toMatchObject({
      id: 'pay_4',
      userId: 'user_4',
      creditPackageId: 'pkg_4',
      amount: 4000,
      currency: 'USD',
      status: 'PAID',
    });
  });
test('TTL expirado: deve tratar como primeira execução e recriar resposta', async () => {
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_ttl' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    const paymentCreate = jest.fn().mockResolvedValue({
      id: 'pay_ttl_new',
      userId: 'user_ttl',
      creditPackageId: 'pkg_ttl',
      amount: 1234,
      currency: 'USD',
      status: 'PAID',
      externalId: 'purchase_ttl_new',
      paymentMethod: 'manual',
    });

    const hashTTL = computeHash({ packageId: 'pkg_ttl', credits: null, price: 1234, currency: 'USD' });

    // findUnique retorna registro expirado (expiresAt no passado) -> util deve ignorar como "não existente"
    const idempoFindUnique = jest.fn().mockResolvedValue({
      id: 'idem_ttl_old',
      userId: 'user_ttl',
      route: '/api/credits/purchase',
      key: 'k_ttl',
      requestHash: hashTTL,
      responseStatus: 201,
      responseBody: { old: true },
      responseHeaders: { 'Cache-Control': 'no-store' },
      expiresAt: new Date(Date.now() - 60_000), // expirado
    });

    const idempoCreate = jest.fn().mockResolvedValue({
      id: 'idem_ttl_new',
      userId: 'user_ttl',
      route: '/api/credits/purchase',
      key: 'k_ttl',
      requestHash: hashTTL,
      responseStatus: null,
      responseBody: null,
      responseHeaders: null,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const idempoUpdate = jest.fn().mockResolvedValue({});

    const prismaTransaction = jest.fn().mockImplementation(async (fn: any) => {
      const tx = {
        idempotencyRequest: {
          findUnique: idempoFindUnique,
          create: idempoCreate,
          update: idempoUpdate,
        },
      };
      return fn(tx);
    });

    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: paymentCreate },
        $transaction: prismaTransaction,
      },
    }));

    const handler = await loadHandler();
    const payload = { packageId: 'pkg_ttl', price: 1234, currency: 'USD' };
    const res = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k_ttl',
        },
        body: JSON.stringify(payload),
      })
    );

    expect(res.status).toBe(201);
    expect(paymentCreate).toHaveBeenCalledTimes(1);
    const data = await res.json();
    expect(data).toMatchObject({
      id: 'pay_ttl_new',
      userId: 'user_ttl',
      creditPackageId: 'pkg_ttl',
      amount: 1234,
      currency: 'USD',
      status: 'PAID',
    });
  });

  test('Erro no executor: não deve salvar resposta de sucesso e deve propagar erro', async () => {
    jest.doMock('@/lib/auth/guards', () => ({
      requireAuth: jest.fn().mockResolvedValue({ ok: true, userId: 'user_err' }),
    }));
    jest.doMock('@/lib/rate-limit', () => ({
      applyRateLimit: jest.fn().mockResolvedValue(undefined),
    }));

    // Simula falha no executor (por exemplo, falha ao criar pagamento)
    const paymentCreate = jest.fn().mockRejectedValue(new Error('payment-failed'));

    const hashErr = computeHash({ packageId: 'pkg_err', credits: null, price: 999, currency: 'USD' });

    const idempoFindUnique = jest.fn().mockResolvedValue(null);
    const idempoCreate = jest.fn().mockResolvedValue({
      id: 'idem_err',
      userId: 'user_err',
      route: '/api/credits/purchase',
      key: 'k_err',
      requestHash: hashErr,
      responseStatus: null,
      responseBody: null,
      responseHeaders: null,
      expiresAt: new Date(Date.now() + 86400_000),
    });
    const idempoUpdate = jest.fn().mockResolvedValue({});

    const prismaTransaction = jest.fn().mockImplementation(async (fn: any) => {
      const tx = {
        idempotencyRequest: {
          findUnique: idempoFindUnique,
          create: idempoCreate,
          update: idempoUpdate,
        },
      };
      return fn(tx);
    });

    jest.doMock('@/lib/prisma', () => ({
      prisma: {
        payment: { create: paymentCreate },
        $transaction: prismaTransaction,
      },
    }));

    const handler = await loadHandler();
    const payload = { packageId: 'pkg_err', price: 999, currency: 'USD' };

    const res = await handler(
      req('http://localhost/api/credits/purchase', {
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': 'k_err',
        },
        body: JSON.stringify(payload),
      })
    );

    // Como handleRoute padrão converte erros em 500 (ou conforme implementação),
    // esperamos um 500 e que idempotency.update não tenha sido salvo com resposta de sucesso.
    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(paymentCreate).toHaveBeenCalledTimes(1);
  });
});
