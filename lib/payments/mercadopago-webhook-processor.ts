import { prisma } from "@/lib/prisma"
import { PaymentStatus, normalizePaymentStatus } from "@/lib/constants/payment-status"
import { handleMercadoPagoWebhook } from "@/lib/payment-service"
import { CreditService } from "@/lib/credit-service"

type ProcessResult = {
  handled: boolean
  paymentId?: string
  newStatus?: string
}

function extractPaymentId(payload: any): string | null {
  if (!payload) return null
  const direct = payload?.data?.id || payload?.id
  if (direct) return String(direct)
  const resource: string | undefined = payload?.resource
  if (resource) {
    const match = resource.match(/\/(\d+)$/)
    if (match?.[1]) return match[1]
  }
  return null
}

function extractProviderStatus(payload: any): string | undefined {
  const raw = (payload?.data?.status || payload?.status || "").toString().toLowerCase()
  return raw || undefined
}

/**
 * Unified processor for MercadoPago payment webhook payloads.
 * - Updates Payment.status idempotently
 * - Credits user account when payment completes and a `creditPackageId` is present
 * - Optionally updates user plan period if credit package defines a plan
 */
export async function processMercadoPagoPaymentWebhook(payload: any): Promise<ProcessResult> {
  // Only handle payment notifications here
  const type = String(payload?.type || payload?.topic || "").toLowerCase()
  if (type !== "payment") return { handled: false }

  const paymentId = extractPaymentId(payload)
  if (!paymentId) return { handled: false }

  // Try to find our internal payment first
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        { mercadoPagoPaymentId: String(paymentId) },
        { externalId: String(paymentId) }, // legacy compatibility
      ],
    },
  })

  // Determine new status
  let providerStatus = extractProviderStatus(payload)
  let newStatus: string | undefined = providerStatus
    ? normalizePaymentStatus(providerStatus)
    : undefined

  // If we couldn't infer from payload, fetch from provider (best-effort)
  if (!newStatus) {
    try {
      const res = await handleMercadoPagoWebhook({ id: paymentId, topic: "payment" } as any)
      if (res?.status) {
        newStatus = normalizePaymentStatus(String(res.status))
      }
    } catch {
      // ignore; leave unhandled so caller may fallback
    }
  }

  if (!payment) {
    // Not our initiated payment — let caller decide (legacy subscription flow, etc.)
    return { handled: false, paymentId, newStatus }
  }

  if (!newStatus) {
    // No status could be derived — nothing to do now
    return { handled: false, paymentId }
  }

  // Idempotency: if unchanged, early return
  if (payment.status === newStatus) {
    return { handled: true, paymentId, newStatus }
  }

  // Apply changes atomically to avoid double-credit in concurrent webhooks
  await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({ where: { id: payment.id } })
    if (!current) return
    if (current.status === newStatus) return

    if (newStatus === PaymentStatus.COMPLETED && current.creditPackageId) {
      const creditPackage = await tx.creditPackage.findUnique({ where: { id: current.creditPackageId } })
      if (creditPackage) {
        await tx.user.update({
          where: { id: current.userId },
          data: {
            creditBalance: { increment: creditPackage.credits },
            ...(creditPackage.planType
              ? {
                  planType: creditPackage.planType,
                  currentPeriodStart: new Date(),
                  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
              : {}),
          },
        })

        await tx.creditTransaction.create({
          data: {
            userId: current.userId,
            type: 'PURCHASE',
            amount: creditPackage.credits,
          },
        })
      }
    }

    await tx.payment.update({ where: { id: payment.id }, data: { status: newStatus } })
  })

  return { handled: true, paymentId, newStatus }
}


