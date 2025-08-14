import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const email = 'template-test@example.com';
    const password = 'password123';
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        console.log('User already exists');
        return;
    }
    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Template Test User',
            passwordHash,
            planType: 'PRO',
            profession: 'Developer',
            organization: 'InnerAI Clone'
        }
    });
    console.log('User created:', {
        email: user.email,
        name: user.name,
        planType: user.planType
    });
    console.log('\nLogin credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXRlbXBsYXRlLXRlc3QtdXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZS10ZW1wbGF0ZS10ZXN0LXVzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzdDLE9BQU8sTUFBTSxNQUFNLFVBQVUsQ0FBQTtBQUU3QixNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO0FBRWpDLEtBQUssVUFBVSxJQUFJO0lBQ2pCLE1BQU0sS0FBSyxHQUFHLDJCQUEyQixDQUFBO0lBQ3pDLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQTtJQUU5Qix1QkFBdUI7SUFDdkIsTUFBTSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNoRCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUU7S0FDakIsQ0FBQyxDQUFBO0lBRUYsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7UUFDbEMsT0FBTTtJQUNSLENBQUM7SUFFRCxjQUFjO0lBQ2QsTUFBTSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNwRCxNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLElBQUksRUFBRTtZQUNKLEtBQUs7WUFDTCxJQUFJLEVBQUUsb0JBQW9CO1lBQzFCLFlBQVk7WUFDWixRQUFRLEVBQUUsS0FBSztZQUNmLFVBQVUsRUFBRSxXQUFXO1lBQ3ZCLFlBQVksRUFBRSxlQUFlO1NBQzlCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUU7UUFDM0IsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1FBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtRQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtLQUN4QixDQUFDLENBQUE7SUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUE7SUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUVELElBQUksRUFBRTtLQUNILEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0tBQ3BCLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUM1QixDQUFDLENBQUMsQ0FBQSJ9