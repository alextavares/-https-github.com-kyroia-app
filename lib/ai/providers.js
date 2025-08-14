var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import OpenAI from "openai";
export function getProviderConfig() {
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openaiKey) {
        return {
            name: "openai",
            apiKey: openaiKey,
            model: "gpt-4o-mini",
        };
    }
    if (openrouterKey) {
        return {
            name: "openrouter",
            apiKey: openrouterKey,
            baseURL: "https://openrouter.ai/api/v1",
            model: "openai/gpt-4o-mini",
        };
    }
    throw new Error("Nenhuma chave de API configurada. Configure OPENAI_API_KEY ou OPENROUTER_API_KEY.");
}
export function createOpenAIClient(cfg) {
    return new OpenAI({
        apiKey: cfg.apiKey,
        baseURL: cfg.baseURL,
    });
}
// Streaming helper minimalista sem depender do pacote "ai"
// Retorna uma Response SSE com os deltas de conteúdo
export async function streamChatCompletion(messages, cfg) {
    const openai = createOpenAIClient(cfg);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            var _a, e_1, _b, _c;
            var _d, _e, _f, _g;
            try {
                // Força o tipo para evitar fricção com tipos de conteúdo multimodal
                const chatStream = await openai.chat.completions.create({
                    model: cfg.model,
                    // @ts-ignore – passamos o array já na forma esperada pelo SDK
                    messages,
                    stream: true,
                });
                try {
                    for (var _h = true, _j = __asyncValues(chatStream), _k; _k = await _j.next(), _a = _k.done, !_a; _h = true) {
                        _c = _k.value;
                        _h = false;
                        const chunk = _c;
                        const delta = (_g = (_f = (_e = (_d = chunk === null || chunk === void 0 ? void 0 : chunk.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.delta) === null || _f === void 0 ? void 0 : _f.content) !== null && _g !== void 0 ? _g : '';
                        if (delta) {
                            const payload = `data: ${JSON.stringify({ delta })}\n\n`;
                            controller.enqueue(encoder.encode(payload));
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_h && !_a && (_b = _j.return)) await _b.call(_j);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
            catch (err) {
                const message = (err && typeof err === 'object' && 'message' in err)
                    ? String(err.message)
                    : 'stream error';
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
        }
    });
    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvdmlkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFTNUIsTUFBTSxVQUFVLGlCQUFpQjtJQUMvQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDO0lBRXJELElBQUksU0FBUyxFQUFFLENBQUM7UUFDZCxPQUFPO1lBQ0wsSUFBSSxFQUFFLFFBQVE7WUFDZCxNQUFNLEVBQUUsU0FBUztZQUNqQixLQUFLLEVBQUUsYUFBYTtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVELElBQUksYUFBYSxFQUFFLENBQUM7UUFDbEIsT0FBTztZQUNMLElBQUksRUFBRSxZQUFZO1lBQ2xCLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLE9BQU8sRUFBRSw4QkFBOEI7WUFDdkMsS0FBSyxFQUFFLG9CQUFvQjtTQUM1QixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQ2IsbUZBQW1GLENBQ3BGLENBQUM7QUFDSixDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEdBQW1CO0lBQ3BELE9BQU8sSUFBSSxNQUFNLENBQUM7UUFDaEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1FBQ2xCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztLQUNyQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsMkRBQTJEO0FBQzNELHFEQUFxRDtBQUNyRCxNQUFNLENBQUMsS0FBSyxVQUFVLG9CQUFvQixDQUN4QyxRQUFrRCxFQUNsRCxHQUFtQjtJQUVuQixNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksY0FBYyxDQUFhO1FBQzVDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVTs7O1lBQ3BCLElBQUksQ0FBQztnQkFDSCxvRUFBb0U7Z0JBQ3BFLE1BQU0sVUFBVSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO29CQUN0RCxLQUFLLEVBQUUsR0FBRyxDQUFDLEtBQUs7b0JBQ2hCLDhEQUE4RDtvQkFDOUQsUUFBUTtvQkFDUixNQUFNLEVBQUUsSUFBSTtpQkFDTixDQUFDLENBQUM7O29CQUVWLEtBQTBCLGVBQUEsS0FBQSxjQUFBLFVBQWlCLENBQUEsSUFBQSxzREFBRSxDQUFDO3dCQUFwQixjQUFpQjt3QkFBakIsV0FBaUI7d0JBQWhDLE1BQU0sS0FBSyxLQUFBLENBQUE7d0JBQ3BCLE1BQU0sS0FBSyxHQUFHLE1BQUEsTUFBQSxNQUFBLE1BQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLE9BQU8sMENBQUcsQ0FBQyxDQUFDLDBDQUFFLEtBQUssMENBQUUsT0FBTyxtQ0FBSSxFQUFFLENBQUM7d0JBQ3hELElBQUksS0FBSyxFQUFFLENBQUM7NEJBQ1YsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDOzRCQUN6RCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDOUMsQ0FBQztvQkFDSCxDQUFDOzs7Ozs7Ozs7Z0JBQ0QsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDdkQsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLENBQUM7WUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNiLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxTQUFTLElBQUksR0FBRyxDQUFDO29CQUNsRSxDQUFDLENBQUMsTUFBTSxDQUFFLEdBQWEsQ0FBQyxPQUFPLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQ25CLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDdEYsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDdkQsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JCLENBQUM7UUFDSCxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDMUIsTUFBTSxFQUFFLEdBQUc7UUFDWCxPQUFPLEVBQUU7WUFDUCxjQUFjLEVBQUUsa0NBQWtDO1lBQ2xELGVBQWUsRUFBRSx3QkFBd0I7WUFDekMsWUFBWSxFQUFFLFlBQVk7WUFDMUIsbUJBQW1CLEVBQUUsSUFBSTtTQUMxQjtLQUNGLENBQUMsQ0FBQztBQUNMLENBQUMifQ==