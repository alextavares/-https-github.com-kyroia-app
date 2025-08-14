import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
// Simple auth guard to be reused in route handlers (App Router)
// Pass the current Request to avoid relying on globals which can break in edge runtimes.
export async function requireAuth() {
    var _a;
    try {
        // getServerSession em App Router funciona sem req/res, mas em alguns ambientes
        // pode haver conflitos. Mantemos assinatura simples aqui.
        const session = await getServerSession(authOptions);
        if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return { ok: false, error: { message: "Não autorizado", status: 401 } };
        }
        return { ok: true, userId: session.user.id };
    }
    catch (_b) {
        // Falha inesperada ao resolver sessão
        return { ok: false, error: { message: "Não autorizado", status: 401 } };
    }
}
/**
 * Rate limiting em memória (por IP + userId).
 * Em produção, troque por Redis/Memcached para suportar múltiplas instâncias.
 */
const rateLimitStore = new Map();
/**
 * Aplica rate limiting e retorna NextResponse em caso de excesso, ou null se permitido.
 * Use no início do handler, após obter auth e headers.
 */
export async function applyRateLimit(keyParts, opts = {}) {
    var _a, _b, _c;
    const windowMs = (_a = opts.windowMs) !== null && _a !== void 0 ? _a : 60000;
    const max = (_b = opts.max) !== null && _b !== void 0 ? _b : 10;
    const keyPrefix = (_c = opts.keyPrefix) !== null && _c !== void 0 ? _c : "rl";
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
export function extractClientIp(headers) {
    const xff = headers.get("x-forwarded-for");
    if (xff) {
        return xff.split(",")[0].trim();
    }
    const realIp = headers.get("x-real-ip");
    if (realIp)
        return realIp;
    return "127.0.0.1";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3VhcmRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ3VhcmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFNM0MsZ0VBQWdFO0FBQ2hFLHlGQUF5RjtBQUN6RixNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVc7O0lBQy9CLElBQUksQ0FBQztRQUNILCtFQUErRTtRQUMvRSwwREFBMEQ7UUFDMUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsQ0FBQSxNQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLDBDQUFFLEVBQUUsQ0FBQSxFQUFFLENBQUM7WUFDdkIsT0FBTyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBQzFFLENBQUM7UUFDRCxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBQUMsV0FBTSxDQUFDO1FBQ1Asc0NBQXNDO1FBQ3RDLE9BQU8sRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztJQUMxRSxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUF5QyxDQUFDO0FBUXhFOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxLQUFL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