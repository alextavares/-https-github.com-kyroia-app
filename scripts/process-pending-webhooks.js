import { prisma } from '../lib/prisma';
import { updateSubscriptionFromWebhook } from '../lib/subscription-service';
async function processPendingWebhooks() {
    console.log('Starting to process pending webhooks...');
    const pendingWebhooks = await prisma.mercadoPagoWebhookLog.findMany({
        where: { status: 'PENDING' },
    });
    if (pendingWebhooks.length === 0) {
        console.log('No pending webhooks to process.');
        return;
    }
    console.log(`Found ${pendingWebhooks.length} pending webhooks.`);
    for (const webhook of pendingWebhooks) {
        console.log(`Processing webhook ID: ${webhook.id}`);
        try {
            // The body is stored as a stringified JSON in the DB (SQLite doesn't support Json type)
            let payload = null;
            try {
                payload = typeof webhook.body === 'string' ? JSON.parse(webhook.body) : webhook.body;
            }
            catch (e) {
                throw new Error('Webhook log body is not valid JSON string');
            }
            // We need to simulate the webhook structure that updateSubscriptionFromWebhook expects
            // This assumes the core data is in the 'body' field of the log
            if (payload && payload.type && payload.data && payload.data.id) {
                await updateSubscriptionFromWebhook(payload);
                await prisma.mercadoPagoWebhookLog.update({
                    where: { id: webhook.id },
                    data: { status: 'PROCESSED' },
                });
                console.log(`Webhook ID: ${webhook.id} processed successfully.`);
            }
            else {
                throw new Error('Webhook log body is missing required fields (type, data.id)');
            }
        }
        catch (error) {
            console.error(`Failed to process webhook ID: ${webhook.id}`, error);
            await prisma.mercadoPagoWebhookLog.update({
                where: { id: webhook.id },
                data: { status: 'FAILED' },
            });
        }
    }
    console.log('Finished processing webhooks.');
}
processPendingWebhooks()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1wZW5kaW5nLXdlYmhvb2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvY2Vzcy1wZW5kaW5nLXdlYmhvb2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFNUUsS0FBSyxVQUFVLHNCQUFzQjtJQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7SUFFdkQsTUFBTSxlQUFlLEdBQUcsTUFBTSxNQUFNLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDO1FBQ2xFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUU7S0FDN0IsQ0FBQyxDQUFDO0lBRUgsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUMvQyxPQUFPO0lBQ1QsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxlQUFlLENBQUMsTUFBTSxvQkFBb0IsQ0FBQyxDQUFDO0lBRWpFLEtBQUssTUFBTSxPQUFPLElBQUksZUFBZSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDO1lBQ0gsd0ZBQXdGO1lBQ3hGLElBQUksT0FBTyxHQUFRLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUM7Z0JBQ0gsT0FBTyxHQUFHLE9BQVEsT0FBZSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsT0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBRSxPQUFlLENBQUMsSUFBSSxDQUFDO1lBQ2xILENBQUM7WUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsMkNBQTJDLENBQUMsQ0FBQztZQUMvRCxDQUFDO1lBRUQsdUZBQXVGO1lBQ3ZGLCtEQUErRDtZQUMvRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDL0QsTUFBTSw2QkFBNkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFN0MsTUFBTSxNQUFNLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDO29CQUN4QyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRTtvQkFDekIsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRTtpQkFDOUIsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxPQUFPLENBQUMsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO1lBQ25FLENBQUM7aUJBQU0sQ0FBQztnQkFDTixNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7WUFDakYsQ0FBQztRQUVILENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sTUFBTSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztnQkFDeEMsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pCLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7YUFDM0IsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELHNCQUFzQixFQUFFO0tBQ3JCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMsQ0FBQztLQUNELE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM3QixDQUFDLENBQUMsQ0FBQyJ9