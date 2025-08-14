// Jest setup for API tests (App Router)
// - Polyfills/mocks leves para ambiente Node
// - Pode adicionar jest.useFakeTimers() ou outras configs globais aqui

// Silenciar logs de teste excessivos se necessário
const originalError = console.error
// Tipar como unknown[] para evitar 'any'
console.error = (...args: unknown[]) => {
  // Evita ruído de warnings não críticos em testes
  const first = args[0]
  const msg = typeof first === 'string' ? first : String(first ?? '')
  if (
    msg.includes('Warning:') ||
    msg.includes('Deprecated') ||
    msg.includes('ExperimentalWarning')
  ) {
    return
  }
  // Repassa mantendo tipagem segura
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  originalError(...(args as unknown as Parameters<typeof originalError>))
}