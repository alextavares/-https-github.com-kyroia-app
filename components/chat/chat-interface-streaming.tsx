"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import TemplateSelector from "./template-selector"
import { getModelsForPlan, MODEL_CATEGORIES } from "@/lib/ai/innerai-models-config"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  conversationId?: string
  onNewConversation?: (conversationId: string) => void
  model?: string
  onModelChange?: (model: string) => void
}

export default function ChatInterfaceStreaming({ 
  conversationId, 
  onNewConversation,
  model = "gpt-3.5-turbo",
  onModelChange 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [planType, setPlanType] = useState<'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'>('FREE')
  const [loadingPlan, setLoadingPlan] = useState<boolean>(false)
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; category: 'fast' | 'advanced' | 'reasoning' }>>([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadConversationMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  // Load user plan to gate advanced models
  useEffect(() => {
    const loadPlan = async () => {
      if (!session?.user) return
      setLoadingPlan(true)
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const pt = (data?.planType || 'FREE') as typeof planType
          setPlanType(pt)
        }
      } catch {}
      finally {
        setLoadingPlan(false)
      }
    }
    loadPlan()
  }, [session])

  // Update available models when plan changes
  useEffect(() => {
    try {
      const models = getModelsForPlan(planType).map(m => ({ id: m.id, name: m.name, category: m.category as 'fast' | 'advanced' | 'reasoning' }))
      setAvailableModels(models)
    } catch (e) {
      setAvailableModels([])
    }
  }, [planType])

  // Ensure selected model is valid for current plan
  useEffect(() => {
    if (!availableModels || availableModels.length === 0) return
    const exists = availableModels.some(m => m.id === model)
    if (!exists) {
      onModelChange?.(availableModels[0].id)
    }
  }, [availableModels])

  // Persist and restore selection per plan in localStorage
  useEffect(() => {
    try {
      const key = `selectedModel:${planType}`
      const stored = localStorage.getItem(key)
      if (stored && availableModels.some(m => m.id === stored)) {
        onModelChange?.(stored)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planType, availableModels.length])

  useEffect(() => {
    try {
      const key = `selectedModel:${planType}`
      if (model) localStorage.setItem(key, model)
    } catch {}
  }, [model, planType])

  const isAdvancedModel = (m: string) => availableModels.find(x => x.id === m)?.category === 'advanced' || false

  const loadConversationMessages = async () => {
    if (!conversationId) return
    
    setLoadingMessages(true)
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const data = await response.json()
          const loadedMessages: Message[] = data.conversation.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role.toLowerCase() as 'user' | 'assistant',
            content: msg.content,
            // Evitar mismatch de hidratação: armazena string e converte apenas no client render
            timestamp: new Date(msg.createdAt)
          }))
        setMessages(loadedMessages)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
      setError("Erro ao carregar mensagens")
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    // Gate: block advanced models for FREE plan with friendly message
    if (planType === 'FREE' && isAdvancedModel(model)) {
      setError('Este modelo requer um plano LITE ou PRO. Faça upgrade para usar modelos avançados.')
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError("")

    // Add placeholder for assistant message
      const assistantMessageId = String(Date.now() + 1)
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      let showCostPref = false
      try { showCostPref = localStorage.getItem('showResponseCost') === 'true' } catch {}
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
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao enviar mensagem")
      }

      // Read the stream
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr.trim()) {
              try {
                const data = JSON.parse(dataStr)
                
                if (data.token) {
                  // Update the assistant message content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + data.token }
                      : msg
                  ))
                } else if (data.done) {
                  // Mark streaming as complete
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId
                      ? { ...msg, isStreaming: false }
                      : msg
                  ))

                  // Handle new conversation
                  if (!conversationId && data.conversationId && onNewConversation) {
                    onNewConversation(data.conversationId)
                  }
                } else if (data.error) {
                  throw new Error(data.error)
                }
              } catch (e) {
                console.error("Error parsing SSE data:", e)
              }
            }
          }
        }
      }

    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      setError(error instanceof Error ? error.message : "Erro ao enviar mensagem")
      
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleUseTemplate = (templateContent: string) => {
    setInput(templateContent)
    setShowTemplates(false)
  }

  const handleExport = async (format: string) => {
    if (!conversationId) return
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conversa-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting conversation:', error)
    }
    setShowExportMenu(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Model Selector & Export */}
      {onModelChange && (
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {conversationId && messages.length > 0 && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  📥 Exportar
                </Button>
                {showExportMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('json')}
                    >
                      📄 JSON
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('md')}
                    >
                      📝 Markdown
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('txt')}
                    >
                      📃 Texto
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={model}
              onChange={(e) => onModelChange?.(e.target.value)}
              className="text-sm border rounded px-2 py-1 bg-background"
              disabled={loading}
            >
              {(['fast','advanced','reasoning'] as const).map(cat => {
                const label = (MODEL_CATEGORIES as any)[cat] || cat
                const models = availableModels.filter(m => m.category === cat)
                if (models.length === 0) return null
                return (
                  <optgroup key={cat} label={label}>
                    {models.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
            {planType === 'FREE' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = '/pricing')}
                      disabled={loadingPlan}
                    >
                      {loadingPlan ? '...' : 'Upgrade'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Desbloqueie modelos avançados (GPT-4, Claude) com qualidade e contexto maiores.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando mensagens...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Olá! Como posso ajudar você hoje?</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.isStreaming && (
                  <span className="inline-block w-1 h-4 bg-foreground animate-pulse ml-1" />
                )}
                {!message.isStreaming && (
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mx-4">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-muted-foreground">Pergunte para Kyroia</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowTemplates(true)}
          >
            📝 Templates
          </Button>
          <Button variant="ghost" size="sm" disabled>📎 Adicionar</Button>
          <Button variant="ghost" size="sm" disabled>🔍 Pesquisa na web</Button>
          <Button variant="ghost" size="sm" disabled>🧠 Conhecimento</Button>
        </div>
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Enviar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>

      {/* Template Selector Modal */}
      {showTemplates && (
        <TemplateSelector
          onUseTemplate={handleUseTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}