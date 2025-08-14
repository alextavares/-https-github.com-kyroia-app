import { prisma } from '@/lib/prisma';
export const PLAN_LIMITS = {
    FREE: {
        dailyMessages: 50, // 50 messages per day for free users
        monthlyTokens: null,
        monthlyAdvancedMessages: 0, // No advanced models for free
        modelsAllowed: {
            fast: [
                'gpt-4o-mini',
                'claude-3.5-haiku',
                'gemini-2-flash-free',
                'mistral-7b',
                'deepseek-r1-small',
                'qwen-qwq'
            ],
            advanced: [] // No advanced models for free users
        },
        monthlyCredits: null,
    },
    LITE: {
        dailyMessages: null, // unlimited for fast models
        monthlyTokens: null, // unlimited for fast models  
        monthlyAdvancedMessages: 120, // 120 messages per month with advanced models
        modelsAllowed: {
            fast: [
                'gpt-4o-mini',
                'claude-3.5-haiku',
                'gemini-2-flash-free',
                'mistral-7b',
                'llama-2-13b',
                'llama-3.3-70b',
                'deepseek-r1',
                'deepseek-r1-small',
                'grok-3-mini',
                'perplexity-sonar',
                'qwen-qwq',
                'sabia-3.1'
            ],
            advanced: [
                'gpt-4o',
                'gpt-3.5-turbo',
                'claude-3.5-sonnet',
                'claude-4-sonnet',
                'gemini-2-pro',
                'grok-3',
                'perplexity-sonar-pro',
                'perplexity-reasoning',
                'mistral-large-2'
            ]
        },
        monthlyCredits: null,
    },
    PRO: {
        dailyMessages: null, // unlimited
        monthlyTokens: null, // unlimited
        monthlyAdvancedMessages: null, // unlimited
        modelsAllowed: {
            fast: [
                'gpt-3.5-turbo',
                'gpt-4o-mini',
                'claude-3-haiku',
                'claude-3.5-haiku',
                'gemini-2-flash',
                'gemini-2-flash-free',
                'mistral-7b',
                'llama-2-13b',
                'llama-3.3-70b',
                'deepseek-r1',
                'grok-3-mini',
                'perplexity-sonar',
                'qwen-qwq',
                'qwen-2.5-coder'
            ],
            advanced: [
                'gpt-4',
                'gpt-4-turbo',
                'gpt-4o',
                'claude-3-sonnet',
                'claude-3.5-sonnet',
                'gemini-pro',
                'gemini-2-pro',
                'mixtral-8x7b',
                'mistral-large-2',
                'llama-2-70b',
                'llama-3.1-405b',
                'grok-3',
                'grok-2-vision',
                'perplexity-sonar-pro',
                'perplexity-reasoning',
                'qwen-2.5-72b'
            ]
        },
        monthlyCredits: 1000000, // increased for testing
    },
    ENTERPRISE: {
        dailyMessages: null, // unlimited
        monthlyTokens: null, // unlimited
        monthlyAdvancedMessages: null, // unlimited
        modelsAllowed: {
            fast: [
                'gpt-3.5-turbo',
                'gpt-4o-mini',
                'claude-3-haiku',
                'claude-3.5-haiku',
                'gemini-2-flash',
                'gemini-2-flash-free',
                'mistral-7b',
                'llama-2-13b',
                'llama-3.3-70b',
                'deepseek-r1',
                'grok-3-mini',
                'perplexity-sonar',
                'qwen-qwq',
                'qwen-2.5-coder',
                'neural-chat-7b',
                'mythomist-7b'
            ],
            advanced: [
                'gpt-4',
                'gpt-4-turbo',
                'gpt-4o',
                'claude-3-opus',
                'claude-3-sonnet',
                'claude-3.5-sonnet',
                'gemini-pro',
                'gemini-2-pro',
                'gemini-pro-vision',
                'mixtral-8x7b',
                'mistral-large-2',
                'llama-2-70b',
                'llama-3.1-405b',
                'llama-3.2-90b-vision',
                'codellama-70b',
                'grok-3',
                'grok-2-vision',
                'perplexity-sonar-pro',
                'perplexity-reasoning',
                'qwen-2.5-72b',
                'phind-codellama-34b',
                'deepseek-coder',
                'wizardcoder-33b',
                'nous-hermes-2',
                'openhermes-2.5',
                'zephyr-7b',
                'cinematika-7b'
            ]
        },
        monthlyCredits: null, // unlimited credits
    },
};
// Função auxiliar para determinar se um modelo é fast ou advanced
export function getModelType(model) {
    for (const plan of Object.values(PLAN_LIMITS)) {
        if (plan.modelsAllowed.fast.includes(model))
            return 'fast';
        if (plan.modelsAllowed.advanced.includes(model))
            return 'advanced';
    }
    return null;
}
export async function checkUsageLimits(userId, model) {
    // Some deployments don't have the userUsage table. Guard for that.
    const userUsageDelegate = prisma.userUsage;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const limits = PLAN_LIMITS[user.planType];
    // Check model access
    if (model) {
        const allAllowedModels = [...limits.modelsAllowed.fast, ...limits.modelsAllowed.advanced];
        if (!allAllowedModels.includes(model)) {
            return {
                allowed: false,
                reason: `Model ${model} is not available for ${user.planType} plan`,
                planType: user.planType,
            };
        }
        // Determine if model is fast or advanced
        const isAdvancedModel = limits.modelsAllowed.advanced.includes(model);
        // For advanced models, check monthly limit for FREE plan
        if (isAdvancedModel && user.planType === 'FREE' && limits.monthlyAdvancedMessages !== null) {
            if (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                const monthlyAdvancedUsage = await userUsageDelegate.aggregate({
                    where: {
                        userId,
                        date: {
                            gte: startOfMonth,
                        },
                        modelId: {
                            in: limits.modelsAllowed.advanced
                        }
                    },
                    _sum: {
                        messagesCount: true,
                    },
                });
                const advancedMessagesUsed = monthlyAdvancedUsage._sum.messagesCount || 0;
                if (advancedMessagesUsed >= limits.monthlyAdvancedMessages) {
                    return {
                        allowed: false,
                        reason: `Monthly advanced messages limit reached (${advancedMessagesUsed}/${limits.monthlyAdvancedMessages})`,
                        planType: user.planType,
                        usage: {
                            monthlyAdvancedMessages: {
                                used: advancedMessagesUsed,
                                limit: limits.monthlyAdvancedMessages,
                            },
                        },
                    };
                }
            }
        }
    }
    // Check daily message limit
    if (limits.dailyMessages !== null) {
        if (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayUsage = await userUsageDelegate.aggregate({
                where: {
                    userId,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
                _sum: {
                    messagesCount: true,
                },
            });
            const messagesUsed = todayUsage._sum.messagesCount || 0;
            if (messagesUsed >= limits.dailyMessages) {
                return {
                    allowed: false,
                    reason: `Daily message limit reached (${messagesUsed}/${limits.dailyMessages})`,
                    planType: user.planType,
                    usage: {
                        dailyMessages: {
                            used: messagesUsed,
                            limit: limits.dailyMessages,
                        },
                    },
                };
            }
        }
    }
    // Check monthly token limit
    if (limits.monthlyTokens !== null) {
        if (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const monthlyUsage = await userUsageDelegate.aggregate({
                where: {
                    userId,
                    date: {
                        gte: startOfMonth,
                    },
                },
                _sum: {
                    inputTokensUsed: true,
                    outputTokensUsed: true,
                },
            });
            const tokensUsed = (monthlyUsage._sum.inputTokensUsed || 0) +
                (monthlyUsage._sum.outputTokensUsed || 0);
            if (tokensUsed >= limits.monthlyTokens) {
                return {
                    allowed: false,
                    reason: `Monthly token limit reached (${tokensUsed.toLocaleString()}/${limits.monthlyTokens.toLocaleString()})`,
                    planType: user.planType,
                    usage: {
                        monthlyTokens: {
                            used: tokensUsed,
                            limit: limits.monthlyTokens,
                        },
                    },
                };
            }
        }
    }
    return {
        allowed: true,
        planType: user.planType,
        limits,
    };
}
export async function trackUsage(userId, modelId, tokensUsed, cost) {
    const userUsageDelegate = prisma.userUsage;
    if (!(userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.upsert)) {
        // Usage tracking disabled when table is not available
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Use upsert for a more atomic and potentially efficient operation
    await userUsageDelegate.upsert({
        where: {
            // This relies on the @@unique([userId, modelId, date]) constraint in schema.prisma
            userId_modelId_date: {
                userId,
                modelId,
                date: today,
            },
        },
        create: {
            userId,
            modelId,
            date: today,
            messagesCount: 1,
            inputTokensUsed: tokensUsed.input,
            outputTokensUsed: tokensUsed.output,
            costIncurred: cost,
        },
        update: {
            messagesCount: { increment: 1 },
            inputTokensUsed: { increment: tokensUsed.input },
            outputTokensUsed: { increment: tokensUsed.output },
            costIncurred: { increment: cost },
        },
    });
}
export async function getUserUsageStats(userId) {
    const userUsageDelegate = prisma.userUsage;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    try {
        const [dailyUsage, monthlyUsage, user] = await Promise.all([
            (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) ? userUsageDelegate.aggregate({
                where: {
                    userId,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
                _sum: {
                    messagesCount: true,
                    inputTokensUsed: true,
                    outputTokensUsed: true,
                    costIncurred: true,
                },
            }) : { _sum: { messagesCount: 0, inputTokensUsed: 0, outputTokensUsed: 0, costIncurred: 0 } },
            (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) ? userUsageDelegate.aggregate({
                where: {
                    userId,
                    date: {
                        gte: startOfMonth,
                    },
                },
                _sum: {
                    messagesCount: true,
                    inputTokensUsed: true,
                    outputTokensUsed: true,
                    costIncurred: true,
                },
            }) : { _sum: { messagesCount: 0, inputTokensUsed: 0, outputTokensUsed: 0, costIncurred: 0 } },
            prisma.user.findUnique({
                where: { id: userId },
                select: { planType: true },
            }),
        ]);
        if (!user) {
            console.error('User not found in getUserUsageStats, returning defaults for userId:', userId);
            // Return default stats for non-existent user instead of throwing
            return {
                planType: 'FREE',
                daily: {
                    messages: {
                        used: 0,
                        limit: 20,
                        remaining: 20,
                    },
                    cost: 0,
                },
                monthly: {
                    messages: 0,
                    advancedMessages: {
                        used: 0,
                        limit: 0,
                        remaining: 0,
                    },
                    tokens: {
                        used: 0,
                        limit: 50000,
                        remaining: 50000,
                    },
                    credits: {
                        used: 0,
                        limit: null,
                        remaining: null,
                    },
                    cost: 0,
                },
                modelsAllowed: PLAN_LIMITS.FREE.modelsAllowed,
            };
        }
        const limits = PLAN_LIMITS[user.planType];
        const dailyMessages = dailyUsage._sum.messagesCount || 0;
        const monthlyTokens = (monthlyUsage._sum.inputTokensUsed || 0) +
            (monthlyUsage._sum.outputTokensUsed || 0);
        const monthlyCost = monthlyUsage._sum.costIncurred || 0;
        // Calculate advanced messages used for FREE plan
        const monthlyAdvancedMessages = user.planType === 'FREE' && (userUsageDelegate === null || userUsageDelegate === void 0 ? void 0 : userUsageDelegate.aggregate) ? await userUsageDelegate.aggregate({
            where: {
                userId,
                date: {
                    gte: startOfMonth,
                },
                // Temporarily check modelId directly since foreign key is removed
                modelId: {
                    in: limits.modelsAllowed.advanced
                }
            },
            _sum: {
                messagesCount: true,
            },
        }) : null;
        const advancedMessagesUsed = (monthlyAdvancedMessages === null || monthlyAdvancedMessages === void 0 ? void 0 : monthlyAdvancedMessages._sum.messagesCount) || 0;
        return {
            planType: user.planType,
            daily: {
                messages: {
                    used: dailyMessages,
                    limit: limits.dailyMessages,
                    remaining: limits.dailyMessages ? Math.max(0, limits.dailyMessages - dailyMessages) : null,
                },
                cost: dailyUsage._sum.costIncurred || 0,
            },
            monthly: {
                messages: monthlyUsage._sum.messagesCount || 0,
                advancedMessages: {
                    used: advancedMessagesUsed,
                    limit: limits.monthlyAdvancedMessages,
                    remaining: limits.monthlyAdvancedMessages ? Math.max(0, limits.monthlyAdvancedMessages - advancedMessagesUsed) : null,
                },
                tokens: {
                    used: monthlyTokens,
                    limit: limits.monthlyTokens,
                    remaining: limits.monthlyTokens ? Math.max(0, limits.monthlyTokens - monthlyTokens) : null,
                },
                credits: {
                    used: 0, // TODO: implement credit tracking
                    limit: limits.monthlyCredits,
                    remaining: limits.monthlyCredits ? limits.monthlyCredits : null,
                },
                cost: monthlyCost,
            },
            modelsAllowed: limits.modelsAllowed,
        };
    }
    catch (error) {
        console.error('Error in getUserUsageStats:', error);
        // Return default stats in case of any error
        return {
            planType: 'FREE',
            daily: {
                messages: {
                    used: 0,
                    limit: 20,
                    remaining: 20,
                },
                cost: 0,
            },
            monthly: {
                messages: 0,
                advancedMessages: {
                    used: 0,
                    limit: 0,
                    remaining: 0,
                },
                tokens: {
                    used: 0,
                    limit: 50000,
                    remaining: 50000,
                },
                credits: {
                    used: 0,
                    limit: null,
                    remaining: null,
                },
                cost: 0,
            },
            modelsAllowed: PLAN_LIMITS.FREE.modelsAllowed,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNhZ2UtbGltaXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNhZ2UtbGltaXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFjckMsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFrQztJQUN4RCxJQUFJLEVBQUU7UUFDSixhQUFhLEVBQUUsRUFBRSxFQUFFLHFDQUFxQztRQUN4RCxhQUFhLEVBQUUsSUFBSTtRQUNuQix1QkFBdUIsRUFBRSxDQUFDLEVBQUUsOEJBQThCO1FBQzFELGFBQWEsRUFBRTtZQUNiLElBQUksRUFBRTtnQkFDSixhQUFhO2dCQUNiLGtCQUFrQjtnQkFDbEIscUJBQXFCO2dCQUNyQixZQUFZO2dCQUNaLG1CQUFtQjtnQkFDbkIsVUFBVTthQUNYO1lBQ0QsUUFBUSxFQUFFLEVBQUUsQ0FBQyxvQ0FBb0M7U0FDbEQ7UUFDRCxjQUFjLEVBQUUsSUFBSTtLQUNyQjtJQUNELElBQUksRUFBRTtRQUNKLGFBQWEsRUFBRSxJQUFJLEVBQUUsNEJBQTRCO1FBQ2pELGFBQWEsRUFBRSxJQUFJLEVBQUUsOEJBQThCO1FBQ25ELHVCQUF1QixFQUFFLEdBQUcsRUFBRSw4Q0FBOEM7UUFDNUUsYUFBYSxFQUFFO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLGFBQWE7Z0JBQ2Isa0JBQWtCO2dCQUNsQixxQkFBcUI7Z0JBQ3JCLFlBQVk7Z0JBQ1osYUFBYTtnQkFDYixlQUFlO2dCQUNmLGFBQWE7Z0JBQ2IsbUJBQW1CO2dCQUNuQixhQUFhO2dCQUNiLGtCQUFrQjtnQkFDbEIsVUFBVTtnQkFDVixXQUFXO2FBQ1o7WUFDRCxRQUFRLEVBQUU7Z0JBQ1IsUUFBUTtnQkFDUixlQUFlO2dCQUNmLG1CQUFtQjtnQkFDbkIsaUJBQWlCO2dCQUNqQixjQUFjO2dCQUNkLFFBQVE7Z0JBQ1Isc0JBQXNCO2dCQUN0QixzQkFBc0I7Z0JBQ3RCLGlCQUFpQjthQUNsQjtTQUNGO1FBQ0QsY0FB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