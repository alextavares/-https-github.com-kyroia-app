"use client"

import { useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Paperclip, Globe, MapPin, Send, Bot, User, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatInput() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatStarted, setChatStarted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  // Placeholder dinâmico e sugestões rápidas
  const placeholderExamples = [
    'Crie um resumo em bullets de um texto',
    'Gere um e-mail de vendas curto e direto',
    'Escreva um post para Instagram com CTA',
    'Explique este código em linguagem simples',
  ]
  // Evitar mismatch de hidratação: valor estático inicial e definir dinâmico após montagem
  const [placeholder, setPlaceholder] = useState<string>('Digite sua mensagem...')
  useEffect(() => {
    const idx = new Date().getMinutes() % placeholderExamples.length
    setPlaceholder(placeholderExamples[idx])
  }, [])

  const quickSuggestions = [
    'Faça um resumo dos recursos do Kyroia',
    'Crie uma lista de tarefas para minha semana',
    'Sugira um roteiro de vídeo de 60s sobre IA',
    'Gere 5 ideias de posts para LinkedIn',
  ]

  // Preferência local de visibilidade: 'never' | 'low' | 'always'
  // Padrão: 'low' (somente quando baixo)
  const getVisibilityPref = (): 'never' | 'low' | 'always' => {
    try {
      const v = localStorage.getItem('usageVisibility')
      if (v === 'never' || v === 'low' || v === 'always') return v
    } catch {}
    return 'low'
  }

  // Checagem de saldo baixo de créditos: toast apenas quando preferido
  useEffect(() => {
    const checkLowBalance = async () => {
      if (!session?.user?.id) return
      const pref = getVisibilityPref()
      if (pref === 'never') return
      try {
        const res = await fetch('/api/credits/balance', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (data?.isLowBalance && (pref === 'low' || pref === 'always')) {
          toast({
            title: 'Saldo baixo de créditos',
            description: `Você tem ${data.balance?.toLocaleString?.('pt-BR') ?? data.balance} créditos.`,
          })
        }
      } catch {}
    }
    checkLowBalance()
    // também re-checar ao iniciar uma conversa
  }, [session, toast])

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Verificar se usuário está logado
    if (!session) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para usar o chat.",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setChatStarted(true)

    try {
      console.log('Enviando requisição para /api/chat...')
      // Ler modelo salvo pelo ModelSelector; fallback para gpt-4o-mini
      let modelId = 'gpt-4o-mini'
      try {
        const saved = localStorage.getItem('selectedModel')
        if (saved && typeof saved === 'string') modelId = saved
      } catch {}
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
      })

      console.log('Resposta recebida:', response.status)

      if (!response.ok) {
        // Extrai JSON se possível; caso contrário, tenta texto bruto
        type ApiErrorPayload = { message?: string; error?: string; raw?: string }
        let errorPayload: ApiErrorPayload = {}
        try {
          const json = (await response.json()) as Partial<ApiErrorPayload>
          errorPayload = {
            message: typeof json.message === 'string' ? json.message : undefined,
            error: typeof json.error === 'string' ? json.error : undefined,
          }
        } catch {
          try {
            const text = await response.text()
            errorPayload.raw = text
          } catch {
            // mantém objeto vazio
          }
        }

        // Log estruturado para facilitar diagnóstico no console
        console.error('Erro na API:', {
          status: response.status,
          statusText: response.statusText,
          payload: errorPayload,
        })

        const msg =
          errorPayload.message ||
          errorPayload.error ||
          (typeof errorPayload.raw === 'string' && errorPayload.raw) ||
          `HTTP ${response.status}: ${response.statusText}`

        throw new Error(msg)
      }

      const data = await response.json()
      console.log('Dados recebidos:', data)

      const messageText: string | null =
        typeof data?.message === 'string' ? data.message :
        typeof data?.content === 'string' ? data.content :
        (Array.isArray(data?.choices) && data.choices?.[0]?.message?.content)
          ? String(data.choices[0].message.content)
          : null

      if (!messageText || !messageText.trim()) {
        throw new Error('Resposta da API não contém mensagem')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: messageText,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Erro no chat:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (chatStarted) {
    return (
      <div className="space-y-4">
        {/* Chat Messages */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500/20">
                          <Bot className="h-4 w-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 bg-blue-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-blue-500/20">
                          <User className="h-4 w-4 text-blue-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                      <AvatarFallback className="bg-purple-500/20">
                        <Bot className="h-4 w-4 text-purple-400" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                        <span className="text-sm text-gray-400">Digitando...</span>
                      </div>
                    </div>
                  </div>
                )}
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
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px',
                      maxHeight: '120px',
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-500">
                Digite sua mensagem e pressione Enter para enviar
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative">
      <Card className="bg-gray-900 border-gray-700 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{
                      height: 'auto',
                      minHeight: '44px',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Globe className="h-5 w-5" />
                </button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors">
                  <MapPin className="h-5 w-5" />
                </button>
                {input.trim() && (
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-2"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
          {/* Sugestões rápidas antes do chat começar */}
          <div className="mt-4 flex flex-wrap gap-2">
            {quickSuggestions.map((s) => (
              <Button
                key={s}
                type="button"
                variant="outline"
                className="h-8 rounded-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
            Adicionar • Pesquisa na web • Conhecimento
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
