"use client"

import { useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Paperclip, Globe, MapPin, Send, Bot, User, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { useEffect } from 'react'
import { calculateCreditsForTokens, getModelById } from '@/lib/ai/innerai-models-config'

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
  const [temperature, setTemperature] = useState<number>(0.7)
  const [maxTokens, setMaxTokens] = useState<number>(512)
  const [estimatedCost, setEstimatedCost] = useState<string>('~ R$ 0,000')
  const [estimatedCredits, setEstimatedCredits] = useState<number>(0)
  const [inputTokens, setInputTokens] = useState<number>(0)
  const [outputTokens, setOutputTokens] = useState<number>(0)
  const [balance, setBalance] = useState<number>(0)
  const [currentModelId, setCurrentModelId] = useState<string>('gpt-4o-mini')
  const [currentModelName, setCurrentModelName] = useState<string>('GPT-4o Mini')
  const [currentModelFeatures, setCurrentModelFeatures] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  // Estado de salvar template removido
  // const [saveOpen, setSaveOpen] = useState(false)
  // Feature flag para esconder contadores/custos em dev
  const SHOW_COST = false

  // Uso diário simples (mensagens/dia)
  const [dailyUsage, setDailyUsage] = useState<{ used: number; limit: number | null }>({ used: 0, limit: null })
  const isAtLimit = typeof dailyUsage.limit === 'number' && dailyUsage.used >= dailyUsage.limit
  
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

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.text) setInput(String(e.detail.text))
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('kyroia:prefill', handler as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kyroia:prefill', handler as any)
      }
    }
  }, [])

  // Carregar uso diário
  useEffect(() => {
    const loadUsage = async () => {
      try {
        const res = await fetch('/api/usage/today', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const used = Number(json?.dailyMessages?.used ?? 0)
        const limit = json?.dailyMessages?.limit ?? null
        setDailyUsage({ used, limit })
      } catch {}
    }
    loadUsage()
  }, [])

  const handleSuggestionClick = (text: string) => {
    setInput(text)
    textareaRef.current?.focus()
  }
  // Estimativa simples de tokens (~4 chars/token). Ajuste conforme necessário
  const estimateTokens = (text: string) => {
    const cleaned = text.replace(/\s+/g, ' ').trim()
    if (!cleaned) return 0
    return Math.max(1, Math.ceil(cleaned.length / 4))
  }

  // Calcular custo estimado com base no modelo selecionado
  const recomputeEstimatedCost = useCallback(async (modelId: string, text: string) => {
    try {
      const inTok = estimateTokens(text)
      // Supor 40% da saída do input como palpite conservador
      const outTok = Math.min(maxTokens, Math.ceil(inTok * 0.4))
      setInputTokens(inTok)
      setOutputTokens(outTok)
      // Tabela leve de custos locais
      const costTable: Record<string, { in: number; out: number }> = {
        'gpt-4o-mini': { in: 0.00015 / 1000, out: 0.0006 / 1000 },
        'claude-3.5-haiku': { in: 0.00025 / 1000, out: 0.00125 / 1000 },
        'gemini-2.5-flash': { in: 0.0000375 / 1000, out: 0.00015 / 1000 },
        'deepseek-r1': { in: 0.00055 / 1000, out: 0.0022 / 1000 },
        'gpt-4o': { in: 0.0025 / 1000, out: 0.01 / 1000 },
      }
      const c = costTable[modelId] || costTable['gpt-4o-mini']
      const costUSD = inTok * c.in + outTok * c.out
      const brl = costUSD * 5
      setEstimatedCost(`~ R$ ${brl.toFixed(4)}`)
      // Créditos estimados
      try {
        const credits = calculateCreditsForTokens(modelId, inTok, outTok)
        setEstimatedCredits(credits)
      } catch {
        setEstimatedCredits(0)
      }
    } catch {
      setEstimatedCost('~ R$ 0,000')
      setEstimatedCredits(0)
    }
  }, [maxTokens])

  // Recalcular custo ao digitar e atualizar metadados do modelo
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('lastPlanType') || 'FREE'
      const byPlan = localStorage.getItem(`selectedModel:${savedPlan}`)
      const globalSelected = localStorage.getItem('selectedModel')
      const modelId = (byPlan || globalSelected || 'gpt-4o-mini')
      recomputeEstimatedCost(modelId, input)
      setCurrentModelId(modelId)
      const meta = getModelById(modelId)
      if (meta) {
        setCurrentModelName(meta.name)
        setCurrentModelFeatures(meta.features || [])
      }
    } catch {}
  }, [input, recomputeEstimatedCost])

  // Carregar saldo de créditos
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const res = await fetch('/api/credits/balance', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const b = Number(json?.balance ?? 0)
          if (!Number.isNaN(b)) setBalance(b)
        }
      } catch {}
    }
    loadBalance()
  }, [])


  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        ;(scrollContainer as HTMLElement).scrollTop = (scrollContainer as HTMLElement).scrollHeight
      }
    }
  }, [])

  const sendMessageCore = async (text: string) => {
    // Verificar se usuário está logado
    if (!session) {
      toast({ title: 'Erro de Autenticação', description: 'Você precisa estar logado para usar o chat.', variant: 'destructive' })
      return
    }
    if (isAtLimit) {
      toast({ title: 'Limite atingido', description: 'Você atingiu o limite diário do seu plano.', variant: 'destructive' })
      return
    }
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() }

    // Bloquear envio se créditos estimados forem insuficientes
    try {
      const savedPlan = localStorage.getItem('lastPlanType') || 'FREE'
      const byPlan = localStorage.getItem(`selectedModel:${savedPlan}`)
      const globalSelected = localStorage.getItem('selectedModel')
      const modelId = (byPlan || globalSelected || 'gpt-4o-mini')
      const inTok = estimateTokens(userMessage.content)
      const outTok = Math.min(maxTokens, Math.ceil(inTok * 0.4))
      const creditsNeeded = calculateCreditsForTokens(modelId, inTok, outTok)
      if (SHOW_COST && creditsNeeded > balance) {
        toast({ title: 'Créditos insuficientes', description: `Necessários ~${creditsNeeded} créditos, saldo atual ${balance}.`, variant: 'destructive' })
        return
      }
    } catch {}

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setChatStarted(true)

    try {
      let modelId = 'gpt-4o-mini'
      try {
        const savedPlan = localStorage.getItem('lastPlanType') || 'FREE'
        const byPlan = localStorage.getItem(`selectedModel:${savedPlan}`)
        const globalSelected = localStorage.getItem('selectedModel')
        if (byPlan && typeof byPlan === 'string') modelId = byPlan
        else if (globalSelected && typeof globalSelected === 'string') modelId = globalSelected
      } catch {}

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content })),
          model: modelId,
          // parâmetros avançados ocultos por ora
        }),
      })
      if (!response.ok) {
        // Tentar interpretar limites
        try {
          const j = await response.json()
          if (j?.errorCode === 'LIMIT_REACHED') {
            const reason = j?.message || 'Limite do plano atingido.'
            toast({ title: 'Limite atingido', description: reason, variant: 'destructive' })
            const limitNum = Number(j?.usage?.dailyMessages?.limit)
            const usedNum = Number(j?.usage?.dailyMessages?.used)
            if (!Number.isNaN(limitNum) && !Number.isNaN(usedNum)) {
              setDailyUsage({ used: usedNum, limit: limitNum })
            } else if (typeof dailyUsage.limit === 'number') {
              setDailyUsage({ used: dailyUsage.limit, limit: dailyUsage.limit })
            }
            return
          }
          throw new Error(j?.message || j?.error || 'Falha ao enviar')
        } catch {
          throw new Error('Falha ao enviar')
        }
      }
      const data = await response.json()
      const messageText: string | null =
        typeof data?.message === 'string' ? data.message :
        typeof data?.content === 'string' ? data.content :
        (Array.isArray(data?.choices) && data.choices?.[0]?.message?.content)
          ? String(data.choices[0].message.content)
          : null
      if (!messageText || !messageText.trim()) throw new Error('Resposta da API não contém mensagem')

      const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: messageText, timestamp: new Date() }
      setMessages(prev => [...prev, assistantMessage])
      // Incrementar contador local após sucesso
      setDailyUsage(prev => ({ used: prev.used + 1, limit: prev.limit }))
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
      setTimeout(scrollToBottom, 100)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isAtLimit) return
    const text = input
    setInput('')
    await sendMessageCore(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast({ title: 'Copiado', description: 'Conteúdo copiado para a área de transferência.' }) } catch {}
  }

  const handleRegenerate = async () => {
    if (isLoading) return
    // Encontrar a última mensagem do usuário
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        await sendMessageCore(messages[i].content)
        break
      }
    }
  }

  // Funcionalidade de salvar como template removida
  // const handleSaveAsTemplate = async (text: string) => {}
  // const [pendingContent, setPendingContent] = useState<string | null>(null)

  const renderModelBadges = () => (
    <div className="flex items-center flex-wrap gap-2 text-xs text-gray-300 mb-2">
      <span className="text-gray-400">{currentModelName} · Recursos:</span>
      {currentModelFeatures.includes('Vision') && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">🖼️ Visão</span>}
      {currentModelFeatures.includes('Function Calling') && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">🔧 Ferramentas</span>}
      {currentModelFeatures.some(f => /Multimodal/i.test(f)) && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">🎛️ Multimodal</span>}
      {currentModelFeatures.includes('Code') && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">💻 Código</span>}
      {currentModelFeatures.includes('Web Search') && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">🌐 Pesquisa</span>}
      {currentModelFeatures.some(f => /Reasoning|Raciocínio/i.test(f)) && <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700">🧠 Raciocínio</span>}
    </div>
  )

  if (chatStarted) {
    return (
      <div className="space-y-4">
        {/* Chat Messages */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <ScrollArea ref={scrollAreaRef} className="h-96 p-4">
              <div className="space-y-4">
                {messages.map((message, idx) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 bg-purple-500/20 flex-shrink-0">
                        <AvatarFallback className="bg-purple-500/20">
                          <Bot className="h-4 w-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-white border border-gray-700'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && idx === messages.length - 1 && (
                        <div className="mt-2 flex gap-2 text-xs text-gray-300">
                          <button onClick={() => handleCopy(message.content)} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600">Copiar</button>
                          <button onClick={handleRegenerate} className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600">Regenerar</button>
                          {/* Botão "Salvar como template" removido */}
                        </div>
                      )}
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
              {renderModelBadges()}
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
                    style={{ height: 'auto', minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {/* Botão "Salvar template" removido */}
                  <Button type="submit" disabled={!input.trim() || isLoading} className="bg-purple-600 hover:bg-purple-700 text-white p-3">
                  <Send className="h-4 w-4" />
                </Button>
                </div>
              </div>
              {/* Aviso de limite e indicador de uso diário */}
              <div className="flex items-center justify-between gap-3 text-xs">
                {isAtLimit ? (
                  <div className="px-2 py-1 rounded bg-red-900/30 border border-red-800 text-red-300">
                    Você atingiu o limite diário do seu plano. <Link href="/pricing" className="underline">Conheça os planos</Link>
                  </div>
                ) : <span />}
                <div className="text-gray-400">
                  Hoje: <span className="font-mono">{dailyUsage.used}</span>
                  {typeof dailyUsage.limit === 'number' ? <>/<span className="font-mono">{dailyUsage.limit}</span></> : ' / ∞'} mensagens
                </div>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-500">Digite sua mensagem e pressione Enter para enviar</div>
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
          {/* Dialog de criação de template removido */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  {renderModelBadges()}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    style={{ height: 'auto', minHeight: '44px' }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors"><Paperclip className="h-5 w-5" /></button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors"><Globe className="h-5 w-5" /></button>
                <button type="button" className="p-2 text-gray-400 hover:text-white transition-colors"><MapPin className="h-5 w-5" /></button>
                {input.trim() && (
                  <Button type="submit" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white p-2">
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
          {/* Sugestões rápidas antes do chat começar */}
          <div className="mt-4 flex flex-wrap gap-2">
            {quickSuggestions.map((s) => (
              <Button key={s} type="button" variant="outline" className="h-8 rounded-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800" onClick={() => handleSuggestionClick(s)}>
                {s}
              </Button>
            ))}
          </div>
          <div className="flex items-center justify-center mt-3 text-xs text-gray-500">Adicionar • Pesquisa na web • Conhecimento</div>
        </CardContent>
      </Card>
    </div>
  )
}
