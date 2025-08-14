import { handleRoute, BadRequest } from '@/lib/http/errors'
import { requireAuth, applyRateLimit } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { computeRequestHash, withIdempotency } from '@/lib/http/idempotency'
import { PaymentStatus } from '@/lib/constants/payment-status'

type PurchasePayload = {
  packageId?: string;
  credits?: number;
  price?: number;
  currency?: string;
};

export const POST = handleRoute(async (req: Request) => {
  // Autenticação (contrato: { ok: true, userId } | { ok: false, error })
  const auth = await requireAuth();
  if (!auth.ok) {
    return auth.error;
  }
  const userId = auth.userId;

  // Rate limit (caminho confirmado)
  const rl = await applyRateLimit([userId, 'credits', 'purchase'], { windowMs: 60_000, max: 20, keyPrefix: 'rl' })
  if (rl) return rl

  // Parse body
  let body: PurchasePayload;
  try {
    body = (await req.json()) as PurchasePayload;
  } catch {
    return BadRequest('Invalid JSON body');
  }

  const { packageId, credits, price, currency } = body ?? {};
  if (!packageId && !(credits && price && currency)) {
    return BadRequest('Missing required fields: provide packageId or (credits, price, currency)');
  }

  // Lógica de criação do pagamento alinhada ao schema informado (externalId e paymentMethod obrigatórios).
  // Observação: ajuste creditPackageId/amount/etc. conforme seu schema real.
  const createPayment = async () => {
    const payment = await prisma.payment.create({
      data: {
        userId,
        creditPackageId: packageId ?? '',
        amount: price ?? 0,
        currency: currency ?? 'USD',
        status: PaymentStatus.COMPLETED, // armazenamos padronizado internamente
        provider: 'manual',
        externalId: `purchase_${Date.now()}`,
        paymentMethod: 'manual',
      },
      select: {
        id: true,
        userId: true,
        creditPackageId: true,
        amount: true,
        currency: true,
        status: true,
        externalId: true,
        paymentMethod: true,
      },
    });

    // Compatibilidade: respostas antigas esperam 'PAID'
    const legacyStatus = 'PAID'

    return {
      status: 201,
      body: {
        id: payment.id,
        userId: payment.userId,
        creditPackageId: payment.creditPackageId,
        amount: payment.amount,
        currency: payment.currency,
        status: legacyStatus,
        externalId: payment.externalId,
        paymentMethod: payment.paymentMethod,
      },
      headers: {
        'Cache-Control': 'no-store',
      },
    };
  };

  // Idempotency-Key
  const idemKey = req.headers.get('Idempotency-Key');

  // Sem Idempotency-Key: comportamento atual
  if (!idemKey) {
    const stored = await createPayment();
    return new Response(JSON.stringify(stored.body), {
      status: stored.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Com Idempotency-Key: calcular hash determinístico do payload relevante
  const requestHash = computeRequestHash({
    packageId: packageId ?? null,
    credits: credits ?? null,
    price: price ?? null,
    currency: currency ?? null,
  });

  // Envolver criação com idempotência
  return withIdempotency(
    {
      userId,
      route: '/api/credits/purchase',
      key: idemKey,
      requestHash,
      ttlMs: 24 * 60 * 60 * 1000,
    },
    async () => {
      return createPayment();
    }
  );
});
