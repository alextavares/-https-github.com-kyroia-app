import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    try {
        const email = 'teste@innerai.com';
        const password = 'Test@123456';
        console.log('🚀 Creating test user...');
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.log('❌ Test user already exists with email:', email);
            console.log('🔑 Use password:', password);
            return;
        }
        // Create test user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                name: 'Test User',
                planType: 'FREE',
                onboardingCompleted: true,
                usageType: 'USO_PESSOAL',
                professionCategory: 'Desenvolvedor',
                organization: 'Kyroia Test',
                phone: '+5511999999999',
            }
        });
        console.log('✅ Test user created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('🆔 User ID:', user.id);
        console.log('\n🌐 Login at: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin');
    }
    catch (error) {
        console.error('❌ Error creating test user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRlc3QtdXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZS10ZXN0LXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzdDLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQTtBQUU3QixNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO0FBRWpDLEtBQUssVUFBVSxJQUFJO0lBQ2pCLElBQUksQ0FBQztRQUNILE1BQU0sS0FBSyxHQUFHLG1CQUFtQixDQUFBO1FBQ2pDLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQTtRQUU5QixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFFdkMsdUJBQXVCO1FBQ3ZCLE1BQU0sWUFBWSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDaEQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFO1NBQ2pCLENBQUMsQ0FBQTtRQUVGLElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ3pDLE9BQU07UUFDUixDQUFDO1FBRUQsbUJBQW1CO1FBQ25CLE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7UUFFdEQsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxJQUFJLEVBQUU7Z0JBQ0osS0FBSztnQkFDTCxZQUFZLEVBQUUsY0FBYztnQkFDNUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixtQkFBbUIsRUFBRSxJQUFJO2dCQUN6QixTQUFTLEVBQUUsYUFBYTtnQkFDeEIsa0JBQWtCLEVBQUUsZUFBZTtnQkFDbkMsWUFBWSxFQUFFLGNBQWM7Z0JBQzVCLEtBQUssRUFBRSxnQkFBZ0I7YUFDeEI7U0FDRixDQUFDLENBQUE7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUE7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEVBQTBFLENBQUMsQ0FBQTtJQUN6RixDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDckQsQ0FBQztZQUFTLENBQUM7UUFDVCxNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUM1QixDQUFDO0FBQ0gsQ0FBQztBQUVELElBQUksRUFBRSxDQUFBIn0=