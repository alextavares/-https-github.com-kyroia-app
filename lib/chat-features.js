import { z } from 'zod';
/* keep single source of truth for schemas (avoid re-declare conflicts) */
export const ChatMessageSchema = z.object({
    content: z.string().min(1).max(32000),
    attachments: z.array(z.object({
        type: z.enum(['image', 'document', 'audio', 'video']),
        name: z.string(),
        url: z.string(),
        size: z.number(),
        mimeType: z.string()
    })).optional(),
    sessionId: z.string().uuid(),
    parentMessageId: z.string().uuid().optional()
});
/* keep single source of truth for schemas (avoid re-declare conflicts) */
export const ChatSettingsSchema = z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().min(1).max(8192).default(2048),
    topP: z.number().min(0).max(1).default(1),
    frequencyPenalty: z.number().min(-2).max(2).default(0),
    presencePenalty: z.number().min(-2).max(2).default(0),
    systemPrompt: z.string().max(2000).optional(),
    autoSave: z.boolean().default(true),
    codeHighlighting: z.boolean().default(true),
    mathRendering: z.boolean().default(true)
});
export class ChatFeatures {
    // Advanced conversation management
    static async createChatSession(userId, title, model, settings) {
        const defaultSettings = Object.assign({ temperature: 0.7, maxTokens: 2048, topP: 1, frequencyPenalty: 0, presencePenalty: 0, autoSave: true, codeHighlighting: true, mathRendering: true }, settings);
        return {
            id: crypto.randomUUID(),
            userId,
            title,
            model,
            createdAt: new Date(),
            updatedAt: new Date(),
            messageCount: 0,
            isArchived: false,
            tags: [],
            settings: defaultSettings
        };
    }
    // Message branching and regeneration
    static async regenerateMessage(sessionId, messageId, newSettings) {
        // This would integrate with the AI service to regenerate
        // the message with different parameters
        throw new Error('Not implemented - requires AI service integration');
    }
    // Smart message summarization
    static async summarizeConversation(messages) {
        const conversationText = messages
            .filter(m => m.role !== 'system')
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');
        // This would use a fast model to create a summary
        return `Conversa sobre: ${conversationText.slice(0, 100)}...`;
    }
    // Context-aware suggestions
    static getMessageSuggestions(messages, currentInput) {
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'assistant') {
            return [
                'Pode me ajudar com...',
                'Explique como...',
                'Qual é a diferença entre...',
                'Me dê exemplos de...'
            ];
        }
        // Context-aware suggestions based on conversation
        if (lastMessage.content.includes('código') || lastMessage.content.includes('programação')) {
            return [
                'Pode explicar este código?',
                'Como posso otimizar isso?',
                'Há algum bug neste código?',
                'Pode refatorar este código?'
            ];
        }
        if (lastMessage.content.includes('erro') || lastMessage.content.includes('problema')) {
            return [
                'Como posso resolver isso?',
                'Quais são as possíveis causas?',
                'Pode me dar uma solução alternativa?',
                'Como prevenir isso no futuro?'
            ];
        }
        return [
            'Continue...',
            'Pode elaborar mais?',
            'Tem algum exemplo?',
            'E quanto a...?'
        ];
    }
    // Advanced search and filtering
    static searchMessages(messages, query, filters) {
        let filtered = messages;
        if (filters === null || filters === void 0 ? void 0 : filters.role) {
            filtered = filtered.filter(m => m.role === filters.role);
        }
        if (filters === null || filters === void 0 ? void 0 : filters.dateRange) {
            filtered = filtered.filter(m => m.timestamp >= filters.dateRange.start &&
                m.timestamp <= filters.dateRange.end);
        }
        if ((filters === null || filters === void 0 ? void 0 : filters.hasAttachments) !== undefined) {
            filtered = filtered.filter(m => filters.hasAttachments ?
                (m.attachments && m.attachments.length > 0) :
                (!m.attachments || m.attachments.length === 0));
        }
        // Simple text search
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filtered = filtered.filter(m => m.content.toLowerCase().includes(searchTerm));
        }
        return filtered;
    }
    // Export conversation in various formats
    static exportConversation(session, messages, format) {
        switch (format) {
            case 'markdown':
                let markdown = `# ${session.title}\n\n`;
                markdown += `**Modelo:** ${session.model}\n`;
                markdown += `**Data:** ${session.createdAt.toLocaleDateString()}\n\n`;
                messages.forEach(msg => {
                    var _a;
                    const role = msg.role === 'user' ? '👤 **Você**' : '🤖 **AI**';
                    markdown += `## ${role}\n\n${msg.content}\n\n`;
                    if ((_a = msg.attachments) === null || _a === void 0 ? void 0 : _a.length) {
                        markdown += `**Anexos:** ${msg.attachments.map(a => a.name).join(', ')}\n\n`;
                    }
                });
                return markdown;
            case 'json':
                return JSON.stringify({ session, messages }, null, 2);
            case 'txt':
                let text = `${session.title}\n`;
                text += `Modelo: ${session.model}\n`;
                text += `Data: ${session.createdAt.toLocaleDateString()}\n\n`;
                messages.forEach(msg => {
                    const role = msg.role === 'user' ? 'Você' : 'AI';
                    text += `${role}: ${msg.content}\n\n`;
                });
                return text;
            default:
                throw new Error(`Formato não suportado: ${format}`);
        }
    }
    // Calculate conversation statistics
    static getConversationStats(messages) {
        const totalMessages = messages.length;
        const userMessages = messages.filter(m => m.role === 'user').length;
        const assistantMessages = messages.filter(m => m.role === 'assistant').length;
        const totalTokens = messages.reduce((sum, m) => { var _a, _b; return sum + (((_a = m.tokens) === null || _a === void 0 ? void 0 : _a.input) || 0) + (((_b = m.tokens) === null || _b === void 0 ? void 0 : _b.output) || 0); }, 0);
        const totalCost = messages.reduce((sum, m) => { var _a; return sum + (((_a = m.tokens) === null || _a === void 0 ? void 0 : _a.cost) || 0); }, 0);
        const averageResponseTime = messages
            .filter(m => { var _a; return (_a = m.metadata) === null || _a === void 0 ? void 0 : _a.responseTime; })
            .reduce((sum, m, _, arr) => sum + (m.metadata.responseTime / arr.length), 0);
        return {
            totalMessages,
            userMessages,
            assistantMessages,
            totalTokens,
            totalCost,
            averageResponseTime,
            conversationLength: totalMessages > 0 ?
                messages[messages.length - 1].timestamp.getTime() - messages[0].timestamp.getTime() : 0
        };
    }
    // Smart auto-complete for technical content
    static getAutoCompletesuggestions(input, context) {
        const commonCompletions = {
            code: [
                'function',
                'const',
                'import',
                'export',
                'class',
                'interface',
                'type',
                'async',
                'await'
            ],
            technical: [
                'implementar',
                'configurar',
                'otimizar',
                'debugar',
                'integrar',
                'desenvolver',
                'arquitetura',
                'performance'
            ],
            general: [
                'explique',
                'como',
                'porque',
                'quando',
                'onde',
                'exemplo',
                'diferença',
                'vantagem'
            ]
        };
        const relevantCompletions = commonCompletions[context] || commonCompletions.general;
        return relevantCompletions
            .filter(completion => completion.toLowerCase().startsWith(input.toLowerCase()))
            .slice(0, 5);
    }
}
// Enhanced message templates
export const MESSAGE_TEMPLATES = {
    code: {
        review: 'Por favor, revise este código e sugira melhorias:\n\n```\n[SEU_CÓDIGO]\n```',
        debug: 'Estou enfrentando este erro:\n\n```\n[ERRO]\n```\n\nCódigo relacionado:\n\n```\n[CÓDIGO]\n```',
        explain: 'Pode explicar como este código funciona?\n\n```\n[CÓDIGO]\n```',
        optimize: 'Como posso otimizar este código para melhor performance?\n\n```\n[CÓDIGO]\n```'
    },
    writing: {
        improve: 'Por favor, melhore este texto:\n\n[SEU_TEXTO]',
        summarize: 'Resuma este conteúdo:\n\n[CONTEÚDO]',
        translate: 'Traduza este texto para [IDIOMA]:\n\n[TEXTO]',
        format: 'Formate este texto em [FORMATO]:\n\n[TEXTO]'
    },
    analysis: {
        data: 'Analise estes dados:\n\n[DADOS]',
        compare: 'Compare:\n\nOpção A: [OPÇÃO_A]\nOpção B: [OPÇÃO_B]',
        pros_cons: 'Liste os prós e contras de:\n\n[TÓPICO]',
        research: 'Pesquise sobre:\n\n[TÓPICO]'
    }
};
/* removed duplicate re-exports to avoid conflicts */
/* removed duplicate re-exports to avoid conflicts */ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1mZWF0dXJlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoYXQtZmVhdHVyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQXlEdkIsMEVBQTBFO0FBQzFFLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEMsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUNyQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzVCLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDaEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNoQixRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtLQUNyQixDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDZCxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRTtJQUM1QixlQUFlLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUM5QyxDQUFDLENBQUE7QUFFRiwwRUFBMEU7QUFDMUUsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6QyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFD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