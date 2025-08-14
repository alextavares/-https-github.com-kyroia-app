import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
/**
 * Compute a stable SHA-256 hash for an arbitrary payload using key-sorted JSON.
 */
export function computeRequestHash(payload) {
    const json = JSON.stringify(sortObject(payload));
    return crypto.createHash('sha256').update(json).digest('hex');
}
/**
 * Recursively sort object keys to produce a stable JSON representation.
 */
function sortObject(value) {
    if (Array.isArray(value)) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return value.map((v) => sortObject(v));
    }
    if (value && typeof value === 'object') {
        const obj = value;
        const sortedKeys = Object.keys(obj).sort();
        const result = {};
        for (const k of sortedKeys) {
            result[k] = sortObject(obj[k]);
        }
        return result;
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
export async function withIdempotency({ userId, route, key, requestHash, ttlMs = 24 * 60 * 60 * 1000 }, executor) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);
    return await prisma.$transaction(async (tx) => {
        var _a, _b, _c, _d;
        const delegate = tx.idempotencyRequest;
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
                return buildJsonResponse({ error: 'Idempotency key conflict', message: 'Payload does not match previous request' }, 409);
            }
            if (record.responseStatus != null) {
                logEvent('idempotency_hit', { userId, route, key });
                return rebuildStoredResponse(record.responseStatus, (_a = record.responseBody) !== null && _a !== void 0 ? _a : undefined, (_b = record.responseHeaders) !== null && _b !== void 0 ? _b : undefined);
            }
            // No stored response yet → fall through to execute and store
        }
        else {
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
                responseBody: ((_c = stored.body) !== null && _c !== void 0 ? _c : null),
                responseHeaders: ((_d = stored.headers) !== null && _d !== void 0 ? _d : {}),
            },
        });
        return buildJsonResponse(stored.body, stored.status, stored.headers);
    });
}
function buildJsonResponse(body, status = 200, headers) {
    const finalHeaders = Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, (headers !== null && headers !== void 0 ? headers : {}));
    return new Response(body != null ? JSON.stringify(body) : null, {
        status,
        headers: finalHeaders,
    });
}
function rebuildStoredResponse(status, body, headers) {
    return buildJsonResponse(body, status, headers);
}
function logEvent(event, data) {
    try {
        // eslint-disable-next-line no-console
        console.info(JSON.stringify(Object.assign({ level: 'info', event }, data)));
    }
    catch (_a) {
        // ignore logging errors
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbXBvdGVuY3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpZGVtcG90ZW5jeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQXNFdEM7O0dBRUc7QUFDSCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsT0FBZ0I7SUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNqRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLFVBQVUsQ0FBSSxLQUFRO0lBQzdCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3pCLHlFQUF5RTtRQUN6RSxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBaUIsQ0FBQztJQUN2RCxDQUFDO0lBQ0gsSUFBSSxLQUFLLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDdkMsTUFBTSxHQUFHLEdBQUcsS0FBZ0MsQ0FBQztRQUM3QyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNDLE1BQU0sTUFBTSxHQUE0QixFQUFFLENBQUM7UUFDM0MsS0FBSyxNQUFNLENBQUMsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUMzQixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pD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