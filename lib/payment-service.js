import Stripe from 'stripe';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { normalizePaymentStatus, PaymentStatus } from '@/lib/constants/payment-status';
// Initialize Stripe conditionally to avoid build-time errors
let stripe = null;
function getStripe() {
    if (!stripe && process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-06-30.basil',
            typescript: true,
        });
    }
    if (!stripe) {
        throw new Error('Stripe not initialized. Missing STRIPE_SECRET_KEY environment variable.');
    }
    return stripe;
}
// Initialize MercadoPago lazily to avoid build-time errors
let mercadopagoClient = null;
let mercadopagoPayment = null;
let mercadopagoPreference = null;
// MercadoPago typing helpers to ensure id is string where needed
function initializeMercadoPago() {
    if (!mercadopagoClient && process.env.MERCADOPAGO_ACCESS_TOKEN) {
        mercadopagoClient = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
            options: { timeout: 5000 }
        });
        mercadopagoPayment = new Payment(mercadopagoClient);
        mercadopagoPreference = new Preference(mercadopagoClient);
    }
}
function getMercadoPagoPayment() {
    initializeMercadoPago();
    if (!mercadopagoPayment) {
        throw new Error('MercadoPago not initialized. Missing MERCADOPAGO_ACCESS_TOKEN environment variable.');
    }
    return mercadopagoPayment;
}
function getMercadoPagoPreference() {
    initializeMercadoPago();
    if (!mercadopagoPreference) {
        throw new Error('MercadoPago not initialized. Missing MERCADOPAGO_ACCESS_TOKEN environment variable.');
    }
    return mercadopagoPreference;
}
export const PAYMENT_PLANS = [
    {
        id: 'free',
        name: 'Grátis',
        price: 0,
        currency: 'BRL',
        interval: 'monthly',
        features: [
            'Mensagens ilimitadas com modelos rápidos',
            '120 mensagens por mês com modelos avançados',
            'GPT-4o Mini, Deepseek 3.1, Claude 3.5 Haiku',
            'Criação de 1 assistente personalizado',
            'Até 2 anexos por chat'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 1.00, // Valor de teste
        currency: 'BRL',
        interval: 'monthly',
        features: [
            'Mensagens ilimitadas com modelos rápidos',
            'Mensagens ilimitadas com modelos avançados',
            'GPT-4o, Claude 4 Sonnet, Gemini 2.5 Pro',
            '7.000 créditos mensais para imagem/áudio/vídeo',
            'Criação ilimitada de assistentes',
            'Anexos ilimitados nos chats'
        ],
        stripePriceId: process.env.STRIPE_PRICE_PRO,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 1.00, // Valor de teste
        currency: 'BRL',
        interval: 'monthly',
        features: [
            'Tudo do plano Pro',
            'API dedicada',
            'SLA garantido',
            'Modelos customizados',
            'Treinamento dedicado',
            'Suporte 24/7',
            'Compliance LGPD'
        ],
        stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
        stripeYearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
    }
];
export async function createCheckoutSession(params) {
    const plan = PAYMENT_PLANS.find(p => p.id === params.planId);
    if (!plan || plan.price === 0) {
        throw new Error('Invalid plan selected');
    }
    // For card payments, use Stripe
    if (params.paymentMethod === 'card') {
        const isYearly = params.billingCycle === 'yearly';
        const priceId = isYearly ? plan.stripeYearlyPriceId : plan.stripePriceId;
        if (!priceId) {
            throw new Error(`Stripe ${isYearly ? 'yearly' : 'monthly'} price ID not configured for this plan`);
        }
        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
            customer_email: params.email,
            metadata: {
                userId: params.userId,
                planId: params.planId,
                billingCycle: params.billingCycle || 'monthly',
            },
            subscription_data: {
                metadata: {
                    userId: params.userId,
                    planId: params.planId,
                    billingCycle: params.billingCycle || 'monthly',
                },
            },
            // Enable installments for Brazilian cards
            payment_method_options: {
                card: {
                    installments: {
                        enabled: true
                    }
                }
            }
        });
        return {
            provider: 'stripe',
            checkoutUrl: session.url,
            sessionId: session.id
        };
    }
    // For Pix and Boleto, use MercadoPago
    if (params.paymentMethod === 'pix' || params.paymentMethod === 'boleto') {
        const isYearly = params.billingCycle === 'yearly';
        const price = isYearly ? (plan.price * 12 * 0.4) : plan.price; // 60% discount for yearly
        const title = isYearly ? `Plano ${plan.name} Anual - Kyroia` : `Plano ${plan.name} - Kyroia`;
        const preference = await getMercadoPagoPreference().create({
            body: {
                items: [
                    {
                        id: plan.id,
                        title: title,
                        quantity: 1,
                        unit_price: price,
                        currency_id: 'BRL',
                    }
                ],
                payer: {
                    email: params.email,
                },
                payment_methods: {
                    excluded_payment_types: params.paymentMethod === 'pix'
                        ? [{ id: 'bolbradesco' }, { id: 'ticket' }] // Exclude boleto for pix
                        : [{ id: 'account_money' }], // Exclude account money for boleto
                    installments: params.paymentMethod === 'pix' ? 1 : 1, // No installments for pix/boleto
                },
                back_urls: {
                    success: params.successUrl,
                    failure: params.cancelUrl,
                    pending: params.successUrl,
                },
                auto_return: 'approved',
                external_reference: JSON.stringify({
                    userId: params.userId,
                    planId: params.planId,
                    billingCycle: params.billingCycle || 'monthly',
                    timestamp: new Date().toISOString()
                }),
                metadata: {
                    user_id: params.userId,
                    plan_id: params.planId,
                    billing_cycle: params.billingCycle || 'monthly',
                },
            }
        });
        return {
            provider: 'mercadopago',
            checkoutUrl: preference.init_point,
            preferenceId: preference.id
        };
    }
    throw new Error('Invalid payment method');
}
export async function createPortalSession(customerId, returnUrl) {
    const session = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });
    return session.url;
}
export async function cancelSubscription(subscriptionId) {
    const subscription = await getStripe().subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    });
    return subscription;
}
export async function getSubscription(subscriptionId) {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    return subscription;
}
// Webhook handlers
export async function handleStripeWebhook(event) {
    var _a, _b, _c;
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            // Handle successful payment
            return {
                userId: (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId,
                planId: (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId,
                subscriptionId: session.subscription,
                customerId: session.customer
            };
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                userId: (_c = subscription.metadata) === null || _c === void 0 ? void 0 : _c.userId
            };
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}
async function retryPaymentFetch(paymentId, maxRetries = 3, delay = 2000) {
    var _a;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[MercadoPago] Fetching payment attempt ${attempt}/${maxRetries} for ID: ${paymentId}`);
            const payment = await getMercadoPagoPayment().get({ id: paymentId });
            console.log(`[MercadoPago] Payment found on attempt ${attempt}:`, {
                id: payment.id,
                status: payment.status,
                payment_type_id: payment.payment_type_id,
                external_reference: payment.external_reference
            });
            return Object.assign(Object.assign({}, payment), { id: String((_a = payment.id) !== null && _a !== void 0 ? _a : '') });
        }
        catch (error) {
            console.log(`[MercadoPago] Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
            if (attempt === maxRetries) {
                throw error; // Re-throw on final attempt
            }
            // Wait before retry
            console.log(`[MercadoPago] Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 1.5; // Exponential backoff
        }
    }
    // This should never be reached due to the throw in the final attempt, but TypeScript requires it
    throw new Error(`Failed to fetch payment after ${maxRetries} attempts`);
}
export async function handleMercadoPagoWebhook(data) {
    var _a, _b, _c, _d, _e, _f;
    // MercadoPago sends notification with data.id and data.topic
    if (!data || !data.id) {
        console.error('[MercadoPago] Invalid webhook data:', data);
        return null;
    }
    if (data.topic === 'payment') {
        try {
            const payment = await retryPaymentFetch(data.id);
            const newStatus = normalizePaymentStatus(payment.status);
            console.log(`[MercadoPago] Payment status: ${payment.status} -> ${newStatus}`);
            // Handle completed and pending payments
            if (newStatus === PaymentStatus.COMPLETED || newStatus === PaymentStatus.PENDING) {
                // Parse external_reference if it's a JSON string
                let parsedRef = {};
                try {
                    parsedRef = JSON.parse(String((_a = payment.external_reference) !== null && _a !== void 0 ? _a : '{}'));
                }
                catch (_g) {
                    console.error('[MercadoPago] Failed to parse external_reference:', payment.external_reference);
                }
                console.log(`[MercadoPago] Processing payment ${payment.id} with status ${newStatus}`);
                console.log(`[MercadoPago] Payment type: ${payment.payment_type_id || 'unknown'}`);
                console.log(`[MercadoPago] External reference:`, parsedRef);
                return {
                    userId: parsedRef.userId || payment.external_reference,
                    planId: parsedRef.planId || ((_b = payment.metadata) === null || _b === void 0 ? void 0 : _b['plan_id']),
                    paymentId: payment.id,
                    status: payment.status, // preserve provider raw for legacy callers
                    billingCycle: (parsedRef.billingCycle || ((_c = payment.metadata) === null || _c === void 0 ? void 0 : _c['billing_cycle']) || 'monthly')
                };
            }
            else {
                // Return status for failed/refunded payments for logging
                let parsedRef = {};
                try {
                    parsedRef = JSON.parse(String((_d = payment.external_reference) !== null && _d !== void 0 ? _d : '{}'));
                }
                catch (_h) {
                    console.error('[MercadoPago] Failed to parse external_reference:', payment.external_reference);
                }
                console.log(`[MercadoPago] Payment ${payment.id} status: ${payment.status} - not processing`);
                return {
                    userId: parsedRef.userId || payment.external_reference,
                    planId: parsedRef.planId || ((_e = payment.metadata) === null || _e === void 0 ? void 0 : _e['plan_id']),
                    paymentId: payment.id,
                    status: payment.status, // preserve provider raw for legacy callers
                    billingCycle: (parsedRef.billingCycle || ((_f = payment.metadata) === null || _f === void 0 ? void 0 : _f['billing_cycle']) || 'monthly')
                };
            }
        }
        catch (error) {
            console.error('[MercadoPago] Error fetching payment after retries:', error);
            return null;
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bWVudC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGF5bWVudC1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUMzQixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFFdEYsNkRBQTZEO0FBQzdELElBQUksTUFBTSxHQUFrQixJQUFJLENBQUE7QUFFaEMsU0FBUyxTQUFTO0lBQ2hCLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO1lBQ2pELFVBQVUsRUFBRSxrQkFBa0I7WUFDOUIsVUFBVSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMseUVBQXlFLENBQUMsQ0FBQTtJQUM1RixDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDO0FBRUQsMkRBQTJEO0FBQzNELElBQUksaUJBQWlCLEdBQTZCLElBQUksQ0FBQTtBQUN0RCxJQUFJLGtCQUFrQixHQUFtQixJQUFJLENBQUE7QUFDN0MsSUFBSSxxQkFBcUIsR0FBc0IsSUFBSSxDQUFBO0FBRW5ELGlFQUFpRTtBQUVqRSxTQUFTLHFCQUFxQjtJQUM1QixJQUFJLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQy9ELGlCQUFpQixHQUFHLElBQUksaUJBQWlCLENBQUM7WUFDeEMsV0FBVyxFQUFFLE9BQU8sQ0FB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