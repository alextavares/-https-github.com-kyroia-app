import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { setNoStore } from "@/lib/cache/headers";
import { handleRoute, DomainError } from "@/lib/http/errors";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// Atenção: Em produção, cartão deve ser tokenizado pelo frontend (PCI-DSS).
// Aqui modelamos um fluxo simples com token/id do cartão já tokenizado no cliente.

const CardCheckoutSchema = z.object({
  packageId: z.string().min(1),
  // amount agora é ignorado; usamos o preço do pacote no banco
  amount: z.number().positive().optional(),
  // token gerado pelo frontend (Mercado Pago card token)
  cardToken: z.string().min(1),
  // opcional
  installments: z.number().int().min(1).max(12).optional(),
  payer: z
    .object({
      email: z.string().email(),
      identification: z
        .object({
          type: z.string().optional(),
          number: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  return handleRoute(async () => {
    const auth = await requireAuth();
    if (!auth.ok) {
      const res = NextResponse.json({ error: "Não autorizado" }, { status: auth.error.status });
      setNoStore(res);
      return res;
    }

    const json = await request.json().catch(() => null);
    const parsed = CardCheckoutSchema.safeParse(json);
    if (!parsed.success) {
      throw new DomainError("BAD_REQUEST", "Body inválido");
    }

    const { packageId, cardToken, installments, payer } = parsed.data;

    // Busca preço/currency a partir do catálogo
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId },
      select: { id: true, price: true, currency: true, name: true },
    })
    if (!creditPackage) throw new DomainError("PACKAGE_NOT_FOUND", "Pacote não encontrado")
    const price = Number(creditPackage.price || 0)
    const currency = creditPackage.currency || "BRL"

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw new DomainError("CONFIG_MISSING", "MERCADOPAGO_ACCESS_TOKEN ausente");

    const externalReference = randomUUID();

    // Cria Payment PENDING
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: auth.userId,
        provider: "mercadopago",
        externalId: externalReference,
        status: "pending",
        amount: price,
        currency,
        creditPackageId: packageId,
        paymentMethod: "card",
      },
      select: { id: true },
    });

    // Cria pagamento com método cartão usando token (server-side)
    const payload: any = {
      transaction_amount: price,
      token: cardToken,
      description: `Compra de créditos: ${packageId}`,
      installments: installments ?? 1,
      payment_method_id: "visa", // MP detecta pelo token, mas pode ser especificado
      payer: {
        email: payer?.email ?? "user@example.com",
        identification: payer?.identification,
      },
      external_reference: externalReference,
      notification_url: `${process.env.NEXTAUTH_URL || "https://seahorse-app-k5pag.ondigitalocean.app"}/api/mercadopago/webhook`,
    };

    const mpResp = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!mpResp.ok) {
      const errText = await mpResp.text();
      console.error("[mp.card] provider_error", errText);
      throw new DomainError("PROVIDER_ERROR", "Falha ao criar pagamento cartão no Mercado Pago");
    }

    const mpData = await mpResp.json();

    const last4 =
      mpData?.card?.last_four_digits ??
      null;

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        mercadoPagoPaymentId: String(mpData?.id ?? ""),
      },
    });

    // Para cartão, o status pode vir aprovado imediatamente (sandbox). Mantemos PENDING até o webhook confirmar.
    const res = NextResponse.json({
      method: "card",
      externalReference,
      mpPaymentId: mpData?.id ?? null,
      status: "PENDING",
      cardLast4: last4,
    });
    setNoStore(res);
    return res;
  });
}