import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { setNoStore } from "@/lib/cache/headers";
import { handleRoute, DomainError } from "@/lib/http/errors";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const BoletoCheckoutSchema = z.object({
  packageId: z.string().min(1),
  // amount agora é ignorado; usamos o preço do pacote no banco
  amount: z.number().positive().optional(),
  payer: z
    .object({
      email: z.string().email(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      identification: z
        .object({
          type: z.string().optional(), // "CPF" / "CNPJ" dependendo da config
          number: z.string().optional(),
        })
        .optional(),
      address: z
        .object({
          zip_code: z.string().optional(),
          street_name: z.string().optional(),
          street_number: z.string().optional(),
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

    const body = await request.json().catch(() => null);
    const parsed = BoletoCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError("BAD_REQUEST", "Body inválido");
    }
    const { packageId, payer } = parsed.data;

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
        paymentMethod: "boleto",
      },
      select: { id: true },
    });

    // Cria pagamento via Boleto
    const payload: {
      transaction_amount: number;
      description: string;
      payment_method_id: "bolbradesco" | "bolbradesco_v2" | string;
      payer: {
        email: string;
        first_name?: string;
        last_name?: string;
        identification?: { type?: string; number?: string };
      };
      metadata?: Record<string, string | number | boolean>;
      external_reference?: string;
      notification_url?: string;
    } = {
      transaction_amount: price,
      description: `Compra de créditos: ${packageId}`,
      payment_method_id: "bolbradesco",
      external_reference: externalReference,
      payer: {
        email: payer?.email ?? "user@example.com",
        first_name: payer?.first_name,
        last_name: payer?.last_name,
        identification: payer?.identification,
      },
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
      console.error("[mp.boleto] provider_error", errText);
      throw new DomainError("PROVIDER_ERROR", "Falha ao criar pagamento Boleto no Mercado Pago");
    }

    const mpData = await mpResp.json();
    const boletoUrl =
      mpData?.transaction_details?.external_resource_url ||
      mpData?.point_of_interaction?.transaction_data?.ticket_url ||
      null;
    const boletoBarcode = mpData?.barcode?.content || null;

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        mercadoPagoPaymentId: String(mpData?.id ?? ""),
      },
    });

    const res = NextResponse.json({
      method: "boleto",
      externalReference,
      mpPaymentId: mpData?.id ?? null,
      boletoUrl,
      boletoBarcode,
      status: "PENDING",
    });
    setNoStore(res);
    return res;
  });
}