import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/guards";
import { setNoStore } from "@/lib/cache/headers";
import { handleRoute, DomainError } from "@/lib/http/errors";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

// Zod schema de entrada
const PixCheckoutSchema = z.object({
  packageId: z.string().min(1),
  // amount agora é ignorado; usamos o preço do pacote no banco
  amount: z.number().positive().optional(),
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
    const parsed = PixCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError("BAD_REQUEST", "Body inválido");
    }
    const { packageId } = parsed.data;

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

    // Referência externa para correlacionar com o nosso registro interno
    const externalReference = randomUUID();

    // Cria Payment PENDING (idempotência via externalId)
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: auth.userId,
        provider: "mercadopago",
        externalId: externalReference,
        status: "pending",
        amount: price,
        currency,
        creditPackageId: packageId,
        paymentMethod: "pix",
      },
      select: { id: true },
    });

    // Cria preferência/intent PIX na API do Mercado Pago
    // Documentação: preferências / pagamentos PIX
    // Aqui usamos a API de pagamentos com método PIX
    const payload: {
      transaction_amount: number;
      description: string;
      payment_method_id: "pix";
      payer: { email: string };
      external_reference: string;
      notification_url?: string;
    } = {
      transaction_amount: price,
      description: `Compra de créditos: ${packageId}`,
      payment_method_id: "pix",
      payer: {
        email: "user@example.com", // opcional: pode enriquecer com dados do usuário se tiver
      },
      external_reference: externalReference,
      // Garante envio do webhook para nossa rota canônica
      // (conta MercadoPago também pode ter webhook padrão configurado)
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
      // Apenas logamos; manteremos o Payment PENDING para eventual retry/manual
      console.error("[mp.pix] provider_error", errText);
      throw new DomainError("PROVIDER_ERROR", "Falha ao criar pagamento PIX no Mercado Pago");
    }

    const mpData = await mpResp.json();

    // Extrai QR Code base64/URL caso disponível (depende da resposta da API)
    const qrCode = mpData?.point_of_interaction?.transaction_data?.qr_code_base64 ?? null;
    const copiaECola = mpData?.point_of_interaction?.transaction_data?.qr_code ?? null;

    // Atualiza Payment com o ID do MercadoPago
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        mercadoPagoPaymentId: String(mpData?.id ?? ""),
      },
    });

    const res = NextResponse.json({
      method: "pix",
      externalReference,
      mpPaymentId: mpData?.id ?? null,
      qrCode,
      copiaECola,
      status: "PENDING",
    });
    setNoStore(res);
    return res;
  });
}