import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
 
export type RequireAuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: { message: string; status: number } };
 
// Simple auth guard to be reused in route handlers (App Router)
// Pass the current Request to avoid relying on globals which can break in edge runtimes.
export async function requireAuth(): Promise<RequireAuthResult> {
  try {
    // getServerSession em App Router funciona sem req/res, mas em alguns ambientes
    // pode haver conflitos. Mantemos assinatura simples aqui.
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { ok: false, error: { message: "Não autorizado", status: 401 } };
    }
    return { ok: true, userId: session.user.id };
  } catch {
    // Falha inesperada ao resolver sessão
    return { ok: false, error: { message: "Não autorizado", status: 401 } };
  }
}
 
/**
 * Rate limiting em memória (por IP + userId).
 * Em produção, troque por Redis/Memcached para suportar múltiplas instâncias.
 */
const rateLimitStore = new Map<string, { ts: number; count: number }>();
 
export type RateLimitOptions = {
  windowMs?: number; // janela em ms (default 60s)
  max?: number; // máximo por janela (default 10)
  keyPrefix?: string; // prefixo de chave (default 'rl')
};
 
/**
 * Aplica rate limiting e retorna NextResponse em caso de excesso, ou null se permitido.
 * Use no início do handler, após obter auth e headers.
 */
export async function applyRateLimit(
  keyParts: Array<string | undefined | null>,
  opts: RateLimitOptions = {}
): Promise<NextResponse | null> {
  const windowMs = opts.windowMs ?? 60_000;
  const max = opts.max ?? 10;
  const keyPrefix = opts.keyPrefix ?? "rl";
 
  const key = `${keyPrefix}:${keyParts.filter(Boolean).join(":")}`;
  const now = Date.now();
  const item = rateLimitStore.get(key);
 
  if (!item || now - item.ts > windowMs) {
    rateLimitStore.set(key, { ts: now, count: 1 });
    return null;
  }
 
  item.count += 1;
  if (item.count > max) {
    const retryAfterSec = Math.ceil((item.ts + windowMs - now) / 1000);
    const res = NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    res.headers.set("Retry-After", String(retryAfterSec));
    res.headers.set("X-RateLimit-Limit", String(max));
    res.headers.set("X-RateLimit-Remaining", "0");
    return res;
  }
 
  return null;
}
 
/**
 * Tenta extrair IP do cliente a partir de headers comuns em proxies.
 * Fallback: 127.0.0.1
 */
export function extractClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}