import { NextRequest } from 'next/server';
import crypto from 'crypto';

/**
 * Validates an incoming webhook request from MercadoPago.
 * @param req The NextRequest object.
 * @param body The raw request body as a string.
 * @returns True if the signature is valid, false otherwise.
 */
export function isValidMercadoPagoRequest(req: NextRequest, body: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const signature = req.headers.get('x-signature') || '';
  if (!secret || !signature) return false;

  // Parse header: example "ts=1612345678,v1=<hex>"
  const sigMap = Object.fromEntries(
    signature.split(',').map((p) => {
      const [k, v] = p.split('=');
      return [k?.trim(), v?.trim()];
    })
  ) as Record<string, string>;

  const ts = sigMap['ts'];
  const v1 = sigMap['v1'];
  if (!ts || !v1) return false;

  // Timestamp freshness (5 min window)
  const now = Date.now();
  const reqTs = parseInt(ts, 10) * 1000;
  if (!Number.isFinite(reqTs) || now - reqTs > 5 * 60 * 1000) return false;

  // MP official signing scheme (webhooks):
  // payload = `id:${data.id};request-id:${x-request-id};ts:${ts}`
  const xRequestId = req.headers.get('x-request-id') || '';
  let parsed: any = {};
  try { parsed = body ? JSON.parse(body) : {}; } catch {}
  const id = String(parsed?.data?.id || parsed?.id || '');

  const payloadOfficial = `id:${id};request-id:${xRequestId};ts:${ts}`;
  const hmacOfficial = crypto.createHmac('sha256', secret).update(payloadOfficial).digest('hex');
  const matchOfficial = safeCompare(hmacOfficial, v1);

  if (matchOfficial) return true;

  // Legacy fallback used earlier in this project for manual tests
  // payload = `ts:${ts}.${body}`
  const payloadLegacy = `ts:${ts}.${body}`;
  const hmacLegacy = crypto.createHmac('sha256', secret).update(payloadLegacy).digest('hex');
  const matchLegacy = safeCompare(hmacLegacy, v1);

  return matchLegacy;
}

function safeCompare(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}
