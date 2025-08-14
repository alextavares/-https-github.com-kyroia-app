import { PrismaClient, SubscriptionStatus, PlanType } from '@prisma/client';
const prisma = new PrismaClient();
async function expireSubscriptions() {
    console.log('Starting job: Expire Subscriptions...');
    let processedCount = 0;
    let errorCount = 0;
    try {
        const now = new Date();
        const expiredSubscriptions = await prisma.subscription.findMany({
            where: {
                status: SubscriptionStatus.ACTIVE,
                expiresAt: {
                    lt: now, // Less than current time
                    not: null, // Ensure expiresAt is not null
                },
            },
            include: {
                // Include user to easily get userId and for logging
                user: {
                    select: { id: true, email: true, planType: true },
                },
            },
        });
        if (expiredSubscriptions.length === 0) {
            console.log('No active subscriptions found that have expired.');
            return;
        }
        console.log(`Found ${expiredSubscriptions.length} subscription(s) to expire.`);
        for (const subscription of expiredSubscriptions) {
            try {
                console.log(`Processing subscription ID: ${subscription.id} for user ID: ${subscription.userId} (Email: ${subscription.user.email}, Current Plan: ${subscription.user.planType})`);
                // Update subscription status to EXPIRED
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: SubscriptionStatus.EXPIRED },
                });
                // Update user's plan to FREE
                // Only update if their current plan is not already FREE (though it shouldn't be if subscription was ACTIVE)
                if (subscription.user.planType !== PlanType.FREE) {
                    await prisma.user.update({
                        where: { id: subscription.userId },
                        data: { planType: PlanType.FREE },
                    });
                    console.log(`User ID: ${subscription.userId} plan downgraded to FREE.`);
                }
                else {
                    console.log(`User ID: ${subscription.userId} plan was already FREE. No downgrade needed.`);
                }
                processedCount++;
            }
            catch (e) {
                errorCount++;
                console.error(`Error processing subscription ID: ${subscription.id} for user ID: ${subscription.userId}. Error: ${e.message}`);
                // Decide on error handling: continue with next subscription or stop?
                // For a cron job, it's usually better to attempt to process all.
            }
        }
    }
    catch (error) {
        errorCount++;
        console.error(`Major error during Expire Subscriptions job: ${error.message}`);
        // Potentially send a notification on major errors
    }
    finally {
        await prisma.$disconnect();
        console.log('Expire Subscriptions job finished.');
        console.log(`Successfully processed: ${processedCount} subscription(s).`);
        console.log(`Errors encountered: ${errorCount}.`);
    }
}
// Execute the function
expireSubscriptions()
    .then(() => {
    console.log('Script execution successful.');
    process.exit(0);
})
    .catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwaXJlLXN1YnNjcmlwdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJleHBpcmUtc3Vic2NyaXB0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTNFLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7QUFFakMsS0FBSyxVQUFVLG1CQUFtQjtJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUE7SUFDcEQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFBO0lBQ3RCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQTtJQUVsQixJQUFJLENBQUM7UUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1FBQ3RCLE1BQU0sb0JBQW9CLEdBQUcsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQztZQUM5RCxLQUFLLEVBQUU7Z0JBQ0wsTUFBTSxFQUFFLGtCQUFrQixDQUFDLE1BQU07Z0JBQ2pDLFNBQVMsRUFBRTtvQkFDVCxFQUFFLEVBQUUsR0FBRyxFQUFFLHlCQUF5QjtvQkFDbEMsR0FBRyxFQUFFLElBQUksRUFBRSwrQkFBK0I7aUJBQzNDO2FBQ0Y7WUFDRCxPQUFPLEVBQUU7Z0JBQ1Asb0RBQW9EO2dCQUNwRCxJQUFJLEVBQUU7b0JBQ0osTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7aUJBQ2xEO2FBQ0Y7U0FDRixDQUFDLENBQUE7UUFFRixJQUFJLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLGtEQUFrRCxDQUFDLENBQUE7WUFDL0QsT0FBTTtRQUNSLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsb0JBQW9CLENBQUMsTUFBTSw2QkFBNkIsQ0FBQyxDQUFBO1FBRTlFLEtBQUssTUFBTSxZQUFZLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUM7Z0JBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FDVCwrQkFBK0IsWUFBWSxDQUFDLEVBQUUsaUJBQWlCLFlBQVksQ0FBQyxNQUFNLFlBQVksWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFtQixZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUN0SyxDQUFBO2dCQUVELHdDQUF3QztnQkFDeEMsTUFBTSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztvQkFDL0IsS0FBSyxFQUFFLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxFQUFFLEVBQUU7b0JBQzlCLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUU7aUJBQzdDLENBQUMsQ0FBQTtnQkFFRiw2QkFBNkI7Z0JBQzdCLDRHQUE0RztnQkFDNUcsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBQ2pELE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxZQUFZLENBQUMsTUFBTSxFQUFFO3dCQUNsQyxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRTtxQkFDbEMsQ0FBQyxDQUFBO29CQUNGLE9BQU8sQ0FBQyxHQUFHLENBQ1QsWUFBWSxZQUFZLENBQUMsTUFBTSwyQkFBMkIsQ0FDM0QsQ0FBQTtnQkFDSCxDQUFDO3FCQUFNLENBQUM7b0JBQ04sT0FBTyxDQUFDLEdBQUcsQ0FDVCxZQUFZLFlBQVksQ0FBQyxNQUFNLDhDQUE4QyxDQUM5RSxDQUFBO2dCQUNILENBQUM7Z0JBRUQsY0FBYyxFQUFFLENBQUE7WUFDbEIsQ0FBQztZQUFDLE9BQU8sQ0FBTSxFQUFFLENBQUM7Z0JBQ2hCLFVBQVUsRUFBRSxDQUFBO2dCQUNaLE9BQU8sQ0FBQyxLQUFLLENBQ1gscUNBQXFDLFlBQVksQ0FBQyxFQUFFLGlCQUFpQixZQUFZLENBQUMsTUFBTSxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FDaEgsQ0FBQTtnQkFDRCxxRUFBcUU7Z0JBQ3JFLGlFQUFpRTtZQUNuRSxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLFVBQVUsRUFBRSxDQUFBO1FBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxnREFBZ0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUE7UUFDOUUsa0RBQWtEO0lBQ3BELENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLGNBQWMsbUJBQW1CLENBQUMsQ0FBQTtRQUN6RSxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixVQUFVLEdBQUcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7QUFDSCxDQUFDO0FBRUQsdUJBQXVCO0FBQ3ZCLG1CQUFtQixFQUFFO0tBQ2xCLElBQUksQ0FBQyxHQUFHLEVBQUU7SUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUE7SUFDM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUM7S0FDRCxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtJQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDLENBQUMsQ0FBQSJ9