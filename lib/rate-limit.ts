export type RateLimitOptions = {
  windowMs?: number
  max?: number
  keyPrefix?: string
}

// No-op server-side rate limiter placeholder used for local/dev and tests.
// Tests will mock this module; we just export a default shape to satisfy resolver.
export async function applyRateLimit(_keys: (string | number)[], _options?: RateLimitOptions): Promise<void> {
  return
}


