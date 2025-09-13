"use client"

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import MarkdownRenderer from '@/components/chat/MarkdownRenderer'
import TemplateCard from '@/components/templates/TemplateCard'
import CategoriesBar from '@/components/docs/CategoriesBar'
import SaveAsTemplateDialog from '@/components/docs/SaveAsTemplateDialog'
import { TemplatePreviewDialog } from '@/components/templates/TemplatePreviewDialog'
import SidebarMini from '@/components/docs/SidebarMini'
import WaterfallGrid, { WaterfallItem } from '@/components/docs/WaterfallGrid'
import { Paperclip, Mic, CornerDownLeft, Loader2, FileText, Archive, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import RichEditor from '@/components/docs/RichEditor'
import FillVariablesDialog, { extractCurlyVars } from '@/components/docs/FillVariablesDialog'

type PromptTemplate = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  templateContent: string
  usageCount: number
  icon?: string | null
  gradient?: string | null
  isFavorite?: boolean
}

export default function DocsHome() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Templates')
  const [prompt, setPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [liveStream, setLiveStream] = useState<boolean>(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'rich'|'md'>('rich')
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [fillVarsOpen, setFillVarsOpen] = useState(false)
  const [pendingTemplateContent, setPendingTemplateContent] = useState<string | null>(null)
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [currentDocIsPublic, setCurrentDocIsPublic] = useState<boolean>(false)
  const [currentDocPublicId, setCurrentDocPublicId] = useState<string | null>(null)
  const [currentDocStatus, setCurrentDocStatus] = useState<'draft'|'published'|'archived'>('draft')
  const [docs, setDocs] = useState<any[]>([])
  const [genMode, setGenMode] = useState<'full'|'outline'>('full')
  const [tone, setTone] = useState<string>('Neutral')
  const [lengthPref, setLengthPref] = useState<string>('Medium')
  const [lastGenMode, setLastGenMode] = useState<'full'|'outline'|null>(null)
  const abortRef = useMemo(() => ({ current: null as AbortController | null }), [])
  const [isAgentRunning, setIsAgentRunning] = useState(false)
  const agentAbortRef = useMemo(() => ({ current: null as AbortController | null }), [])
  const [agentOpen, setAgentOpen] = useState(false)
  const [agentObjective, setAgentObjective] = useState('Criar um documento chamado "Proposta 2025" com Introdução e Orçamento, depois publicar.')
  const [agentEvents, setAgentEvents] = useState<any[]>([])
  const [trashOpen, setTrashOpen] = useState(false)
  const [trash, setTrash] = useState<any[]>([])
  const [trashQuery, setTrashQuery] = useState('')
  const [trashLimit, setTrashLimit] = useState(50)
  const [showArchived, setShowArchived] = useState(false)
  const [docsTab, setDocsTab] = useState<'todos'|'arquivados'|'lixeira'>('todos')
  const [archivedCount, setArchivedCount] = useState(0)
  const [trashCount, setTrashCount] = useState(0)
  const [allCount, setAllCount] = useState(0)
  const [countsLoading, setCountsLoading] = useState(false)
  const defaultRefreshMs = Number(process.env.NEXT_PUBLIC_DOCS_COUNT_REFRESH_MS || 30000)
  const [refreshMs, setRefreshMs] = useState<number>(defaultRefreshMs)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const refreshDebounceRef = useMemo(() => ({ current: null as any }), [])
  const { toast } = useToast()
  
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); alert('URL copiada') } catch { alert(text) }
  }
  const getPublicUrl = (publicId?: string | null) => {
    if (!publicId) return ''
    const base = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin) : '') as string
    return `${base}/docs/p/${publicId}`
  }
  const refreshCounts = async () => {
    try {
      setCountsLoading(true)
      const r0 = await fetch('/api/docs/items?count=1'); const c0 = await r0.json(); setAllCount(Number(c0?.count||0))
      const r1 = await fetch('/api/docs/items?archived=1&count=1'); const c1 = await r1.json(); setArchivedCount(Number(c1?.count||0))
      const r2 = await fetch('/api/docs/items/trash?count=1'); const c2 = await r2.json(); setTrashCount(Number(c2?.count||0))
      setLastUpdated(Date.now())
    } catch {} finally { setCountsLoading(false) }
  }

  const scheduleRefreshCounts = (delay = 300) => {
    try { if (refreshDebounceRef.current) clearTimeout(refreshDebounceRef.current) } catch {}
    refreshDebounceRef.current = setTimeout(() => { refreshCounts() }, delay)
  }
  const gallery: WaterfallItem[] = useMemo(() => [
    { id: 'g1', title: 'Resume 1', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/a5590ae8-ba44-3dd9-8baa-18adc914ee2f' },
    { id: 'g2', title: 'Cover letter', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/96bf76e2-6b15-3cbe-bc50-7c7e908d0876' },
    { id: 'g3', title: 'Invoice', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/1dbf8b5a-a488-3ef7-9c6f-9791d7544256' },
    { id: 'g4', title: 'Annual Report', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/bdbeb49b-4d72-33e0-ae30-fa83f5456fea' },
    { id: 'g5', title: 'Agenda', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/b86e5973-e160-3fb0-8d68-a19fd3560212' },
    { id: 'g6', title: 'Social Media Report', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/d6f1df97-cf56-3745-8683-8d3d8fbd29d1' },
    { id: 'g7', title: 'Proust questionnaire', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/5a0f2ef7-813b-3694-a48b-52b5144521f6' },
    { id: 'g8', title: 'Receipt', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/3ae11e8f-7bc5-3efc-a01c-644c23e7906e' },
    { id: 'g9', title: 'Business conference', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/f56282a4-e77d-3b43-bfe2-67e290073662' },
    { id: 'g10', title: 'Teaching material', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/3db18493-ac4a-3885-a104-3f885346c682' },
    { id: 'g11', title: 'Research survey', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/41d3d523-8eaf-3a19-ae4d-07f607d64cab' },
    { id: 'g12', title: 'Digital marketing performance', thumb: 'https://page.gensparksite.com/docs_agent/template/v1/13b0aa07-777c-3da2-8955-89a131fd9a12' },
  ], [])

  const loadTemplates = useCallback(async (cat: string) => {
    try {
      const params = new URLSearchParams()
      // Map our English categories to simple ids for backend (optional):
      const map: Record<string, string> = {
        'All Templates': 'all',
        'Job Applications': 'work',
        'Business Communications': 'business',
        'Reports and Analysis': 'reports',
        'Forms and Surveys': 'forms',
        'Legal and Finance': 'legal',
        'Education and Training': 'education',
        'Creative and Marketing': 'marketing',
        'Event and Planning': 'event',
      }
      const catId = map[cat] || 'all'
      if (catId !== 'all') params.set('category', catId)
      const res = await fetch(`/api/docs/templates?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) setTemplates(data)
    } catch {}
  }, [])

  useEffect(() => { loadTemplates(selectedCategory) }, [selectedCategory, loadTemplates])
  useEffect(() => { (async () => { try { const r = await fetch(`/api/docs/items${showArchived ? '?archived=1' : ''}`); const j = await r.json(); if (Array.isArray(j)) setDocs(j) } catch {} })() }, [showArchived])
  useEffect(() => { refreshCounts() }, [])
  useEffect(() => {
    try { const s = localStorage.getItem('docs_count_refresh_ms'); if (s) setRefreshMs(Math.max(5000, Number(s))) } catch {}
  }, [])
  useEffect(() => {
    const tid = setInterval(() => { if (docsTab !== 'lixeira') refreshCounts() }, Math.max(5000, refreshMs))
    return () => clearInterval(tid)
  }, [refreshMs, docsTab])
  // Persist selected tab
  useEffect(() => { try { const t = localStorage.getItem('docs_tab') as any; if (t==='todos'||t==='arquivados'||t==='lixeira') setDocsTab(t) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem('docs_tab', docsTab) } catch {} }, [docsTab])
  // Auto-open by query param (?open=docId)
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const openId = sp.get('open')
      if (openId && openId.trim()) {
        openDocument(openId)
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Preferências: Live updates & Agente
  useEffect(() => {
    try {
      const lsLive = localStorage.getItem('docs_live_stream')
      if (lsLive != null) setLiveStream(lsLive === '1' || lsLive === 'true')
      const lsAgentObj = localStorage.getItem('docs_agent_objective')
      if (lsAgentObj) setAgentObjective(lsAgentObj)
      const lsAgentOpen = localStorage.getItem('docs_agent_open')
      if (lsAgentOpen != null) setAgentOpen(lsAgentOpen === '1' || lsAgentOpen === 'true')
      const lsTone = localStorage.getItem('docs_tone')
      if (lsTone) setTone(lsTone)
      const lsLen = localStorage.getItem('docs_length')
      if (lsLen) setLengthPref(lsLen)
      const lsTq = localStorage.getItem('docs_trash_query')
      if (lsTq != null) setTrashQuery(lsTq)
      const lsTl = localStorage.getItem('docs_trash_limit')
      if (lsTl != null && !Number.isNaN(Number(lsTl))) setTrashLimit(Number(lsTl))
      const lsGen = localStorage.getItem('docs_gen_mode')
      if (lsGen === 'full' || lsGen === 'outline') setGenMode(lsGen)
      const lsEditor = localStorage.getItem('docs_editor_mode')
      if (lsEditor === 'rich' || lsEditor === 'md') setMode(lsEditor)
      const lsCat = localStorage.getItem('docs_category')
      if (lsCat) setSelectedCategory(lsCat)
      const lsTitle = localStorage.getItem('docs_current_title')
      if (lsTitle) setTitle(lsTitle)
    } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('docs_live_stream', liveStream ? '1' : '0') } catch {} }, [liveStream])
  useEffect(() => { try { localStorage.setItem('docs_agent_objective', agentObjective || '') } catch {} }, [agentObjective])
  useEffect(() => { try { localStorage.setItem('docs_agent_open', agentOpen ? '1' : '0') } catch {} }, [agentOpen])
  useEffect(() => { try { localStorage.setItem('docs_tone', tone || '') } catch {} }, [tone])
  useEffect(() => { try { localStorage.setItem('docs_length', lengthPref || '') } catch {} }, [lengthPref])
  useEffect(() => { try { localStorage.setItem('docs_trash_query', trashQuery || '') } catch {} }, [trashQuery])
  useEffect(() => { try { localStorage.setItem('docs_trash_limit', String(trashLimit)) } catch {} }, [trashLimit])
  useEffect(() => { try { localStorage.setItem('docs_gen_mode', genMode) } catch {} }, [genMode])
  useEffect(() => { try { localStorage.setItem('docs_editor_mode', mode) } catch {} }, [mode])
  useEffect(() => { try { localStorage.setItem('docs_category', selectedCategory) } catch {} }, [selectedCategory])
  useEffect(() => { try { localStorage.setItem('docs_current_title', title) } catch {} }, [title])

  const filtered = useMemo(() => {
    return templates
  }, [templates])

  const selectedTemplate = useMemo(() => templates.find(t => t.id === previewId) || null, [previewId, templates])

  const handleFavorite = async (id: string) => {
    try {
      const t = templates.find(x => x.id === id)
      const action = t?.isFavorite ? 'remove' : 'add'
      const res = await fetch('/api/docs/templates/favorite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: id, action }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao favoritar')
      setTemplates(prev => prev.map(x => x.id === id ? { ...x, isFavorite: data.isFavorite } : x))
    } catch {}
  }

  const newDocument = () => {
    setCurrentDocId(null)
    setTitle('')
    setPrompt('')
    setResult('')
    setMode('rich')
  }

  const saveDocument = async () => {
    const content = (result ?? prompt ?? '').toString()
    const fmt = mode === 'md' ? 'MD' : 'RICH'
    const docTitle = title?.trim() || (prompt?.split('\n')[0] || 'Sem título')
    if (!currentDocId) {
      const res = await fetch('/api/docs/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: docTitle, content, format: fmt, status: 'draft' }) })
      const j = await res.json().catch(() => null)
      if (res.ok && j?.id) {
        setCurrentDocId(j.id)
        setTitle(j.title)
        // refresh list
        try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
      }
    } else {
      await fetch(`/api/docs/items/${currentDocId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: docTitle, content, format: fmt }) })
      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
    }
  }

  const openDocument = async (id: string) => {
    try {
      const r = await fetch(`/api/docs/items/${id}`)
      const j = await r.json()
      if (r.ok && j?.id) {
        setCurrentDocId(j.id)
        setTitle(j.title || '')
        setResult(j.content || '')
        setMode(j.format === 'MD' ? 'md' : 'rich')
        setCurrentDocIsPublic(Boolean(j.isPublic))
        setCurrentDocPublicId(j.publicId || null)
        if (j.status === 'archived' || j.status === 'published' || j.status === 'draft') setCurrentDocStatus(j.status)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {}
  }

  const deleteDocument = async (id: string) => {
    try {
      await fetch(`/api/docs/items/${id}`, { method: 'DELETE' })
      setDocs((prev) => prev.filter((d) => d.id !== id))
      if (currentDocId === id) newDocument()
      refreshCounts()
    } catch {}
  }

  const loadTrash = async () => {
    try {
      const params = new URLSearchParams()
      if (trashQuery) params.set('q', trashQuery)
      if (trashLimit) params.set('limit', String(trashLimit))
      const r = await fetch(`/api/docs/items/trash?${params.toString()}`)
      const j = await r.json()
      if (Array.isArray(j)) setTrash(j)
    } catch {}
  }

  useEffect(() => { if (trashOpen) loadTrash() }, [trashOpen])

  const restoreDocument = async (id: string) => {
    try {
      await fetch(`/api/docs/items/${id}/restore`, { method: 'POST' })
      await loadTrash()
      const r = await fetch('/api/docs/items')
      const j = await r.json()
      if (Array.isArray(j)) setDocs(j)
      refreshCounts()
    } catch {}
  }

  const publishDocument = async () => {
    if (!currentDocId) return
    const res = await fetch(`/api/docs/items/${currentDocId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish' }) })
    const j = await res.json().catch(() => null)
    if (res.ok && j?.url) {
      try { await navigator.clipboard.writeText(j.url) } catch {}
      // refresh list
      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
      toast({
        title: 'Documento publicado',
        description: 'Link público copiado para a área de transferência.',
        action: (
          <ToastAction altText="Abrir" onClick={() => { try { window.open(j.url, '_blank') } catch {} }}>Abrir</ToastAction>
        ),
      })
      setCurrentDocStatus('published')
      setCurrentDocIsPublic(true)
      setCurrentDocPublicId(j.publicId || null)
      refreshCounts()
    }
  }

  // Publish/Unpublish direto da listagem
  const publishDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/docs/items/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'publish' }) })
      if (!res.ok) return
      const r = await fetch('/api/docs/items')
      const list = await r.json()
      if (Array.isArray(list)) setDocs(list)
      refreshCounts()
    } catch {}
  }
  const unpublishDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/docs/items/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unpublish' }) })
      if (!res.ok) return
      const r = await fetch('/api/docs/items')
      const list = await r.json()
      if (Array.isArray(list)) setDocs(list)
      refreshCounts()
    } catch {}
  }

  // Archive/Unarchive (list)
  const archiveDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/docs/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) })
      if (!res.ok) return toast({ title: 'Falha ao arquivar', variant: 'destructive' as any })
      toast({ title: 'Documento arquivado' })
      const r = await fetch('/api/docs/items')
      const list = await r.json()
      if (Array.isArray(list)) setDocs(list)
      refreshCounts()
    } catch { toast({ title: 'Erro ao arquivar', variant: 'destructive' as any }) }
  }
  const unarchiveDoc = async (id: string) => {
    try {
      const res = await fetch(`/api/docs/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) })
      if (!res.ok) return toast({ title: 'Falha ao desarquivar', variant: 'destructive' as any })
      toast({ title: 'Documento desarquivado' })
      const r = await fetch('/api/docs/items')
      const list = await r.json()
      if (Array.isArray(list)) setDocs(list)
      refreshCounts()
    } catch { toast({ title: 'Erro ao desarquivar', variant: 'destructive' as any }) }
  }

  const unpublishDocument = async () => {
    if (!currentDocId) return
    const res = await fetch(`/api/docs/items/${currentDocId}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unpublish' }) })
    if (res.ok) {
      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
      toast({ title: 'Documento despublicado' })
      setCurrentDocStatus('draft')
      setCurrentDocIsPublic(false)
      setCurrentDocPublicId(null)
      refreshCounts()
    }
  }

  const generate = async () => {
    if (liveStream) return generateStream()
    setIsLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          format: mode === 'md' ? 'markdown' : 'richtext',
          mode: genMode === 'outline' ? 'outline' : 'full',
          tone,
          length: lengthPref,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Falha ao gerar')
      setResult(data.content || '')
      setLastGenMode(genMode)
    } catch (e: any) {
      setError(e?.message || 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  const generateStream = async () => {
    setIsLoading(true)
    setIsStreaming(true)
    setResult('')
    setError(null)
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const response = await fetch('/api/docs/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          format: mode === 'md' ? 'markdown' : 'richtext',
          mode: genMode === 'outline' ? 'outline' : 'full',
          tone,
          length: lengthPref,
          title,
        }),
        signal: abortRef.current.signal,
      })
      if (!response.ok) {
        const err = await response.text().catch(() => '')
        throw new Error(err || 'Falha ao iniciar streaming')
      }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')
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
                if (data.created && data.docId) {
                  setCurrentDocId(data.docId)
                }
                if (data.token) {
                  setResult(prev => (prev || '') + data.token)
                }
                if (data.done) {
                  setLastGenMode(genMode)
                }
                if (data.error) throw new Error(data.error)
              } catch {}
            }
          }
        }
      }
      // refresh list ao final
      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
    } catch (e: any) {
      setError(e?.message || 'Erro no streaming')
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortRef.current = null as any
    }
  }

  const expandFromOutline = async () => {
    if (!result) return
    if (liveStream) return expandFromOutlineStream()
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/docs/generate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          format: mode === "md" ? "markdown" : "richtext",
          mode: "expand",
          outline: result,
          tone,
          length: lengthPref,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Falha ao expandir")
      setResult(data.content || "")
      setLastGenMode('full')
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      setError((e as any)?.message || "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const expandFromOutlineStream = async () => {
    if (!result) return
    setIsLoading(true)
    setIsStreaming(true)
    setError(null)
    setResult('')
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    try {
      const response = await fetch('/api/docs/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          format: mode === 'md' ? 'markdown' : 'richtext',
          mode: 'expand',
          outline: result,
          tone,
          length: lengthPref,
          title,
        }),
        signal: abortRef.current.signal,
      })
      if (!response.ok) {
        const err = await response.text().catch(() => '')
        throw new Error(err || 'Falha ao iniciar streaming')
      }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Stream não disponível')
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
                if (data.created && data.docId) setCurrentDocId(data.docId)
                if (data.token) setResult(prev => (prev || '') + data.token)
                if (data.done) setLastGenMode('full')
                if (data.error) throw new Error(data.error)
              } catch {}
            }
          }
        }
      }
      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
    } catch (e: any) {
      setError(e?.message || 'Erro no streaming')
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortRef.current = null as any
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] px-0 md:px-0 py-0">
      <div className="flex">
        <SidebarMini active="docs" onNew={() => setPrompt('')} />
        <main className="flex-1 px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Ready to create your docs?</h1>
          <div className="flex items-center gap-2">
            <button
              className={`text-sm px-3 py-1 rounded-full border ${mode==='rich' ? 'bg-black text-white' : ''}`}
              onClick={() => setMode('rich')}
            >Rich Text</button>
            <button
              className={`text-sm px-3 py-1 rounded-full border ${mode==='md' ? 'bg-black text-white' : ''}`}
              onClick={() => setMode('md')}
            >Markdown</button>
            <select aria-label="Geração" className="text-sm px-2 py-1 border rounded" value={genMode} onChange={(e)=>setGenMode(e.target.value as 'full'|'outline')}>
              <option value="full">Completo</option>
              <option value="outline">Outline</option>
            </select>
            <select aria-label="Tom" className="text-sm px-2 py-1 border rounded" value={tone} onChange={(e)=>setTone(e.target.value)}>
              <option>Neutral</option>
              <option>Formal</option>
              <option>Friendly</option>
              <option>Persuasive</option>
              <option>Technical</option>
            </select>
            <select aria-label="Extensão" className="text-sm px-2 py-1 border rounded" value={lengthPref} onChange={(e)=>setLengthPref(e.target.value)}>
              <option>Short</option>
              <option>Medium</option>
              <option>Long</option>
            </select>
            <label className="text-xs text-muted-foreground ml-2 flex items-center gap-1">
              <input type="checkbox" checked={liveStream} onChange={(e)=>setLiveStream(e.target.checked)} />
              Live updates
            </label>
            {currentDocId && (
              <>
                <button
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                  onClick={async()=>{ try { await navigator.clipboard.writeText((window.location.origin || '') + `/docs?open=${encodeURIComponent(currentDocId)}`); alert('Link do documento copiado') } catch {} }}
                >Copiar link do documento</button>
                {currentDocIsPublic && currentDocPublicId && (
                  <button
                    className="text-sm underline text-muted-foreground hover:text-foreground"
                    onClick={async()=>{ try { const url = getPublicUrl(currentDocPublicId); await navigator.clipboard.writeText(url); alert('Link público copiado') } catch {} }}
                  >Copiar link público</button>
                )}
              </>
            )}
          </div>
          </div>

          {/* Title + actions */}
          <div className="flex items-center gap-2 mb-3">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do documento" className="flex-1 px-3 py-2 border rounded" />
            {currentDocId ? (
              <Badge variant={currentDocStatus === 'archived' ? 'destructive' : currentDocIsPublic ? 'secondary' : 'outline'}>
                {currentDocStatus === 'archived' ? 'Arquivado' : currentDocIsPublic ? 'Publicado' : 'Rascunho'}
              </Badge>
            ) : null}
            <Button variant="outline" onClick={newDocument}>Novo</Button>
            <Button onClick={saveDocument}>Salvar</Button>
            {currentDocId ? (
              <>
                {currentDocStatus === 'archived' ? (
                  <Button variant="outline" onClick={async () => {
                    if (!currentDocId) return
                    try {
                      const res = await fetch(`/api/docs/items/${currentDocId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }) })
                      if (res.ok) { setCurrentDocStatus('draft'); toast({ title: 'Documento desarquivado' }) }
                    } catch {}
                  }}>Desarquivar</Button>
                ) : currentDocIsPublic ? (
                  <>
                    <Button variant="outline" onClick={unpublishDocument}>Despublicar</Button>
                    {currentDocPublicId && (
                      <Button variant="outline" onClick={() => copyToClipboard(getPublicUrl(currentDocPublicId))}>Copiar URL</Button>
                    )}
                  </>
                ) : (
                  <Button variant="outline" onClick={publishDocument}>Publicar/Compartilhar</Button>
                )}
                {currentDocStatus === 'archived' ? null : (
                  <Button variant="outline" onClick={async () => {
                    if (!currentDocId) return
                    try {
                      const res = await fetch(`/api/docs/items/${currentDocId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) })
                      if (res.ok) { setCurrentDocStatus('archived'); toast({ title: 'Documento arquivado' }) }
                    } catch {}
                  }}>Arquivar</Button>
                )}
              </>
            ) : null}
            <Button variant="outline" onClick={() => setAgentOpen(v => !v)}>Agente (CRUD)</Button>
            {isStreaming && (
              <Button variant="destructive" onClick={() => { try { abortRef.current?.abort() } catch {}; setIsStreaming(false); setIsLoading(false) }}>Parar</Button>
            )}
          </div>

          {agentOpen && (
            <div className="mb-4 border rounded p-3 bg-white">
              <div className="text-sm font-medium mb-2">Agente de Documentos (com Tools)</div>
              <textarea
                className="w-full border rounded p-2 text-sm"
                rows={3}
                value={agentObjective}
                onChange={(e)=>setAgentObjective(e.target.value)}
                placeholder="Descreva o objetivo do agente (CRUD)."
              />
              <div className="mt-2 flex items-center gap-2">
                <Button
                  onClick={async () => {
                    setAgentEvents([])
                    setIsAgentRunning(true)
                    try {
                      agentAbortRef.current?.abort(); agentAbortRef.current = new AbortController()
                      const response = await fetch('/api/agents/docs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ objective: agentObjective }),
                        signal: agentAbortRef.current.signal,
                      })
                      const reader = response.body?.getReader()
                      if (!reader) throw new Error('Stream indisponível')
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
                                const evt = JSON.parse(line.slice(6))
                                if (evt?.event === 'tool_result' && evt?.name === 'publish_doc') {
                                  const url = evt?.result?.url
                                  if (url) {
                                    try { navigator.clipboard.writeText(url) } catch {}
                                    toast({
                                      title: 'Publicado (Agente)',
                                      description: 'Link público copiado.',
                                      action: (
                                        <ToastAction altText="Abrir" onClick={() => { try { window.open(url, '_blank') } catch {} }}>Abrir</ToastAction>
                                      ),
                                    })
                                  }
                                }
                                setAgentEvents(prev => [...prev, evt])
                              } catch {}
                            }
                          }
                        }
                      }
                      // refresh docs
                      try { const r = await fetch('/api/docs/items'); const list = await r.json(); if (Array.isArray(list)) setDocs(list) } catch {}
                    } catch (e) {
                      if ((e as any)?.name === 'AbortError') {
                        setAgentEvents(prev => [...prev, { event: 'aborted' }])
                      } else {
                        setAgentEvents(prev => [...prev, { event: 'error', message: (e as any)?.message || 'Falha' }])
                      }
                    }
                    setIsAgentRunning(false)
                  }}
                >Executar Agente</Button>
                {isAgentRunning && (
                  <Button variant="destructive" onClick={() => { try { agentAbortRef.current?.abort() } catch {} }}>Parar Agente</Button>
                )}
              </div>
              <div className="mt-3 max-h-56 overflow-auto border rounded">
                {agentEvents.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-2">Sem eventos ainda.</div>
                ) : (
                  <ul className="text-xs divide-y">
                    {agentEvents.map((e, idx) => {
                      const url = e?.event === 'tool_result' && e?.name === 'publish_doc' ? (e?.result?.url || '') : ''
                      return (
                        <li key={idx} className="p-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{e.event || e.type || 'log'}</div>
                            {url ? (
                              <Button size="sm" variant="outline" onClick={() => copyToClipboard(url)}>Copiar URL</Button>
                            ) : null}
                          </div>
                          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(e, null, 2)}</pre>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {docsTab === 'lixeira' && (
            <div className="mb-4 border rounded p-3 bg-white">
              <div className="text-sm font-medium mb-2">Lixeira</div>
              <div className="flex items-center gap-2 mb-2">
                <input value={trashQuery} onChange={(e)=>setTrashQuery(e.target.value)} placeholder="Buscar por título" className="px-2 py-1 border rounded text-sm" />
                <select className="px-2 py-1 border rounded text-sm" value={trashLimit} onChange={(e)=>setTrashLimit(Number(e.target.value))}>
                  {[10,20,50,100].map(n => (<option key={n} value={n}>{n}</option>))}
                </select>
                <Button size="sm" variant="outline" onClick={loadTrash}>Atualizar</Button>
              </div>
              {trash.length === 0 ? (
                <div className="text-xs text-muted-foreground">Nenhum item na lixeira.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {trash.map((t) => (
                    <div key={t.id} className="border rounded p-2 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">Deletado em {new Date(t.deletedAt).toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => restoreDocument(t.id)}>Restaurar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prompt block styled to match reference */}
          <div className="bg-white dark:bg-[#333] rounded-[24px] shadow-[0px_6px_30px_0px_rgba(0,0,0,0.08)] border border-gray-200 dark:border-[#e6e9eb40] p-3 md:p-4">
            <Textarea
              placeholder="Describe the document you want to create (e.g., Resume, Report, Contract...)"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-[64px] text-sm"
            />
            <div className="flex items-center justify-between mt-2 text-[#909499]">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-[#444] rounded-md" title="Attach"><Paperclip className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-[#f0f0f0] dark:hover:bg-[#444] rounded-md" title="Voice"><Mic className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={generate} disabled={isLoading || isStreaming || !prompt.trim()} variant="secondary" className="text-[#909499] bg-[#f4f4f4] dark:bg-[#eeeeee30]">
                  {isLoading || isStreaming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <CornerDownLeft className="w-4 h-4 mr-2" />
                      Gerar
                    </>
                  )}
                </Button>
                {isStreaming && (
                  <Button variant="destructive" onClick={() => { try { abortRef.current?.abort() } catch {}; setIsStreaming(false); setIsLoading(false) }}>Parar</Button>
                )}
              </div>
            </div>
          </div>

      {/* Categorias */}
          <div className="mt-6">
            <CategoriesBar selected={selectedCategory} onChange={setSelectedCategory} />
          </div>

          {/* Waterfall gallery for visual parity */}
          <div className="mt-4">
            <WaterfallGrid items={gallery} />
          </div>

          {/* Grid de templates */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            template={{
              id: t.id,
              name: t.name,
              description: t.description || '',
              category: t.category || 'general',
              icon: t.icon || undefined,
              gradient: t.gradient || undefined,
              usageCount: Number(t.usageCount || 0),
              isFavorite: Boolean(t.isFavorite),
            }}
            onFavorite={() => handleFavorite(t.id)}
            onUse={() => {
              const content = t.templateContent || ''
              const vars = extractCurlyVars(content)
              if (vars.length > 0) {
                setPendingTemplateContent(content)
                setFillVarsOpen(true)
              } else {
                setPrompt(content)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              // track usage
              fetch('/api/docs/templates/used', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: t.id }) }).catch(() => {})
            }}
            onPreview={() => setPreviewId(t.id)}
          />
        ))}
          </div>

      {/* Resultado */}
      {(result || error) && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Resultado</h2>
          {/* Export toolbar */}
          <div className="flex items-center gap-2 mb-2">
            {lastGenMode === 'outline' && result ? (
              <Button variant="default" onClick={expandFromOutline} disabled={isLoading}>
                {isLoading ? 'Expandindo...' : 'Expandir Outline'}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => {
              const text = result || ''
              navigator.clipboard.writeText(text).catch(() => {})
            }}>Copiar</Button>
            <Button variant="outline" onClick={() => {
              const text = result || ''
              const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'document.md'
              a.click()
              URL.revokeObjectURL(url)
            }}>Baixar .md</Button>
            <Button variant="outline" onClick={() => {
              const text = result || ''
              const html = mode === 'md'
                ? `<pre style=\"font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space:pre-wrap;\">${escapeHtml(text)}</pre>`
                : text.split(/\n\n+/).map(p => `<p style=\"margin: 0 0 8px\">${escapeHtml(p)}</p>`).join('')
              const w = window.open('', '_blank')
              if (!w) return
              w.document.write(`<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Print</title><style>@media print { body { -webkit-print-color-adjust: exact; } }</style></head><body>${html}<script>window.onload=()=>window.print()</script></body></html>`)
              w.document.close()
            }}>Imprimir / PDF</Button>
            <Button variant="outline" disabled={!currentDocId} onClick={async () => {
              if (!currentDocId) return
              const r = await fetch(`/api/docs/items/${currentDocId}/pdf`)
              if (!r.ok) return
              const blob = await r.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `${sanitizeFilename(title || 'documento')}.pdf`
              a.click()
              URL.revokeObjectURL(url)
            }}>Baixar PDF (alta qualidade)</Button>
          </div>
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : mode === 'md' ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <MarkdownRenderer content={result || ''} />
            </div>
          ) : (
            <RichEditor value={result || ''} onChange={(v) => setResult(v)} />
          )}
          <div className="mt-3 flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsSaving(true)} disabled={!result}>Salvar como Template</Button>
            {lastGenMode === 'outline' && (
              <Button onClick={expandFromOutline} disabled={isLoading || isStreaming || !result}>Expandir Outline</Button>
            )}
          </div>
          <SaveAsTemplateDialog
            open={isSaving}
            onOpenChange={setIsSaving}
            initialContent={result || ''}
            initialName={prompt?.slice(0, 40) || undefined}
            initialCategoryId={selectedCategory}
            onSuccess={() => loadTemplates(selectedCategory)}
          />
        </div>
      )}

      {/* Meus Documentos */}
      <div className="mt-10">
        <Tabs value={docsTab} onValueChange={(v) => {
          const val = v as 'todos'|'arquivados'|'lixeira'
          setDocsTab(val)
          if (val === 'lixeira') { setTrashOpen(true); setShowArchived(false); loadTrash() }
          else if (val === 'arquivados') { setTrashOpen(false); setShowArchived(true) }
          else { setTrashOpen(false); setShowArchived(false) }
          scheduleRefreshCounts(250)
        }}>
          <TabsList className="bg-muted rounded-lg">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FileText className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Ver todos os documentos</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Todos</span>
              <Badge variant="outline" className={`ml-1 px-1 py-0 text-[10px] leading-4 ${countsLoading ? 'animate-pulse' : ''}`}>{allCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="arquivados" className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Archive className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Ver documentos arquivados</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Arquivados</span>
              <Badge variant="outline" className={`ml-1 px-1 py-0 text-[10px] leading-4 ${countsLoading ? 'animate-pulse' : ''}`}>{archivedCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="lixeira" className="flex items-center gap-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Trash2 className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">Ver itens na lixeira</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>Lixeira</span>
              <Badge variant="outline" className={`ml-1 px-1 py-0 text-[10px] leading-4 ${countsLoading ? 'animate-pulse' : ''}`}>{trashCount}</Badge>
            </TabsTrigger>
          </TabsList>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <Button size="sm" variant="outline" onClick={() => refreshCounts()} disabled={countsLoading}>
              {countsLoading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin"/>Sincronizando…</> : 'Sincronizar'}
            </Button>
            <div className="flex items-center gap-1">
              Auto:
              <Button size="sm" variant="ghost" className="px-2" onClick={() => {
                const next = refreshMs === 30000 ? 60000 : refreshMs === 60000 ? 120000 : 30000
                setRefreshMs(next)
                try { localStorage.setItem('docs_count_refresh_ms', String(next)) } catch {}
              }}>{Math.floor(refreshMs/1000)}s</Button>
            </div>
            {countsLoading && (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin"/> Sincronizando…</span>
            )}
            {!countsLoading && lastUpdated && (
              <span className="opacity-70">Atualizado às {new Date(lastUpdated).toLocaleTimeString('pt-BR')}</span>
            )}
          </div>
        </Tabs>
        <h3 className="text-lg font-semibold mt-3 mb-2">Meus Documentos</h3>
        {docsTab !== 'lixeira' && Array.isArray(docs) && docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {docs.map((d) => (
              <div key={d.id} className="border rounded p-3 bg-white flex items-center justify-between gap-2">
                <div>
              <div className="font-medium text-sm">{d.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{new Date(d.updatedAt || d.createdAt).toLocaleString('pt-BR')}</span>
                    {d.isPublic && d.publicId ? (
                      <Badge
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => { try { window.open(getPublicUrl(d.publicId), '_blank') } catch {} }}
                      >Publicado</Badge>
                    ) : null}
                    {d.status === 'archived' ? (
                      <Badge variant="destructive">Arquivado</Badge>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => openDocument(d.id)}>Abrir</Button>
                  <Button size="sm" variant="outline" onClick={() => { try { window.open(`/docs?open=${encodeURIComponent(d.id)}`, '_blank') } catch {} }}>Ver</Button>
                  <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText((window.location.origin || '') + `/docs?open=${encodeURIComponent(d.id)}`); alert('Link do documento copiado') } catch {} }}>Copiar</Button>
                  {d.status === 'archived' ? null : d.isPublic ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => unpublishDoc(d.id)}>Despublicar</Button>
                      {d.publicId && (
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(getPublicUrl(d.publicId))}>Copiar URL</Button>
                      )}
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => publishDoc(d.id)}>Publicar</Button>
                  )}
                  {d.status === 'archived' ? (
                    <Button size="sm" variant="outline" onClick={() => unarchiveDoc(d.id)}>Desarquivar</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => archiveDoc(d.id)}>Arquivar</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteDocument(d.id)}>Excluir</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (docsTab !== 'lixeira' ? (
          <div className="text-sm text-muted-foreground">Nenhum documento salvo ainda.</div>
        ) : null)}
      </div>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <TemplatePreviewDialog
          open={!!selectedTemplate}
          onOpenChange={(o) => !o && setPreviewId(null)}
          template={{
            id: selectedTemplate.id,
            name: selectedTemplate.name,
            description: selectedTemplate.description || '',
            category: selectedTemplate.category || 'general',
            templateContent: selectedTemplate.templateContent,
            icon: selectedTemplate.icon || '📝',
            gradient: selectedTemplate.gradient || 'blue',
            tags: [],
            isPublic: true,
            isFeatured: false,
            usageCount: Number(selectedTemplate.usageCount || 0),
            createdBy: undefined,
            isFavorite: Boolean(selectedTemplate.isFavorite),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          onUse={() => {
            const content = selectedTemplate.templateContent
            const vars = extractCurlyVars(content)
            if (vars.length > 0) {
              setPendingTemplateContent(content)
              setFillVarsOpen(true)
            } else {
              setPrompt(content)
            }
            setPreviewId(null)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            fetch('/api/docs/templates/used', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: selectedTemplate.id }) }).catch(() => {})
          }}
        />
      )}

      {/* Fill Variables Dialog */}
      {fillVarsOpen && (
        <FillVariablesDialog
          open={fillVarsOpen}
          onOpenChange={setFillVarsOpen}
          templateContent={pendingTemplateContent || ''}
          onSubmit={(filled) => {
            setPrompt(filled)
            setPendingTemplateContent(null)
          }}
        />
      )}
        </main>
      </div>
    </div>
  )
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  } as Record<string, string>)[c] || c)
}

function sanitizeFilename(s: string) {
  return (s || 'documento').replace(/[^a-zA-Z0-9-_\s\.]/g, '').slice(0, 80)
}
