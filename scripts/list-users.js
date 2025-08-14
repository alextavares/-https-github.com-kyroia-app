import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function listUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
                name: true,
                planType: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        console.log('📋 Users in database:\n');
        console.log('Email                          | Plan       | Name                | Created');
        console.log('------------------------------|------------|---------------------|------------------------');
        users.forEach(user => {
            const email = user.email.padEnd(29);
            const plan = (user.planType || 'FREE').padEnd(10);
            const name = (user.name || 'N/A').padEnd(19);
            const created = new Date(user.createdAt).toLocaleString();
            console.log(`${email} | ${plan} | ${name} | ${created}`);
        });
        console.log(`\nTotal users: ${users.length}`);
    }
    catch (error) {
        console.error('❌ Error listing users:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
listUsers();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC11c2Vycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpc3QtdXNlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTdDLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUE7QUFFakMsS0FBSyxVQUFVLFNBQVM7SUFDdEIsSUFBSSxDQUFDO1FBQ0gsTUFBTSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN2QyxNQUFNLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLElBQUk7Z0JBQ1gsSUFBSSxFQUFFLElBQUk7Z0JBQ1YsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsU0FBUyxFQUFFLElBQUk7YUFDaEI7WUFDRCxPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO1NBQy9CLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQTtRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLDZFQUE2RSxDQUFDLENBQUE7UUFDMUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0RkFBNEYsQ0FBQyxDQUFBO1FBRXpHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDbkMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUNqRCxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzVDLE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQTtZQUV6RCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUMxRCxDQUFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBRS9DLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNoRCxDQUFDO1lBQVMsQ0FBQztRQUNULE1BQU0sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzVCLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxFQUFFLENBQUEifQ==