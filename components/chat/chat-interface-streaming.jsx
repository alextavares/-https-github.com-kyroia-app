"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import TemplateSelector from "./template-selector";
import { getModelsForPlan, MODEL_CATEGORIES } from "@/lib/ai/innerai-models-config";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
export default function ChatInterfaceStreaming({ conversationId, onNewConversation, model = "gpt-3.5-turbo", onModelChange }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const messagesEndRef = useRef(null);
    const { data: session } = useSession();
    const [planType, setPlanType] = useState('FREE');
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    // Load messages when conversation changes
    useEffect(() => {
        if (conversationId) {
            loadConversationMessages();
        }
        else {
            setMessages([]);
        }
    }, [conversationId]);
    // Load user plan to gate advanced models
    useEffect(() => {
        const loadPlan = async () => {
            if (!(session === null || session === void 0 ? void 0 : session.user))
                return;
            setLoadingPlan(true);
            try {
                const res = await fetch('/api/subscription', { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    const pt = ((data === null || data === void 0 ? void 0 : data.planType) || 'FREE');
                    setPlanType(pt);
                }
            }
            catch (_a) { }
            finally {
                setLoadingPlan(false);
            }
        };
        loadPlan();
    }, [session]);
    // Update available models when plan changes
    useEffect(() => {
        try {
            const models = getModelsForPlan(planType).map(m => ({ id: m.id, name: m.name, category: m.category }));
            setAvailableModels(models);
        }
        catch (e) {
            setAvailableModels([]);
        }
    }, [planType]);
    // Ensure selected model is valid for current plan
    useEffect(() => {
        if (!availableModels || availableModels.length === 0)
            return;
        const exists = availableModels.some(m => m.id === model);
        if (!exists) {
            onModelChange === null || onModelChange === void 0 ? void 0 : onModelChange(availableModels[0].id);
        }
    }, [availableModels]);
    // Persist and restore selection per plan in localStorage
    useEffect(() => {
        try {
            const key = `selectedModel:${planType}`;
            const stored = localStorage.getItem(key);
            if (stored && availableModels.some(m => m.id === stored)) {
                onModelChange === null || onModelChange === void 0 ? void 0 : onModelChange(stored);
            }
        }
        catch (_a) { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [planType, availableModels.length]);
    useEffect(() => {
        try {
            const key = `selectedModel:${planType}`;
            if (model)
                localStorage.setItem(key, model);
        }
        catch (_a) { }
    }, [model, planType]);
    const isAdvancedModel = (m) => { var _a; return ((_a = availableModels.find(x => x.id === m)) === null || _a === void 0 ? void 0 : _a.category) === 'advanced' || false; };
    const loadConversationMessages = async () => {
        if (!conversationId)
            return;
        setLoadingMessages(true);
        try {
            const response = await fetch(`/api/conversations/${conversationId}`);
            if (response.ok) {
                const data = await response.json();
                const loadedMessages = data.conversation.messages.map((msg) => ({
                    id: msg.id,
                    role: msg.role.toLowerCase(),
                    content: msg.content,
                    timestamp: new Date(msg.createdAt)
                }));
                setMessages(loadedMessages);
            }
        }
        catch (error) {
            console.error("Error loading messages:", error);
            setError("Erro ao carregar mensagens");
        }
        finally {
            setLoadingMessages(false);
        }
    };
    const sendMessage = async () => {
        var _a;
        if (!input.trim() || loading)
            return;
        // Gate: block advanced models for FREE plan with friendly message
        if (planType === 'FREE' && isAdvancedModel(model)) {
            setError('Este modelo requer um plano LITE ou PRO. Faça upgrade para usar modelos avançados.');
            return;
        }
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        setError("");
        // Add placeholder for assistant message
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true
        };
        setMessages(prev => [...prev, assistantMessage]);
        try {
            let showCostPref = false;
            try {
                showCostPref = localStorage.getItem('showResponseCost') === 'true';
            }
            catch (_b) { }
            const response = await fetch("/api/chat/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-show-cost": showCostPref ? "true" : "false",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    model,
                    conversationId
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao enviar mensagem");
            }
            // Read the stream
            const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader)
                throw new Error("No reader available");
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6);
                        if (dataStr.trim()) {
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.token) {
                                    // Update the assistant message content
                                    setMessages(prev => prev.map(msg => msg.id === assistantMessageId
                                        ? Object.assign(Object.assign({}, msg), { content: msg.content + data.token }) : msg));
                                }
                                else if (data.done) {
                                    // Mark streaming as complete
                                    setMessages(prev => prev.map(msg => msg.id === assistantMessageId
                                        ? Object.assign(Object.assign({}, msg), { isStreaming: false }) : msg));
                                    // Handle new conversation
                                    if (!conversationId && data.conversationId && onNewConversation) {
                                        onNewConversation(data.conversationId);
                                    }
                                }
                                else if (data.error) {
                                    throw new Error(data.error);
                                }
                            }
                            catch (e) {
                                console.error("Error parsing SSE data:", e);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            setError(error instanceof Error ? error.message : "Erro ao enviar mensagem");
            // Remove the empty assistant message on error
            setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        }
        finally {
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    const handleUseTemplate = (templateContent) => {
        setInput(templateContent);
        setShowTemplates(false);
    };
    const handleExport = async (format) => {
        if (!conversationId)
            return;
        try {
            const response = await fetch(`/api/conversations/${conversationId}/export?format=${format}`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `conversa-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        }
        catch (error) {
            console.error('Error exporting conversation:', error);
        }
        setShowExportMenu(false);
    };
    return (<div className="flex flex-col h-full">
      {/* Model Selector & Export */}
      {onModelChange && (<div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conversationId && messages.length > 0 && (<div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setShowExportMenu(!showExportMenu)}>
                  📥 Exportar
                </Button>
                {showExportMenu && (<div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('json')}>
                      📄 JSON
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('md')}>
                      📝 Markdown
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => handleExport('txt')}>
                      📃 Texto
                    </Button>
                  </div>)}
              </div>)}
          </div>
          <div className="flex items-center gap-2">
            <select value={model} onChange={(e) => onModelChange === null || onModelChange === void 0 ? void 0 : onModelChange(e.target.value)} className="text-sm border rounded px-2 py-1 bg-background" disabled={loading}>
              {['fast', 'advanced', 'reasoning'].map(cat => {
                const label = MODEL_CATEGORIES[cat] || cat;
                const models = availableModels.filter(m => m.category === cat);
                if (models.length === 0)
                    return null;
                return (<optgroup key={cat} label={label}>
                    {models.map(m => (<option key={m.id} value={m.id}>{m.name}</option>))}
                  </optgroup>);
            })}
            </select>
            {planType === 'FREE' && (<TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => (window.location.href = '/pricing')} disabled={loadingPlan}>
                      {loadingPlan ? '...' : 'Upgrade'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Desbloqueie modelos avançados (GPT-4, Claude) com qualidade e contexto maiores.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>)}
          </div>
        </div>)}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (<div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando mensagens...</p>
            </div>
          </div>) : messages.length === 0 ? (<div className="text-center text-muted-foreground py-8">
            <p>Olá! Como posso ajudar você hoje?</p>
          </div>) : (messages.map((message) => (<div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.isStreaming && (<span className="inline-block w-1 h-4 bg-foreground animate-pulse ml-1"/>)}
                {!message.isStreaming && (<p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>)}
              </div>
            </div>)))}
        <div ref={messagesEndRef}/>
      </div>

      {/* Error Message */}
      {error && (<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mx-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>)}

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-muted-foreground">Pergunte para Kyroia</span>
          <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
            📝 Templates
          </Button>
          <Button variant="ghost" size="sm" disabled>📎 Adicionar</Button>
          <Button variant="ghost" size="sm" disabled>🔍 Pesquisa na web</Button>
          <Button variant="ghost" size="sm" disabled>🧠 Conhecimento</Button>
        </div>
        <div className="flex space-x-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Digite sua mensagem..." disabled={loading} className="flex-1"/>
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "..." : "Enviar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (<TemplateSelector onUseTemplate={handleUseTemplate} onClose={() => setShowTemplates(false)}/>)}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1pbnRlcmZhY2Utc3RyZWFtaW5nLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNoYXQtaW50ZXJmYWNlLXN0cmVhbWluZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ25ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVDLE9BQU8sZ0JBQWdCLE1BQU0scUJBQXFCLENBQUE7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDbkYsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBaUJsRyxNQUFNLENBQUMsT0FBTyxVQUFVLHNCQUFzQixDQUFDLEVBQzdDLGNBQWMsRUFDZCxpQkFBaUIsRUFDakIsS0FBSyxHQUFHLGVBQWUsRUFDdkIsYUFBYSxFQUNNO0lBQ25CLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUcsUUFBUSxDQUFZLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzdDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsa0JBQWtCLENB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