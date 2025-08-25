"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import ConversationHistory from '@/components/chat/conversation-history'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Send,
  Bot,
  User,
  Loader2,
  Copy,
  Check,
  Edit3,
  RefreshCcw,
  Zap,
  Paperclip,
  X,
  FileText,
  Image,
  Monitor,
  Save,
  Link as LinkIcon,
  Globe,
  BookOpen,
  Plus,
  Sun,
  Moon,
  Menu,
  Sparkles,
  Code,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  model?: string
  tokensUsed?: number
  attachments?: FileAttachment[]
}

interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  content: string // base64 for images, text content for documents
}

function RenderMessageContent({ content, isDark }: { content: string; isDark?: boolean }) {
  const lines = content.split('\n')
  const parts: JSX.Element[] = []
  let quoteBuffer: string[] = []

  const flushQuote = () => {
    if (quoteBuffer.length) {
      parts.push(
        <div key={`q-${parts.length}`} className={`border-l-4 pl-4 py-2 my-2 rounded-r-lg ${isDark ? 'bg-blue-500/10 border-blue-400/30' : 'bg-blue-50 border-blue-200'}`}>
          <div className="text-sm text-foreground/90 whitespace-pre-wrap italic">{quoteBuffer.join('\n').replace(/^>\s?/gm, '')}</div>
        </div>
      )
      quoteBuffer = []
    }
  }

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('>')) {
      quoteBuffer.push(line)
    } else {
      flushQuote()
      parts.push(
        <div key={`p-${idx}`} className="text-sm leading-relaxed whitespace-pre-wrap">
          {line.length ? line : ' '}
        </div>
      )
    }
  })
  flushQuote()
  return <>{parts}</>
}

// Categorias de modelos para melhor organização seguindo a estrutura da imagem
const MODEL_CATEGORIES = {
  FAST: {
    name: 'Modelos Rápidos (Ilimitados)',
    icon: Zap,
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tier: 'FREE' },
      { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', tier: 'FREE' },
      { id: 'gemini-2-flash-free', name: 'Gemini 2 Flash Free', tier: 'FREE' },
      { id: 'mistral-7b', name: 'Mistral 7B', tier: 'FREE' },
      { id: 'deepseek-r1-small', name: 'Deepseek R1 Small', tier: 'FREE' },
      { id: 'qwen-qwq', name: 'Qwen QwQ', tier: 'FREE' },
      { id: 'llama-2-13b', name: 'Llama 2 13B', tier: 'LITE' },
      { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', tier: 'LITE' },
      { id: 'deepseek-r1', name: 'Deepseek R1', tier: 'LITE' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini', tier: 'LITE' },
      { id: 'perplexity-sonar', name: 'Perplexity Sonar', tier: 'LITE' },
      { id: 'sabia-3.1', name: 'Sabiá 3.1', tier: 'LITE' },
    ]
  },
  ADVANCED: {
    name: 'Modelos Avançados',
    icon: Sparkles,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', tier: 'LITE' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tier: 'LITE' },
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', tier: 'LITE' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', tier: 'LITE' },
      { id: 'gemini-2-pro', name: 'Gemini 2 Pro', tier: 'LITE' },
      { id: 'grok-3', name: 'Grok 3', tier: 'LITE' },
      { id: 'perplexity-sonar-pro', name: 'Perplexity Sonar Pro', tier: 'LITE' },
      { id: 'perplexity-reasoning', name: 'Perplexity Reasoning', tier: 'LITE' },
      { id: 'mistral-large-2', name: 'Mistral Large 2', tier: 'LITE' },
      { id: 'gpt-4.1', name: 'GPT-4.1', tier: 'PRO' },
      { id: 'claude-4-sonnet-thinking', name: 'Claude 4 Sonnet Thinking', tier: 'PRO' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'PRO' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', tier: 'PRO' },
      { id: 'amazon-nova-premier', name: 'Amazon Nova Premier', tier: 'PRO' },
      { id: 'o3', name: 'o3', tier: 'PRO' },
      { id: 'o4-mini', name: 'o4 Mini', tier: 'PRO' },
    ]
  },
  CODE: {
    name: 'Código',
    icon: Code,
    models: [
      { id: 'phind-codellama-34b', name: 'Phind CodeLlama', tier: 'PRO' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder', tier: 'PRO' },
      { id: 'qwen-2.5-coder', name: 'Qwen 2.5 Coder', tier: 'PRO' },
    ]
  }
}

// Função para obter modelos disponíveis baseado no plano do usuário
function getAvailableModels(planType: string) {
  const tierMap: Record<string, string[]> = {
    FREE: ['FREE'],
    LITE: ['FREE', 'LITE'],
    PRO: ['FREE', 'LITE', 'PRO'],
    ENTERPRISE: ['FREE', 'LITE', 'PRO', 'ENTERPRISE']
  }
  
  const allowedTiers = tierMap[planType] || ['FREE']
  const availableModels: Array<{id: string, name: string, category: string, icon: any}> = []
  
  Object.entries(MODEL_CATEGORIES).forEach(([key, category]) => {
    category.models.forEach(model => {
      if (allowedTiers.includes(model.tier)) {
        availableModels.push({
          id: model.id,
          name: model.name,
          category: category.name,
          icon: category.icon
        })
      }
    })
  })
  
  return availableModels
}

export default function ChatPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [selectedCategory, setSelectedCategory] = useState<'FAST' | 'ADVANCED' | 'CODE'>('FAST')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userPlan, setUserPlan] = useState<string>('FREE')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [savedFiles, setSavedFiles] = useState<FileAttachment[]>([]) // Simular arquivos salvos
  const [webSearchEnabled, setWebSearchEnabled] = useState(false) // Estado para controlar busca na internet
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = useState(false) // Estado para controlar Knowledge Base
  const [isChatDisabledByLimit, setIsChatDisabledByLimit] = useState(false) // Novo estado
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const hasLoadedRef = useRef(false) // Prevent multiple loads
  const [usage, setUsage] = useState<{ used: number; limit: number | null; planType?: string }>({ used: 0, limit: null })
  const isAtLimit = typeof usage.limit === 'number' && usage.used >= usage.limit
  const [chatTheme, setChatTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'light'
    try { return (localStorage.getItem('chatTheme') as 'dark' | 'light') || 'light' } catch { return 'light' }
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [recentConversations, setRecentConversations] = useState<Array<{id:string; title:string}>>([])
  const [conversationTitle, setConversationTitle] = useState<string>('Nova conversa')
  const [editingTitle, setEditingTitle] = useState<boolean>(false)
  const [titleInput, setTitleInput] = useState<string>('')
  const [modelStatus, setModelStatus] = useState<'idle'|'thinking'|'error'>('idle')
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    // carregar recentes (melhora painel direito)
    ;(async()=>{
      try {
        const c = await fetch('/api/conversations').then(r=>r.ok?r.json():[])
        setRecentConversations(Array.isArray(c) ? c.slice(0,5).map((x:any)=>({ id:x.id, title:x.title })) : [])
      } catch { setRecentConversations([]) }
    })()
  }, [])

  // Título dinâmico: pega o primeiro prompt do usuário como fallback
  useEffect(() => {
    const userFirst = messages.find(m => m.role === 'user')
    if (userFirst && userFirst.content) {
      const t = userFirst.content.trim().slice(0, 60)
      if (t) setConversationTitle(t)
    } else {
      setConversationTitle('Nova conversa')
    }
  }, [messages])

  // Carrega título salvo localmente quando não há conversationId
  useEffect(() => {
    if (!conversationId) {
      try {
        const t = localStorage.getItem('kyroia:conv-title-draft')
        if (t && t.trim()) setConversationTitle(t.trim())
      } catch {}
    }
  }, [conversationId])

  const modelLabel = useMemo(() => {
    const map: Record<string,string> = {
      'gpt-4o-mini': 'GPT‑4o Mini',
    }
    return map[selectedModel] || selectedModel
  }, [selectedModel])
  const statusColor = useMemo(() => {
    return modelStatus === 'thinking' ? 'bg-amber-500' : modelStatus === 'error' ? 'bg-red-500' : 'bg-emerald-500'
  }, [modelStatus])
  
  const handleRegenerateFromLastUser = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        const text = messages[i].content
        setInput(text)
        setTimeout(() => {
          try { handleSubmit({ preventDefault: () => {} } as any) } catch {}
        }, 0)
        break
      }
    }
  }

  const handleSetConversationTitle = async (proposed: string) => {
    const title = (proposed || '').trim().slice(0, 80)
    if (!title) return
    if (!conversationId) {
      toast({ title: 'Título atualizado', description: title })
      return
    }
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!res.ok) throw new Error('Falha ao atualizar título')
      toast({ title: 'Título atualizado', description: title })
    } catch (e) {
      toast({ title: 'Erro', description: e instanceof Error ? e.message : 'Não foi possível atualizar o título', variant: 'destructive' })
    }
  }

  const resendFrom = async (index: number) => {
    if (index < 0 || index >= messages.length) return
    if (messages[index].role !== 'user') return
    const base = messages.slice(0, index + 1)
    setMessages(base)
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: base.map(msg => ({ role: msg.role, content: msg.content, attachments: msg.attachments })),
          model: selectedModel,
          conversationId,
          webSearchEnabled,
          knowledgeBaseEnabled,
        })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData?.message || 'Erro na resposta')
      }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')
      let assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: '', timestamp: new Date(), model: selectedModel }
      setMessages(prev => [...prev, assistantMessage])
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.token) {
                  assistantMessage.content += data.token
                  setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: assistantMessage.content } : msg))
                }
                if (data.done) {
                  setConversationId(data.conversationId)
                  assistantMessage.tokensUsed = data.tokensUsed?.total
                }
                if (data.error) throw new Error(data.error)
              } catch {}
            }
          }
        }
      }
    } catch (error) {
      toast({ title: 'Erro', description: error instanceof Error ? error.message : 'Falha ao reenviar', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user plan
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/subscription')
          if (response.ok) {
            const data = await response.json()
            setUserPlan(data.planType || 'FREE')
          }
        } catch (error) {
          console.error('Error fetching user plan:', error)
        }
      }
    }
    
    if (session) {
      fetchUserPlan()
    }
  }, [session])
  
  useEffect(() => {
    try {
      localStorage.setItem('chatTheme', chatTheme)
      window.dispatchEvent(new CustomEvent('kyroia:theme', { detail: { theme: chatTheme } }))
    } catch {}
  }, [chatTheme])

  // Load simple daily usage for header banner
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/usage/today', { cache: 'no-store' })
        if (!res.ok) return
        const j = await res.json()
        setUsage({
          used: Number(j?.dailyMessages?.used ?? 0),
          limit: j?.dailyMessages?.limit ?? null,
          planType: j?.planType,
        })
      } catch {}
    }
    load()
  }, [session])

  // Reset chat disabled state when model changes
  useEffect(() => {
    setIsChatDisabledByLimit(false)
  }, [selectedModel])

  // Nome amigável do modelo atual (para badge no header)
  const currentModelName = (() => {
    const match = getAvailableModels(userPlan).find(m => m.id === selectedModel)
    return match?.name ?? selectedModel
  })()

  const loadTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`)
      if (response.ok) {
        const template = await response.json()
        setInput(template.templateContent)
        toast({
          title: "Template carregado!",
          description: `Template "${template.name}" pronto para usar.`,
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o template.",
        variant: "destructive",
      })
    }
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (response.ok) {
        const conversation = await response.json()
        setConversationId(conversationId)
        setMessages(conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role.toLowerCase() as 'user' | 'assistant',
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          model: msg.modelUsed,
          tokensUsed: msg.tokensUsed,
        })))
        if (conversation.modelUsed) {
          setSelectedModel(conversation.modelUsed)
        }
        toast({
          title: "Conversa carregada!",
          description: "Você pode continuar de onde parou.",
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar a conversa.",
        variant: "destructive",
      })
    }
  }, [])

  // Load template, conversation, or prompt if specified in URL
  useEffect(() => {
    if (hasLoadedRef.current) return
    
    const templateId = searchParams.get('template')
    const conversationId = searchParams.get('conversation')
    const promptParam = searchParams.get('prompt')
    
    if (templateId && templateId.length > 0) {
      hasLoadedRef.current = true
      loadTemplate(templateId)
    } else if (conversationId && conversationId.length > 0) {
      hasLoadedRef.current = true
      loadConversation(conversationId)
    } else if (promptParam && promptParam.length > 0) {
      hasLoadedRef.current = true
      setInput(decodeURIComponent(promptParam))
      // Focus the textarea after setting the prompt
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Client-only effect to prefill from localStorage without affecting SSR markup
  useEffect(() => {
    try {
      const draft = localStorage.getItem('kyroia:template-draft')
      if (draft) {
        const ev = new CustomEvent('kyroia:prefill', { detail: { text: draft } })
        window.dispatchEvent(ev)
        localStorage.removeItem('kyroia:template-draft')
      }
    } catch {}
  }, [])

// Classe de erro customizada
class HttpError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }
}

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive",
        })
        continue
      }

      // Validate file type
      const allowedTypes = [
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/json',
        'text/javascript',
        'text/html',
        'text/css',
      ]

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo não suportado",
          description: "Suportamos apenas texto, imagens, PDF e alguns formatos de código.",
          variant: "destructive",
        })
        continue
      }

      try {
        let content = ''
        if (file.type.startsWith('image/')) {
          // Convert image to base64
          const reader = new FileReader()
          content = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
        } else {
          // Read text content
          content = await file.text()
        }

        const attachment: FileAttachment = {
          id: Date.now().toString() + Math.random().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          content,
        }

        setAttachments(prev => [...prev, attachment])
        toast({
          title: "Arquivo anexado",
          description: `${file.name} foi anexado com sucesso.`,
        })
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foi possível processar o arquivo.",
          variant: "destructive",
        })
      }
    }

    // Clear the input
    if (event.target) {
      event.target.value = ''
    }
  }

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return

    try {
      // Aqui você normalmente faria uma requisição para buscar o conteúdo da URL
      // Por enquanto, vamos simular com uma mensagem
      const urlAttachment: FileAttachment = {
        id: Date.now().toString() + Math.random().toString(),
        name: urlInput,
        type: 'text/html',
        size: 0,
        content: `[URL Content from: ${urlInput}]`, // Em produção, você buscaria o conteúdo real
      }

      setAttachments(prev => [...prev, urlAttachment])
      toast({
        title: "URL adicionada",
        description: `${urlInput} foi anexada com sucesso.`,
      })
      setUrlInput('')
      setUrlDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erro ao adicionar URL",
        description: "Não foi possível adicionar a URL.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
      toast({
        title: "Copiado!",
        description: "Mensagem copiada para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a mensagem.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && attachments.length === 0) || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setAttachments([]) // Clear attachments after sending
    setIsLoading(true)
    setModelStatus('thinking')

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            attachments: msg.attachments
          })),
          model: selectedModel,
          conversationId,
          webSearchEnabled,
          knowledgeBaseEnabled
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Usar a classe de erro customizada para propagar mais detalhes
        throw new HttpError(errorData.message || 'Erro na resposta', response.status, errorData)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        model: selectedModel
      }

      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.token) {
                  assistantMessage.content += data.token
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === assistantMessage.id 
                        ? { ...msg, content: assistantMessage.content }
                        : msg
                    )
                  )
                }
                
                if (data.done) {
                  setConversationId(data.conversationId)
                  assistantMessage.tokensUsed = data.tokensUsed?.total
                }
                
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.error('Parse error:', parseError)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setModelStatus('error')
      let toastMessage = "Erro ao enviar mensagem";
      let toastTitle = "Erro no chat";

      if (error instanceof HttpError && error.data?.errorCode === "LIMIT_REACHED") {
        setIsChatDisabledByLimit(true) // Desabilita o chat
        toastTitle = "Limite Atingido"
        // Construir mensagem mais detalhada
        toastMessage = error.message // Mensagem base do backend (ex: "Daily message limit reached (10/10)")

        if (error.data.planType && error.data.usage) {
          if (error.data.details?.limitType === 'dailyMessages') {
             toastMessage = `Você atingiu seu limite de ${error.data.details.limit} mensagens diárias para o plano ${error.data.planType}.`
          } else if (error.data.details?.limitType === 'monthlyTokens') {
            toastMessage = `Você atingiu seu limite de tokens mensais para o plano ${error.data.planType}.`
          }
        }
        // Para adicionar link ao toast, a description do toast pode precisar aceitar JSX.
        // Se não, podemos adicionar a sugestão de upgrade na mensagem.
        toastMessage += " Considere fazer um upgrade para continuar."

        // Exemplo de como adicionar um link se o toast suportar ReactNode na description
        // (isso depende da implementação do componente `toast`)
        // const symptômesDescription = (
        //   <>
        //     {toastMessage}
        //     <Button variant="link" onClick={() => router.push('/pricing')} className="p-0 h-auto text-white underline">
        //       Fazer Upgrade
        //     </Button>
        //   </>
        // );
      } else if (error instanceof Error) {
        toastMessage = error.message
      }

      toast({
        title: toastTitle,
        description: toastMessage, // Aqui poderia ser o JSX com o botão se suportado
        variant: "destructive",
        // duration: isChatDisabledByLimit ? Infinity : 5000 // Manter o toast visível se o chat estiver desabilitado?
      })
      
      // Remove a mensagem do usuário que falhou da UI, exceto se o chat foi desabilitado por limite
      // pois nesse caso a mensagem pode já ter sido removida ou o estado do chat é diferente.
      if (!isChatDisabledByLimit && messages.length > 0 && messages[messages.length -1].role === 'user') {
         setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // Remove a mensagem específica
      } else if (messages.length > 0 && messages[messages.length -1].role === 'user' && !(error instanceof HttpError && error.data?.errorCode === "LIMIT_REACHED")) {
        // Se não for erro de limite, remove a última mensagem do usuário
         setMessages(prev => prev.slice(0, -1));
      }


    } finally {
      setIsLoading(false)
      if (!isChatDisabledByLimit && modelStatus !== 'error') setModelStatus('idle')
    }
  }

  // Inline title editing helpers
  const startInlineTitleEdit = () => {
    setTitleInput(conversationTitle)
    setEditingTitle(true)
  }
  const commitInlineTitleEdit = () => {
    const v = titleInput.trim()
    if (v && v !== conversationTitle) {
      if (conversationId) {
        handleSetConversationTitle(v)
        try { localStorage.removeItem('kyroia:conv-title-draft') } catch {}
      } else {
        setConversationTitle(v)
        try { localStorage.setItem('kyroia:conv-title-draft', v) } catch {}
        toast({ title: 'Título salvo localmente', description: v })
      }
    }
    setEditingTitle(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isChatDisabledByLimit) return; // Não permitir submit se desabilitado
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setConversationId(null)
    setAttachments([])
    setIsChatDisabledByLimit(false) // Reset limit state on new chat
    textareaRef.current?.focus()
  }

  const handleLoadConversation = async (conversationId: string) => {
    await loadConversation(conversationId)
  }

  const handleNewConversation = () => {
    handleNewChat()
  }

  return (
    <div className="min-h-screen w-full">
      {/* Conteúdo principal simplificado */}
      <main className="max-w-4xl mx-auto px-4 flex flex-col min-w-0">
        {/* Topbar removido para simplificar */}
        <div className="hidden">
          {/* Botão hambúrguer + Drawer (apenas mobile) */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-black/10"
                aria-label="Abrir histórico de conversas"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 sm:w-80">
              <ConversationHistory
                currentConversationId={conversationId || undefined}
                onSelectConversation={(id) => {
                  handleLoadConversation(id)
                  setIsMobileSidebarOpen(false)
                }}
                onNewConversation={() => {
                  handleNewConversation()
                  setIsMobileSidebarOpen(false)
                }}
              />
            </SheetContent>
          </Sheet>

          {/* Seletor segmentado por categoria + select de modelos */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Headline da conversa */}
            <div className="hidden md:flex flex-col mr-2 min-w-0">
              <div className="text-sm font-medium truncate">
                {editingTitle ? (
                  <input
                    value={titleInput}
                    onChange={(e)=>setTitleInput(e.target.value)}
                    onBlur={commitInlineTitleEdit}
                    onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); commitInlineTitleEdit()} if(e.key==='Escape'){ setEditingTitle(false) } }}
                    autoFocus
                    className="h-7 px-2 rounded border border-border bg-background text-foreground text-sm w-full"
                  />
                ) : (
                  <button type="button" className="truncate text-left hover:underline" onClick={startInlineTitleEdit} title="Renomear conversa">
                    {conversationTitle}
                  </button>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${statusColor}`} />
                  {modelStatus==='thinking' && <Loader2 className="h-3 w-3 animate-spin opacity-70" />}
                  {modelLabel}
                </span>
                <span>•</span>
                <span>{userPlan}</span>
          </div>
          {/* Progress bar while thinking */}
          <div className={`absolute inset-x-0 bottom-0 ${modelStatus==='thinking' ? 'h-1 rounded-full bg-gradient-to-r from-primary/30 via-primary to-primary/30 animate-pulse' : 'h-0 bg-transparent'}`} />
        </div>
            <div className="hidden sm:flex items-center gap-1 rounded-md border border-border p-1 bg-card">
              {([
                { k: 'FAST', Icon: Zap, label: 'Rápidos' },
                { k: 'ADVANCED', Icon: Sparkles, label: 'Avançados' },
                { k: 'CODE', Icon: Code, label: 'Código' },
              ] as const).map(({ k, Icon, label }) => (
                <Button
                  key={k}
                  size="sm"
                  variant={selectedCategory === (k as any) ? 'secondary' : 'ghost'}
                  className={`h-8 px-2 rounded-md ${selectedCategory === (k as any) ? '' : 'text-muted-foreground'}`}
                  onClick={() => setSelectedCategory(k as any)}
                >
                  <Icon className="h-4 w-4 mr-1" /> {label}
                </Button>
              ))}
            </div>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[220px] h-9 bg-card border-border/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Modelo" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[360px] bg-card border-border/50 rounded-xl">
                {getAvailableModels(userPlan)
                  .filter(m => {
                    // Mapear nome para chave (rápidos/avançados/código)
                    const cat = m.category
                    if (selectedCategory === 'FAST') return cat.includes('Rápid') || cat.includes('Ilimit')
                    if (selectedCategory === 'ADVANCED') return cat.includes('Avançad')
                    if (selectedCategory === 'CODE') return cat.includes('Código')
                    return true
                  })
                  .map(model => {
                    const Icon = model.icon
                    return (
                      <SelectItem key={model.id} value={model.id} className="rounded-lg">
                        <div className="flex items-center gap-2 w-full">
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{model.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
              </SelectContent>
            </Select>
          </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="h-9" onClick={handleNewChat} aria-label="Nova conversa">
                <Plus className="h-4 w-4 mr-1" />
                Nova Conversa
              </Button>
              {/* Sugestões popover (md/lg) */}
              <div className="hidden md:block xl:hidden">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9">Sugestões</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 animate-in fade-in-0 zoom-in-95">
                    <div className="text-sm font-semibold mb-2">Sugestões rápidas</div>
                    <div className="flex flex-col gap-2">
                      {[ 'Esboçar plano de projeto', 'Gerar checklist de tarefas', 'Sintetizar reunião em bullets' ].map(s => (
                        <Button key={s} variant="outline" className="h-8 rounded-lg justify-start" onClick={()=>setInput(s)}>
                          {s}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setChatTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                title={chatTheme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {chatTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-0 py-3 pb-36">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-sm text-muted-foreground">Digite sua mensagem para começar</div>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-[42rem] mx-auto">
            {messages.map((message, idx) => (
              <div key={message.id} className={`group/message flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`relative transition-all duration-200 max-w-[560px] md:max-w-[640px] rounded-md px-3 py-2.5 text-sm leading-6 shadow-sm animate-in fade-in-0 ${message.role === 'user' ? 'slide-in-from-right-2' : 'slide-in-from-left-2'} ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground hover:shadow-md'
                    : 'bg-card/80 border border-border/40 text-foreground hover:border-border/50'
                }`}>
                  {/* Inline actions on hover */}
                  <div className="absolute -top-2 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 bg-background/80 border border-border/60 rounded-lg px-1 py-0.5 shadow-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent"
                              onClick={() => handleCopy(message.content, message.id)}
                              aria-label="Copiar"
                              type="button"
                            >
                              {copiedId === message.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {message.role === 'user' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent"
                                onClick={() => { setEditingId(message.id); setEditingText(message.content) }}
                                aria-label="Editar"
                                type="button"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {message.role === 'assistant' && idx === messages.length - 1 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-accent"
                                onClick={handleRegenerateFromLastUser}
                                aria-label="Regenerar"
                                type="button"
                              >
                                <RefreshCcw className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Regenerar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                    {message.attachments && message.attachments.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                        {message.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/10 rounded-lg">
                          {attachment.type.startsWith('image/') ? <Image className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            <span className="text-xs truncate flex-1">{attachment.name}</span>
                          <span className="text-[10px] opacity-70">{formatFileSize(attachment.size)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  {editingId === message.id ? (
                    <div className="space-y-1">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="min-h-[80px] resize-none border border-border/40 bg-background/60"
                      />
                      <div className="flex items-center gap-2 text-[10px]">
                        <Button size="sm" className="h-7 px-2" onClick={() => { setMessages(prev => prev.map(m => m.id === message.id ? { ...m, content: editingText } : m)); setEditingId(null); setEditingText(''); resendFrom(idx) }}>Reenviar</Button>
                        <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => { setEditingId(null); setEditingText('') }}>Cancelar</Button>
                    </div>
                      </div>
                  ) : (
                    <RenderMessageContent content={message.content} isDark={chatTheme==='dark'} />
                  )}
                  <div className="mt-1 flex items-center justify-between text-[10px] opacity-0 transition-opacity group-hover/message:opacity-100">
                    <span>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-1">
                      <button
                        className={`h-5 w-5 inline-flex items-center justify-center rounded ${message.role === 'user' ? 'bg-white/20' : 'bg-background/40'} hover:opacity-90`}
                        onClick={() => handleCopy(message.content, message.id)}
                        title="Copiar"
                      >
                        {copiedId === message.id ? <Check className="h-2.5 w-2.5" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className={`h-6 w-6 inline-flex items-center justify-center rounded ${message.role === 'user' ? 'bg-white/25' : 'bg-background/40'} hover:opacity-90`} title="Mais ações">⋯</button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={message.role === 'user' ? 'end' : 'start'} className="w-48">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => { navigator.clipboard.writeText(message.content) }}>Copiar</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => { setInput(message.content); textareaRef.current?.focus() }}>Usar como prompt</DropdownMenuItem>
                          {/* Opção de salvar como template removida */}
                {message.role === 'user' && (
                            <>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => { setEditingId(message.id); setEditingText(message.content) }}>Editar e reenviar</DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer" onClick={() => resendFrom(idx)}>Continuar a partir daqui</DropdownMenuItem>
                            </>
                          )}
                          {message.role === 'assistant' && idx === messages.length - 1 && (
                            <DropdownMenuItem className="cursor-pointer" onClick={handleRegenerateFromLastUser}>Regenerar</DropdownMenuItem>
                          )}
                          {message.role === 'user' && (
                            <DropdownMenuItem className="cursor-pointer" onClick={() => {
                              let sel = ''
                              try { sel = (window.getSelection()?.toString() || '').trim() } catch {}
                              const base = sel || message.content
                              handleSetConversationTitle(base)
                            }}>Usar como título da conversa</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer" onClick={() => setMessages(prev => prev.filter(m => m.id !== message.id))}>Apagar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                      </div>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="max-w-[80%]">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Pensando...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area - Docked overlay */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30">
        <form onSubmit={handleSubmit} className={`pointer-events-auto max-w-3xl mx-auto rounded-lg border ${chatTheme === 'dark' ? 'bg-background/70 border-border/60' : 'bg-card/80 border-border/60'} backdrop-blur supports-[backdrop-filter]:bg-background/50 p-2.5 transition-all duration-200 ${(inputFocused || attachments.length>0 || urlDialogOpen || webSearchEnabled || knowledgeBaseEnabled) ? 'shadow-xl ring-1 ring-primary/20 translate-y-[-1px]' : 'shadow-lg'}`}>
          {/* Attachments Preview (with transition) */}
          <div className={`mb-3 transition-all duration-200 overflow-hidden ${attachments.length>0 ? 'opacity-100 max-h-64' : 'opacity-0 max-h-0'}`}>
            {attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Arquivos anexados:</div>
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border/50">
                    {attachment.type.startsWith('image/') ? (
                      <Image className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm truncate flex-1">{attachment.name}</span>
                    <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={`relative rounded-xl p-2`}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.csv,.pdf,.jpg,.jpeg,.png,.gif,.webp,.json,.js,.html,.css"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={()=>setInputFocused(true)}
              onBlur={()=>setInputFocused(false)}
              placeholder={isChatDisabledByLimit ? "Limite atingido. Faça upgrade para continuar." : "Digite sua mensagem..."}
              className="min-h-[84px] max-h-[196px] resize-none border-0 bg-transparent px-3 pt-2.5 pb-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/60"
              disabled={isLoading || isChatDisabledByLimit}
            />
            {/* Bottom toolbar */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-end">
              {/* Barra de ferramentas simplificada: removidos anexos, Web Search e Knowledge */}
              
              <Button
                type="submit"
                disabled={(!input.trim() && attachments.length === 0) || isLoading || isChatDisabledByLimit}
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90"
              >
                {isLoading && !isChatDisabledByLimit ? ( // Mostrar loader apenas se não estiver desabilitado por limite
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Dialog para inserir URL */}
      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar arquivo de URL</DialogTitle>
            <DialogDescription>
              Insira a URL do arquivo que deseja adicionar ao chat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/arquivo.pdf"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleUrlSubmit()
                  }
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUrlDialogOpen(false)
                setUrlInput('')
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
    {/* Painel direito removido para UI limpa */}
    </div>
  )
}
