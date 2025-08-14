// Script para corrigir assinatura manualmente
// Execute com: npx tsx scripts/fix-subscription.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function fixSubscription() {
    try {
        // ID do usuário que precisa ser corrigido
        const userId = 'cmc410nrb00009te15vuhi44r'; // Alexandre
        // Verificar se já existe uma assinatura ativa
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE'
            }
        });
        if (existingSubscription) {
            console.log('✅ Assinatura ativa já existe:', existingSubscription.id);
            return;
        }
        // Criar nova assinatura
        const startDate = new Date();
        const expiresDate = new Date(startDate);
        expiresDate.setMonth(startDate.getMonth() + 1); // 1 mês
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planType: 'PRO',
                status: 'ACTIVE',
                mercadoPagoPaymentId: 'manual_fix_' + Date.now(),
                startedAt: startDate,
                expiresAt: expiresDate
            }
        });
        console.log('✅ Assinatura criada com sucesso:', subscription);
        // Verificar se o usuário está com o plano correto
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if ((user === null || user === void 0 ? void 0 : user.planType) !== 'PRO') {
            await prisma.user.update({
                where: { id: userId },
                data: { planType: 'PRO' }
            });
            console.log('✅ Plano do usuário atualizado para PRO');
        }
    }
    catch (error) {
        console.error('❌ Erro ao corrigir assinatura:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
fixSubscription();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LXN1YnNjcmlwdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpeC1zdWJzY3JpcHRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsOENBQThDO0FBQzlDLG1EQUFtRDtBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFN0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQTtBQUVqQyxLQUFLLFVBQVUsZUFBZTtJQUM1QixJQUFJLENBQUM7UUFDSCwwQ0FBMEM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsMkJBQTJCLENBQUEsQ0FBQyxZQUFZO1FBRXZELDhDQUE4QztRQUM5QyxNQUFNLG9CQUFvQixHQUFHLE1BQU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDL0QsS0FBSyxFQUFFO2dCQUNMLE1BQU07Z0JBQ04sTUFBTSxFQUFFLFFBQVE7YUFDakI7U0FDRixDQUFDLENBQUE7UUFFRixJQUFJLG9CQUFvQixFQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNyRSxPQUFNO1FBQ1IsQ0FBQztRQUVELHdCQUF3QjtRQUN4QixNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFBO1FBQzVCLE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3ZDLFdBQVcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFBLENBQUMsUUFBUTtRQUV2RCxNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQ3BELElBQUksRUFBRTtnQkFDSixNQUFNO2dCQUNOLFFBQVEsRUFBRSxLQUFLO2dCQUNmLE1BQU0sRUFBRSxRQUFRO2dCQUNoQixvQkFBb0IsRUFBRSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDaEQsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFNBQVMsRUFBRSxXQUFXO2FBQ3ZCO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUU3RCxrREFBa0Q7UUFDbEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUN4QyxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFO1NBQ3RCLENBQUMsQ0FBQTtRQUVGLElBQUksQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsUUFBUSxNQUFLLEtBQUssRUFBRSxDQUFDO1lBQzdCLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUU7Z0JBQ3JCLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUU7YUFDMUIsQ0FBQyxDQUFBO1lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1FBQ3ZELENBQUM7SUFFSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDeEQsQ0FBQztZQUFTLENBQUM7UUFDVCxNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUM1QixDQUFDO0FBQ0gsQ0FBQztBQUVELGVBQWUsRUFBRSxDQUFBIn0=