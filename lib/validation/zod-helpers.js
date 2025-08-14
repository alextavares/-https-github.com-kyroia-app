import { NextResponse } from "next/server";
import { setNoStore } from "@/lib/cache/headers";
/**
 * Tenta fazer o parse de JSON do request, retornando null se inválido.
 */
export async function parseJson(request) {
    try {
        return await request.json();
    }
    catch (_a) {
        return null;
    }
}
/**
 * Resposta padronizada para erros de validação Zod.
 */
export function replyValidationError(error) {
    const res = NextResponse.json({
        error: "Dados inválidos",
        details: error.flatten(),
    }, { status: 400 });
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
export async function validateWith(schema, data) {
    const result = await schema.safeParseAsync(data);
    if (!result.success) {
        return replyValidationError(result.error);
    }
    return result.data;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9kLWhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ6b2QtaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUdqRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsU0FBUyxDQUFDLE9BQWdCO0lBQzlDLElBQUksQ0FBQztRQUNILE9BQU8sTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDOUIsQ0FBQztJQUFDLFdBQU0sQ0FBQztRQUNQLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxvQkFBb0IsQ0FBQyxLQUFlO0lBQ2xELE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQzNCO1FBQ0UsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRTtLQUN6QixFQUNELEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUNoQixDQUFDO0lBQ0YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILE1BQU0sQ0FBQyxLQUFLLFVBQVUsWUFBWSxDQUNoQyxNQUFTLEVBQ1QsSUFBYTtJQUViLE1BQU0sTUFBTSxHQUFHLE1BQU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BCLE9BQU8sb0JBQW9CLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDckIsQ0FBQyJ9