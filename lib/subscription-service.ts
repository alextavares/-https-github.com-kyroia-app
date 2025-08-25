import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PaymentStatus, normalizePaymentStatus } from '@/lib/constants/payment-status';

// Initialize the MercadoPago client (tolerant to missing env in tests)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'test',
});

interface WebhookPayload {
  type: string;
  data: {
    id: string;
  };
}

/**
 * Processes a validated MercadoPago webhook payload, fetches real payment data,
 * and updates the user's subscription in the database.
 * @param payload The webhook payload from MercadoPago.
 */
export async function updateSubscriptionFromWebhook(payload: WebhookPayload) {
  if (payload.type !== 'payment') {
    console.log(`Ignoring webhook of type: ${payload.type}`);
    return;
  }

  try {
    // Instantiate Payment at call-time so Jest mocks can override
    const mpPayment = new Payment(client);
    const paymentDetails = await mpPayment.get({ id: payload.data.id });

    if (!paymentDetails || !paymentDetails.external_reference) {
      throw new Error(`Payment details or external_reference (userId) not found for payment ID: ${payload.data.id}`);
    }

    const userId = paymentDetails.external_reference as string;
    const status = paymentDetails.status as string | undefined;
    if (!status) {
      console.warn(`[subscription-service] Missing status for payment ${payload.data.id}; skipping update`)
      return;
    }
    const paymentId = payload.data.id;

    console.log(`Processing payment ${paymentId} for user ${userId} with status: ${status}`);

    const normalizedStatus = normalizePaymentStatus(status);
    // Map statuses to current schema fields
    const isActive = normalizedStatus === PaymentStatus.COMPLETED;
    const newEndDate = new Date();
    newEndDate.setDate(newEndDate.getDate() + 30);

    await prisma.subscription.upsert({
      where: {
        mercadoPagoPaymentId: paymentId,
      },
      update: {
        status: isActive ? 'ACTIVE' : 'CANCELED',
        currentPeriodEnd: isActive ? newEndDate : new Date(),
      },
      create: {
        userId: userId,
        mercadoPagoPaymentId: paymentId,
        plan: 'PRO',
        status: isActive ? 'ACTIVE' : 'CANCELED',
        currentPeriodStart: new Date(),
        currentPeriodEnd: isActive ? newEndDate : new Date(),
      },
    });

    console.log(`Successfully processed payment ${paymentId} for user ${userId}. Status set to ${isActive ? 'ACTIVE' : 'CANCELED'}.`);

  } catch (error) {
    console.error(`Failed to process payment ID ${payload.data.id}:`, error);
    // Re-throw to be handled by the caller if necessary
    throw error;
  }
}
