/**
 * Testes de integração para POST /api/user/clear-data
 * Estratégia:
 * - Mock de requireAuth (401 e ok)
 * - Mock de rate limiting (200/429)
 * - Mock de prisma.conversation.deleteMany e count retornado
 * - Verificar headers no-store e status codes 401, 200, 429
 * Observação: não alterar package.json; Jest já configurado no projeto.
 */

import { afterEach, describe, expect, it, beforeEach, jest } from '@jest/globals'

jest.mock('@/lib/auth/guards', () => {
  return {
    requireAuth: jest.fn(),
    applyRateLimit: jest.fn(),
    extractClientIp: jest.fn(),
  }
})

jest.mock('@/lib/prisma', () => {
  const prismaMock = {
    conversation: {
      deleteMany: jest.fn(),
    },
  }
  return { prisma: prismaMock }
})

import { requireAuth, applyRateLimit, extractClientIp } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'

// Util para mocks sem genéricos de jest.Mock
type AnyMock = {
  mockReturnValue: (v: unknown) => unknown
  mockResolvedValue: (v: unknown) => unknown
  mockResolvedValueOnce: (v: unknown) => unknown
}
const asMock = (fn: unknown): AnyMock => {
  const m = fn as Partial<AnyMock>
  const noop = () => undefined
  return {
    mockReturnValue: (m.mockReturnValue ?? noop).bind(m),
    mockResolvedValue: (m.mockResolvedValue ?? noop).bind(m),
    mockResolvedValueOnce: (m.mockResolvedValueOnce ?? noop).bind(m),
  }
}

// Import dinâmico do handler
async function loadHandler(): Promise<(req?: Request) => Promise<Response>> {
  const mod = await import('@/app/api/user/clear-data/route')
  return (mod as unknown as { POST: (req?: Request) => Promise<Response> }).POST
}

type RequireAuthOk = { ok: true; userId: string }
type RequireAuthFail = { ok: false; error: { status: number; message: string } }

describe('POST /api/user/clear-data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('retorna 401 quando não autenticado', async () => {
    asMock(requireAuth).mockResolvedValue({ ok: false, error: { status: 401, message: 'Não autorizado' } } as RequireAuthFail)
    const handler = await loadHandler()
    const res = await handler(new Request('http://localhost/api/user/clear-data', { method: 'POST' }))
    expect(res.status).toBe(401)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('limpa conversas do usuário e retorna 200 com no-store', async () => {
    const userId = 'user-123'
    asMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk)
    asMock(extractClientIp).mockReturnValue('127.0.0.1')
    asMock(applyRateLimit).mockResolvedValue(null)

    // Simula deleteMany retornando count
    asMock(prisma.conversation.deleteMany).mockResolvedValue({ count: 5 })

    const handler = await loadHandler()
    const res = await handler(new Request('http://localhost/api/user/clear-data', { method: 'POST' }))

    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const body = await res.json()
    expect(body).toEqual(
      expect.objectContaining({
        cleared: expect.objectContaining({
          conversations: 5,
        }),
      })
    )
  })

  it('aplica rate limit e retorna 429 na segunda chamada', async () => {
    const userId = 'user-123'
    asMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk)
    asMock(extractClientIp).mockReturnValue('127.0.0.1')

    // Evita erro TS de tipo unknown explicitando shape mínimo usado
    const rl = applyRateLimit as unknown as {
      mockResolvedValueOnce: (v: unknown) => unknown
    }
    rl.mockResolvedValueOnce(null)
    rl.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '3',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Date.now() + 60_000),
          'Cache-Control': 'no-store',
        },
      })
    )

    asMock(prisma.conversation.deleteMany).mockResolvedValue({ count: 2 })

    const handler = await loadHandler()
    const res1 = await handler(new Request('http://localhost/api/user/clear-data', { method: 'POST' }))
    expect([200, 204]).toContain(res1.status)

    const res2 = await handler(new Request('http://localhost/api/user/clear-data', { method: 'POST' }))
    expect(res2.status).toBe(429)
    expect(res2.headers.get('Retry-After')).toBe('60')
    expect(res2.headers.get('X-RateLimit-Limit')).toBe('3')
    expect(res2.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(res2.headers.get('Cache-Control')).toBe('no-store')
  })
})