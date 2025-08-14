/**
 * Helpers de erro HTTP e wrapper para rotas.
 * Padrão: gerar NextResponse JSON consistente, com mensagem e opcionais detalhes.
 * Este arquivo implementa:
 * - DomainError com códigos padronizados
 * - Mapeamento de status HTTP por código
 * - Correlation-Id por requisição (gerado aqui se ausente)
 * - Logging estruturado dos erros
 */
import { NextResponse } from "next/server";
import { setNoStore } from "@/lib/cache/headers";
const STATUS_BY_CODE = {
    VALIDATION: 422,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL: 500,
};
function httpStatusFromCode(code) {
    var _a;
    if (!code)
        return 500;
    return (_a = STATUS_BY_CODE[code]) !== null && _a !== void 0 ? _a : 500;
}
function generateCorrelationId() {
    // UUID v4 simples: fallback sem dependências
    // Nota: em Node 18+, poderíamos usar crypto.randomUUID()
    const rnd = () => Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}
function asPlainObject(err) {
    if (err instanceof Error) {
        // Extrai campos padronizados de Error
        const out = {
            name: err.name,
            message: err.message,
            stack: err.stack,
        };
        // Copia propriedades próprias enumeráveis adicionais, se houver
        // Convertemos para unknown antes de indexar para satisfazer o TS/eslint
        const anyErr = err;
        for (const key of Object.keys(anyErr)) {
            if (key !== "name" && key !== "message" && key !== "stack") {
                out[key] = anyErr[key];
            }
        }
        return out;
    }
    return err;
}
// -----------------------------
// DomainError
// -----------------------------
export class DomainError extends Error {
    constructor(code, message, details) {
        super(message !== null && message !== void 0 ? message : code);
        this.code = code;
        this.details = details;
        this.name = "DomainError";
    }
}
// -----------------------------
// JSON error helpers
// -----------------------------
function jsonError(message, status, details, code, correlationId) {
    const res = NextResponse.json(Object.assign(Object.assign(Object.assign({ error: message }, (code ? { code } : {})), (details ? { details } : {})), (correlationId ? { correlationId } : {})), { status });
    setNoStore(res);
    if (correlationId) {
        res.headers.set("X-Correlation-Id", correlationId);
    }
    return res;
}
export function BadRequest(message = "Requisição inválida", details, correlationId) {
    return jsonError(message, 400, details, "BAD_REQUEST", correlationId);
}
export function Unauthorized(message = "Não autorizado", details, correlationId) {
    return jsonError(message, 401, details, "UNAUTHORIZED", correlationId);
}
export function NotFound(message = "Não encontrado", details, correlationId) {
    return jsonError(message, 404, details, "NOT_FOUND", correlationId);
}
export function InternalError(message = "Erro interno do servidor", details, correlationId) {
    return jsonError(message, 500, details, "INTERNAL", correlationId);
}
// -----------------------------
// Wrapper de rota com mapeamento e logs
// -----------------------------
/**
 * Importante: em rotas App Router, export const GET/POST/etc deve ser uma função (não uma Promise).
 * Portanto, handleRoute DEVE devolver uma função handler, e não uma Promise resolvida.
 * Este wrapper garante que não haverá uso de Function.prototype.apply/Reflect.apply sobre Promises.
 */
export function handleRoute(fn) {
    return async function routeHandler(req) {
        const correlationId = generateCorrelationId();
        try {
            const result = await fn(req);
            if (result instanceof Response) {
                if (!result.headers.get("X-Correlation-Id")) {
                    result.headers.set("X-Correlation-Id", correlationId);
                }
                return result;
            }
            const res = NextResponse.json(result);
            setNoStore(res);
            res.headers.set("X-Correlation-Id", correlationId);
            return res;
        }
        catch (err) {
            if (err instanceof DomainError) {
                const status = httpStatusFromCode(err.code);
                structuredLog("route_error", {
                    level: status >= 500 ? "error" : "warn",
                    code: err.code,
                    message: err.message,
                    details: err.details,
                    correlationId,
                });
                return jsonError(err.message, status, err.details, err.code, correlationId);
            }
            if ((err === null || err === void 0 ? void 0 : err.name) === "ZodError") {
                structuredLog("route_error", {
                    level: "warn",
                    code: "VALIDATION",
                    message: "Erro de validação",
                    details: asPlainObject(err),
                    correlationId,
                });
                return jsonError("Erro de validação", 422, asPlainObject(err), "VALIDATION", correlationId);
            }
            structuredLog("route_error", {
                level: "error",
                code: "INTERNAL",
                message: typeof err.message === "string"
                    ? err.message
                    : "Erro interno do servidor",
                details: asPlainObject(err),
                correlationId,
            });
            return InternalError("Erro interno do servidor", asPlainObject(err), correlationId);
        }
    };
}
function structuredLog(event, data) {
    const record = Object.assign({ event, timestamp: new Date().toISOString() }, data);
    // Saída JSON única para fácil coleta por observabilidade
    // Em produção, integrar com provider (Datadog, ELK, etc.)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(record));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZXJyb3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHO0FBQ0gsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFZakQsTUFBTSxjQUFjLEdBQTJCO0lBQzdDLFVBQVUsRUFBRSxHQUFHO0lBQ2YsV0FBVyxFQUFFLEdBQUc7SUFDaEIsWUFBWSxFQUFFLEdBQUc7SUFDakIsU0FBUyxFQUFFLEdBQUc7SUFDZCxTQUFTLEVBQUUsR0FBRztJQUNkLFFBQVEsRUFBRSxHQUFHO0lBQ2IsWUFBWSxFQUFFLEdBQUc7SUFDakIsUUFBUSxFQUFFLEdBQUc7Q0FDZCxDQUFDO0FBRUYsU0FBUyxrQkFBa0IsQ0FBQyxJQUFhOztJQUN2QyxJQUFJLENBQUMsSUFBSTtRQUFFLE9BQU8sR0FBRyxDQUFDO0lBQ3RCLE9BQU8sTUFBQSxjQUFjLENBQUMsSUFBSSxDQUFDLG1DQUFJLEdBQUcsQ0FBQztBQUNyQyxDQUFDO0FBRUQsU0FBUyxxQkFBcUI7SUFDNUIsNkNBQTZDO0lBQzdDLHlEQUF5RDtJQUN6RCxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FDZixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQztTQUN0QyxRQUFRLENBQUMsRUFBRSxDQUFDO1NBQ1osU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ2hGLENBQUM7QUFFRCxTQUFTLGFBQWEs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