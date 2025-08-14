/**
 * Testes de integração para DELETE /api/user/delete
 * Estratégia:
 * - Mock de requireAuth (autenticado e não autenticado)
 * - Mock de prisma.user (findUnique/delete)
 * - Invocar diretamente o handler DELETE do App Router e inspecionar Response
 * Observação: sem scripts no package.json ainda; execução depende de configuração Jest já criada.
 */

import { afterEach, describe, expect, it, beforeEach, jest } from '@jest/globals'

// Tipos auxiliares para mocks
type RequireAuthOk = { ok: true; userId: string }
type RequireAuthFail = { ok: false; error: { status: number; message: string } }
// Removed alias para evitar eslint 'defined but never used'
// type RequireAuthReturn = RequireAuthOk | RequireAuthFail

// Mocks dos módulos internos (tipagem simples para reduzir ruído TS)
jest.mock('@/lib/auth/guards', () => {
  return {
    requireAuth: jest.fn(),
    applyRateLimit: jest.fn(),
    extractClientIp: jest.fn(),
  }
})

jest.mock('@/lib/prisma', () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  }
  return { prisma: prismaMock }
})

// Imports após mocks
import { requireAuth, applyRateLimit, extractClientIp } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'

// Helpers de cast para mocks sem depender de tipos genéricos de jest.Mock (garante métodos definidos)
type AnyMock = {
  mockReturnValue: (v: unknown) => unknown
  mockResolvedValue: (v: unknown) => unknown
  mockResolvedValueOnce: (v: unknown) => unknown
}
const asMock = (fn: unknown): AnyMock => {
  const m = fn as Partial<AnyMock>
  // Funções no-op sem parâmetro para evitar eslint de variável não usada
  const noopReturn = () => undefined
  const noopResolved = () => undefined
  const noopResolvedOnce = () => undefined

  return {
    mockReturnValue: (m.mockReturnValue ?? noopReturn).bind(m),
    mockResolvedValue: (m.mockResolvedValue ?? noopResolved).bind(m),
    mockResolvedValueOnce: (m.mockResolvedValueOnce ?? noopResolvedOnce).bind(m),
  }
}

// Import dinâmico do handler para evitar cache entre casos
async function loadHandler(): Promise<(req?: Request) => Promise<Response>> {
  const mod = await import('@/app/api/user/delete/route')
  return (mod as unknown as { DELETE: (req?: Request) => Promise<Response> }).DELETE
}

describe('DELETE /api/user/delete', () => {
  const userId = 'user_123'

  beforeEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('retorna 401/403 quando não autenticado', async () => {
    asMock(requireAuth).mockResolvedValue(
      { ok: false, error: { status: 401, message: 'Não autorizado' } } as RequireAuthFail
    )

    const DELETE = await loadHandler()
    const res = await DELETE(new Request('http://localhost/api/user/delete', { method: 'DELETE' }))
    expect(res.status).toBe(401)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('retorna 404 quando usuário não existe', async () => {
    asMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk)
    asMock(extractClientIp).mockReturnValue('127.0.0.1')
    asMock(applyRateLimit).mockResolvedValue(null)
    asMock(prisma.user.findUnique).mockResolvedValue(null)

    const DELETE = await loadHandler()
    const res = await DELETE(new Request('http://localhost/api/user/delete', { method: 'DELETE' }))
    expect(res.status).toBe(404)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('retorna 204 em sucesso e aplica no-store', async () => {
    asMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk)
    asMock(extractClientIp).mockReturnValue('127.0.0.1')
    asMock(applyRateLimit).mockResolvedValue(null)
    asMock(prisma.user.findUnique).mockResolvedValue({ id: userId })
    asMock(prisma.user.delete).mockResolvedValue({ id: userId })

    const DELETE = await loadHandler()
    const res = await DELETE(new Request('http://localhost/api/user/delete', { method: 'DELETE' }))
    expect(res.status).toBe(204)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    const text = await res.text()
    expect(text).toBe('') // No Content
  })

  it('retorna 429 quando excede rate limiting', async () => {
    asMock(requireAuth).mockResolvedValue({ ok: true, userId } as RequireAuthOk)
    asMock(extractClientIp).mockReturnValue('127.0.0.1')

    // Simula primeira chamada OK e segunda bloqueada por RL
    asMock(applyRateLimit).mockResolvedValueOnce(null)
    asMock(applyRateLimit).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: 'Too Many Requests' }),
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '2',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + 60_000),
            'Cache-Control': 'no-store',
          },
        },
      )
    )

    asMock(prisma.user.findUnique).mockResolvedValue({ id: userId })
    asMock(prisma.user.delete).mockResolvedValue({ id: userId })

    const DELETE = await loadHandler()
    // 1ª chamada
    const res1 = await DELETE(new Request('http://localhost/api/user/delete', { method: 'DELETE' }))
    expect([200, 204, 404]).toContain(res1.status) // dependendo do mock

    // 2ª chamada (bloqueada)
    const res2 = await DELETE(new Request('http://localhost/api/user/delete', { method: 'DELETE' }))
    expect(res2.status).toBe(429)
    expect(res2.headers.get('Retry-After')).toBeTruthy()
    expect(res2.headers.get('X-RateLimit-Limit')).toBeTruthy()
    expect(res2.headers.get('X-RateLimit-Remaining')).toBe('0')
    expect(res2.headers.get('Cache-Control')).toBe('no-store')
  })
})