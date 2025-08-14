const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const userId = process.argv[2];
  const payId = process.argv[3];
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { externalId: payId },
          { mercadoPagoPaymentId: payId },
        ],
      },
      orderBy: { createdAt: 'desc' }
    });
    const log = await prisma.mercadoPagoWebhookLog.findFirst({ orderBy: { createdAt: 'desc' } });
    const txs = await prisma.creditTransaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 });

    console.log(JSON.stringify({
      user: user ? { id: user.id, email: user.email, planType: user.planType, creditBalance: user.creditBalance } : null,
      payment,
      latestWebhookLog: log,
      latestTx: txs,
    }, null, 2));
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

