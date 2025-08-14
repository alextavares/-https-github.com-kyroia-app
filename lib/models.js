export const AVAILABLE_MODELS = [
    // Modelos Avançados
    {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        provider: 'openai',
        category: 'advanced',
        contextWindow: 128000,
        description: 'Modelo mais recente e poderoso da OpenAI'
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        category: 'advanced',
        contextWindow: 128000,
        description: 'Modelo multimodal otimizado da OpenAI'
    },
    {
        id: 'claude-4-sonnet',
        name: 'Claude 4 Sonnet',
        provider: 'anthropic',
        category: 'advanced',
        contextWindow: 200000,
        description: 'Modelo mais recente da Anthropic'
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'google',
        category: 'advanced',
        contextWindow: 1048576,
        description: 'Modelo avançado do Google com contexto massivo'
    },
    {
        id: 'llama-4-maverick',
        name: 'Llama 4 Maverick',
        provider: 'meta',
        category: 'advanced',
        contextWindow: 131072,
        description: 'Modelo open source mais poderoso da Meta'
    },
    {
        id: 'perplexity-sonar',
        name: 'Perplexity Sonar',
        provider: 'perplexity',
        category: 'advanced',
        contextWindow: 200000,
        description: 'Modelo com pesquisa web integrada'
    },
    {
        id: 'sabia-3.1',
        name: 'Sabiá 3.1',
        provider: 'maritaca',
        category: 'advanced',
        contextWindow: 32768,
        description: 'Modelo brasileiro otimizado para português'
    },
    {
        id: 'mistral-large-2',
        name: 'Mistral Large 2',
        provider: 'mistral',
        category: 'advanced',
        contextWindow: 131072,
        description: 'Modelo multilíngue avançado'
    },
    {
        id: 'grok-3',
        name: 'Grok 3',
        provider: 'xai',
        category: 'advanced',
        isPro: true,
        contextWindow: 131072,
        description: 'Modelo da xAI com personalidade única'
    },
    {
        id: 'amazon-nova-premier',
        name: 'Amazon Nova Premier',
        provider: 'amazon',
        category: 'advanced',
        contextWindow: 300000,
        description: 'Modelo mais poderoso da Amazon'
    },
    // Raciocínio Profundo
    {
        id: 'o3',
        name: 'o3',
        provider: 'openai',
        category: 'reasoning',
        isPro: true,
        contextWindow: 128000,
        description: 'Modelo de raciocínio profundo'
    },
    {
        id: 'o4-mini',
        name: 'o4 Mini',
        provider: 'openai',
        category: 'reasoning',
        isPro: true,
        contextWindow: 128000,
        description: 'Modelo de raciocínio otimizado'
    },
    {
        id: 'qwen-qwq',
        name: 'Qwen QwQ',
        provider: 'alibaba',
        category: 'reasoning',
        contextWindow: 131072,
        description: 'Modelo de raciocínio step-by-step'
    },
    {
        id: 'claude-4-sonnet-thinking',
        name: 'Claude 4 Sonnet Thinking',
        provider: 'anthropic',
        category: 'reasoning',
        isPro: true,
        contextWindow: 200000,
        description: 'Claude com modo de raciocínio avançado'
    },
    {
        id: 'deepseek-r1-small',
        name: 'Deepseek R1 Small',
        provider: 'deepseek',
        category: 'reasoning',
        contextWindow: 128000,
        description: 'Modelo de raciocínio eficiente'
    },
    {
        id: 'deepseek-r1',
        name: 'Deepseek R1',
        provider: 'deepseek',
        category: 'reasoning',
        isPro: true,
        contextWindow: 128000,
        description: 'Modelo de raciocínio avançado'
    },
    {
        id: 'grok-3-mini',
        name: 'Grok 3 Mini',
        provider: 'xai',
        category: 'reasoning',
        isPro: true,
        contextWindow: 131072,
        description: 'Versão compacta do Grok com raciocínio'
    }
];
// Função para obter modelos por categoria
export function getModelsByCategory(category) {
    return AVAILABLE_MODELS.filter(model => model.category === category);
}
// Função para obter modelos Pro
export function getProModels() {
    return AVAILABLE_MODELS.filter(model => model.isPro === true);
}
// Função para obter modelo por ID
export function getModelById(id) {
    return AVAILABLE_MODELS.find(model => model.id === id);
}
// Mapear IDs de modelo para IDs do OpenRouter
export const MODEL_MAPPING = {
    // OpenAI
    'gpt-4.1': 'openai/gpt-4-turbo-preview',
    'gpt-4o': 'openai/gpt-4o',
    'o3': 'openai/o1-preview',
    'o4-mini': 'openai/o1-mini',
    // Anthropic
    'claude-4-sonnet': 'anthropic/claude-3.5-sonnet',
    'claude-4-sonnet-thinking': 'anthropic/claude-3.5-sonnet',
    // Google
    'gemini-2.5-pro': 'google/gemini-2.0-pro-exp',
    // Meta
    'llama-4-maverick': 'meta-llama/llama-3.3-70b-instruct',
    // Perplexity
    'perplexity-sonar': 'perplexity/sonar-pro',
    // Sabiá (Maritaca AI)
    'sabia-3.1': 'maritaca/sabia-3',
    // Mistral
    'mistral-large-2': 'mistralai/mistral-large-2411',
    // xAI
    'grok-3': 'x-ai/grok-beta',
    'grok-3-mini': 'x-ai/grok-beta-mini',
    // Amazon
    'amazon-nova-premier': 'amazon/nova-pro-v1',
    // Alibaba
    'qwen-qwq': 'qwen/qwq-32b-preview',
    // DeepSeek
    'deepseek-r1-small': 'deepseek/deepseek-r1-lite-preview',
    'deepseek-r1': 'deepseek/deepseek-r1'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVdBLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFrQjtJQUM3QyxvQkFBb0I7SUFDcEI7UUFDRSxFQUFFLEVBQUUsU0FBUztRQUNiLElBQUksRUFBRSxTQUFTO1FBQ2YsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsYUFBYSxFQUFFLE1BQU07UUFDckIsV0FBVyxFQUFFLDBDQUEwQztLQUN4RDtJQUNEO1FBQ0UsRUFBRSxFQUFFLFFBQVE7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGFBQWEsRUFBRSxNQUFNO1FBQ3JCLFdBQVcsRUFBRSx1Q0FBdUM7S0FDckQ7SUFDRDtRQUNFLEVBQUUsRUFBRSxpQkFBaUI7UUFDckIsSUFBSSxFQUFFLGlCQUFpQjtRQUN2QixRQUFRLEVBQUUsV0FBVztRQUNyQixRQUFRLEVBQUUsVUFBVTtRQUNwQixhQUFhLEVBQUUsTUFBTTtRQUNyQixXQUFXLEVBQUUsa0NBQWtDO0tBQ2hEO0lBQ0Q7UUFDRSxFQUFFLEVBQUUsZ0JBQWdCO1FBQ3BCLElBQUksRUFBRSxnQkFBZ0I7UUFDdEIsUUFBUSxFQUFFLFFBQVE7UUFDbEIsUUFBUSxFQUFFLFVBQVU7UUFDcEIsYUFBYSxFQUFFLE9BQU87UUFDdEIsV0FBVyxFQUFFLGdEQUFnRDtLQUM5RDtJQUNEO1FBQ0UsRUFBRSxFQUFFLGtCQUFrQjtRQUN0QixJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLFFBQVEsRUFBRSxNQUFNO1FBQ2hCLFFBQVEsRUFBRSxVQUFVO1FBQ3BCLGFBQWEsRUFBRSxNQUFNO1FBQ3JCLFdBQVcsRUFBRSwwQ0FBMEM7S0FDeEQ7SUFDRDtRQUNFLEVBQUUsRUFBRSxrQkFBa0I7UUFDdEIsSUFBSSxFQUFFLGtCQUFrQjtRQUN4QixRQUFR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