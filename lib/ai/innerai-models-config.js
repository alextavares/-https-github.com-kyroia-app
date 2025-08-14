// Configuração EXATA dos modelos do Kyroia original
// Baseado na análise do site app.innerai.com - Janeiro 2025
// ATENÇÃO: Esta lista deve ser EXATAMENTE igual à do Kyroia original
export const INNERAI_MODELS = [
    // ===== MODELOS RÁPIDOS (Fast Models) =====
    // Exatamente como no Kyroia original
    {
        id: 'llama-4-scout',
        name: 'Llama 4 Scout',
        provider: 'Meta',
        category: 'fast',
        description: 'Modelo Llama mais recente para respostas rápidas',
        contextWindow: 131072,
        costPer1kTokens: { input: 0.0002, output: 0.0002 },
        creditsPerToken: { input: 0.001, output: 0.001 }, // Modelo rápido - baixo custo
        features: ['Chat', 'Fast Response', 'Open Source'],
        planRequired: 'FREE',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'meta-llama/llama-3.2-3b-instruct', // Fallback temporário
        performance: { speed: 'fast', quality: 'good' },
    },
    {
        id: 'deepseek-3.1',
        name: 'Deepseek 3.1',
        provider: 'DeepSeek',
        category: 'fast',
        description: 'Última versão do modelo DeepSeek',
        contextWindow: 64000,
        costPer1kTokens: { input: 0.00014, output: 0.00028 },
        creditsPerToken: { input: 0.001, output: 0.002 }, // Modelo rápido
        features: ['Chat', 'Code', 'Math', 'Reasoning'],
        planRequired: 'FREE',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'deepseek/deepseek-chat', // Fallback temporário
        performance: { speed: 'fast', quality: 'excellent' },
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        category: 'fast',
        description: 'Modelo rápido e eficiente da OpenAI',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.00015, output: 0.0006 },
        creditsPerToken: { input: 0.002, output: 0.004 }, // Modelo rápido
        features: ['Chat', 'Completions', 'Function Calling', 'Vision'],
        planRequired: 'FREE',
        isAvailable: true,
        openRouterModel: 'openai/gpt-4o-mini',
        performance: { speed: 'fast', quality: 'good' },
    },
    {
        id: 'claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        category: 'fast',
        description: 'Modelo rápido da Anthropic com excelente qualidade',
        contextWindow: 200000,
        costPer1kTokens: { input: 0.00025, output: 0.00125 },
        creditsPerToken: { input: 0.003, output: 0.008 }, // Modelo rápido
        features: ['Chat', 'Fast Response', 'Code', 'Analysis'],
        planRequired: 'FREE',
        isAvailable: true,
        openRouterModel: 'anthropic/claude-3-5-haiku-20241022',
        performance: { speed: 'fast', quality: 'excellent' },
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'Google',
        category: 'fast',
        description: 'Nova versão rápida do Gemini com melhor performance',
        contextWindow: 1000000,
        costPer1kTokens: { input: 0.0000375, output: 0.00015 },
        creditsPerToken: { input: 0.001, output: 0.002 }, // Modelo rápido - muito eficiente
        features: ['Chat', 'Multimodal', 'Code', 'Fast Response'],
        planRequired: 'FREE',
        isAvailable: true,
        openRouterModel: 'google/gemini-2.0-flash-exp', // Última versão disponível
        performance: { speed: 'fast', quality: 'good' },
    },
    {
        id: 'google-gaia',
        name: 'Google Gaia',
        provider: 'Google',
        category: 'fast',
        description: 'Novo modelo especializado do Google',
        contextWindow: 32768,
        costPer1kTokens: { input: 0.0005, output: 0.0015 },
        creditsPerToken: { input: 0.005, output: 0.012 }, // Modelo rápido
        features: ['Chat', 'Specialized Tasks', 'Fast Response'],
        planRequired: 'FREE',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'google/gemini-pro', // Fallback temporário
        performance: { speed: 'fast', quality: 'good' },
    },
    // ===== MODELOS AVANÇADOS (Advanced Models) =====
    // Exatamente como no Kyroia original
    {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'OpenAI',
        category: 'advanced',
        description: 'Nova versão aprimorada do GPT-4',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.01, output: 0.03 },
        creditsPerToken: { input: 0.08, output: 0.20 }, // Modelo avançado - custo médio
        features: ['Chat', 'Advanced Reasoning', 'Vision', 'Function Calling'],
        planRequired: 'LITE',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'openai/gpt-4-turbo', // Fallback temporário
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        category: 'advanced',
        description: 'Modelo mais capaz da OpenAI para tarefas complexas',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.0025, output: 0.01 },
        creditsPerToken: { input: 0.02, output: 0.08 }, // Modelo avançado
        features: ['Chat', 'Vision', 'Function Calling', 'Advanced Reasoning'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'openai/gpt-4o',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'Anthropic',
        category: 'advanced',
        description: 'Nova geração do Claude com capacidades aprimoradas',
        contextWindow: 200000,
        costPer1kTokens: { input: 0.003, output: 0.015 },
        creditsPerToken: { input: 0.025, output: 0.10 }, // Modelo avançado
        features: ['Chat', 'Analysis', 'Code', 'Long Context', 'Vision'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'anthropic/claude-3-5-sonnet-20241022', // Última versão disponível
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'Google',
        category: 'advanced',
        description: 'Versão avançada do Gemini com capacidades superiores',
        contextWindow: 2097152,
        costPer1kTokens: { input: 0.00125, output: 0.005 },
        creditsPerToken: { input: 0.01, output: 0.04 }, // Modelo avançado - eficiente
        features: ['Chat', 'Multimodal', 'Code', 'Long Context', 'Advanced Analysis'],
        planRequired: 'LITE',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'google/gemini-pro-1.5', // Fallback temporário
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'llama-4-maverick',
        name: 'Llama 4 Maverick',
        provider: 'Meta',
        category: 'advanced',
        description: 'Versão avançada do Llama 4 para tarefas complexas',
        contextWindow: 131072,
        costPer1kTokens: { input: 0.000005, output: 0.000015 },
        creditsPerToken: { input: 0.0001, output: 0.0002 }, // Modelo avançado - open source barato
        features: ['Chat', 'Advanced Reasoning', 'Code', 'Open Source'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'meta-llama/llama-3.1-405b-instruct', // Melhor disponível
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'perplexity-sonar',
        name: 'Perplexity Sonar',
        provider: 'Perplexity',
        category: 'advanced',
        description: 'Modelo especializado em pesquisa web com citações',
        contextWindow: 200000,
        costPer1kTokens: { input: 0.001, output: 0.001 },
        creditsPerToken: { input: 0.008, output: 0.008 }, // Modelo avançado com pesquisa web
        features: ['Web Search', 'Real-time Info', 'Citations', 'Research'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'perplexity/llama-3.1-sonar-large-128k-online',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'sabia-3.1',
        name: 'Sabiá 3.1',
        provider: 'Maritalk',
        category: 'advanced',
        description: 'Modelo brasileiro especializado em português',
        contextWindow: 32768,
        costPer1kTokens: { input: 0.001, output: 0.003 },
        creditsPerToken: { input: 0.008, output: 0.024 }, // Modelo avançado brasileiro
        features: ['Chat', 'Portuguese Native', 'Brazilian Context'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'maritalk/sabia-3', // Verificar disponibilidade
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'mistral-large-2',
        name: 'Mistral Large 2',
        provider: 'Mistral AI',
        category: 'advanced',
        description: 'Segunda geração do Mistral Large',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.002, output: 0.006 },
        creditsPerToken: { input: 0.016, output: 0.048 }, // Modelo avançado europeu
        features: ['Chat', 'Multilingual', 'Code', 'Function Calling'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'mistralai/mistral-large',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'xAI',
        category: 'advanced',
        description: 'Terceira geração do Grok com melhor performance',
        contextWindow: 131072,
        costPer1kTokens: { input: 0.002, output: 0.01 },
        creditsPerToken: { input: 0.016, output: 0.08 }, // Modelo avançado xAI
        features: ['Chat', 'Real-time Info', 'Vision', 'Uncensored'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'x-ai/grok-beta',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'amazon-nova-premier',
        name: 'Amazon Nova Premier',
        provider: 'Amazon',
        category: 'advanced',
        description: 'Modelo premium da Amazon para empresas',
        contextWindow: 300000,
        costPer1kTokens: { input: 0.008, output: 0.032 },
        creditsPerToken: { input: 0.064, output: 0.256 }, // Modelo avançado enterprise
        features: ['Chat', 'Enterprise Features', 'Long Context'],
        planRequired: 'LITE',
        isAvailable: true,
        openRouterModel: 'amazon/nova-pro-v1',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    // ===== RACIOCÍNIO PROFUNDO (Deep Reasoning) =====
    // Exatamente como no Kyroia original
    {
        id: 'grok-4',
        name: 'Grok 4',
        provider: 'xAI',
        category: 'reasoning',
        description: 'Quarta geração do Grok com raciocínio avançado',
        contextWindow: 131072,
        costPer1kTokens: { input: 0.01, output: 0.03 },
        creditsPerToken: { input: 0.1, output: 0.3 }, // Modelo de raciocínio premium
        features: ['Advanced Reasoning', 'Problem Solving', 'Real-time Info'],
        planRequired: 'PRO',
        isAvailable: false, // Aguardando disponibilidade no OpenRouter
        openRouterModel: 'x-ai/grok-beta', // Fallback temporário
        performance: { speed: 'slow', quality: 'superior' },
    },
    {
        id: 'o3',
        name: 'o3',
        provider: 'OpenAI',
        category: 'reasoning',
        description: 'Modelo de raciocínio de terceira geração da OpenAI',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.015, output: 0.06 },
        creditsPerToken: { input: 0.15, output: 0.60 }, // Modelo de raciocínio premium
        features: ['Advanced Reasoning', 'Problem Solving', 'Math', 'Science'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'openai/o1-preview', // Melhor disponível
        performance: { speed: 'slow', quality: 'superior' },
    },
    {
        id: 'o4-mini',
        name: 'o4 Mini',
        provider: 'OpenAI',
        category: 'reasoning',
        description: 'Versão compacta do modelo de raciocínio o4',
        contextWindow: 128000,
        costPer1kTokens: { input: 0.003, output: 0.012 },
        creditsPerToken: { input: 0.03, output: 0.12 }, // Modelo de raciocínio compacto
        features: ['Reasoning', 'Problem Solving', 'Fast Inference'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'openai/o1-mini',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'qwen-qwq',
        name: 'Qwen QwQ',
        provider: 'Alibaba',
        category: 'reasoning',
        description: 'Modelo de raciocínio especializado em questões complexas',
        contextWindow: 32768,
        costPer1kTokens: { input: 0.0009, output: 0.0009 },
        creditsPerToken: { input: 0.009, output: 0.009 }, // Modelo de raciocínio eficiente
        features: ['Reasoning', 'Q&A', 'Problem Solving'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'qwen/qwq-32b-preview',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'claude-4-sonnet-thinking',
        name: 'Claude 4 Sonnet Thinking',
        provider: 'Anthropic',
        category: 'reasoning',
        description: 'Claude 4 com capacidades avançadas de raciocínio',
        contextWindow: 200000,
        costPer1kTokens: { input: 0.003, output: 0.015 },
        creditsPerToken: { input: 0.03, output: 0.15 }, // Modelo de raciocínio anthropic
        features: ['Advanced Reasoning', 'Analysis', 'Problem Solving', 'Long Context'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'anthropic/claude-3-5-sonnet-20241022', // Melhor disponível
        performance: { speed: 'slow', quality: 'superior' },
    },
    {
        id: 'deepseek-r1-small',
        name: 'Deepseek R1 Small',
        provider: 'DeepSeek',
        category: 'reasoning',
        description: 'Versão compacta do modelo de raciocínio DeepSeek R1',
        contextWindow: 64000,
        costPer1kTokens: { input: 0.00055, output: 0.0022 },
        creditsPerToken: { input: 0.006, output: 0.022 }, // Modelo de raciocínio compacto
        features: ['Reasoning', 'Problem Solving', 'Fast Inference'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'deepseek/deepseek-r1',
        performance: { speed: 'medium', quality: 'excellent' },
    },
    {
        id: 'deepseek-r1',
        name: 'Deepseek R1',
        provider: 'DeepSeek',
        category: 'reasoning',
        description: 'Modelo de raciocínio avançado da DeepSeek',
        contextWindow: 64000,
        costPer1kTokens: { input: 0.00055, output: 0.0022 },
        creditsPerToken: { input: 0.006, output: 0.022 }, // Modelo de raciocínio avançado
        features: ['Advanced Reasoning', 'Problem Solving', 'Math', 'Science'],
        planRequired: 'PRO',
        isAvailable: true,
        openRouterModel: 'deepseek/deepseek-r1',
        performance: { speed: 'slow', quality: 'superior' },
    },
];
// Configurações de planos - EXATAMENTE como no Kyroia
export const PLAN_LIMITS = {
    FREE: {
        fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
        advancedModels: 0, // Modelos Avançados: não disponível
        reasoningModels: 0, // Raciocínio Profundo: não disponível
    },
    LITE: {
        fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
        advancedModels: 'unlimited', // Modelos Avançados: ilimitadas
        reasoningModels: 0, // Raciocínio Profundo: não disponível
    },
    PRO: {
        fastModels: 'unlimited', // Modelos Rápidos: ilimitadas
        advancedModels: 'unlimited', // Modelos Avançados: ilimitadas
        reasoningModels: 'unlimited', // Raciocínio Profundo: ilimitadas
    },
    ENTERPRISE: {
        fastModels: 'unlimited',
        advancedModels: 'unlimited',
        reasoningModels: 'unlimited',
    },
};
// Categorias para filtros - EXATAMENTE como no Kyroia
export const MODEL_CATEGORIES = {
    fast: 'Modelos Rápidos',
    advanced: 'Modelos Avançados',
    reasoning: 'Raciocínio Profundo',
};
// Função para obter modelos por categoria
export function getModelsByCategory(category) {
    return INNERAI_MODELS.filter(model => model.category === category && model.isAvailable);
}
// Função para obter modelos por plano - EXATAMENTE como no Kyroia
export function getModelsForPlan(planType) {
    const availableModels = INNERAI_MODELS.filter(model => model.isAvailable);
    switch (planType) {
        case 'FREE':
            // Apenas modelos rápidos
            return availableModels.filter(model => model.category === 'fast');
        case 'LITE':
            // Modelos rápidos + avançados
            return availableModels.filter(model => model.category === 'fast' || model.category === 'advanced');
        case 'PRO':
            // Todos os modelos
            return availableModels;
        case 'ENTERPRISE':
            // Todos os modelos
            return availableModels;
        default:
            return [];
    }
}
// Função para obter modelo por ID
export function getModelById(id) {
    return INNERAI_MODELS.find(model => model.id === id);
}
// Função para calcular créditos necessários baseado nos tokens
export function calculateCreditsForTokens(modelId, inputTokens, outputTokens) {
    const model = getModelById(modelId);
    if (!model) {
        return 0;
    }
    const inputCredits = inputTokens * model.creditsPerToken.input;
    const outputCredits = outputTokens * model.creditsPerToken.output;
    return Math.ceil(inputCredits + outputCredits); // Arredondar para cima
}
// Função para verificar se um modelo consome créditos (não FREE)
export function modelRequiresCredits(modelId) {
    const model = getModelById(modelId);
    if (!model)
        return false;
    // Modelos FREE não consomem créditos do usuário
    return model.planRequired !== 'FREE';
}
// Providers disponíveis
export const PROVIDERS = [
    'OpenAI',
    'Anthropic',
    'Google',
    'Meta',
    'xAI',
    'Perplexity',
    'Mistral AI',
    'DeepSeek',
    'Alibaba',
    'Maritalk',
    'Amazon',
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5uZXJhaS1tb2RlbHMtY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW5uZXJhaS1tb2RlbHMtY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFEQUFxRDtBQUNyRCw0REFBNEQ7QUFDNUQsc0VBQXNFO0FBNEJ0RSxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQWM7SUFDdkMsNENBQTRDO0lBQzVDLHNDQUFzQztJQUV0QztRQUNFLEVBQUUsRUFBRSxlQUFlO1FBQ25CLElBQUksRUFBRSxlQUFlO1FBQ3JCLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLFdBQVcsRUFBRSxrREFBa0Q7UUFDL0QsYUFBYSxFQUFFLE1BQU07UUFDckIsZUFBZSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFO1FBQ2xELGVBQWUsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLDhCQUE4QjtRQUNoRixRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLGFBQWEsQ0FBQztRQUNsRCxZQUFZLEVBQUUsTUFBTTtRQUNwQixXQUFXLEVBQUUsS0FBSyxFQUFFLDJDQUEyQztRQUMvRCxlQUFlLEVBQUUsa0NBQWtDLEVBQUUsc0JBQXNCO1FBQzNFLFdBQVcsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtLQUNoRDtJQUVEO1FBQ0UsRUFBRSxFQUFFLGNBQWM7UUFDbEIsSUFBSSxFQUFFLGNBQWM7UUFDcEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsUUFBUSxFQUFFLE1BQU07UUFDaEIsV0FBVyxFQUFFLGtDQUFrQztRQUMvQyxhQUFhLEVBQUUsS0FBSztRQUNwQixlQUFlLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUU7UUFDcEQsZUFBZSxF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