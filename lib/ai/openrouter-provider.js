var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
export class OpenRouterProvider {
    constructor(apiKey) {
        this.id = 'openrouter';
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 segundo
        // Mapa EXATO dos modelos do Kyroia original para OpenRouter
        this.modelMap = {
            // ===== MODELOS RÁPIDOS (Fast Models) =====
            'llama-4-scout': 'meta-llama/llama-3.2-3b-instruct', // Fallback temporário
            'deepseek-3.1': 'deepseek/deepseek-chat', // Fallback temporário
            'gpt-4o-mini': 'openai/gpt-4o-mini',
            'claude-3.5-haiku': 'anthropic/claude-3-5-haiku-20241022',
            'gemini-2.5-flash': 'google/gemini-2.0-flash-exp',
            'google-gaia': 'google/gemini-pro', // Fallback temporário
            // ===== MODELOS AVANÇADOS (Advanced Models) =====
            'gpt-4.1': 'openai/gpt-4-turbo', // Fallback temporário
            'gpt-4o': 'openai/gpt-4o',
            'claude-4-sonnet': 'anthropic/claude-3-5-sonnet-20241022',
            'gemini-2.5-pro': 'google/gemini-pro-1.5', // Fallback temporário
            'llama-4-maverick': 'meta-llama/llama-3.1-405b-instruct',
            'perplexity-sonar': 'perplexity/llama-3.1-sonar-large-128k-online',
            'sabia-3.1': 'maritalk/sabia-3',
            'mistral-large-2': 'mistralai/mistral-large',
            'grok-3': 'x-ai/grok-beta',
            'amazon-nova-premier': 'amazon/nova-pro-v1',
            // ===== RACIOCÍNIO PROFUNDO (Deep Reasoning) =====
            'grok-4': 'x-ai/grok-beta', // Fallback temporário
            'o3': 'openai/o1-preview',
            'o4-mini': 'openai/o1-mini',
            'qwen-qwq': 'qwen/qwq-32b-preview',
            'claude-4-sonnet-thinking': 'anthropic/claude-3-5-sonnet-20241022',
            'deepseek-r1-small': 'deepseek/deepseek-r1',
            'deepseek-r1': 'deepseek/deepseek-r1',
            // Manter alguns modelos legados para compatibilidade
            'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
            'gpt-4': 'openai/gpt-4',
            'gpt-4-turbo': 'openai/gpt-4-turbo-preview'
        };
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
        if (!this.apiKey) {
            console.warn('[OpenRouter] API key not configured');
        }
    }
    // Método para fazer retry com exponential backoff
    async retryRequest(operation, retries = this.maxRetries) {
        let lastError = null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                console.log(`[OpenRouter] Attempt ${attempt}/${retries}`);
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                console.warn(`[OpenRouter] Attempt ${attempt} failed:`, lastError.message);
                // Não fazer retry em erros de autenticação ou quota
                if (lastError.message.includes('401') ||
                    lastError.message.includes('quota') ||
                    lastError.message.includes('billing')) {
                    throw lastError;
                }
                if (attempt < retries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`[OpenRouter] Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new Error('All retries failed');
    }
    // Informações sobre os modelos para exibição
    getModelInfo() {
        return {
            // Modelos OpenAI
            'gpt-4.1': {
                name: 'GPT-4.1',
                description: 'Modelo mais recente e poderoso da OpenAI',
                category: 'advanced',
                contextWindow: 128000,
                strengths: ['Raciocínio avançado', 'Multimodal', 'Velocidade']
            },
            'o3': {
                name: 'o3',
                description: 'Modelo de raciocínio profundo',
                category: 'reasoning',
                contextWindow: 128000,
                strengths: ['Raciocínio step-by-step', 'Resolução de problemas', 'Matemática']
            },
            'o4-mini': {
                name: 'o4 Mini',
                description: 'Modelo de raciocínio otimizado',
                category: 'reasoning',
                contextWindow: 128000,
                strengths: ['Raciocínio rápido', 'Eficiência', 'Precisão']
            },
            'claude-3-opus': {
                name: 'Claude 3 Opus',
                description: 'Modelo mais poderoso da Anthropic',
                category: 'premium',
                contextWindow: 200000,
                strengths: ['Raciocínio complexo', 'Análise profunda', 'Criatividade']
            },
            'claude-3-sonnet': {
                name: 'Claude 3 Sonnet',
                description: 'Equilíbrio entre performance e custo',
                category: 'balanced',
                contextWindow: 200000,
                strengths: ['Versatilidade', 'Velocidade', 'Precisão']
            },
            'claude-3-haiku': {
                name: 'Claude 3 Haiku',
                description: 'Modelo rápido e eficiente',
                category: 'fast',
                contextWindow: 200000,
                strengths: ['Velocidade', 'Custo-benefício', 'Tarefas simples']
            },
            'gemini-pro': {
                name: 'Gemini Pro',
                description: 'Modelo avançado do Google',
                category: 'premium',
                contextWindow: 32000,
                strengths: ['Multimodal', 'Raciocínio', 'Conhecimento atual']
            },
            'mixtral-8x7b': {
                name: 'Mixtral 8x7B',
                description: 'Modelo MoE poderoso e eficiente',
                category: 'balanced',
                contextWindow: 32000,
                strengths: ['Open source', 'Multilíngue', 'Performance']
            },
            'llama-2-70b': {
                name: 'Llama 2 70B',
                description: 'Modelo open source da Meta',
                category: 'balanced',
                contextWindow: 4096,
                strengths: ['Open source', 'Customizável', 'Boa performance']
            },
            'phind-codellama-34b': {
                name: 'Phind CodeLlama',
                description: 'Especializado em programação',
                category: 'code',
                contextWindow: 16000,
                strengths: ['Código', 'Debug', 'Explicações técnicas']
            },
            'deepseek-coder': {
                name: 'DeepSeek Coder',
                description: 'Modelo focado em código',
                category: 'code',
                contextWindow: 16000,
                strengths: ['Programação', 'Algoritmos', 'Refatoração']
            },
            'deepseek-r1': {
                name: 'DeepSeek R1',
                description: 'Modelo avançado de raciocínio (gratuito)',
                category: 'reasoning',
                contextWindow: 128000,
                strengths: ['Raciocínio complexo', 'Análise profunda', 'Resolução de problemas']
            },
            'mythomist-7b': {
                name: 'Mythomist',
                description: 'Modelo criativo para histórias',
                category: 'creative',
                contextWindow: 8192,
                strengths: ['Criatividade', 'Narrativas', 'Roleplay']
            },
            'nous-hermes-2': {
                name: 'Nous Hermes 2',
                description: 'Modelo versátil e preciso',
                category: 'balanced',
                contextWindow: 8192,
                strengths: ['Instruções', 'Versatilidade', 'Consistência']
            },
            // Novos modelos OpenAI
            'gpt-4o': {
                name: 'GPT-4o',
                description: 'Modelo mais recente e poderoso da OpenAI',
                category: 'advanced',
                contextWindow: 128000,
                strengths: ['Raciocínio avançado', 'Multimodal', 'Velocidade']
            },
            'gpt-4o-mini': {
                name: 'GPT-4o Mini',
                description: 'Versão otimizada do GPT-4o',
                category: 'fast',
                contextWindow: 128000,
                strengths: ['Velocidade', 'Eficiência', 'Custo-benefício']
            },
            // Claude atualizado
            'claude-3.5-sonnet': {
                name: 'Claude 3.5 Sonnet',
                description: 'Versão mais recente do Claude Sonnet',
                category: 'advanced',
                contextWindow: 200000,
                strengths: ['Raciocínio', 'Código', 'Análise']
            },
            'claude-3.5-haiku': {
                name: 'Claude 3.5 Haiku',
                description: 'Claude rápido e eficiente atualizado',
                category: 'fast',
                contextWindow: 200000,
                strengths: ['Velocidade', 'Precisão', 'Eficiência']
            },
            'claude-4-sonnet': {
                name: 'Claude 4 Sonnet',
                description: 'Modelo mais recente da Anthropic',
                category: 'advanced',
                contextWindow: 200000,
                strengths: ['Raciocínio avançado', 'Análise profunda', 'Código']
            },
            'claude-4-sonnet-thinking': {
                name: 'Claude 4 Sonnet Thinking',
                description: 'Claude com modo de raciocínio avançado',
                category: 'reasoning',
                contextWindow: 200000,
                strengths: ['Raciocínio profundo', 'Análise detalhada', 'Explicações']
            },
            // Gemini 2
            'gemini-2-flash': {
                name: 'Gemini 2.5 Flash',
                description: 'Modelo rápido do Google com contexto enorme',
                category: 'fast',
                contextWindow: 1048576,
                strengths: ['Contexto gigante', 'Multimodal', 'Velocidade']
            },
            'gemini-2-pro': {
                name: 'Gemini 2.5 Pro',
                description: 'Modelo avançado do Google',
                category: 'advanced',
                contextWindow: 1048576,
                strengths: ['Contexto gigante', 'Análise profunda', 'Multimodal']
            },
            'gemini-2.5-pro': {
                name: 'Gemini 2.5 Pro',
                description: 'Modelo avançado do Google com contexto massivo',
                category: 'advanced',
                contextWindow: 1048576,
                strengths: ['Contexto gigante', 'Análise profunda', 'Multimodal']
            },
            // Grok
            'grok-3': {
                name: 'Grok 3',
                description: 'Modelo mais recente da xAI',
                category: 'advanced',
                contextWindow: 131072,
                strengths: ['Humor', 'Atualidade', 'Personalidade']
            },
            'grok-3-mini': {
                name: 'Grok 3 Mini',
                description: 'Versão rápida do Grok',
                category: 'fast',
                contextWindow: 131072,
                strengths: ['Velocidade', 'Humor', 'Conversação']
            },
            // Perplexity
            'perplexity-sonar-pro': {
                name: 'Perplexity Sonar Pro',
                description: 'Modelo com pesquisa web integrada',
                category: 'research',
                contextWindow: 200000,
                strengths: ['Pesquisa web', 'Atualidade', 'Fontes']
            },
            'perplexity-reasoning': {
                name: 'Perplexity Reasoning Pro',
                description: 'Modelo focado em raciocínio com pesquisa',
                category: 'reasoning',
                contextWindow: 128000,
                strengths: ['Raciocínio', 'Pesquisa', 'Análise']
            },
            // Llama atualizado
            'llama-3.3-70b': {
                name: 'Llama 3.3 70B',
                description: 'Versão mais recente do Llama',
                category: 'balanced',
                contextWindow: 131072,
                strengths: ['Open source', 'Versatilidade', 'Performance']
            },
            'llama-3.1-405b': {
                name: 'Llama 3.1 405B',
                description: 'Maior modelo do Llama',
                category: 'advanced',
                contextWindow: 32768,
                strengths: ['Capacidade máxima', 'Open source', 'Profundidade']
            },
            // Mistral
            'mistral-large-2': {
                name: 'Mistral Large 2',
                description: 'Versão mais recente do Mistral Large',
                category: 'advanced',
                contextWindow: 131072,
                strengths: ['Multilíngue', 'Raciocínio', 'Código']
            },
            // Qwen
            'qwq-32b': {
                name: 'QwQ 32B',
                description: 'Modelo de raciocínio da Qwen',
                category: 'reasoning',
                contextWindow: 131072,
                strengths: ['Raciocínio step-by-step', 'Matemática', 'Lógica']
            },
            'qwen-2.5-72b': {
                name: 'Qwen 2.5 72B',
                description: 'Modelo avançado da Alibaba',
                category: 'advanced',
                contextWindow: 32768,
                strengths: ['Multilíngue', 'Código', 'Análise']
            },
            'qwen-2.5-coder': {
                name: 'Qwen 2.5 Coder',
                description: 'Especializado em programação',
                category: 'code',
                contextWindow: 32768,
                strengths: ['Código', 'Debug', 'Arquitetura']
            },
            // Novos modelos
            'llama-4-maverick': {
                name: 'Llama 4 Maverick',
                description: 'Modelo open source mais poderoso da Meta',
                category: 'advanced',
                contextWindow: 131072,
                strengths: ['Open source', 'Versatilidade', 'Performance']
            },
            'perplexity-sonar': {
                name: 'Perplexity Sonar',
                description: 'Modelo com pesquisa web integrada',
                category: 'advanced',
                contextWindow: 200000,
                strengths: ['Pesquisa web', 'Atualidade', 'Fontes']
            },
            'sabia-3.1': {
                name: 'Sabiá 3.1',
                description: 'Modelo brasileiro otimizado para português',
                category: 'advanced',
                contextWindow: 32768,
                strengths: ['Português nativo', 'Cultura brasileira', 'Regionalização']
            },
            'amazon-nova-premier': {
                name: 'Amazon Nova Premier',
                description: 'Modelo mais poderoso da Amazon',
                category: 'advanced',
                contextWindow: 300000,
                strengths: ['Capacidade máxima', 'Integração AWS', 'Performance']
            },
            'qwen-qwq': {
                name: 'Qwen QwQ',
                description: 'Modelo de raciocínio step-by-step',
                category: 'reasoning',
                contextWindow: 131072,
                strengths: ['Raciocínio detalhado', 'Matemática', 'Lógica']
            },
            'deepseek-r1-small': {
                name: 'Deepseek R1 Small',
                description: 'Modelo de raciocínio eficiente',
                category: 'reasoning',
                contextWindow: 128000,
                strengths: ['Raciocínio rápido', 'Eficiência', 'Custo-benefício']
            }
        };
    }
    getOpenRouterModel(model) {
        return this.modelMap[model] || model;
    }
    async generateResponse(messages, model) {
        if (!this.apiKey) {
            throw new Error('[OpenRouter] API key not configured');
        }
        const openRouterModel = this.getOpenRouterModel(model);
        console.log(`[OpenRouter] Generating response with model: ${openRouterModel}`);
        return this.retryRequest(async () => {
            var _a, _b, _c, _d, _e;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
            try {
                const response = await fetch(`${this.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'Kyroia Clone'
                    },
                    body: JSON.stringify({
                        model: openRouterModel,
                        messages: messages.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        temperature: 0.7,
                        max_tokens: 4096,
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = ((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) || errorMessage;
                    }
                    catch (_f) {
                        // Se não conseguir parsear, usar a mensagem de status HTTP
                    }
                    console.error(`[OpenRouter] API Error: ${errorMessage}`);
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                if (!((_d = (_c = (_b = data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content)) {
                    throw new Error('[OpenRouter] Invalid response format');
                }
                // Calcular custos aproximados (OpenRouter fornece isso na resposta)
                const usage = data.usage || {};
                const promptTokens = usage.prompt_tokens || 0;
                const completionTokens = usage.completion_tokens || 0;
                const totalTokens = promptTokens + completionTokens;
                // OpenRouter retorna o custo real na resposta
                const cost = ((_e = data.usage) === null || _e === void 0 ? void 0 : _e.total_cost) || this.estimateCost(model, promptTokens, completionTokens);
                console.log(`[OpenRouter] Success: ${completionTokens} tokens, $${cost.toFixed(6)}`);
                return {
                    content: data.choices[0].message.content,
                    tokensUsed: {
                        input: promptTokens,
                        output: completionTokens,
                        total: totalTokens
                    },
                    cost,
                    model: openRouterModel
                };
            }
            catch (error) {
                clearTimeout(timeoutId);
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new Error('[OpenRouter] Request timeout after 30 seconds');
                }
                throw error;
            }
        });
    }
    streamResponse(messages, model, _options) {
        return __asyncGenerator(this, arguments, function* streamResponse_1() {
            var _a, _b, _c, _d;
            const openRouterModel = this.getOpenRouterModel(model);
            try {
                const response = yield __await(fetch(`${this.baseURL}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                        'X-Title': 'Kyroia Clone'
                    },
                    body: JSON.stringify({
                        model: openRouterModel,
                        messages: messages.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content
                        })),
                        temperature: 0.7,
                        max_tokens: 4096,
                        stream: true
                    })
                }));
                if (!response.ok) {
                    const error = yield __await(response.json());
                    throw new Error(((_a = error.error) === null || _a === void 0 ? void 0 : _a.message) || 'OpenRouter API error');
                }
                const reader = (_b = response.body) === null || _b === void 0 ? void 0 : _b.getReader();
                const decoder = new TextDecoder();
                if (!reader) {
                    throw new Error('No response body');
                }
                while (true) {
                    const { done, value } = yield __await(reader.read());
                    if (done)
                        break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]')
                                continue;
                            try {
                                const parsed = JSON.parse(data);
                                const token = (_d = (_c = parsed.choices[0]) === null || _c === void 0 ? void 0 : _c.delta) === null || _d === void 0 ? void 0 : _d.content;
                                if (token) {
                                    yield yield __await(token);
                                }
                            }
                            catch (_e) {
                                // Ignorar erros de parsing
                            }
                        }
                    }
                }
            }
            catch (error) {
                console.error('OpenRouter streaming error:', error);
                throw error;
            }
        });
    }
    estimateCost(model, inputTokens, outputTokens) {
        // Custos aproximados por 1k tokens (você pode ajustar com valores reais)
        const costs = {
            'claude-3-opus': { input: 0.015, output: 0.075 },
            'claude-3-sonnet': { input: 0.003, output: 0.015 },
            'claude-3-haiku': { input: 0.00025, output: 0.00125 },
            'claude-2.1': { input: 0.008, output: 0.024 },
            'claude-2': { input: 0.008, output: 0.024 },
            'gemini-pro': { input: 0.00025, output: 0.0005 },
            'gemini-pro-vision': { input: 0.00025, output: 0.0005 },
            'palm-2': { input: 0.0005, output: 0.0005 },
            'llama-2-70b': { input: 0.0007, output: 0.0009 },
            'llama-2-13b': { input: 0.0001, output: 0.0001 },
            'codellama-70b': { input: 0.0007, output: 0.0009 },
            'mixtral-8x7b': { input: 0.00027, output: 0.00027 },
            'mistral-7b': { input: 0.00006, output: 0.00006 },
            'nous-hermes-2': { input: 0.00027, output: 0.00027 },
            'openhermes-2.5': { input: 0.00006, output: 0.00006 },
            'zephyr-7b': { input: 0.00006, output: 0.00006 },
            'phind-codellama-34b': { input: 0.0004, output: 0.0004 },
            'deepseek-coder': { input: 0.0004, output: 0.0004 },
            'deepseek-r1': { input: 0.0, output: 0.0 }, // Modelo gratuito
            'wizardcoder-33b': { input: 0.0004, output: 0.0004 },
            'mythomist-7b': { input: 0.00006, output: 0.00006 },
            'cinematika-7b': { input: 0.00006, output: 0.00006 },
            'neural-chat-7b': { input: 0.00006, output: 0.00006 },
            // Novos modelos
            'gpt-4.1': { input: 0.005, output: 0.015 },
            'gpt-4o': { input: 0.0025, output: 0.01 },
            'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
            'o3': { input: 0.015, output: 0.06 },
            'o4-mini': { input: 0.003, output: 0.012 },
            'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
            'claude-4-sonnet': { input: 0.003, output: 0.015 },
            'claude-4-sonnet-thinking': { input: 0.003, output: 0.015 },
            'claude-3.5-haiku': { input: 0.0008, output: 0.004 },
            'gemini-2-flash': { input: 0.0003, output: 0.0025 },
            'gemini-2-pro': { input: 0.00125, output: 0.01 },
            'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
            'gemini-2-flash-free': { input: 0.0, output: 0.0 },
            'grok-3': { input: 0.003, output: 0.015 },
            'grok-3-mini': { input: 0.0003, output: 0.0005 },
            'grok-2-vision': { input: 0.002, output: 0.01 },
            'perplexity-sonar-pro': { input: 0.003, output: 0.015 },
            'perplexity-sonar': { input: 0.003, output: 0.015 },
            'perplexity-reasoning': { input: 0.002, output: 0.008 },
            'llama-3.3-70b': { input: 0.000039, output: 0.00012 },
            'llama-3.2-90b-vision': { input: 0.0012, output: 0.0012 },
            'llama-3.1-405b': { input: 0.0008, output: 0.0008 },
            'llama-4-maverick': { input: 0.0008, output: 0.0008 },
            'qwen-qwq': { input: 0.000075, output: 0.00015 },
            'qwq-32b': { input: 0.000075, output: 0.00015 },
            'qwen-2.5-72b': { input: 0.00012, output: 0.00039 },
            'qwen-2.5-coder': { input: 0.00006, output: 0.00015 },
            'mistral-large-2': { input: 0.002, output: 0.006 },
            'sabia-3.1': { input: 0.002, output: 0.008 },
            'amazon-nova-premier': { input: 0.008, output: 0.032 },
            'deepseek-r1-small': { input: 0.00014, output: 0.00055 }
        };
        const modelCosts = costs[model] || { input: 0.001, output: 0.001 };
        return (inputTokens / 1000 * modelCosts.input) + (outputTokens / 1000 * modelCosts.output);
    }
    isConfigured() {
        // Verificar novamente a variável de ambiente se não tiver chave
        if (!this.apiKey && process.env.OPENROUTER_API_KEY) {
            this.apiKey = process.env.OPENROUTER_API_KEY;
        }
        return !!this.apiKey;
    }
    getAvailableModels() {
        // Os modelos agora são gerenciados pela configuração centralizada do Kyroia
        // Esta função é mantida para compatibilidade, mas não é mais usada
        return [];
    }
    estimateTokens(text, model) {
        // Estimativa simples: ~4 caracteres por token
        return Math.ceil(text.length / 4);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbnJvdXRlci1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9wZW5yb3V0ZXItcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUVBLE1BQU0sT0FBTyxrQkFBa0I7SUFPN0IsWUFBWSxNQUFlO1FBTlgsT0FBRSxHQUFHLFlBQVksQ0FBQTtRQUV6QixZQUFPLEdBQUcsOEJBQThCLENBQUE7UUFDeEMsZUFBVSxHQUFHLENBQUMsQ0FBQTtRQUNkLGVBQVUsR0FBRyxJQUFJLENBQUEsQ0FBQyxZQUFZO1FBMEN0Qyw2REFBNkQ7UUFDckQsYUFBUSxHQUEyQjtZQUN6Qyw0Q0FBNEM7WUFDNUMsZUFBZSxFQUFFLGtDQUFrQyxFQUFFLHNCQUFzQjtZQUMzRSxjQUFjLEVBQUUsd0JBQXdCLEVBQUUsc0JBQXNCO1lBQ2hFLGFBQWEsRUFBRSxvQkFBb0I7WUFDbkMsa0JBQWtCLEVBQUUscUNBQXFDO1lBQ3pELGtCQUFrQixFQUFFLDZCQUE2QjtZQUNqRCxhQUFhLEVBQUUsbUJBQW1CLEVBQUUsc0JBQXNCO1lBRTFELGtEQUFrRDtZQUNsRCxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsc0JBQXNCO1lBQ3ZELFFBQVEsRUFBRSxlQUFlO1lBQ3pCLGlCQUFpQixFQUFFLHNDQUFzQztZQUN6RCxnQkFBZ0IsRUFBRSx1QkFBdUIsRUFBRSxzQkFBc0I7WUFDakUsa0JBQWtCLEVBQUUsb0NBQW9DO1lBQ3hELGtCQUFrQixFQUFFLDhDQUE4QztZQUNsRSxXQUFXLEVBQUUsa0JBQWtCO1lBQy9CLGlCQUFpQixFQUFFLHlCQUF5QjtZQUM1QyxRQUFRLEVBQUUsZ0JBQWdCO1lBQzFCLHFCQUFxQixFQUFFLG9CQUFvQjtZQUUzQyxtREFBbUQ7WUFDbkQsUUFBUSxFQUFFLGdCQUFnQixFQUFFLHNCQUFzQjtZQUNsRCxJQUFJLEVBQUUsbUJBQW1CO1lBQ3pCLFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0IsVUFBVSxFQUFFLHNCQUFz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