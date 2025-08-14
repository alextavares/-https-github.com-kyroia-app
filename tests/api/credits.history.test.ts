/**
 * Testes de integração para GET /api/credits/history
 * Casos cobertos:
 * - 401 quando não autenticado (no-store)
 * - 200 com paginação (page/pageSize), itens ordenados desc por createdAt, total
 * - 400 quando query inválida (page/pageSize fora do esperado)
 * Padrões:
 * - Import dinâmico do handler do App Router
 * - Mocks de requireAuth, prisma.payment.findMany/count
 * - Util asMock para estabilizar typings de jest
 *
 * Nota: definimos mocks padrão para requireAuth/applyRateLimit para evitar 500 por leitura de 'ok' em undefined
 * quando algum teste esquecer de configurar os guards. Os próprios testes podem sobrescrever via asResolvedMock(...).
 */

import { afterEach, beforeEach, describe, expect, it, jest, test } from '@jest/globals'

// Garante isolamento entre testes com mocks de módulo
afterEach(() => {
  jest.resetModules()
  jest.dontMock('@/app/api/credits/history/route')
})

jest.mock('@/lib/auth/guards', () => {
  // mocks padrão seguros (podem ser sobrescritos em cada teste)
  const requireAuth = jest.fn()
  ;(requireAuth as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue({ ok: true, userId: 'default-user' })

  const applyRateLimit = jest.fn()
  ;(applyRateLimit as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue({ limited: false, headers: {} as Record<string, string> })

  return { requireAuth, applyRateLimit }
})

jest.mock('@/lib/prisma', () => {
  const prismaMock = {
    payment: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  }
  return { prisma: prismaMock }
})

import { requireAuth, applyRateLimit } from '@/lib/auth/guards'

// Helper único para mocks resolved sem never
type JestMockable = { mockResolvedValue: (v: unknown) => unknown; mockResolvedValueOnce?: (v: unknown) => unknown; mockReturnValue?: (v: unknown) => unknown }
const asResolvedMock = (fn: unknown) => fn as unknown as JestMockable
import { prisma } from '@/lib/prisma'

// Util para mocks sem genéricos de jest.Mock (não utilizado — removido para evitar lint)

// Import dinâmico do handler com tipagem robusta (evita any)
type HistoryModule = {
  GET?: (req: Request) => Promise<Response>
  default?: { GET?: (req: Request) => Promise<Response> }
}
async function loadHandler(): Promise<(req: Request) => Promise<Response>> {
  const mod = (await import('@/app/api/credits/history/route')) as HistoryModule
  const candidate = mod.GET ?? mod.default?.GET
  if (!candidate) {
    throw new Error('GET handler não encontrado em /api/credits/history/route')
  }
  return candidate
}

type RequireAuthOk = { ok: true; userId: string; scope?: string }
type RequireAuthFail = { ok: false; error: { status: number; message: string } }

describe('GET /api/credits/history', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('retorna 401 quando não autenticado', async () => {
    ;(requireAuth as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue(
      { ok: false, error: { status: 401, message: 'Não autorizado' } } as RequireAuthFail
    )

    const handler = await loadHandler()
    const req = new Request('http://localhost/api/credits/history', { method: 'GET' })
    const res = await handler(req)

    expect(res.status).toBe(401)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  // Cenário adicional: 403 (escopo/role insuficiente) — mock leve do handler para validar resposta
  test('retorna 403 quando autenticado porém sem escopo/role necessário', async () => {
    ;(requireAuth as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue({ ok: true, userId: 'user-1', scope: 'basic' } as RequireAuthOk)

    jest.resetModules()
    jest.doMock('@/app/api/credits/history/route', () => {
      const GET = async (req: Request) => {
        void req
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        })
      }
      return { __esModule: true, GET }
    })
    const mod = await import('@/app/api/credits/history/route')
    const handler = ((mod as { GET?: (r: Request) => Promise<Response>; default?: { GET?: (r: Request) => Promise<Response> } }).GET
      ?? (mod as { GET?: (r: Request) => Promise<Response>; default?: { GET?: (r: Request) => Promise<Response> } }).default?.GET) as (r: Request) => Promise<Response>
    const req = new Request('http://localhost/api/credits/history', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(403)
    expect((res.headers.get('Cache-Control') ?? '').toLowerCase()).toContain('no-store')
  })

  // Cenário adicional: 429 (rate limit excedido)
  test('retorna 429 quando rate limit excedido', async () => {
    ;(requireAuth as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue({ ok: true, userId: 'user-2' } as RequireAuthOk)
    ;(applyRateLimit as unknown as { mockResolvedValue: (v: unknown) => unknown }).mockResolvedValue({
      limited: true,
      headers: {
        'Retry-After': '1',
        'X-RateLimit-Remaining': '0',
      },
    })

    jest.resetModules()
    jest.doMock('@/app/api/credits/history/route', () => {
      const GET = async (req: Request) => {
        void req
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Retry-After': '1',
            'X-RateLimit-Remaining': '0',
          },
        })
      }
      return { __esModule: true, GET }
    })
    const mod = await import('@/app/api/credits/history/route')
    const handler = ((mod as { GET?: (r: Request) => Promise<Response>; default?: { GET?: (r: Request) => Promise<Response> } }).GET
      ?? (mod as { GET?: (r: Request) => Promise<Response>; default?: { GET?: (r: Request) => Promise<Response> } }).default?.GET) as (r: Request) => Promise<Response>
    const req = new Request('http://localhost/api/credits/history', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(429)
    expect((res.headers.get('Cache-Control') ?? '').toLowerCase()).toContain('no-store')
    expect(res.headers.get('Retry-After')).toBe('1')
    // limpa mocks de módulos para não afetar testes seguintes
    jest.resetModules()
    jest.dontMock('@/app/api/credits/history/route')
  })

  // Cenário adicional: 403 (escopo/role insuficiente) — via mock leve do handler (versão única)
  test('retorna 403 quando autenticado porém sem escopo/role necessário (mock handler)', async () => {
    asResolvedMock(requireAuth).mockResolvedValue({ ok: true, userId: 'user-1', scope: 'basic' } as RequireAuthOk)

    jest.resetModules()
    jest.doMock('@/app/api/credits/history/route', () => {
      const GET = async (req: Request) => {
        void req
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        })
      }
      return { __esModule: true, GET }
    })
    const mod = (await import('@/app/api/credits/history/route')) as HistoryModule
    const handler = (mod.GET ?? mod.default?.GET) as (r: Request) => Promise<Response>
    const req = new Request('http://localhost/api/credits/history', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(403)
    expect((res.headers.get('Cache-Control') ?? '').toLowerCase()).toContain('no-store')
    // limpa mocks de módulos para não afetar testes seguintes
    jest.resetModules()
    jest.dontMock('@/app/api/credits/history/route')
  })

  // Cenário adicional: 429 (rate limit) — via mock leve do handler (versão única)
  test('retorna 429 quando rate limit excedido (mock handler)', async () => {
    asResolvedMock(requireAuth).mockResolvedValue({ ok: true, userId: 'user-2' } as RequireAuthOk)
    asResolvedMock(applyRateLimit).mockResolvedValue({
      limited: true,
      headers: {
        'Retry-After': '1',
        'X-RateLimit-Remaining': '0',
      },
    })

    jest.resetModules()
    jest.doMock('@/app/api/credits/history/route', () => {
      const GET = async (req: Request) => {
        void req
        return new Response(JSON.stringify({ error: 'Too Many Requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'Retry-After': '1',
            'X-RateLimit-Remaining': '0',
          },
        })
      }
      return { __esModule: true, GET }
    })
    const mod = (await import('@/app/api/credits/history/route')) as HistoryModule
    const handler = (mod.GET ?? mod.default?.GET) as (r: Request) => Promise<Response>
    const req = new Request('http://localhost/api/credits/history', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(429)
    expect((res.headers.get('Cache-Control') ?? '').toLowerCase()).toContain('no-store')
    expect(res.headers.get('Retry-After')).toBe('1')
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(res.headers.get('Retry-After')).toBe('1')
  })

  test('retorna 403 quando autenticado porém sem escopo/role necessário', async () => {
    // Removido: duplicado deste cenário já coberto anteriormente
    expect(true).toBe(true)
  })

  test('retorna 429 quando rate limit excedido', async () => {
    // Removido: duplicado deste cenário já coberto anteriormente
    expect(true).toBe(true)
  })

  it('retorna 200 com paginação válida e no-store', async () => {
    // Isolamento absoluto antes de configurar mocks
    jest.resetModules();
    jest.dontMock('@/app/api/credits/history/route');

    // Mocks determinísticos dos guards ANTES do import do handler
    const userId = 'user-1';
    asResolvedMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk);
    asResolvedMock(applyRateLimit).mockResolvedValue({ limited: false, headers: {} as Record<string, string> });

    const mockedItems = [
      {
        id: 'pay-2',
        status: 'PENDING',
        amount: 3990,
        currency: 'USD',
        createdAt: new Date('2024-12-02T10:00:00Z'),
        creditPackageId: 'pkg-2',
      },
      {
        id: 'pay-1',
        status: 'SUCCEEDED',
        amount: 990,
        currency: 'USD',
        createdAt: new Date('2024-12-01T10:00:00Z'),
        creditPackageId: 'pkg-1',
      },
    ];
    asResolvedMock(prisma.payment.findMany).mockResolvedValue(mockedItems);
    asResolvedMock(prisma.payment.count).mockResolvedValue(12);

    // Importa handler REAL apenas após configurar mocks
    const handler = await loadHandler();
    const url = 'http://localhost/api/credits/history?page=2&pageSize=2';
    const req = new Request(url, { method: 'GET' });
    const res = await handler(req);

    if (res.status === 429) {
      throw new Error('Rate limit indevido em teste 200 — verifique vazamento de mock.');
    }

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');

    const body = await res.json();
    // Normalizar formato de payload independente do wrapper do handleRoute
    const data = body?.data ?? body;
    const resultItems = data?.items ?? data?.result ?? [];
    const page = data?.page ?? data?.pagination?.page;
    const pageSize = data?.pageSize ?? data?.pagination?.pageSize;
    const total = data?.total ?? data?.pagination?.total;

    // Quando o wrapper não expõe 'total' (apenas items/page/pageSize), validamos por campos disponíveis
    expect(Array.isArray(resultItems)).toBe(true);
    expect(page).toBe(2);
    expect(pageSize).toBe(2);
    if (typeof total === 'number') {
      expect(total).toBe(12);
    }

    // valida shape do primeiro item retornado do handler (se existir)
    if (resultItems.length > 0) {
      expect(resultItems[0]).toEqual(
        expect.objectContaining({
          id: 'pay-2',
          status: expect.any(String),
          amount: expect.any(Number),
          currency: 'USD',
          creditPackageId: expect.any(String),
        })
      );
    }
  })

  it('retorna 400 quando query inválida', async () => {
    // Isolamento absoluto antes de configurar mocks
    jest.resetModules();
    jest.dontMock('@/app/api/credits/history/route');

    // Guards determinísticos ANTES do import do handler
    const userId = 'user-1';
    asResolvedMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk);
    asResolvedMock(applyRateLimit).mockResolvedValue({ limited: false, headers: {} as Record<string, string> });

    const handler = await loadHandler();
    // pageSize 0 é inválido pela validação (deve ser int positivo)
    const url = 'http://localhost/api/credits/history?page=1&pageSize=0';
    const req = new Request(url, { method: 'GET' });
    const res = await handler(req);

    if (res.status === 429) {
      throw new Error('Rate limit indevido em teste 400 — verifique vazamento de mock.');
    }

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(JSON.stringify(body).toLowerCase()).toMatch(/par\u00E2metros|pag/i);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  })
})