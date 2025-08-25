"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2 } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function RenderMessageContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const parts: JSX.Element[] = []
  let quote: string[] = []

  const flush = () => {
    if (quote.length) {
      parts.push(
        <div key={`q-${parts.length}`} className="border-l-4 pl-3 py-2 my-1 rounded-r bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-400/30">
          <div className="text-sm whitespace-pre-wrap italic text-foreground/90">{quote.join('\n').replace(/^>\s?/gm, '')}</div>
        </div>
      )
      quote = []
    }
  }

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('>')) {
      quote.push(line)
    } else {
      flush()
      parts.push(
        <div key={`p-${idx}`} className="text-sm leading-relaxed whitespace-pre-wrap">
          {line.length ? line : ' '}
        </div>
      )
    }
  })
  flush()
  return <>{parts}</>
}

export function InlineChat({ tall = false, onActivate, onShowTemplates }: { tall?: boolean, onActivate?: () => void, onShowTemplates?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Prefill support from other widgets (e.g., templates)
  useEffect(() => {
    try {
      const v = localStorage.getItem('kyroia:inline-prefill')
      if (v && v.trim()) {
        setInput(v)
        localStorage.removeItem('kyroia:inline-prefill')
        // focus after a tick
        setTimeout(() => textareaRef.current?.focus(), 50)
        onActivate?.()
      }
    } catch {}
  }, [])

  // When first message arrives, ensure chat is active
  useEffect(() => {
    if (messages.length > 0) onActivate?.()
  }, [messages, onActivate])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    const userMsg: Message = { id: String(Date.now()), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      // Resolve modelo selecionado (compatível com outras telas)
      let model = 'gpt-4o-mini'
      try {
        const plan = localStorage.getItem('lastPlanType') || 'FREE'
        const byPlan = localStorage.getItem(`selectedModel:${plan}`)
        const globalSelected = localStorage.getItem('selectedModel')
        model = (byPlan || globalSelected || 'gpt-4o-mini')
      } catch {}

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          model,
          conversationId,
          webSearchEnabled,
          knowledgeBaseEnabled,
        })
      })
      if (!res.ok) throw new Error('Falha ao enviar')

      const reader = res.body?.getReader()
      if (!reader) throw new Error('Stream indisponível')

      let assistant: Message = { id: String(Date.now() + 1), role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistant])

      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) {
          const chunk = decoder.decode(value)
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            try {
              const data = JSON.parse(line.slice(6))
              if (data.token) {
                assistant.content += data.token
                setMessages(prev => prev.map(m => (m.id === assistant.id ? { ...m, content: assistant.content } : m)))
              }
              if (data.conversationId) setConversationId(data.conversationId)
              if (data.error) throw new Error(data.error)
            } catch {/* ignore parse */}
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.slice(0, -1)) // remove assistant placeholder
    } finally {
      setIsLoading(false)
      textareaRef.current?.focus()
    }
  }

  return (
    <Card id="inline-chat" className="rounded-2xl border border-border/60 bg-card/90 supports-[backdrop-filter]:bg-background/70 backdrop-blur-sm shadow-soft">
      <CardHeader className={`${tall ? 'py-1' : 'pb-2'} flex items-center justify-between`}>
        {!tall ? (
          <CardTitle className="text-lg font-semibold">Converse com a IA</CardTitle>
        ) : <div />}
        {onShowTemplates && tall && (
          <button type="button" onClick={() => onShowTemplates()} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
            Mostrar templates
          </button>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {/* Toolbar mínima de ações */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={webSearchEnabled ? 'default' : 'outline'}
              className={`h-8 px-2.5 text-xs ${webSearchEnabled ? '' : 'bg-card'}`}
              aria-pressed={webSearchEnabled}
              onClick={() => { setWebSearchEnabled(v => !v); onActivate?.() }}
              title="Usar pesquisa na web"
            >
              🔎 Web Search
            </Button>
            <Button
              type="button"
              variant={knowledgeBaseEnabled ? 'default' : 'outline'}
              className={`h-8 px-2.5 text-xs ${knowledgeBaseEnabled ? '' : 'bg-card'}`}
              aria-pressed={knowledgeBaseEnabled}
              onClick={() => { setKnowledgeBaseEnabled(v => !v); onActivate?.() }}
              title="Usar Base de Conhecimento"
            >
              🗂️ Knowledge
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-8 px-2.5 text-xs bg-card" disabled title="Em breve">
              📎 Anexar
            </Button>
          </div>
        </div>
        <div className={`${tall ? 'h-[340px]' : 'h-[240px]'} rounded-lg border border-border/50 bg-background/60 transition-[height] duration-200`}>
          <ScrollArea className="h-full p-2">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Digite sua mensagem para começar
              </div>
            ) : (
              <div className="space-y-4" data-testid="chat-messages">
                {messages.map(m => (
                  m.role === 'assistant' ? (
                    <div key={m.id} className="flex items-start gap-3">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[85%] rounded-2xl border border-border bg-card px-3.5 py-2.5 text-sm leading-relaxed break-words shadow-soft">
                        <RenderMessageContent content={m.content} />
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-start gap-3 justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-primary text-primary-foreground px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )
                ))}
                <div ref={endRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        <form onSubmit={handleSubmit} className="mt-2 flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            id="inline-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => onActivate?.()}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Digite sua mensagem..."
            className="flex-1 min-h-[44px] max-h-[140px] resize-none border border-border/60 bg-background/60 rounded-lg px-3 py-2"
            rows={2}
            disabled={isLoading}
          />
          <Button type="submit" disabled={!canSend} className="h-10">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
