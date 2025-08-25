// Configuração EXATA dos modelos do Kyroia original
// Baseado na análise do site app.innerai.com - Janeiro 2025
// ATENÇÃO: Esta lista deve ser EXATAMENTE igual à do Kyroia original

export interface AIModel {
  id: string
  name: string
  provider: string
  category: 'fast' | 'advanced' | 'reasoning'
  description: string
  contextWindow: number
  costPer1kTokens: {
    input: number
    output: number
  }
  // Configuração de créditos para o sistema interno
  creditsPerToken: {
    input: number  // Créditos por token de entrada
    output: number // Créditos por token de saída
  }
  features: string[]
  planRequired: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'
  isAvailable: boolean
  openRouterModel: string
  performance: {
    speed: 'fast' | 'medium' | 'slow'
    quality: 'good' | 'excellent' | 'superior'
  }
}

export const INNERAI_MODELS: AIModel[] = [
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
    creditsPerToken: { input: 0.001, output: 0.001 },
    features: ['Chat', 'Fast Response', 'Open Source'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'meta-llama/llama-3.2-3b-instruct',
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
    creditsPerToken: { input: 0.001, output: 0.002 },
    features: ['Chat', 'Code', 'Math', 'Reasoning'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'deepseek/deepseek-chat',
    performance: { speed: 'fast', quality: 'excellent' },
  },

  // Adicionados conforme solicitação: GPT-5 Mini e GPT OSS (Fast)
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    category: 'fast',
    description: 'Versão rápida e econômica (mapeada ao GPT-4o Mini)',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.00015, output: 0.0006 },
    creditsPerToken: { input: 0.002, output: 0.004 },
    features: ['Chat', 'Completions', 'Function Calling', 'Vision'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'openai/gpt-4o-mini',
    performance: { speed: 'fast', quality: 'good' },
  },
  {
    id: 'gpt-oss',
    name: 'GPT OSS',
    provider: 'Open Source',
    category: 'fast',
    description: 'Modelo OSS de alta qualidade (Llama 3.3 70B)',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.00002, output: 0.00002 },
    creditsPerToken: { input: 0.0002, output: 0.0002 },
    features: ['Chat', 'Open Source', 'Code'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'meta-llama/llama-3.3-70b-instruct',
    performance: { speed: 'fast', quality: 'good' },
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
    id: 'glm-4.5',
    name: 'GLM-4.5',
    provider: 'Z.AI',
    category: 'advanced',
    description: 'Modelo GLM-4.5 avançado com excelente compreensão em português',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.0003, output: 0.0015 },
    creditsPerToken: { input: 0.003, output: 0.008 },
    features: ['Chat', 'Português Nativo', 'Reasoning', 'Code', 'Analysis'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'z-ai/glm-4.5',
    performance: { speed: 'medium', quality: 'excellent' },
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
    id: 'gemini-2-flash-free',
    name: 'Gemini 2 Flash (Free)',
    provider: 'Google',
    category: 'fast',
    description: 'Variante gratuita do Gemini 2 Flash com grande janela de contexto',
    contextWindow: 1000000,
    costPer1kTokens: { input: 0, output: 0 },
    creditsPerToken: { input: 0, output: 0 },
    features: ['Chat', 'Multimodal', 'Fast Response'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'google/gemini-2.0-flash-exp:free',
    performance: { speed: 'fast', quality: 'good' },
  },

  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    provider: 'Mistral AI',
    category: 'fast',
    description: 'Modelo leve e rápido para tarefas gerais',
    contextWindow: 32000,
    costPer1kTokens: { input: 0.00001, output: 0.00001 },
    creditsPerToken: { input: 0.0001, output: 0.0001 },
    features: ['Chat', 'Code', 'Open Source'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'mistralai/mistral-7b-instruct',
    performance: { speed: 'fast', quality: 'good' },
  },

  {
    id: 'llama-2-13b',
    name: 'Llama 2 13B',
    provider: 'Meta',
    category: 'fast',
    description: 'Modelo open source popular para conversação',
    contextWindow: 4096,
    costPer1kTokens: { input: 0.000005, output: 0.000005 },
    creditsPerToken: { input: 0.00005, output: 0.00005 },
    features: ['Chat', 'Open Source'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'meta-llama/llama-2-13b-chat',
    performance: { speed: 'fast', quality: 'good' },
  },

  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    category: 'fast',
    description: 'Modelo Llama 3.3 de 70B otimizado para chat',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.00002, output: 0.00002 },
    creditsPerToken: { input: 0.0002, output: 0.0002 },
    features: ['Chat', 'Open Source', 'Code'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'meta-llama/llama-3.3-70b-instruct',
    performance: { speed: 'fast', quality: 'good' },
  },

  {
    id: 'grok-3-mini',
    name: 'Grok 3 Mini',
    provider: 'xAI',
    category: 'fast',
    description: 'Variante mais rápida e econômica do Grok 3',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.0005, output: 0.0015 },
    creditsPerToken: { input: 0.004, output: 0.012 },
    features: ['Chat', 'Real-time Info'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'x-ai/grok-3-mini',
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
    creditsPerToken: { input: 0.005, output: 0.012 },
    features: ['Chat', 'Specialized Tasks', 'Fast Response'],
    planRequired: 'FREE',
    isAvailable: true,
    openRouterModel: 'google/gemini-pro',
    performance: { speed: 'fast', quality: 'good' },
  },

  // ===== MODELOS AVANÇADOS (Advanced Models) =====
  // Exatamente como no Kyroia original
  
  // Adicionado conforme solicitação: GPT-5 (Advanced)
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    category: 'advanced',
    description: 'Modelo avançado (mapeado ao GPT-4o)',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.0025, output: 0.01 },
    creditsPerToken: { input: 0.02, output: 0.08 },
    features: ['Chat', 'Vision', 'Function Calling', 'Advanced Reasoning'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'openai/gpt-4o',
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
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'advanced',
    description: 'Modelo avançado da Anthropic com alta qualidade',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    creditsPerToken: { input: 0.025, output: 0.10 },
    features: ['Chat', 'Analysis', 'Code', 'Long Context', 'Vision'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'anthropic/claude-3-5-sonnet-20241022',
    performance: { speed: 'medium', quality: 'excellent' },
  },
  
  {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    category: 'advanced',
    description: 'Modelo avançado da Anthropic',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.003, output: 0.015 },
    creditsPerToken: { input: 0.025, output: 0.10 },
    features: ['Chat', 'Analysis', 'Code', 'Long Context', 'Vision'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'anthropic/claude-3-5-sonnet-20241022',
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
    id: 'perplexity-sonar-pro',
    name: 'Perplexity Sonar Pro',
    provider: 'Perplexity',
    category: 'advanced',
    description: 'Versão Pro do Sonar com capacidades aprimoradas',
    contextWindow: 200000,
    costPer1kTokens: { input: 0.0015, output: 0.0015 },
    creditsPerToken: { input: 0.012, output: 0.012 },
    features: ['Web Search', 'Citations', 'Research'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'perplexity/sonar-pro',
    performance: { speed: 'medium', quality: 'excellent' },
  },

  {
    id: 'perplexity-reasoning',
    name: 'Perplexity Reasoning',
    provider: 'Perplexity',
    category: 'advanced',
    description: 'Modelo focado em raciocínio e pesquisa combinados',
    contextWindow: 128000,
    costPer1kTokens: { input: 0.0015, output: 0.0015 },
    creditsPerToken: { input: 0.012, output: 0.012 },
    features: ['Reasoning', 'Web Search', 'Citations'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'perplexity/sonar-reasoning-pro',
    performance: { speed: 'medium', quality: 'excellent' },
  },

  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    category: 'advanced',
    description: 'Modelo Grok 3 com informações em tempo real',
    contextWindow: 131072,
    costPer1kTokens: { input: 0.002, output: 0.01 },
    creditsPerToken: { input: 0.016, output: 0.08 },
    features: ['Chat', 'Real-time Info', 'Vision'],
    planRequired: 'LITE',
    isAvailable: true,
    openRouterModel: 'x-ai/grok-3',
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
    creditsPerToken: { input: 0.1, output: 0.3 },
    features: ['Advanced Reasoning', 'Problem Solving', 'Real-time Info'],
    planRequired: 'PRO',
    isAvailable: true,
    openRouterModel: 'x-ai/grok-beta',
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
    creditsPerToken: { input: 0.009, output: 0.009 },
    features: ['Chat', 'Reasoning', 'Q&A', 'Problem Solving'],
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
    creditsPerToken: { input: 0.006, output: 0.022 },
    features: ['Chat', 'Reasoning', 'Problem Solving', 'Fast Inference'],
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
]

// Lista ENXUTA permitida (somente estes aparecem no seletor)
export const ALLOWED_MODEL_IDS = new Set<string>([
  // Fast Models
  'gpt-5-mini',
  'gpt-oss',
  'llama-4-scout',
  'deepseek-3.1',
  'gpt-4o-mini',
  'claude-3.5-haiku',
  'gemini-2.5-flash',
  'google-gaia',
  // Advanced Models
  'gpt-5',
  'gpt-4o',
  'claude-4-sonnet',
  'gemini-2.5-pro',
  'llama-4-maverick',
  'perplexity-sonar',
  'sabia-3.1',
  'mistral-large-2',
  'grok-3',
  'amazon-nova-premier',
  // Deep Reasoning
  'grok-4',
  'o3',
  'o4-mini',
  'qwen-qwq',
  'claude-4-sonnet-thinking',
  'deepseek-r1-small',
  'deepseek-r1',
])

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
}

// Categorias para filtros - EXATAMENTE como no Kyroia
export const MODEL_CATEGORIES = {
  fast: 'Modelos Rápidos',
  advanced: 'Modelos Avançados',
  reasoning: 'Raciocínio Profundo',
}

// Função para obter modelos por categoria
export function getModelsByCategory(category: 'fast' | 'advanced' | 'reasoning') {
  return INNERAI_MODELS.filter(model => model.category === category && model.isAvailable && ALLOWED_MODEL_IDS.has(model.id))
}

// Função para obter modelos por plano - EXATAMENTE como no Kyroia
// Ordem desejada por categoria conforme solicitação
export const CATEGORY_ORDER: Record<'fast' | 'advanced' | 'reasoning', string[]> = {
  fast: [
    'gpt-5-mini',
    'gpt-oss',
    'llama-4-scout',
    'deepseek-3.1',
    'gpt-4o-mini',
    'claude-3.5-haiku',
    'gemini-2.5-flash',
    'google-gaia',
  ],
  advanced: [
    'gpt-5',
    'gpt-4o',
    'claude-4-sonnet',
    'gemini-2.5-pro',
    'llama-4-maverick',
    'perplexity-sonar',
    'sabia-3.1',
    'mistral-large-2',
    'grok-3',
    'amazon-nova-premier',
  ],
  reasoning: [
    'grok-4',
    'o3',
    'o4-mini',
    'qwen-qwq',
    'claude-4-sonnet-thinking',
    'deepseek-r1-small',
    'deepseek-r1',
  ],
}

function sortByCategoryOrder(models: typeof INNERAI_MODELS, categories: Array<'fast' | 'advanced' | 'reasoning'>) {
  const byId = new Map(models.map(m => [m.id, m]))
  const result: typeof INNERAI_MODELS = []
  for (const cat of categories) {
    const order = CATEGORY_ORDER[cat]
    // push ordered first
    for (const id of order) {
      const m = byId.get(id)
      if (m && m.category === cat && m.isAvailable) result.push(m)
    }
    // then any remaining available of this category (not listed)
    for (const m of models) {
      if (m.category === cat && m.isAvailable && !order.includes(m.id)) {
        result.push(m)
      }
    }
  }
  return result
}

export function getModelsForPlan(planType: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE') {
  const availableModels = INNERAI_MODELS.filter(model => model.isAvailable && ALLOWED_MODEL_IDS.has(model.id))

  switch (planType) {
    case 'FREE': {
      const fast = availableModels.filter(m => m.category === 'fast')
      return sortByCategoryOrder(fast, ['fast'])
    }
    case 'LITE': {
      const allowed = availableModels.filter(m => m.category === 'fast' || m.category === 'advanced')
      return sortByCategoryOrder(allowed, ['fast', 'advanced'])
    }
    case 'PRO':
    case 'ENTERPRISE': {
      return sortByCategoryOrder(availableModels, ['fast', 'advanced', 'reasoning'])
    }
    default:
      return []
  }
}

// Função para obter modelo por ID
export function getModelById(id: string) {
  const model = INNERAI_MODELS.find(model => model.id === id)
  if (!model) return undefined
  if (!ALLOWED_MODEL_IDS.has(model.id)) return undefined
  if (!model.isAvailable) return undefined
  return model
}

// Função para calcular créditos necessários baseado nos tokens
export function calculateCreditsForTokens(
  modelId: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const model = getModelById(modelId)
  if (!model) {
    return 0
  }
  
  const inputCredits = inputTokens * model.creditsPerToken.input
  const outputCredits = outputTokens * model.creditsPerToken.output
  
  return Math.ceil(inputCredits + outputCredits) // Arredondar para cima
}

// Função para verificar se um modelo consome créditos (não FREE)
export function modelRequiresCredits(modelId: string): boolean {
  const model = getModelById(modelId)
  if (!model) return false
  
  // Modelos FREE não consomem créditos do usuário
  return model.planRequired !== 'FREE'
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
]
