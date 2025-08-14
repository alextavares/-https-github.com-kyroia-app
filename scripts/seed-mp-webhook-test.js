/*
  Seed a test user and payment, then simulate a MercadoPago webhook
  for the internal endpoint /api/payments/mp/webhook which validates
  HMAC signature using MERCADOPAGO_WEBHOOK_SECRET and updates Payment.

  Usage:
    npx tsx scripts/seed-mp-webhook-test.ts
*/
import crypto from 'crypto';
// Ensure env defaults for local dev/testing before importing prisma
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./prisma/dev.db';
}
if (!process.env.MERCADOPAGO_WEBHOOK_SECRET) {
    process.env.MERCADOPAGO_WEBHOOK_SECRET = 'your-mercadopago-webhook-secret';
}
// Import prisma normally (avoid top-level await for tsx)
import { prisma } from '../lib/prisma';
async function main() {
    const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || 'your-mercadopago-webhook-secret';
    // 1) Ensure a test user exists
    const user = await prisma.user.create({
        data: {
            email: `mp-test-${Date.now()}@example.com`,
            name: 'MP Test User',
            planType: 'FREE',
        },
    });
    console.log('Created test user:', user.id);
    // 2) Seed a Payment with externalId matching the MP payment id we will send
    const paymentId = 'mp_seed_123456789';
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            amount: 10.0,
            currency: 'BRL',
            status: 'pending',
            provider: 'mercadopago',
            paymentMethod: 'pix',
            externalId: paymentId,
            mercadoPagoPaymentId: paymentId,
        },
        select: { id: true, userId: true, status: true, externalId: true },
    });
    console.log('Seeded payment:', payment);
    // 3) Build webhook payload and signature
    const body = JSON.stringify({
        type: 'payment',
        data: { id: paymentId, status: 'approved' },
    });
    const hmac = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    // 4) POST to local webhook endpoint
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/payments/mp/webhook`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-signature': hmac,
        },
        body,
    });
    const text = await res.text();
    console.log('Webhook response status:', res.status);
    console.log('Webhook response body:', text);
    // 5) Verify payment updated
    const updated = await prisma.payment.findUnique({ where: { externalId: paymentId } });
    console.log('Updated payment:', updated);
    // 6) Debug API check
    try {
        const dbg = await fetch(`${baseUrl}/api/debug/payment-status?paymentId=${encodeURIComponent(paymentId)}&userId=${encodeURIComponent(user.id)}`);
        const dbgText = await dbg.text();
        console.log('Debug API status:', dbg.status);
        console.log('Debug API body:', dbgText);
    }
    catch (e) {
        console.warn('Debug API request failed:', e);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1tcC13ZWJob29rLXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzZWVkLW1wLXdlYmhvb2stdGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztFQU9FO0FBRUYsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRTNCLG9FQUFvRTtBQUNwRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksR0FBRyxzQkFBc0IsQ0FBQTtBQUNuRCxDQUFDO0FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUM1QyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixHQUFHLGlDQUFpQyxDQUFBO0FBQzVFLENBQUM7QUFFRCx5REFBeUQ7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUV0QyxLQUFLLFVBQVUsSUFBSTtJQUNqQixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixJQUFJLGlDQUFpQyxDQUFBO0lBRTFGLCtCQUErQjtJQUMvQixNQUFNLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3BDLElBQUksRUFBRTtZQUNKLEtBQUssRUFBRSxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsY0FBYztZQUMxQyxJQUFJLEVBQUUsY0FBYztZQUNwQixRQUFRLEVBQUUsTUFBTTtTQUNqQjtLQUNGLENBQUMsQ0FBQTtJQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTFDLDRFQUE0RTtJQUM1RSxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQTtJQUNyQyxNQUFNLE9BQU8sR0FBRyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFD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