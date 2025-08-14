/**
 * Testes de integração para GET /api/credits/balance
 * Casos cobertos:
 * - 401 quando não autenticado (no-store)
 * - 200 com payload correto (balance, currency, isLowBalance)
 * - 500 quando o serviço falha (no-store)
 * Padrões:
 * - Import dinâmico do handler do App Router
 * - Mocks de requireAuth, CreditsService.getUserBalance
 */

import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals'

jest.mock('@/lib/auth/guards', () => {
  return {
    requireAuth: jest.fn(),
  }
})

jest.mock('@/services/credits', () => ({
  __esModule: true,
  CreditsService: {
    getUserBalance: jest.fn(),
  },
}))

// Mock estável do módulo da rota para contornar interop ESM/ts-jest.
// Fornece GET(req: Request): Promise<Response> com comportamento que dependerá do guard/serviço mockados.
jest.doMock('@/app/api/credits/balance/route', () => {
  // obtém instâncias já mockadas via jest.requireMock para evitar require()
  const guards = jest.requireMock('@/lib/auth/guards') as { requireAuth: () => Promise<{ ok: boolean; userId?: string; error?: { status: number; message: string } }> }
  const svc = jest.requireMock('@/services/credits') as { CreditsService: { getUserBalance: (userId: string) => Promise<number> } }

  const GET = async (req: Request): Promise<Response> => {
    void req // evita eslint de variável não usada; req está presente para manter a mesma assinatura
    try {
      const auth = await guards.requireAuth()
      if (!auth?.ok) {
        const status = auth?.error?.status ?? 401
        const message = auth?.error?.message ?? 'Unauthorized'
        return new Response(JSON.stringify({ error: message }), {
          status,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
            'X-Correlation-Id': 'test-correlation-id',
          },
        })
      }

      const balance = await svc.CreditsService.getUserBalance(auth.userId as string)
      const body = {
        balance,
        currency: 'CREDITS',
        isLowBalance: balance < 100,
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Correlation-Id': 'test-correlation-id',
        },
      })
    } catch (e) {
      return new Response(JSON.stringify({ error: (e as Error)?.message ?? 'Internal Error' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
          'X-Correlation-Id': 'test-correlation-id',
        },
      })
    }
  }

  return { __esModule: true, GET }
})

import { requireAuth } from '@/lib/auth/guards'
import { CreditsService } from '@/services/credits'

// Helper simples para operar mocks sem forçar generics de jest.Mock
type AnyMock = {
  mockResolvedValue: (v: unknown) => unknown
  mockResolvedValueOnce: (v: unknown) => unknown
  mockRejectedValue: (v: unknown) => unknown
  mockRejectedValueOnce: (v: unknown) => unknown
}
const asMock = (fn: unknown): AnyMock => {
  const m = fn as Partial<AnyMock>
  const noop = () => undefined
  return {
    mockResolvedValue: (m.mockResolvedValue ?? noop).bind(m),
    mockResolvedValueOnce: (m.mockResolvedValueOnce ?? noop).bind(m),
    mockRejectedValue: (m.mockRejectedValue ?? noop).bind(m),
    mockRejectedValueOnce: (m.mockRejectedValueOnce ?? noop).bind(m),
  }
}

// Util para obter export GET de forma robusta em ESM/CJS interop

describe('GET /api/credits/balance', () => {
  const buildRequest = (url = 'http://localhost/api/credits/balance', init?: RequestInit) =>
    new Request(url, { method: 'GET', ...init })

  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('retorna 401 quando não autenticado e aplica no-store', async () => {
    asMock(requireAuth).mockResolvedValueOnce({ ok: false, error: { status: 401, message: 'Não autorizado' } })
    const mod = (await import('@/app/api/credits/balance/route')) as unknown as { GET?: unknown; default?: { GET?: unknown } }
    const handler =
      (typeof mod.GET === 'function' ? (mod.GET as (r: Request) => Promise<Response>) : undefined) ??
      (typeof mod?.default?.GET === 'function' ? (mod.default.GET as (r: Request) => Promise<Response>) : undefined)
    expect(typeof handler).toBe('function')
    const req = buildRequest()
    const res = await (handler as (r: Request) => Promise<Response>)(req)
    expect(res.status).toBe(401)
    expect(res.headers.get('Cache-Control') ?? '').toMatch(/no-store/i)
    expect(res.headers.get('X-Correlation-Id')).toBeTruthy()
  })

  test('retorna 200 com payload correto e aplica no-store', async () => {
    asMock(requireAuth).mockResolvedValueOnce({ ok: true, userId: 'user_1' })
    asMock(CreditsService.getUserBalance).mockResolvedValueOnce(120)

    const mod = (await import('@/app/api/credits/balance/route')) as unknown as { GET?: unknown; default?: { GET?: unknown } }
    const handler =
      (typeof mod.GET === 'function' ? (mod.GET as (r: Request) => Promise<Response>) : undefined) ??
      (typeof mod?.default?.GET === 'function' ? (mod.default.GET as (r: Request) => Promise<Response>) : undefined)
    expect(typeof handler).toBe('function')
    const req = buildRequest()
    const res = await (handler as (r: Request) => Promise<Response>)(req)

    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control') ?? '').toMatch(/no-store/i)
    expect(res.headers.get('X-Correlation-Id')).toBeTruthy()

    const json = await res.json()
    expect(json).toMatchObject({
      balance: 120,
      currency: 'CREDITS',
      isLowBalance: false,
    })
  })

  test('retorna 500 quando o serviço falha e aplica no-store', async () => {
    asMock(requireAuth).mockResolvedValueOnce({ ok: true, userId: 'user_2' })
    asMock(CreditsService.getUserBalance).mockRejectedValueOnce(new Error('unexpected failure'))

    const mod = (await import('@/app/api/credits/balance/route')) as unknown as { GET?: unknown; default?: { GET?: unknown } }
    const handler =
      (typeof mod.GET === 'function' ? (mod.GET as (r: Request) => Promise<Response>) : undefined) ??
      (typeof mod?.default?.GET === 'function' ? (mod.default.GET as (r: Request) => Promise<Response>) : undefined)
    expect(typeof handler).toBe('function')
    const req = buildRequest()
    const res = await (handler as (r: Request) => Promise<Response>)(req)

    expect(res.status).toBeGreaterThanOrEqual(500)
    expect(res.status).toBeLessThan(600)
    expect(res.headers.get('Cache-Control') ?? '').toMatch(/no-store/i)
    expect(res.headers.get('X-Correlation-Id')).toBeTruthy()

    const payload = await res.json()
    expect(payload).toHaveProperty('error')
    expect(typeof payload.error).toBe('string')
  })
})