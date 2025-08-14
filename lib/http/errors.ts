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

// -----------------------------
// Tipos e utilitários
// -----------------------------
type ErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
  correlationId?: string;
};

const STATUS_BY_CODE: Record<string, number> = {
  VALIDATION: 422,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

function httpStatusFromCode(code?: string): number {
  if (!code) return 500;
  return STATUS_BY_CODE[code] ?? 500;
}

function generateCorrelationId(): string {
  // UUID v4 simples: fallback sem dependências
  // Nota: em Node 18+, poderíamos usar crypto.randomUUID()
  const rnd = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}

function asPlainObject(err: unknown): unknown {
  if (err instanceof Error) {
    // Extrai campos padronizados de Error
    const out: Record<string, unknown> = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
    // Copia propriedades próprias enumeráveis adicionais, se houver
    // Convertemos para unknown antes de indexar para satisfazer o TS/eslint
    const anyErr = err as unknown as Record<string, unknown>;
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
  code: string;
  details?: unknown;

  constructor(code: string, message?: string, details?: unknown) {
    super(message ?? code);
    this.code = code;
    this.details = details;
    this.name = "DomainError";
  }
}

// -----------------------------
// JSON error helpers
// -----------------------------
function jsonError(message: string, status: number, details?: unknown, code?: string, correlationId?: string) {
  const res = NextResponse.json(
    { error: message, ...(code ? { code } : {}), ...(details ? { details } : {}), ...(correlationId ? { correlationId } : {}) } as ErrorBody,
    { status }
  );
  setNoStore(res);
  if (correlationId) {
    res.headers.set("X-Correlation-Id", correlationId);
  }
  return res;
}

export function BadRequest(message = "Requisição inválida", details?: unknown, correlationId?: string) {
  return jsonError(message, 400, details, "BAD_REQUEST", correlationId);
}

export function Unauthorized(message = "Não autorizado", details?: unknown, correlationId?: string) {
  return jsonError(message, 401, details, "UNAUTHORIZED", correlationId);
}

export function NotFound(message = "Não encontrado", details?: unknown, correlationId?: string) {
  return jsonError(message, 404, details, "NOT_FOUND", correlationId);
}

export function InternalError(message = "Erro interno do servidor", details?: unknown, correlationId?: string) {
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
export function handleRoute<T>(fn: (req: Request) => Promise<T | Response>) {
  return async function routeHandler(req: Request): Promise<Response> {
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
    } catch (err) {
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

      if ((err as unknown as { name?: string })?.name === "ZodError") {
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
        message:
          typeof (err as { message?: unknown }).message === "string"
            ? ((err as { message?: unknown }).message as string)
            : "Erro interno do servidor",
        details: asPlainObject(err),
        correlationId,
      });
      return InternalError("Erro interno do servidor", asPlainObject(err), correlationId);
    }
  };
}

// -----------------------------
// Logging estruturado
// -----------------------------
type LogRecord = {
  level: "debug" | "info" | "warn" | "error";
  event: string;
  correlationId?: string;
  code?: string;
  message?: string;
  details?: unknown;
  timestamp?: string;
};

function structuredLog(event: string, data: Omit<LogRecord, "event" | "timestamp">) {
  const record: LogRecord = {
    event,
    timestamp: new Date().toISOString(),
    ...data,
  };
  // Saída JSON única para fácil coleta por observabilidade
  // Em produção, integrar com provider (Datadog, ELK, etc.)
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(record));
}
