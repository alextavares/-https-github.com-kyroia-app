/**
 * Testes de integração para GET /api/credits/packages
 * Padrões verificados:
 * - Público (sem requireAuth)
 * - Validação de query param planType (opcional) via Zod/validateWith
 * - Retorno { packages } do CreditsService.getAvailablePackages()
 * - Filtragem opcional por planType (case-insensitive)
 * - Cache público via setPublicCache(res, 300, 600) => Cache-Control/SWR headers
 *
 * Observação: manter package.json inalterado (Jest já configurado).
 */

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'

// Mock do serviço utilizado pelo handler
jest.mock('@/services/credits', () => {
  return {
    CreditsService: {
      getAvailablePackages: jest.fn(),
    },
  }
})

// Import após mocks
import { CreditsService } from '@/services/credits'

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

// Import dinâmico do handler para evitar cache entre casos
async function loadHandler(): Promise<(req: Request) => Promise<Response>> {
  const mod = await import('@/app/api/credits/packages/route')
  // GET é exportado como function GET(req: Request) ou const GET = handleRoute(...)
  const handler = (mod as unknown as { GET: (req: Request) => Promise<Response> }).GET
  return handler
}

describe('GET /api/credits/packages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('retorna 200 com lista completa de pacotes e cache público', async () => {
    const pkgs = [
      { id: 'p1', name: 'Starter', credits: 100, price: 9.9 },
      { id: 'p2', name: 'Pro', credits: 500, price: 39.9 },
    ]
    asMock(CreditsService.getAvailablePackages).mockResolvedValue(pkgs)

    const handler = await loadHandler()
    const req = new Request('http://localhost/api/credits/packages', { method: 'GET' })
    const res = await handler(req)

    expect(res.status).toBe(200)
    // Cache-Control definido por setPublicCache(res, 300, 600)
    const cacheControl = res.headers.get('Cache-Control') ?? ''
    expect(cacheControl.length).toBeGreaterThan(0)
    // Verifica directives típicas: public, max-age, stale-while-revalidate
    expect(cacheControl).toMatch(/public/i)
    expect(cacheControl).toMatch(/max-age=\d+/i)
    expect(cacheControl).toMatch(/stale-while-revalidate=\d+/i)

    const body = await res.json()
    expect(body).toEqual({ packages: pkgs })
  })

  it('filtra por planType (case-insensitive) quando informado', async () => {
    const pkgs = [
      { id: 'p1', name: 'Starter', credits: 100, price: 9.9, planType: 'Free' },
      { id: 'p2', name: 'Pro', credits: 500, price: 39.9, planType: 'PRO' },
      { id: 'p3', name: 'Enterprise', credits: 5000, price: 299.0, planType: 'Enterprise' },
    ]
    asMock(CreditsService.getAvailablePackages).mockResolvedValue(pkgs)

    const handler = await loadHandler()
    const req = new Request('http://localhost/api/credits/packages?planType=pro', { method: 'GET' })
    const res = await handler(req)

    expect(res.status).toBe(200)
    const body = await res.json()
    // Deve conter apenas o pacote com planType 'PRO' (case-insensitive)
    expect(body).toEqual({
      packages: [
        expect.objectContaining({ id: 'p2', planType: 'PRO' }),
      ],
    })
    // Confirma cache público
    const cacheControl = res.headers.get('Cache-Control') ?? ''
    expect(cacheControl).toMatch(/public/i)
  })

  it('retorna 400 quando o serviço não retorna um array', async () => {
    // Simula retorno inválido
    asMock(CreditsService.getAvailablePackages).mockResolvedValue(null)

    const handler = await loadHandler()
    const req = new Request('http://localhost/api/credits/packages', { method: 'GET' })
    const res = await handler(req)

    expect(res.status).toBe(400)
    const body = await res.json()
    // A mensagem vem de BadRequest('Falha ao obter catálogo de pacotes de créditos')
    expect(JSON.stringify(body)).toMatch(/pacotes de cr\u00E9ditos|cat\u00E1logo/i)
    // Em erros, handleRoute ainda aplica cabeçalhos consistentes
    const cc = res.headers.get('Cache-Control') ?? ''
    expect(cc.length).toBeGreaterThan(0)
  })

  it('valida query inválida e retorna erro padronizado (status 422/400)', async () => {
    asMock(CreditsService.getAvailablePackages).mockResolvedValue([])

    const handler = await loadHandler()
    // planType vazio viola .min(1)
    const req = new Request('http://localhost/api/credits/packages?planType=', { method: 'GET' })
    const res = await handler(req)

    // validateWith pode responder 422 ou 400 conforme implementação; aceitamos ambas
    expect([400, 422]).toContain(res.status)
    const body = await res.json()
    // Deve conter informações de erro/validação
    expect(JSON.stringify(body).toLowerCase()).toMatch(/error|issue|invalid|inv\u00E1lido/)
  })
})