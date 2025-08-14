var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
import OpenAI from 'openai';
// Token estimation for OpenAI models (rough estimation)
function estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
}
export class OpenAIProvider {
    constructor() {
        this.id = 'openai';
        this.openai = null;
        this.models = [
            {
                id: 'gpt-3.5-turbo',
                name: 'GPT-3.5 Turbo',
                provider: 'openai',
                maxTokens: 4096,
                costPerInputToken: 0.0015 / 1000, // $0.0015 per 1k tokens
                costPerOutputToken: 0.002 / 1000, // $0.002 per 1k tokens
            },
            {
                id: 'gpt-4',
                name: 'GPT-4',
                provider: 'openai',
                maxTokens: 8192,
                costPerInputToken: 0.03 / 1000, // $0.03 per 1k tokens
                costPerOutputToken: 0.06 / 1000, // $0.06 per 1k tokens
            },
            {
                id: 'gpt-4-turbo',
                name: 'GPT-4 Turbo',
                provider: 'openai',
                maxTokens: 128000,
                costPerInputToken: 0.01 / 1000, // $0.01 per 1k tokens
                costPerOutputToken: 0.03 / 1000, // $0.03 per 1k tokens
            },
            {
                id: 'gpt-4-vision-preview',
                name: 'GPT-4 Vision',
                provider: 'openai',
                maxTokens: 4096,
                costPerInputToken: 0.01 / 1000, // $0.01 per 1k tokens
                costPerOutputToken: 0.03 / 1000, // $0.03 per 1k tokens
            }
        ];
        this.apiKey = process.env.OPENAI_API_KEY;
        if (this.apiKey) {
            this.openai = new OpenAI({ apiKey: this.apiKey });
        }
    }
    async generateResponse(messages, model, options) {
        var _a, _b;
        if (!this.openai) {
            throw new Error('OpenAI API key not configured');
        }
        try {
            const completion = await this.openai.chat.completions.create({
                model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                max_tokens: (options === null || options === void 0 ? void 0 : options.maxTokens) || 1000,
                temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7,
            });
            const response = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
            const usage = completion.usage;
            const inputTokens = (usage === null || usage === void 0 ? void 0 : usage.prompt_tokens) || 0;
            const outputTokens = (usage === null || usage === void 0 ? void 0 : usage.completion_tokens) || 0;
            const totalTokens = (usage === null || usage === void 0 ? void 0 : usage.total_tokens) || 0;
            const modelInfo = this.models.find(m => m.id === model);
            const cost = modelInfo ?
                (inputTokens * modelInfo.costPerInputToken) +
                    (outputTokens * modelInfo.costPerOutputToken) : 0;
            return {
                content: response,
                tokensUsed: {
                    input: inputTokens,
                    output: outputTokens,
                    total: totalTokens
                },
                cost,
                model
            };
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            throw new Error('Erro ao gerar resposta com OpenAI');
        }
    }
    estimateTokens(text, model) {
        return estimateTokens(text);
    }
    getAvailableModels() {
        return this.models;
    }
    isConfigured() {
        return !!this.apiKey;
    }
    streamResponse(messages, model, options) {
        return __asyncGenerator(this, arguments, function* streamResponse_1() {
            var _a, e_1, _b, _c;
            var _d, _e;
            if (!this.openai) {
                throw new Error('OpenAI API key not configured');
            }
            try {
                // Verificar se o modelo suporta imagens
                const visionModels = ['gpt-4-vision-preview', 'gpt-4-turbo', 'gpt-4o'];
                const supportsImages = visionModels.includes(model);
                // Processar mensagens para remover imagens se o modelo não suporta
                const processedMessages = messages.map(msg => {
                    if (typeof msg.content === 'string') {
                        return {
                            role: msg.role,
                            content: msg.content
                        };
                    }
                    // Se for array de conteúdo (com imagens)
                    if (Array.isArray(msg.content)) {
                        if (supportsImages) {
                            return {
                                role: msg.role,
                                content: msg.content
                            };
                        }
                        else {
                            // Extrair apenas o texto se o modelo não suporta imagens
                            const textContent = msg.content
                                .filter((part) => part.type === 'text')
                                .map((part) => part.text)
                                .join('\n');
                            return {
                                role: msg.role,
                                content: textContent
                            };
                        }
                    }
                    return {
                        role: msg.role,
                        content: msg.content
                    };
                });
                const stream = yield __await(this.openai.chat.completions.create({
                    model,
                    // @ts-ignore – compatibilidade com conteúdos multimodais em diferentes versões do SDK
                    messages: processedMessages,
                    max_tokens: (options === null || options === void 0 ? void 0 : options.maxTokens) || 1000,
                    temperature: (options === null || options === void 0 ? void 0 : options.temperature) || 0.7,
                    stream: true,
                }));
                try {
                    for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield __await(stream_1.next()), _a = stream_1_1.done, !_a; _f = true) {
                        _c = stream_1_1.value;
                        _f = false;
                        const chunk = _c;
                        const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || '';
                        if (content) {
                            yield yield __await(content);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_f && !_a && (_b = stream_1.return)) yield __await(_b.call(stream_1));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            catch (error) {
                console.error('OpenAI streaming error:', error);
                throw new Error('Erro ao fazer streaming da resposta');
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFpLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3BlbmFpLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBRzNCLHdEQUF3RDtBQUN4RCxTQUFTLGNBQWMsQ0FBQyxJQUFZO0lBQ2xDLDRDQUE0QztJQUM1QyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtBQUNuQyxDQUFDO0FBRUQsTUFBTSxPQUFPLGNBQWM7SUF1Q3pCO1FBdENTLE9BQUUsR0FBRyxRQUFRLENBQUE7UUFFZCxXQUFNLEdBQWtCLElBQUksQ0FBQTtRQUM1QixXQUFNLEdBQWM7WUFDMUI7Z0JBQ0UsRUFBRSxFQUFFLGVBQWU7Z0JBQ25CLElBQUksRUFBRSxlQUFlO2dCQUNyQixRQUFRLEVBQUUsUUFBUTtnQkFDbEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsaUJBQWlCLEVBQUUsTUFBTSxHQUFHLElBQUksRUFBRSx3QkFBd0I7Z0JBQzFELGtCQUFrQixFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUcsdUJBQXVCO2FBQzNEO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLE9BQU87Z0JBQ1gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLGlCQUFpQixFQUFFLElBQUksR0FBRyxJQUFJLEVBQUksc0JBQXNCO2dCQUN4RCxrQkFBa0IsRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFHLHNCQUFzQjthQUN6RDtZQUNEO2dCQUNFLEVBQUUsRUFBRSxhQUFhO2dCQUNqQixJQUFJLEVBQUUsYUFBYTtnQkFDbkIsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixpQkFBaUIsRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFJLHNCQUFz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