import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { handleRoute, Unauthorized, DomainError } from "@/lib/http/errors";
import { setNoStore } from "@/lib/cache/headers";
import { parseJson, validateWith } from "@/lib/validation/zod-helpers";
import { ConversationsService } from "@/services/conversations";

// App Router fornece params como objeto síncrono
type RouteParams = { params: { id: string } };

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isArchived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

// GET /api/conversations/[id]
export const GET = handleRoute(async (_req: Request, _ctx?: unknown) => {
  // como handleRoute agora recebe (req) apenas, usamos assinatura compatível e extraímos id via URL
  // Alternativa: Next.js passa (request: NextRequest, context: RouteParams) ao export; porém nosso wrapper não usa context.
  // Portanto, recuperamos o id parseando a URL do request.
  // Obs: quando chamado por Next, _req será NextRequest com URL /api/conversations/:id
  const url = new URL((_req as NextRequest).url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  const auth = await requireAuth();
  if (!auth.ok) {
    const res = Unauthorized();
    setNoStore(res);
    return res;
  }

  const conversation = await ConversationsService.findById(auth.userId, id);
  if (!conversation) throw new DomainError("NOT_FOUND", "Conversa não encontrada");

  return conversation;
});

// PATCH /api/conversations/[id]
export const PATCH = handleRoute(async (req: Request) => {
  const url = new URL((req as NextRequest).url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  const auth = await requireAuth();
  if (!auth.ok) {
    const res = Unauthorized();
    setNoStore(res);
    return res;
  }

  const json = await parseJson(req as NextRequest);
  const parsed = await validateWith(patchSchema, json);
  if (parsed instanceof Response) {
    setNoStore(parsed);
    return parsed;
  }

  const updated = await ConversationsService.update(auth.userId, id, parsed);
  if (!updated) throw new DomainError("NOT_FOUND", "Conversa não encontrada");

  return { conversation: updated };
});

// DELETE /api/conversations/[id]
export const DELETE = handleRoute(async (req: Request) => {
  const url = new URL((req as NextRequest).url);
  const segments = url.pathname.split("/");
  const id = segments[segments.length - 1];

  const auth = await requireAuth();
  if (!auth.ok) {
    const res = Unauthorized();
    setNoStore(res);
    return res;
  }

  const removed = await ConversationsService.remove(auth.userId, id);
  if (!removed) throw new DomainError("NOT_FOUND", "Conversa não encontrada");

  return new Response(null, { status: 204 });
});