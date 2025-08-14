"use client";
import { useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Globe, MapPin, Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
export function ChatInput() {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatStarted, setChatStarted] = useState(false);
    const textareaRef = useRef(null);
    const scrollAreaRef = useRef(null);
    // Placeholder dinâmico e sugestões rápidas
    const placeholderExamples = [
        'Crie um resumo em bullets de um texto',
        'Gere um e-mail de vendas curto e direto',
        'Escreva um post para Instagram com CTA',
        'Explique este código em linguagem simples',
    ];
    const placeholder = placeholderExamples[new Date().getMinutes() % placeholderExamples.length];
    const quickSuggestions = [
        'Faça um resumo dos recursos do Kyroia',
        'Crie uma lista de tarefas para minha semana',
        'Sugira um roteiro de vídeo de 60s sobre IA',
        'Gere 5 ideias de posts para LinkedIn',
    ];
    // Preferência local de visibilidade: 'never' | 'low' | 'always'
    // Padrão: 'low' (somente quando baixo)
    const getVisibilityPref = () => {
        try {
            const v = localStorage.getItem('usageVisibility');
            if (v === 'never' || v === 'low' || v === 'always')
                return v;
        }
        catch (_a) { }
        return 'low';
    };
    // Checagem de saldo baixo de créditos: toast apenas quando preferido
    useEffect(() => {
        const checkLowBalance = async () => {
            var _a, _b, _c, _d;
            if (!((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id))
                return;
            const pref = getVisibilityPref();
            if (pref === 'never')
                return;
            try {
                const res = await fetch('/api/credits/balance', { cache: 'no-store' });
                if (!res.ok)
                    return;
                const data = await res.json();
                if ((data === null || data === void 0 ? void 0 : data.isLowBalance) && (pref === 'low' || pref === 'always')) {
                    toast({
                        title: 'Saldo baixo de créditos',
                        description: `Você tem ${(_d = (_c = (_b = data.balance) === null || _b === void 0 ? void 0 : _b.toLocaleString) === null || _c === void 0 ? void 0 : _c.call(_b, 'pt-BR')) !== null && _d !== void 0 ? _d : data.balance} créditos.`,
                    });
                }
            }
            catch (_e) { }
        };
        checkLowBalance();
        // também re-checar ao iniciar uma conversa
    }, [session, toast]);
    const handleSuggestionClick = (text) => {
        var _a;
        setInput(text);
        (_a = textareaRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    };
    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, []);
    const handleSubmit = async (e) => {
        var _a, _b, _c;
        e.preventDefault();
        if (!input.trim() || isLoading)
            return;
        // Verificar se usuário está logado
        if (!session) {
            toast({
                title: "Erro de Autenticação",
                description: "Você precisa estar logado para usar o chat.",
                variant: "destructive",
            });
            return;
        }
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setChatStarted(true);
        try {
            console.log('Enviando requisição para /api/chat...');
            // Ler modelo salvo pelo ModelSelector; fallback para gpt-4o-mini
            let modelId = 'gpt-4o-mini';
            try {
                const saved = localStorage.getItem('selectedModel');
                if (saved && typeof saved === 'string')
                    modelId = saved;
            }
            catch (_d) { }
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    model: modelId
                }),
            });
            console.log('Resposta recebida:', response.status);
            if (!response.ok) {
                let errorPayload = {};
                try {
                    const json = (await response.json());
                    errorPayload = {
                        message: typeof json.message === 'string' ? json.message : undefined,
                        error: typeof json.error === 'string' ? json.error : undefined,
                    };
                }
                catch (_e) {
                    try {
                        const text = await response.text();
                        errorPayload.raw = text;
                    }
                    catch (_f) {
                        // mantém objeto vazio
                    }
                }
                // Log estruturado para facilitar diagnóstico no console
                console.error('Erro na API:', {
                    status: response.status,
                    statusText: response.statusText,
                    payload: errorPayload,
                });
                const msg = errorPayload.message ||
                    errorPayload.error ||
                    (typeof errorPayload.raw === 'string' && errorPayload.raw) ||
                    `HTTP ${response.status}: ${response.statusText}`;
                throw new Error(msg);
            }
            const data = await response.json();
            console.log('Dados recebidos:', data);
            const messageText = typeof (data === null || data === void 0 ? void 0 : data.message) === 'string' ? data.message :
                typeof (data === null || data === void 0 ? void 0 : data.content) === 'string' ? data.content :
                    (Array.isArray(data === null || data === void 0 ? void 0 : data.choices) && ((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content))
                        ? String(data.choices[0].message.content)
                        : null;
            if (!messageText || !messageText.trim()) {
                throw new Error('Resposta da API não contém mensagem');
            }
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: messageText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);
        }
        catch (error) {
            console.error('Erro no chat:', error);
            toast({
                title: 'Erro',
                description: error instanceof Error ? error.message : 'Não foi possível enviar a mensagem. Tente novamente.',
                variant: 'destructive',
            });
        }
        finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };
    if (chatStarted) {
        return (<div className="space-y-4">
        {/* Chat Messages */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (<div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (<Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500/20">
                          <Bot className="h-4 w-4 text-purple-400"/>
                        </AvatarFallback>
                      </Avatar>)}
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-white border border-gray-700'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (<Avatar className="h-8 w-8 bg-blue-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-blue-500/20">
                          <User className="h-4 w-4 text-blue-400"/>
                        </AvatarFallback>
                      </Avatar>)}
                  </div>))}
                {isLoading && (<div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                      <AvatarFallback className="bg-purple-500/20">
                        <Bot className="h-4 w-4 text-purple-400"/>
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400"/>
                        <span className="text-sm text-gray-400">Digitando...</span>
                      </div>
                    </div>
                  </div>)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="bg-gray-900 border-gray-700 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite sua mensagem..." className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={1} style={{
                height: 'auto',
                minHeight: '44px',
                maxHeight: '120px',
            }}/>
                </div>
                <Button type="submit" disabled={!input.trim() || isLoading} className="bg-purple-600 hover:bg-purple-700 text-white p-3">
                  <Send className="h-4 w-4"/>
                </Button>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-500">
                Digite sua mensagem e pressione Enter para enviar
              </div>
            </form>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="relative">
      <Card className="bg-gray-900 border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none" rows={1} style={{
            height: 'auto',
            minHeight: '44px',
        }}/>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip className="h-5 w-5"/>
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5"/>
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <MapPin className="h-5 w-5"/>
                </button>
                {input.trim() && (<Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white p-2">
                    <Send className="h-4 w-4"/>
                  </Button>)}
              </div>
            </div>
          </form>
          {/* Sugestões rápidas antes do chat começar */}
          <div className="mt-4 flex flex-wrap gap-2">
            {quickSuggestions.map((s) => (<Button key={s} type="button" variant="outline" className="h-8 rounded-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => handleSuggestionClick(s)}>
                {s}
              </Button>))}
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            Adicionar • Pesquisa na web • Conhecimento
          </div>
        </CardContent>
      </Card>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdC1pbnB1dC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGF0LWlucHV0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQy9ELE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDakYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQzVDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFTakMsTUFBTSxVQUFVLFNBQVM7SUFDdkIsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxVQUFVLEVBQUUsQ0FBQTtJQUN0QyxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFDNUIsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDdEMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyxRQUFRLENBQVksRUFBRSxDQUFDLENBQUE7SUFDdkQsTUFBTSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsR0FBRyxRQUFR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