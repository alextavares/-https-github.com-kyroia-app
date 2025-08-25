"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import TemplateSelector from "./template-selector"
import { Paperclip, Globe, Brain, FileText, Send } from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  conversationId?: string
  onNewConversation?: (conversationId: string) => void
}

export default function ChatInterface({ conversationId, onNewConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load selected model from localStorage for display and API usage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedModel')
      setSelectedModel(saved)
    } catch {}
  }, [])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

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

    try {
      // Progressive streaming via text/event-stream
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: selectedModel || "gpt-3.5-turbo",
          stream: true,
          conversationId,
        }),
      })

      if (!response.ok || !response.body) {
        // Fallback: tentar non-stream JSON para obter a resposta padrão
        const fallback = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
            model: selectedModel || "gpt-3.5-turbo",
            stream: false,
            conversationId,
          }),
        })
        if (!fallback.ok) {
          const errorData = await fallback.json().catch(() => ({}))
          throw new Error(errorData?.message || "Erro ao enviar mensagem")
        }
        const data = await fallback.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data?.choices?.[0]?.message?.content ?? data?.message ?? '',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // SSE parsing
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        // placeholder assistant message to progressively fill
        const assistantId = (Date.now() + 1).toString()
        setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: "", timestamp: new Date() }])

        const appendDelta = (delta: string) => {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: (m.content || "") + delta } : m))
        }

        // read chunks
        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          // split by double newline, standard SSE frame boundary
          const parts = buffer.split("\n\n")
          buffer = parts.pop() || ""
          for (const part of parts) {
            const line = part.trim()
            if (!line) continue
            // each event may contain multiple lines starting with data:
            const dataLines = line.split("\n").filter(l => l.startsWith("data:"))
            for (const dl of dataLines) {
              const payload = dl.replace(/^data:\s*/, "")
              if (payload === "[DONE]") {
                // stream finished
                break
              }
              try {
                const json = JSON.parse(payload)
                if (json?.delta) appendDelta(String(json.delta))
                if (json?.error) {
                  throw new Error(String(json.error))
                }
              } catch (e) {
                // If not JSON, treat as plain delta
                if (payload && payload !== "[DONE]") appendDelta(payload)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      setError(error instanceof Error ? error.message : "Erro ao enviar mensagem")
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

  return (
    <div className="flex flex-col h-full">
      {/* Header sutil do chat */}
      <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-card/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Chat com IA</span>
          {selectedModel && (
            <span className="text-xs text-muted-foreground">• modelo: {selectedModel}</span>
          )}
        </div>
      </div>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
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
                className={`max-w-[80%] rounded-xl px-4 py-2 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-full px-3 py-2 shadow-sm">
              <div className="flex items-center gap-1 opacity-80">
                <span className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-foreground/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
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
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <span className="text-sm">Pergunte para Kyroia</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(true)}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button variant="ghost" size="sm" disabled className="gap-2">
            <Paperclip className="h-4 w-4" />
            Adicionar
          </Button>
          <Button variant="ghost" size="sm" disabled className="gap-2">
            <Globe className="h-4 w-4" />
            Pesquisa na web
          </Button>
          <Button variant="ghost" size="sm" disabled className="gap-2">
            <Brain className="h-4 w-4" />
            Conhecimento
          </Button>
        </div>
        <div className="flex gap-2">
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
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Enviar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter envia • Shift+Enter quebra linha
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
