import { prisma } from '../lib/prisma';
import { checkUsageLimits, getUserUsageStats } from '../lib/usage-limits';
async function checkUserUsageData() {
    try {
        // Buscar um usuário de teste
        const testEmail = process.env.TEST_USER_EMAIL || 'alexandretmoraes000@gmail.com';
        console.log(`\n=== Checking usage data for user: ${testEmail} ===\n`);
        const user = await prisma.user.findUnique({
            where: { email: testEmail }
        });
        if (!user) {
            console.log('User not found!');
            return;
        }
        console.log('User found:', {
            id: user.id,
            email: user.email,
            planType: user.planType
        });
        // Verificar dados de uso
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        console.log('\n=== Checking UserUsage records ===');
        const allUsage = await prisma.userUsage.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startOfMonth
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
        console.log(`Found ${allUsage.length} usage records this month`);
        allUsage.forEach(usage => {
            console.log({
                date: usage.date,
                modelId: usage.modelId,
                messages: usage.messagesCount,
                inputTokens: usage.inputTokensUsed,
                outputTokens: usage.outputTokensUsed,
                cost: usage.costIncurred
            });
        });
        // Testar checkUsageLimits para diferentes modelos
        console.log('\n=== Testing checkUsageLimits ===');
        const modelsToTest = [
            'gpt-4o-mini', // fast model
            'gpt-4o', // advanced model
            'claude-3.5-sonnet' // advanced model
        ];
        for (const model of modelsToTest) {
            console.log(`\nChecking limits for model: ${model}`);
            const result = await checkUsageLimits(user.id, model);
            console.log(result);
        }
        // Obter estatísticas de uso
        console.log('\n=== User Usage Stats ===');
        const stats = await getUserUsageStats(user.id);
        console.log(JSON.stringify(stats, null, 2));
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkUserUsageData();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdXNhZ2UtZGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoZWNrLXVzYWdlLWRhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUV6RSxLQUFLLFVBQVUsa0JBQWtCO0lBQy9CLElBQUksQ0FBQztRQUNILDZCQUE2QjtRQUM3QixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSwrQkFBK0IsQ0FBQTtRQUVoRixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxTQUFTLFFBQVEsQ0FBQyxDQUFBO1FBRXJFLE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDeEMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtTQUM1QixDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7WUFDOUIsT0FBTTtRQUNSLENBQUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRTtZQUN6QixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1NBQ3hCLENBQUMsQ0FBQTtRQUVGLHlCQUF5QjtRQUN6QixNQUFNLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1FBQ3hCLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFMUIsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtRQUMvQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO1FBRW5ELE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7WUFDL0MsS0FBSyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDZixJQUFJLEVBQUU7b0JBQ0osR0FBRyxFQUFFLFlBQVk7aUJBQ2xCO2FBQ0Y7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsSUFBSSxFQUFFLE1BQU07YUFDYjtTQUNGLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxRQUFRLENBQUMsTUFBTSwyQkFBMkIsQ0FBQyxDQUFBO1FBRWhFLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDVixJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7Z0JBQ2hCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsUUFBUSxFQUFFLEtBQUssQ0FBQyxhQUFhO2dCQUM3QixXQUFXLEVBQUUsS0FBSyxDQUFDLGVBQWU7Z0JBQ2xDLFlBQVksRUFBRSxLQUFLLENBQUMsZ0JBQWdCO2dCQUNwQyxJQUFJLEVBQUUsS0FBSyxDQUFDLFlBQVk7YUFDekIsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7UUFFRixrREFBa0Q7UUFDbEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFBO1FBRWpELE1BQU0sWUFBWSxHQUFHO1lBQ25CLGFBQWEsRUFBRyxhQUFhO1lBQzdCLFFBQVEsRUFBUSxpQkFBaUI7WUFDakMsbUJBQW1CLENBQUMsaUJBQWlCO1NBQ3RDLENBQUE7UUFFRCxLQUFLLE1BQU0sS0FBSyxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLEtBQUssRUFBRSxDQUFDLENBQUE7WUFDcEQsTUFBTSxNQUFNLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDckIsQ0FBQztRQUVELDRCQUE0QjtRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFDekMsTUFBTSxLQUFLLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUU3QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ2hDLENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDNUIsQ0FBQztBQUNILENBQUM7QUFFRCxrQkFBa0IsRUFBRSxDQUFBIn0=