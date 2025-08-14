import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const email = 'payment-test@example.com';
    const password = 'testpassword123';
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        console.log('User already exists:', email);
        return;
    }
    // Create user
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            name: 'Payment Test User',
            passwordHash: hashedPassword,
            planType: 'FREE',
            onboardingCompleted: true
        }
    });
    console.log('Created test user:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', user.id);
    console.log('Plan:', user.planType);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXBheW1lbnQtdGVzdC11c2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3JlYXRlLXBheW1lbnQtdGVzdC11c2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRS9CLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7QUFFakMsS0FBSyxVQUFVLElBQUk7SUFDakIsTUFBTSxLQUFLLEdBQUcsMEJBQTBCLENBQUE7SUFDeEMsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUE7SUFFbEMsK0JBQStCO0lBQy9CLE1BQU0sWUFBWSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDaEQsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFO0tBQ2pCLENBQUMsQ0FBQTtJQUVGLElBQUksWUFBWSxFQUFFLENBQUM7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMxQyxPQUFNO0lBQ1IsQ0FBQztJQUVELGNBQWM7SUFDZCxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDL0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQyxJQUFJLEVBQUU7WUFDSixLQUFLO1lBQ0wsSUFBSSxFQUFFLG1CQUFtQjtZQUN6QixZQUFZLEVBQUUsY0FBYztZQUM1QixRQUFRLEVBQUUsTUFBTTtZQUNoQixtQkFBbUIsRUFBRSxJQUFJO1NBQzFCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ2pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDckMsQ0FBQztBQUVELElBQUksRUFBRTtLQUNILEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO0lBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNoQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ2pCLENBQUMsQ0FBQztLQUNELE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUM1QixDQUFDLENBQUMsQ0FBQSJ9