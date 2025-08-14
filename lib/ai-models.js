import { z } from 'zod';
export const AI_MODELS = [
    // Fast Models (Free Plan)
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        category: 'fast',
        description: 'Modelo rápido e eficiente para tarefas básicas',
        inputCostPerToken: 0.0000003,
        outputCostPerToken: 0.0000012,
        contextWindow: 128000,
        features: ['Chat', 'Análise', 'Escrita'],
        isAvailable: true,
        requiresAuth: false,
        supportedFeatures: {
            text: true,
            vision: true,
            audio: false,
            codeGeneration: true,
            reasoning: false
        }
    },
    {
        id: 'deepseek-3.1',
        name: 'DeepSeek 3.1',
        provider: 'DeepSeek',
        category: 'fast',
        description: 'Modelo open-source otimizado para código',
        inputCostPerToken: 0.0000002,
        outputCostPerToken: 0.0000008,
        contextWindow: 64000,
        features: ['Programação', 'Análise', 'Chat'],
        isAvailable: true,
        requiresAuth: false,
        supportedFeatures: {
            text: true,
            vision: false,
            audio: false,
            codeGeneration: true,
            reasoning: true
        }
    },
    {
        id: 'claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        category: 'fast',
        description: 'Modelo rápido da Anthropic com boa qualidade',
        inputCostPerToken: 0.0000008,
        outputCostPerToken: 0.000004,
        contextWindow: 200000,
        features: ['Chat', 'Análise', 'Escrita'],
        isAvailable: true,
        requiresAuth: false,
        supportedFeatures: {
            text: true,
            vision: true,
            audio: false,
            codeGeneration: true,
            reasoning: false
        }
    },
    {
        id: 'moonshotai/kimi-k2:free',
        name: 'Kimi K2 Free',
        provider: 'Moonshot AI',
        category: 'fast',
        description: 'Modelo gratuito da Moonshot AI com boa performance',
        inputCostPerToken: 0.0000002,
        outputCostPerToken: 0.0000008,
        contextWindow: 128000,
        features: ['Chat', 'Análise', 'Escrita'],
        isAvailable: true,
        requiresAuth: false,
        supportedFeatures: {
            text: true,
            vision: false,
            audio: false,
            codeGeneration: true,
            reasoning: false
        }
    },
    // Advanced Models (Pro Plan)
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        category: 'advanced',
        description: 'Modelo mais avançado da OpenAI com multimodalidade',
        inputCostPerToken: 0.000015,
        outputCostPerToken: 0.00006,
        contextWindow: 128000,
        features: ['Chat avançado', 'Visão', 'Áudio', 'Código'],
        isAvailable: true,
        requiresAuth: true,
        supportedFeatures: {
            text: true,
            vision: true,
            audio: true,
            codeGeneration: true,
            reasoning: true
        }
    },
    {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'Anthropic',
        category: 'advanced',
        description: 'Modelo de nova geração da Anthropic',
        inputCostPerToken: 0.000015,
        outputCostPerToken: 0.000075,
        contextWindow: 200000,
        features: ['Raciocínio avançado', 'Análise', 'Código'],
        isAvailable: true,
        requiresAuth: true,
        supportedFeatures: {
            text: true,
            vision: true,
            audio: false,
            codeGeneration: true,
            reasoning: true
        }
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'Google',
        category: 'advanced',
        description: 'Modelo avançado do Google com foco em raciocínio',
        inputCostPerToken: 0.00001,
        outputCostPerToken: 0.00004,
        contextWindow: 1000000,
        features: ['Contexto extenso', 'Multimodalidade', 'Código'],
        isAvailable: true,
        requiresAuth: true,
        supportedFeatures: {
            text: true,
            vision: true,
            audio: true,
            codeGeneration: true,
            reasoning: true
        }
    },
    // Specialized Models
    {
        id: 'o1-preview',
        name: 'OpenAI o1 Preview',
        provider: 'OpenAI',
        category: 'specialized',
        description: 'Modelo especializado em raciocínio complexo',
        inputCostPerToken: 0.000015,
        outputCostPerToken: 0.00006,
        contextWindow: 128000,
        features: ['Raciocínio', 'Matemática', 'Ciência'],
        isAvailable: true,
        requiresAuth: true,
        supportedFeatures: {
            text: true,
            vision: false,
            audio: false,
            codeGeneration: true,
            reasoning: true
        }
    }
];
export const ModelSelectionSchema = z.object({
    modelId: z.string(),
    temperature: z.number().min(0).max(2).optional().default(0.7),
    maxTokens: z.number().min(1).max(8192).optional().default(2048),
    systemPrompt: z.string().optional(),
});
export class AIModelManager {
    static getAvailableModels(userPlan = 'free') {
        if (userPlan === 'free') {
            return AI_MODELS.filter(model => model.category === 'fast');
        }
        if (userPlan === 'pro') {
            return AI_MODELS.filter(model => model.category === 'fast' || model.category === 'advanced');
        }
        return AI_MODELS; // Enterprise has access to all models
    }
    static getModelById(id) {
        return AI_MODELS.find(model => model.id === id);
    }
    static getModelsByProvider(provider) {
        return AI_MODELS.filter(model => model.provider === provider);
    }
    static getModelsByFeature(feature) {
        return AI_MODELS.filter(model => model.supportedFeatures[feature]);
    }
    static calculateTokenCost(modelId, inputTokens, outputTokens) {
        const model = this.getModelById(modelId);
        if (!model)
            return 0;
        return (inputTokens * model.inputCostPerToken) + (outputTokens * model.outputCostPerToken);
    }
    static getBestModelForTask(task, userPlan = 'free') {
        const availableModels = this.getAvailableModels(userPlan);
        switch (task) {
            case 'chat':
                return availableModels.find(m => m.id === 'gpt-4o') ||
                    availableModels.find(m => m.id === 'claude-3.5-haiku') ||
                    availableModels[0];
            case 'code':
                return availableModels.find(m => m.id === 'deepseek-3.1') ||
                    availableModels.find(m => m.supportedFeatures.codeGeneration) ||
                    null;
            case 'vision':
                return availableModels.find(m => m.supportedFeatures.vision) || null;
            case 'reasoning':
                return availableModels.find(m => m.id === 'o1-preview') ||
                    availableModels.find(m => m.supportedFeatures.reasoning) ||
                    null;
            case 'writing':
                return availableModels.find(m => m.id === 'claude-4-sonnet') ||
                    availableModels.find(m => m.provider === 'Anthropic') ||
                    availableModels[0];
            default:
                return availableModels[0] || null;
        }
    }
    static getModelUsageStats(modelId) {
        // This would connect to analytics/usage tracking
        return {
            totalUsage: 0,
            averageResponseTime: 0,
            successRate: 0,
            avgTokensPerRequest: 0
        };
    }
}
// Export types e schemas (evitar duplicações de export)
// Já exportamos AIModel (interface) e ModelSelection (type) acima,
// então não reexportamos novamente para evitar conflitos.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktbW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWktbW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUF1QnZCLE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBYztJQUNsQywwQkFBMEI7SUFDMUI7UUFDRSxFQUFFLEVBQUUsYUFBYTtRQUNqQixJQUFJLEVBQUUsYUFBYTtRQUNuQixRQUFRLEVBQUUsUUFBUTtRQUNsQixRQUFRLEVBQUUsTUFBTTtRQUNoQixXQUFXLEVBQUUsZ0RBQWdEO1FBQzdELGlCQUFpQixFQUFFLFNBQVM7UUFDNUIsa0JBQWtCLEVBQUUsU0FBUztRQUM3QixhQUFhLEVBQUUsTUFBTTtRQUNyQixRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQztRQUN4QyxXQUFXLEVBQUUsSUFBSTtRQUNqQixZQUFZLEVBQUUsS0FBSztRQUNuQixpQkFBaUIsRUFBRTtZQUNqQixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxJQUFJO1lBQ1osS0FBSyxFQUFFLEtBQUs7WUFDWixjQUFjLEVBQUUsSUFBSTtZQUNwQixTQUFTLEVBQUUsS0FBSztTQUNqQjtLQUNGO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsY0FBYztRQUNsQixJQUFJLEVBQUUsY0FBYztRQUNwQixRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUUsTUFBTTtRQUNoQixXQUFXLEVBQUUsMENBQTBDO1FBQ3ZELGlCQUFpQixFQUFFLFNBQVM7UUFDNUIsa0JBQWtCLEVBQUUsU0FBUztRQUM3QixhQUFhLEVBQUUsS0FBSztRQUNwQixRQUFRLEVBQUUsQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQztRQUM1QyxXQUFXLEVBQUUsSUFBSTtRQUNqQixZQUFZLEVBQUUsS0FBSztRQUNuQixpQkFBaUIsRUFBRTtZQUNqQixJQUFJLEVBQUUsSUFBSTtZ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