import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
// We avoid tight coupling with generated Prisma types to keep this file compiling
// before "prisma generate" runs. We will use minimal inline shapes instead.

type IdempotencyArgs = {
  userId: string;
  route: string;
  key: string;
  requestHash: string;
  ttlMs?: number;
};

type StoredResponse = {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type IdempotencyRecord = {
  id: string;
  userId: string;
  route: string;
  key: string;
  requestHash: string;
  responseStatus: number | null;
  responseBody: JsonValue | null;
  responseHeaders: Record<string, string> | null;
  expiresAt: Date;
};

type IdempotencyDelegate = {
  findUnique(args: {
    where: { userId_route_key: { userId: string; route: string; key: string } };
    select: {
      id: true;
      userId: true;
      route: true;
      key: true;
      requestHash: true;
      responseStatus: true;
      responseBody: true;
      responseHeaders: true;
      expiresAt: true;
    };
  }): Promise<IdempotencyRecord | null>;
  create(args: {
    data: {
      userId: string;
      route: string;
      key: string;
      requestHash: string;
      expiresAt: Date;
    };
  }): Promise<IdempotencyRecord>;
  update(args: {
    where: { userId_route_key: { userId: string; route: string; key: string } };
    data: {
      responseStatus: number;
      responseBody: JsonValue | null;
      responseHeaders: Record<string, string>;
    };
  }): Promise<IdempotencyRecord>;
};

type TxWithIdempotency = {
  idempotencyRequest: IdempotencyDelegate;
};

/**
 * Compute a stable SHA-256 hash for an arbitrary payload using key-sorted JSON.
 */
export function computeRequestHash(payload: unknown): string {
  const json = JSON.stringify(sortObject(payload));
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Recursively sort object keys to produce a stable JSON representation.
 */
function sortObject<T>(value: T): T {
  if (Array.isArray(value)) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return value.map((v) => sortObject(v)) as unknown as T;
    }
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const sortedKeys = Object.keys(obj).sort();
    const result: Record<string, unknown> = {};
    for (const k of sortedKeys) {
      result[k] = sortObject(obj[k]);
    }
    return result as unknown as T;
  }
  return value;
}

/**
 * Wrap execution with idempotency semantics backed by Prisma.
 * Ensures:
 * - First request with (userId, route, key) persists the response
 * - Replays return the stored response
 * - Payload mismatch for same key returns 409 Conflict
 *
 * NOTE: Prisma client must be regenerated after schema change.
 */
export async function withIdempotency(
  { userId, route, key, requestHash, ttlMs = 24 * 60 * 60 * 1000 }: IdempotencyArgs,
  executor: () => Promise<StoredResponse>
): Promise<Response> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMs);

  return await prisma.$transaction(async (tx) => {
    const delegate = (tx as unknown as TxWithIdempotency).idempotencyRequest as IdempotencyDelegate;

    let record = await delegate.findUnique({
      where: {
        userId_route_key: {
          userId,
          route,
          key,
        },
      },
      select: {
        id: true,
        userId: true,
        route: true,
        key: true,
        requestHash: true,
        responseStatus: true,
        responseBody: true,
        responseHeaders: true,
        expiresAt: true,
      },
    });

    if (record) {
      if (record.requestHash !== requestHash) {
        logEvent('idempotency_conflict', { userId, route, key });
        return buildJsonResponse(
          { error: 'Idempotency key conflict', message: 'Payload does not match previous request' },
          409
        );
      }
      if (record.responseStatus != null) {
        logEvent('idempotency_hit', { userId, route, key });
        return rebuildStoredResponse(
          record.responseStatus,
          record.responseBody ?? undefined,
          record.responseHeaders ?? undefined
        );
      }
      // No stored response yet → fall through to execute and store
    } else {
      record = await delegate.create({
        data: {
          userId,
          route,
          key,
          requestHash,
          expiresAt,
        },
      });
      logEvent('idempotency_store', { userId, route, key });
    }

    const stored = await executor();

    await delegate.update({
      where: { userId_route_key: { userId, route, key } },
      data: {
        responseStatus: stored.status,
        responseBody: (stored.body ?? null) as JsonValue | null,
        responseHeaders: (stored.headers ?? {}) as Record<string, string>,
      },
    });

    return buildJsonResponse(stored.body, stored.status, stored.headers);
  });
}

function buildJsonResponse(
  body: unknown,
  status = 200,
  headers?: Record<string, string>
): Response {
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(headers ?? {}),
  };
  return new Response(body != null ? JSON.stringify(body) : null, {
    status,
    headers: finalHeaders,
  });
}

function rebuildStoredResponse(
  status: number,
  body?: JsonValue,
  headers?: Record<string, string>
): Response {
  return buildJsonResponse(body, status, headers);
}

function logEvent(event: string, data: Record<string, unknown>): void {
  try {
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({ level: 'info', event, ...data }));
  } catch {
    // ignore logging errors
  }
}