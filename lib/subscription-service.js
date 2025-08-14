import { prisma } from '@/lib/prisma';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PaymentStatus, normalizePaymentStatus } from '@/lib/constants/payment-status';
// Initialize the MercadoPago client
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});
const payment = new Payment(client);
/**
 * Processes a validated MercadoPago webhook payload, fetches real payment data,
 * and updates the user's subscription in the database.
 * @param payload The webhook payload from MercadoPago.
 */
export async function updateSubscriptionFromWebhook(payload) {
    if (payload.type !== 'payment') {
        console.log(`Ignoring webhook of type: ${payload.type}`);
        return;
    }
    try {
        const paymentDetails = await payment.get({ id: payload.data.id });
        if (!paymentDetails || !paymentDetails.external_reference) {
            throw new Error(`Payment details or external_reference (userId) not found for payment ID: ${payload.data.id}`);
        }
        const userId = paymentDetails.external_reference;
        const status = paymentDetails.status;
        if (!status) {
            console.warn(`[subscription-service] Missing status for payment ${payload.data.id}; skipping update`);
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
    }
    catch (error) {
        console.error(`Failed to process payment ID ${payload.data.id}:`, error);
        // Re-throw to be handled by the caller if necessary
        throw error;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NyaXB0aW9uLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdWJzY3JpcHRpb24tc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDekQsT0FBTyxFQUFFLGFBQWEsRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXZGLG9DQUFvQztBQUNwQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFpQixDQUFDO0lBQ25DLFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF5QjtDQUNuRCxDQUFDLENBQUM7QUFDSCxNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQVNwQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLEtBQUssVUFBVSw2QkFBNkIsQ0FBQyxPQUF1QjtJQUN6RSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7UUFDekQsT0FBTztJQUNULENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLGNBQWMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWxFLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxRCxNQUFNLElBQUksS0FBSyxDQUFDLDRFQUE0RSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakgsQ0FBQztRQUVELE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxrQkFBNEIsQ0FBQztRQUMzRCxNQUFNLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBNEIsQ0FBQztRQUMzRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLENBQUMsSUFBSSxDQUFDLHFEQUFxRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtZQUNyRyxPQUFPO1FBQ1QsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBRWxDLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLFNBQVMsYUFBYSxNQUFNLGlCQUFpQixNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRXpGLE1BQU0sZ0JBQWdCLEdBQUcsc0JBQXNCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsd0NBQXdDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixLQUFLLGFBQWEsQ0FBQyxTQUFTLENBQUM7UUFDOUQsTUFBTSxVQUFVLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUM5QixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUU5QyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQy9CLEtBQUssRUFBRTtnQkFDTCxvQkFBb0IsRUFBRSxTQUFTO2FBQ2hDO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVTtnQkFDeEMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFO2FBQ3JEO1lBQ0QsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxNQUFNO2dCQUNkLG9CQUFvQixFQUFFLFNBQVM7Z0JBQy9CLElBQUksRUFBRSxLQUFLO2dCQUNYLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVTtnQkFDeEMsa0JBQWtCLEVBQUUsSUFBSSxJQUFJLEVBQUU7Z0JBQzlCLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTthQUNyRDtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLFNBQVMsYUFBYSxNQUFNLG1CQUFtQixRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUVwSSxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsb0RBQW9EO1FBQ3BELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMifQ==