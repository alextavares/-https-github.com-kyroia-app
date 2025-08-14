"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import TemplateSelector from "./template-selector";
export default function ChatInterface({ conversationId, onNewConversation }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const messagesEndRef = useRef(null);
    const { data: session } = useSession();
    const scrollToBottom = () => {
        var _a;
        (_a = messagesEndRef.current) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const sendMessage = async () => {
        if (!input.trim() || loading)
            return;
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
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    model: "gpt-3.5-turbo",
                    conversationId
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao enviar mensagem");
            }
            const data = await response.json();
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
            // Se é uma nova conversa, notificar o pai
            if (!conversationId && data.conversationId && onNewConversation) {
                onNewConversation(data.conversationId);
            }
        }
        catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            setError(error instanceof Error ? error.message : "Erro ao enviar mensagem");
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
    return (<div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (<div className="text-center text-muted-foreground py-8">
            <p>Olá! Como posso ajudar você hoje?</p>
          </div>) : (messages.map((message) => (<div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'}`}>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>)))}
        {loading && (<div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>)}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1pbnRlcmZhY2UuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2hhdC1pbnRlcmZhY2UudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTtBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNuRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDL0MsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzdDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUM1QyxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFBO0FBY2xELE1BQU0sQ0FBQyxPQUFPLFVBQVUsYUFBYSxDQUFDLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFzQjtJQUM3RixNQUFNLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHLFFBQVEsQ0FBWSxFQUFFLENBQUMsQ0FBQTtJQUN2RCxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUM3QyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUN0QyxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3pELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBaUIsSUFBSSxDQUFDLENBQUE7SUFDbkQsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxVQUFVLEVBQUUsQ0FBQTtJQUV0QyxNQUFNLGNBQWMsR0FBRyxHQUFHLEVBQUU7O1FBQzFCLE1BQUEsY0FBYyxD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