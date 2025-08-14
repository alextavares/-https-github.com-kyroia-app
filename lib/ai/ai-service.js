var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { OpenAIProvider } from './openai-provider';
import { OpenRouterProvider } from './openrouter-provider';
import { INNERAI_MODELS, getModelsForPlan, getModelById } from './innerai-models-config';
class AIService {
    constructor() {
        this.providers = new Map();
        // Modelo padrão preferindo OpenRouter (ID do catálogo interno)
        this.defaultModel = 'gpt-4o-mini';
        // Initialize providers
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('openrouter', new OpenRouterProvider());
    }
    getProvider(providerName) {
        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }
        return provider;
    }
    async generateResponse(messages, model = this.defaultModel, options) {
        console.log(`[AIService] Generating response for model: ${model}`);
        try {
            const modelForProvider = model.startsWith('openrouter/')
                ? model.replace(/^openrouter\//, '')
                : model;
            // Primeiro, tentar o provider específico para o modelo
            const provider = this.getProviderForModel(model);
            console.log(`[AIService] Using provider: ${provider.id}`);
            return await provider.generateResponse(messages, modelForProvider, options);
        }
        catch (error) {
            console.warn(`[AIService] Primary provider failed:`, error);
            // Tentar fallback se disponível
            try {
                const fallbackProvider = this.getFallbackProvider(model);
                if (fallbackProvider) {
                    console.log(`[AIService] Trying fallback provider: ${fallbackProvider.id}`);
                    return await fallbackProvider.generateResponse(messages, model, options);
                }
            }
            catch (fallbackError) {
                console.error(`[AIService] Fallback provider also failed:`, fallbackError);
            }
            // Se tudo falhou, lançar o erro original
            throw error;
        }
    }
    async streamResponse(messages, model = this.defaultModel, options) {
        const provider = this.getProviderForModel(model);
        if (!provider.streamResponse) {
            throw new Error(`Streaming not supported for model ${model}`);
        }
        const modelForProvider = model.startsWith('openrouter/')
            ? model.replace(/^openrouter\//, '')
            : model;
        return provider.streamResponse(messages, modelForProvider, options);
    }
    async streamResponseWithCallbacks(messages, model = this.defaultModel, options) {
        var _a, e_1, _b, _c;
        try {
            const generator = await this.streamResponse(messages, model, options);
            let fullContent = '';
            try {
                for (var _d = true, generator_1 = __asyncValues(generator), generator_1_1; generator_1_1 = await generator_1.next(), _a = generator_1_1.done, !_a; _d = true) {
                    _c = generator_1_1.value;
                    _d = false;
                    const token = _c;
                    fullContent += token;
                    if (options.onToken) {
                        options.onToken(token);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = generator_1.return)) await _b.call(generator_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // Calculate tokens and cost
            const tokensUsed = {
                input: this.estimateTokens(messages.map(m => m.content).join(' '), model),
                output: this.estimateTokens(fullContent, model),
                total: 0
            };
            tokensUsed.total = tokensUsed.input + tokensUsed.output;
            const modelInfo = this.getAllAvailableModels().find(m => m.id === model);
            const cost = modelInfo ?
                (tokensUsed.input * modelInfo.costPerInputToken +
                    tokensUsed.output * modelInfo.costPerOutputToken) : 0;
            if (options.onComplete) {
                options.onComplete({ tokensUsed, cost });
            }
        }
        catch (error) {
            if (options.onError) {
                options.onError(error);
            }
            else {
                throw error;
            }
        }
    }
    estimateTokens(text, model) {
        const provider = this.getProviderForModel(model);
        return provider.estimateTokens(text, model);
    }
    getAllAvailableModels() {
        // Usar a configuração exata do Kyroia
        return INNERAI_MODELS
            .filter((model) => model.isAvailable)
            .map((model) => {
            var _a;
            return ({
                id: model.id,
                name: model.name,
                provider: model.provider,
                contextLength: model.contextWindow,
                costPerInputToken: model.costPer1kTokens.input / 1000,
                costPerOutputToken: model.costPer1kTokens.output / 1000,
                features: model.features,
                category: model.category,
                planRequired: model.planRequired,
                // Ajuste para satisfazer AIModel: incluir maxTokens
                maxTokens: (_a = model.maxTokens) !== null && _a !== void 0 ? _a : model.contextWindow
            });
        });
    }
    getModelsForPlan(planType) {
        // Usar a função da configuração exata do Kyroia
        return getModelsForPlan(planType).map((model) => {
            var _a;
            return ({
                id: model.id,
                name: model.name,
                provider: model.provider,
                contextLength: model.contextWindow,
                costPerInputToken: model.costPer1kTokens.input / 1000,
                costPerOutputToken: model.costPer1kTokens.output / 1000,
                features: model.features,
                category: model.category,
                planRequired: model.planRequired,
                // Ajuste para satisfazer AIModel: incluir maxTokens
                maxTokens: (_a = model.maxTokens) !== null && _a !== void 0 ? _a : model.contextWindow
            });
        });
    }
    getProviderForModel(model) {
        // Permitir o ID direto do OpenRouter como atalho (ex.: 'openrouter/horizon-beta')
        if (model.startsWith('openrouter/')) {
            const openRouterProvider = this.getProvider('openrouter');
            if (openRouterProvider.isConfigured())
                return openRouterProvider;
            throw new Error(`No configured provider found for model: ${model}`);
        }
        // Normalizar ID para busca no catálogo interno (remove prefixos como 'openai/' ou 'anthropic/')
        const lookupId = model.includes('/') ? model.split('/').pop() : model;
        // Buscar modelo na configuração do Kyroia
        const innerAIModel = getModelById(lookupId);
        if (!innerAIModel) {
            throw new Error(`Model ${model} not found in Kyroia configuration`);
        }
        if (!innerAIModel.isAvailable) {
            throw new Error(`Model ${model} is not available`);
        }
        // Usar OpenRouter para todos os modelos exceto modelos nativos da OpenAI
        const nativeOpenAIModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
        if (nativeOpenAIModels.includes(lookupId)) {
            // Tentar OpenAI primeiro, fallback para OpenRouter
            const openaiProvider = this.getProvider('openai');
            if (openaiProvider.isConfigured()) {
                return openaiProvider;
            }
        }
        // Usar OpenRouter para todos os outros modelos (incluindo fallback)
        const openRouterProvider = this.getProvider('openrouter');
        if (openRouterProvider.isConfigured()) {
            return openRouterProvider;
        }
        throw new Error(`No configured provider found for model: ${model}`);
    }
    getFallbackProvider(model) {
        // Tentar outros providers disponíveis como fallback
        const allProviders = Array.from(this.providers.values());
        for (const provider of allProviders) {
            try {
                if (provider.isConfigured()) {
                    // Verificar se o provider tem o modelo ou pode usar um similar
                    const availableModels = provider.getAvailableModels();
                    const hasModel = availableModels.some(m => m.id === model);
                    if (hasModel) {
                        return provider;
                    }
                }
            }
            catch (error) {
                console.warn(`[AIService] Error checking fallback provider ${provider.id}:`, error);
            }
        }
        return null;
    }
}
export const aiService = new AIService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFpLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUUxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBZ0J4RixNQUFNLFNBQVM7SUFLYjtRQUpRLGNBQVMsR0FBNEIsSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUN0RCwrREFBK0Q7UUFDOUMsaUJBQVksR0FBRyxhQUFhLENBQUE7UUFHM0MsdUJBQXVCO1FBQ3ZCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLGNBQWMsRUFBRSxDQUFDLENBQUE7UUFDbEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFBO0lBQzVELENBQUM7SUFFRCxXQUFXLENBQUMsWUFBb0I7UUFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7UUFDakQsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLFlBQVksWUFBWSxDQUFDLENBQUE7UUFDdkQsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFBO0lBQ2pCLENBQUM7SUFFRCxLQUFLLENBQUMsZ0JBQWdCLENBQ3BCLFFBQXFCLEVBQ3JCLFFBQWdCLElBQUksQ0FBQyxZQUFZLEVBQ2pDLE9BSUM7UUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLDhDQUE4QyxLQUFLLEVBQUUsQ0FBQyxDQUFBO1FBRWxFLElBQUksQ0FBQztZQUNILE1BQU0sZ0JBQWdCLEdBQUcs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