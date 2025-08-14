import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
async function createTestUser() {
    const email = 'test@example.com';
    const password = 'test123';
    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.log('Usuário já existe:', email);
            console.log('Deletando usuário existente...');
            await prisma.user.delete({
                where: { email }
            });
        }
        // Create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                name: 'Test User',
                passwordHash: hashedPassword,
                planType: 'PRO',
                profession: 'Developer',
                organization: 'Test Organization'
            }
        });
        console.log('\n✅ Usuário de teste criado com sucesso!');
        console.log('📧 Email:', email);
        console.log('🔑 Senha:', password);
        console.log('🆔 User ID:', user.id);
        console.log('\nUse essas credenciais para fazer login em http://localhost:3000/auth/signin');
    }
    catch (error) {
        console.error('❌ Erro ao criar usuário de teste:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createTestUser();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRlc3QtdXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZS10ZXN0LXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFBO0FBQzdCLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFFdEMsS0FBSyxVQUFVLGNBQWM7SUFDM0IsTUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUE7SUFDaEMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFBO0lBRTFCLElBQUksQ0FBQztRQUNILCtCQUErQjtRQUMvQixNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2hELEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRTtTQUNqQixDQUFDLENBQUE7UUFFRixJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO1lBQzdDLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZCLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRTthQUNqQixDQUFDLENBQUE7UUFDSixDQUFDO1FBRUQsa0JBQWtCO1FBQ2xCLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFDdEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxJQUFJLEVBQUU7Z0JBQ0osS0FBSztnQkFDTCxJQUFJLEVBQUUsV0FBVztnQkFDakIsWUFBWSxFQUFFLGNBQWM7Z0JBQzVCLFFBQVEsRUFBRSxLQUFLO2dCQUNmLFVBQVUsRUFBRSxXQUFXO2dCQUN2QixZQUFZLEVBQUUsbUJBQW1CO2FBQ2xDO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFBO1FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLCtFQUErRSxDQUFDLENBQUE7SUFDOUYsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzNELENBQUM7WUFBUyxDQUFDO1FBQ1QsTUFBTSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDNUIsQ0FBQztBQUNILENBQUM7QUFFRCxjQUFjLEVBQUUsQ0FBQSJ9