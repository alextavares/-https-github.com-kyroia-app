import { prisma } from "@/lib/prisma";
import { PaymentStatus, normalizePaymentStatus } from "@/lib/constants/payment-status";
import { handleMercadoPagoWebhook } from "@/lib/payment-service";
function extractPaymentId(payload) {
    var _a;
    if (!payload)
        return null;
    const direct = ((_a = payload === null || payload === void 0 ? void 0 : payload.data) === null || _a === void 0 ? void 0 : _a.id) || (payload === null || payload === void 0 ? void 0 : payload.id);
    if (direct)
        return String(direct);
    const resource = payload === null || payload === void 0 ? void 0 : payload.resource;
    if (resource) {
        const match = resource.match(/\/(\d+)$/);
        if (match === null || match === void 0 ? void 0 : match[1])
            return match[1];
    }
    return null;
}
function extractProviderStatus(payload) {
    var _a;
    const raw = (((_a = payload === null || payload === void 0 ? void 0 : payload.data) === null || _a === void 0 ? void 0 : _a.status) || (payload === null || payload === void 0 ? void 0 : payload.status) || "").toString().toLowerCase();
    return raw || undefined;
}
/**
 * Unified processor for MercadoPago payment webhook payloads.
 * - Updates Payment.status idempotently
 * - Credits user account when payment completes and a `creditPackageId` is present
 * - Optionally updates user plan period if credit package defines a plan
 */
export async function processMercadoPagoPaymentWebhook(payload) {
    // Only handle payment notifications here
    const type = String((payload === null || payload === void 0 ? void 0 : payload.type) || (payload === null || payload === void 0 ? void 0 : payload.topic) || "").toLowerCase();
    if (type !== "payment")
        return { handled: false };
    const paymentId = extractPaymentId(payload);
    if (!paymentId)
        return { handled: false };
    // Try to find our internal payment first
    const payment = await prisma.payment.findFirst({
        where: {
            OR: [
                { mercadoPagoPaymentId: String(paymentId) },
                { externalId: String(paymentId) }, // legacy compatibility
            ],
        },
    });
    // Determine new status
    let providerStatus = extractProviderStatus(payload);
    let newStatus = providerStatus
        ? normalizePaymentStatus(providerStatus)
        : undefined;
    // If we couldn't infer from payload, fetch from provider (best-effort)
    if (!newStatus) {
        try {
            const res = await handleMercadoPagoWebhook({ id: paymentId, topic: "payment" });
            if (res === null || res === void 0 ? void 0 : res.status) {
                newStatus = normalizePaymentStatus(String(res.status));
            }
        }
        catch (_a) {
            // ignore; leave unhandled so caller may fallback
        }
    }
    if (!payment) {
        // Not our initiated payment — let caller decide (legacy subscription flow, etc.)
        return { handled: false, paymentId, newStatus };
    }
    if (!newStatus) {
        // No status could be derived — nothing to do now
        return { handled: false, paymentId };
    }
    // Idempotency: if unchanged, early return
    if (payment.status === newStatus) {
        return { handled: true, paymentId, newStatus };
    }
    // Apply changes atomically to avoid double-credit in concurrent webhooks
    await prisma.$transaction(async (tx) => {
        const current = await tx.payment.findUnique({ where: { id: payment.id } });
        if (!current)
            return;
        if (current.status === newStatus)
            return;
        if (newStatus === PaymentStatus.COMPLETED && current.creditPackageId) {
            const creditPackage = await tx.creditPackage.findUnique({ where: { id: current.creditPackageId } });
            if (creditPackage) {
                await tx.user.update({
                    where: { id: current.userId },
                    data: Object.assign({ creditBalance: { increment: creditPackage.credits } }, (creditPackage.planType
                        ? {
                            planType: creditPackage.planType,
                            currentPeriodStart: new Date(),
                            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        }
                        : {})),
                });
                await tx.creditTransaction.create({
                    data: {
                        userId: current.userId,
                        type: 'PURCHASE',
                        amount: creditPackage.credits,
                    },
                });
            }
        }
        await tx.payment.update({ where: { id: payment.id }, data: { status: newStatus } });
    });
    return { handled: true, paymentId, newStatus };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyY2Fkb3BhZ28td2ViaG9vay1wcm9jZXNzb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtZXJjYWRvcGFnby13ZWJob29rLXByb2Nlc3Nvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ3JDLE9BQU8sRUFBRSxhQUFhLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUN0RixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQVNoRSxTQUFTLGdCQUFnQixDQUFDLE9BQVk7O0lBQ3BDLElBQUksQ0FBQyxPQUFPO1FBQUUsT0FBTyxJQUFJLENBQUE7SUFDekIsTUFBTSxNQUFNLEdBQUcsQ0FBQSxNQUFBLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxJQUFJLDBDQUFFLEVBQUUsTUFBSSxPQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsRUFBRSxDQUFBLENBQUE7SUFDL0MsSUFBSSxNQUFNO1FBQUUsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDakMsTUFBTSxRQUFRLEdBQXVCLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxRQUFRLENBQUE7SUFDdEQsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUNiLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDeEMsSUFBSSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUcsQ0FBQyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakMsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsT0FBWTs7SUFDekMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFBLE1BQUEsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLElB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