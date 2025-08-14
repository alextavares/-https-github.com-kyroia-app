import { NextResponse } from "next/server";
import { setNoStore } from "@/lib/cache/headers";
import { ZodError, ZodTypeAny } from "zod";

/**
 * Tenta fazer o parse de JSON do request, retornando null se inválido.
 */
export async function parseJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Resposta padronizada para erros de validação Zod.
 */
export function replyValidationError(error: ZodError) {
  const res = NextResponse.json(
    {
      error: "Dados inválidos",
      details: error.flatten(),
    },
    { status: 400 }
  );
  setNoStore(res);
  return res;
}

/**
 * Valida dados com um schema Zod, retornando dados tipados ou uma Response de erro.
 * Uso:
 *   const parsed = await validateWith(schema, await parseJson(req));
 *   if (parsed instanceof Response) return parsed; // erro
 *   // else parsed é do tipo inferido do schema
 */
export async function validateWith<T extends ZodTypeAny>(
  schema: T,
  data: unknown
): Promise<Response | ReturnType<T["parse"]>> {
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    return replyValidationError(result.error);
  }
  return result.data;
}