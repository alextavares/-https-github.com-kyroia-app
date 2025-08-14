const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    const email = process.argv[2] || `sandbox.tester+${Date.now()}@innerai.local`;
    const name = process.argv[3] || 'Sandbox Tester';
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email, name, planType: 'FREE', onboardingCompleted: true } });
    }
    console.log(JSON.stringify({ id: user.id, email: user.email }));
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

