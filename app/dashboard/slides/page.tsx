"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import PlateEditor from '@/components/presentations/PlateEditor'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DropdownTrigger } from '@/components/ui/dropdown-trigger'
import { ChevronLeft, ChevronRight, Search, MoreHorizontal, Download, RefreshCw, HardDrive, Link as LinkIcon, MousePointerClick } from 'lucide-react'
import { saveBlobToDrive } from '@/lib/drive-client'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Sparkles } from 'lucide-react'
type Attachment = { fileName: string; mime: string; size: number; storageUrl: string; source: string }
type SlideDTO = { id: string; index: number; layout: string; contentJson: string; citationsJson?: string | null }
type StatusDTO = {
  id: string
  title: string
  theme: string | null
  status: string
  progress: number
  currentTask?: string | null
  slideCount?: number | null
  attachments: Attachment[]
  slides: SlideDTO[]
}
export default function SlidesPage() {
  const { toast } = useToast()
  const [topic, setTopic] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [theme, setTheme] = useState<'modern-light' | 'modern-dark'>('modern-light')
  const [presentationId, setPresentationId] = useState<string | null>(null)
  const [status, setStatus] = useState<StatusDTO | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tab, setTab] = useState<'view' | 'code' | 'thinking'>('view')
  
  const [query, setQuery] = useState('')
  const [audience, setAudience] = useState<string>('')
  const [ratio, setRatio] = useState<'16:9'|'4:3'|'1:1'>('16:9')
  const [language, setLanguage] = useState<'pt-BR'|'en-US'|'es-ES'>('pt-BR')
  const [slideCount, setSlideCount] = useState<number>(8)
  const [factCheck, setFactCheck] = useState(false)
  const [editIA, setEditIA] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const [useMiniThumbs, setUseMiniThumbs] = useState(true)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slides_useMiniThumbs')
      if (saved === '0' || saved === '1') setUseMiniThumbs(saved === '1')
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem('slides_useMiniThumbs', useMiniThumbs ? '1' : '0') } catch {}
  }, [useMiniThumbs])
  // Open specific presentation by query param (?open=...&slide=...)
  const searchParams = useSearchParams()
  const [highlightSlideId, setHighlightSlideId] = useState<string | null>(null)
  const targetSlideRef = useRef<string | null>(null)
  const [initialSlideId, setInitialSlideId] = useState<string | null>(null)
  useEffect(() => {
    try {
      const openId = searchParams.get('open')
      const slideId = searchParams.get('slide')
      if (openId && openId.trim()) {
        setPresentationId(openId)
        if (slideId && slideId.trim()) { targetSlideRef.current = slideId; setInitialSlideId(slideId) }
        fetchStatusOnce(openId).catch(()=>{})
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When status arrives and a target slide is specified, select and highlight it
  useEffect(() => {
    if (!status || !targetSlideRef.current) return
    const t = targetSlideRef.current
    targetSlideRef.current = null
    try {
      const idx = (status.slides || []).find((s:any) => s.id === t)?.index
      if (typeof idx === 'number') {
        setSelectedIndex(idx)
        setHighlightSlideId(t)
        setTimeout(() => setHighlightSlideId(null), 2200)
        // ensure visibility in sidebar
        setTimeout(() => {
          try { document.querySelector(`[data-slide-id="${t}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }) } catch {}
        }, 50)
      }
    } catch {}
  }, [status?.id, status?.updatedAt])
  // Outline (seções) para geração dirigida
  const [outline, setOutline] = useState<Array<{ id: string; title: string; description?: string }>>([])
  const [outlineBusy, setOutlineBusy] = useState(false)

  // Templates: filtros, favoritos e último aplicado
  type TemplateItem = { id: string; name: string; style: string; theme: 'modern-light'|'modern-dark'; ratio: '16:9'|'4:3'|'1:1'; palette: string[]; tags: string; thumb?: string; pages?: string[]; langs?: string[]; pop?: number; addedAt?: number }
  const templates = useMemo<TemplateItem[]>(() => [
    { id: 'corp-light', name: 'Corporativo Claro', style: 'Corporate', theme: 'modern-light', ratio: '16:9', palette: ['#0ea5e9','#0369a1','#0c4a6e'], tags: 'Corporate, Clean', thumb: '/templates/corp-light.svg', pages: ['/templates/corp-light-p1.svg','/templates/corp-light-p2.svg','/templates/corp-light-p3.svg'], langs: ['pt-BR','en-US','es-ES'], pop: 92, addedAt: 1 },
    { id: 'corp-dark', name: 'Corporativo Escuro', style: 'Corporate', theme: 'modern-dark', ratio: '16:9', palette: ['#22d3ee','#0ea5e9','#0c4a6e'], tags: 'Corporate, Dark', thumb: '/templates/corp-dark.svg', pages: ['/templates/corp-dark-p1.svg','/templates/corp-dark-p2.svg','/templates/corp-dark-p3.svg'], langs: ['pt-BR','en-US','es-ES'], pop: 88, addedAt: 2 },
    { id: 'corp-blue', name: 'Corporate Blue', style: 'Corporate', theme: 'modern-light', ratio: '16:9', palette: ['#2563eb','#1d4ed8','#1e40af'], tags: 'Business, Blue', thumb: '/templates/corp-blue.svg', pages: ['/templates/corp-blue-p1.svg','/templates/corp-blue-p2.svg','/templates/corp-blue-p3.svg'] },
    { id: 'corp-green', name: 'Corporate Green', style: 'Corporate', theme: 'modern-light', ratio: '16:9', palette: ['#16a34a','#22c55e','#15803d'], tags: 'Business, Green', thumb: '/templates/corp-green.svg', pages: ['/templates/corp-green-p1.svg','/templates/corp-green-p2.svg','/templates/corp-green-p3.svg'] },
    { id: 'edu', name: 'Educacional', style: 'Education', theme: 'modern-light', ratio: '4:3', palette: ['#f59e0b','#f97316','#b45309'], tags: 'Educational', thumb: '/templates/edu.svg', pages: ['/templates/edu-p1.svg','/templates/edu-p2.svg','/templates/edu-p3.svg'] },
    { id: 'pitch', name: 'Pitch', style: 'Pitch', theme: 'modern-dark', ratio: '16:9', palette: ['#f97316','#fb7185','#22d3ee'], tags: 'Startup, Pitch', thumb: '/templates/pitch.svg', pages: ['/templates/pitch-p1.svg','/templates/pitch-p2.svg','/templates/pitch-p3.svg'] },
    { id: 'minimal', name: 'Minimal', style: 'Minimal', theme: 'modern-light', ratio: '16:9', palette: ['#0f172a','#64748b','#94a3b8'], tags: 'Minimal', thumb: '/templates/minimal.svg', pages: ['/templates/minimal-p1.svg','/templates/minimal-p2.svg','/templates/minimal-p3.svg'] },
    { id: 'vibrant', name: 'Vibrante', style: 'Vibrant', theme: 'modern-light', ratio: '16:9', palette: ['#ef4444','#f59e0b','#22c55e'], tags: 'Vibrant', thumb: '/templates/vibrant.svg', pages: ['/templates/vibrant-p1.svg','/templates/vibrant-p2.svg','/templates/vibrant-p3.svg'] },
    { id: 'pastel', name: 'Pastel', style: 'Pastel', theme: 'modern-light', ratio: '16:9', palette: ['#fde68a','#fca5a5','#bfdbfe'], tags: 'Soft, Pastel', thumb: '/templates/pastel.svg', pages: ['/templates/pastel-p1.svg','/templates/pastel-p2.svg','/templates/pastel-p3.svg'] },
    { id: 'mono', name: 'Monochrome', style: 'Mono', theme: 'modern-light', ratio: '16:9', palette: ['#111827','#6b7280','#d1d5db'], tags: 'Monochrome', thumb: '/templates/mono.svg', pages: ['/templates/mono-p1.svg','/templates/mono-p2.svg','/templates/mono-p3.svg'] },
    { id: 'neon', name: 'Gradient Neon', style: 'Creative', theme: 'modern-dark', ratio: '16:9', palette: ['#22d3ee','#a78bfa','#f472b6'], tags: 'Neon, Gradient', thumb: '/templates/neon.svg', pages: ['/templates/neon-p1.svg','/templates/neon-p2.svg','/templates/neon-p3.svg'] },
    { id: 'photo', name: 'Photo Focus', style: 'Photo', theme: 'modern-light', ratio: '16:9', palette: ['#0f172a','#94a3b8','#e5e7eb'], tags: 'Photography', thumb: '/templates/photo.svg' },
    { id: 'whiteboard', name: 'Whiteboard', style: 'Education', theme: 'modern-light', ratio: '16:9', palette: ['#0ea5e9','#22c55e','#f97316'], tags: 'Whiteboard', thumb: '/templates/whiteboard.svg' },
    { id: 'retro', name: 'Retro', style: 'Retro', theme: 'modern-light', ratio: '4:3', palette: ['#92400e','#f59e0b','#a16207'], tags: 'Retro', thumb: '/templates/retro.svg' },
    { id: 'creative-dark', name: 'Creative Dark', style: 'Creative', theme: 'modern-dark', ratio: '16:9', palette: ['#22c55e','#f59e0b','#f43f5e'], tags: 'Creative', thumb: '/templates/creative-dark.svg', langs: ['en-US','es-ES'], pop: 77, addedAt: 15 },
  ], [])
  const [tplMyLang, setTplMyLang] = useState<boolean>(false)
  const [tplSort, setTplSort] = useState<'pop'|'recent'|'name'>('pop')
  const [tplCounts, setTplCounts] = useState<Record<string, number>>({})
  const [tplStyle, setTplStyle] = useState<string>('all')
  const [tplTheme, setTplTheme] = useState<'all'|'modern-light'|'modern-dark'>('all')
  const [tplRatio, setTplRatio] = useState<'all'|'16:9'|'4:3'|'1:1'>('all')
  const [tplFavs, setTplFavs] = useState<Record<string, 1>>({})
  const [tplOnlyFav, setTplOnlyFav] = useState<boolean>(false)
  const [tplLast, setTplLast] = useState<string | null>(null)
  useEffect(() => {
    try {
      const f = localStorage.getItem('slides_tpl_favs')
      const o = f ? JSON.parse(f) : {}
      if (o && typeof o === 'object') setTplFavs(o)
      const of = localStorage.getItem('slides_tpl_onlyFav')
      if (of === '1' || of === '0') setTplOnlyFav(of === '1')
      const last = localStorage.getItem('slides_tpl_last')
      if (last && typeof last === 'string') setTplLast(last)
      const fs = localStorage.getItem('slides_tpl_style')
      if (fs && typeof fs === 'string') setTplStyle(fs)
      const ft = localStorage.getItem('slides_tpl_theme') as any
      if (ft === 'all' || ft === 'modern-light' || ft === 'modern-dark') setTplTheme(ft)
      const fr = localStorage.getItem('slides_tpl_ratio') as any
      if (fr === 'all' || fr === '16:9' || fr === '4:3' || fr === '1:1') setTplRatio(fr)
      const ml = localStorage.getItem('slides_tpl_myLang')
      if (ml === '1' || ml === '0') setTplMyLang(ml === '1')
      const so = localStorage.getItem('slides_tpl_sort') as any
      if (so === 'pop' || so === 'recent' || so === 'name') setTplSort(so)
    } catch {}
  }, [])
  useEffect(() => { try { localStorage.setItem('slides_tpl_favs', JSON.stringify(tplFavs)) } catch {} }, [tplFavs])
  useEffect(() => { try { localStorage.setItem('slides_tpl_onlyFav', tplOnlyFav ? '1' : '0') } catch {} }, [tplOnlyFav])
  useEffect(() => { try { localStorage.setItem('slides_tpl_last', tplLast || '') } catch {} }, [tplLast])
  useEffect(() => { try { localStorage.setItem('slides_tpl_style', tplStyle) } catch {} }, [tplStyle])
  useEffect(() => { try { localStorage.setItem('slides_tpl_theme', tplTheme) } catch {} }, [tplTheme])
  useEffect(() => { try { localStorage.setItem('slides_tpl_ratio', tplRatio) } catch {} }, [tplRatio])
  useEffect(() => { try { localStorage.setItem('slides_tpl_myLang', tplMyLang ? '1' : '0') } catch {} }, [tplMyLang])
  useEffect(() => { try { localStorage.setItem('slides_tpl_sort', tplSort) } catch {} }, [tplSort])
  const goPrev = () => setSelectedIndex((i) => Math.max(0, i - 1))
  const goNext = () => setSelectedIndex((i) => Math.min((status?.slides?.length || 1) - 1, i + 1))
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status?.slides?.length])
const pollingRef = useRef<NodeJS.Timeout | null>(null)
const autoOpenPresentRef = useRef<string | null>(null)
  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const list: Attachment[] = []
    for (const f of Array.from(files)) {
      list.push({ fileName: f.name, mime: f.type || 'application/octet-stream', size: f.size, storageUrl: '', source: 'local' })
    }
    setAttachments((prev) => [...prev, ...list])
  }, [])
  const removeAttachment = useCallback((name: string) => setAttachments((prev) => prev.filter((a) => a.fileName !== name)), [])
  const onCreate = useCallback(async () => {
    const payload = { topic: topic || 'Nova Apresentação', audience: audience || undefined, nSlides: Math.max(1, Math.min(50, slideCount || 8)), style: theme, attachments }
    const res = await fetch('/api/presentations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      alert('Falha ao criar apresentação')
      return
    }
    const data = await res.json()
    setPresentationId(data.presentationId)
    // dispara build
    await fetch(`/api/presentations/${data.presentationId}/build`, { method: 'POST' })
    startPolling(data.presentationId)
  }, [attachments, topic, audience, slideCount, theme])
  const newOutlineId = () => 'ol_' + Math.random().toString(36).slice(2, 9)
  const onCreateBlankWithTheme = useCallback(async (themeArg: 'modern-light'|'modern-dark', n?: number) => {
    const nSlidesToUse = Math.max(1, Math.min(50, Number(n || slideCount || 8)))
    const payload = { topic: topic || 'Apresentação em Branco', audience: audience || undefined, nSlides: nSlidesToUse, style: themeArg }
    const res = await fetch('/api/presentations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast({ title: 'Falha ao criar', variant: 'destructive' as any }); return }
    const data = await res.json()
    setPresentationId(data.presentationId)
    await fetch(`/api/presentations/${data.presentationId}/slides/blank`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nSlides: nSlidesToUse }) })
    await fetchStatusOnce(data.presentationId)
    setSelectedIndex(0)
    toast({ title: 'Slides em branco criados' })
    try { window.open(`/presentations/${data.presentationId}/present`, '_blank') } catch {}
  }, [topic, audience, slideCount])

  const onCreateAIWithTheme = useCallback(async (themeArg: 'modern-light'|'modern-dark', n?: number) => {
    const nSlidesToUse = Math.max(1, Math.min(50, Number(n || slideCount || 8)))
    const payload = { topic: topic || 'Nova Apresentação', audience: audience || undefined, nSlides: nSlidesToUse, style: themeArg }
    const res = await fetch('/api/presentations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast({ title: 'Falha ao criar apresentação', variant: 'destructive' as any }); return }
    const data = await res.json()
    const id = data.presentationId as string
    setPresentationId(id)
    autoOpenPresentRef.current = id
    try {
      // Gerar outline com idioma e nSlides selecionados
      const outlineRes = await fetch(`/api/presentations/${id}/outline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: payload.topic, nSlides: nSlidesToUse, language }) })
      if (!outlineRes.ok) throw new Error('outline')
      const odata = await outlineRes.json().catch(()=>({ sections: [] }))
      const sections = Array.isArray(odata.sections) ? odata.sections : []
      setOutline(sections.map((s:any)=>({ id: newOutlineId(), title: String(s?.title||'').trim(), description: (s?.description? String(s.description):'').trim() })).filter((s:any)=>s.title))
      // Gerar slides a partir do outline
      const slidesRes = await fetch(`/api/presentations/${id}/slides/from-outline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outline: sections, nSlides: nSlidesToUse, language }) })
      if (!slidesRes.ok) throw new Error('slides')
      startPolling(id)
      setSelectedIndex(0)
      toast({ title: 'Gerando slides', description: 'Acompanhe o progresso abaixo' })
    } catch {
      // fallback: build completo
      await fetch(`/api/presentations/${id}/build`, { method: 'POST' }).catch(()=>{})
      startPolling(id)
    }
  }, [topic, audience, slideCount, language])
  const onCreateBlank = useCallback(async () => {
    const payload = { topic: topic || 'Apresentação em Branco', audience: audience || undefined, nSlides: Math.max(1, Math.min(50, slideCount || 8)), style: theme }
    const res = await fetch('/api/presentations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast({ title: 'Falha ao criar', variant: 'destructive' as any }); return }
    const data = await res.json()
    setPresentationId(data.presentationId)
    await fetch(`/api/presentations/${data.presentationId}/slides/blank`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nSlides: Math.max(1, Math.min(50, slideCount || 8)) }) })
    await fetchStatusOnce(data.presentationId)
    setSelectedIndex(0)
    toast({ title: 'Slides em branco criados' })
  }, [topic, audience, slideCount, theme])

  // Importar e converter (Drive)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [driveItems, setDriveItems] = useState<Array<{ id: string; url: string; title?: string; mime?: string; bytes?: number; thumbUrl?: string }>>([])
  const [driveCursor, setDriveCursor] = useState<string | null>(null)
  const [driveLoading, setDriveLoading] = useState(false)
  const [driveQuery, setDriveQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<Record<string, boolean>>({})
  const fetchDrive = useCallback(async (q?: string, cursor?: string | null) => {
    try {
      setDriveLoading(true)
      const params = new URLSearchParams()
      params.set('limit', '24')
      if (q) params.set('q', q)
      if (cursor) params.set('cursor', cursor)
      const res = await fetch(`/api/drive/list?${params.toString()}`)
      if (!res.ok) throw new Error('fail')
      const data = await res.json()
      const items = (data.items || []) as any[]
      const filtered = items.filter((it) => typeof it.mime === 'string' && (it.mime.includes('pdf') || it.mime.includes('word') || it.mime.includes('presentation') || it.mime.includes('officedocument') || it.mime.includes('text')))
      setDriveItems(cursor ? (prev => [...prev, ...filtered]) : filtered)
      setDriveCursor(data.nextCursor || null)
    } catch {
      setDriveItems([]); setDriveCursor(null)
    } finally { setDriveLoading(false) }
  }, [])
  useEffect(() => { if (pickerOpen) fetchDrive(driveQuery || undefined, null) }, [pickerOpen])
  const onImportConvert = useCallback(async () => {
    const chosen = driveItems.filter((it) => selectedAssets[it.id])
    if (chosen.length === 0) { toast({ title: 'Selecione pelo menos um arquivo', variant: 'destructive' as any }); return }
    const attachments = chosen.map((a) => ({ fileName: a.title || a.id, mime: a.mime || 'application/octet-stream', size: a.bytes || 0, storageUrl: a.url, source: 'drive' }))
    const payload = { topic: topic || 'Nova Apresentação', audience: audience || undefined, nSlides: Math.max(1, Math.min(50, slideCount || 8)), style: theme, attachments }
    const res = await fetch('/api/presentations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) { toast({ title: 'Falha ao criar apresentação', variant: 'destructive' as any }); return }
    const data = await res.json()
    setPresentationId(data.presentationId)
    await fetch(`/api/presentations/${data.presentationId}/build`, { method: 'POST' })
    startPolling(data.presentationId)
    setPickerOpen(false)
    setSelectedAssets({})
    toast({ title: 'Conversão iniciada', description: 'Acompanhe o progresso abaixo' })
  }, [driveItems, selectedAssets, topic, audience, slideCount, theme])

  // Full templates gallery
  const [tplGalleryOpen, setTplGalleryOpen] = useState(false)
  const [tplSearch, setTplSearch] = useState('')
  const filteredTemplates = useMemo(() => {
    const base = templates
      .filter(t => tplStyle === 'all' ? true : t.style === tplStyle)
      .filter(t => tplTheme === 'all' ? true : t.theme === tplTheme)
      .filter(t => tplRatio === 'all' ? true : t.ratio === tplRatio)
      .filter(t => tplOnlyFav ? Boolean(tplFavs[t.id]) : true)
    const q = tplSearch.trim().toLowerCase()
    if (!q) return base
    return base.filter(t => [t.name, t.style, t.tags].join(' ').toLowerCase().includes(q))
  }, [templates, tplStyle, tplTheme, tplRatio, tplOnlyFav, tplFavs, tplSearch])

  function applyTemplate(tpl: { theme: any; ratio: any; palette: string[]; tags: string; id: string; name: string }) {
    setTheme(tpl.theme)
    setRatio(tpl.ratio)
    setImgPalette(tpl.palette)
    setImgStylesInput(tpl.tags)
    setTplLast(tpl.id)
    toast({ title: 'Modelo aplicado', description: `${tpl.name}` })
  }
  const genOutline = useCallback(async () => {
    if (!presentationId) return
    try {
      setOutlineBusy(true)
      const res = await fetch(`/api/presentations/${presentationId}/outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, nSlides: status?.slideCount || 8, language }),
      })
      if (!res.ok) throw new Error('Falha ao gerar outline')
      const data = await res.json().catch(() => ({}))
      const sections = Array.isArray(data.sections) ? data.sections : []
      setOutline(sections
        .map((s: any) => ({ id: newOutlineId(), title: String(s?.title || '').trim(), description: (s?.description ? String(s.description) : '').trim() }))
        .filter((s) => s.title))
      toast({ title: 'Outline gerado', description: `${sections.length} seções sugeridas` })
    } catch (e) {
      toast({ title: 'Falha ao gerar outline', variant: 'destructive' as any })
    } finally {
      setOutlineBusy(false)
    }
  }, [presentationId, topic, status?.slideCount, language])
  const genSlidesFromOutline = useCallback(async () => {
    if (!presentationId || outline.length === 0) return
    try {
      setOutlineBusy(true)
      const res = await fetch(`/api/presentations/${presentationId}/slides/from-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline: outline.map(({ title, description }) => ({ title, description })), nSlides: outline.length, language }),
      })
      if (!res.ok) throw new Error('Falha ao gerar slides a partir do outline')
      startPolling(presentationId)
      setSelectedIndex(0)
      toast({ title: 'Gerando slides', description: 'Acompanhe o progresso abaixo' })
    } catch (e) {
      toast({ title: 'Falha ao gerar slides', variant: 'destructive' as any })
    } finally {
      setOutlineBusy(false)
    }
  }, [presentationId, outline, language])
  const startPolling = useCallback((id: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      const s = await fetch(`/api/presentations/${id}/status`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
      if (s) {
        setStatus(s as StatusDTO)
        if (Array.isArray(s.slides) && s.slides.length > 0) {
          setSelectedIndex((idx) => Math.max(0, Math.min(idx, s.slides.length - 1)))
        }
        if (s.status === 'ready' || s.status === 'error') {
          // Auto-abrir apresentação quando solicitado
          try {
            if (s.status === 'ready' && autoOpenPresentRef.current && autoOpenPresentRef.current === id) {
              autoOpenPresentRef.current = null
              window.open(`/presentations/${id}/present`, '_blank')
            }
          } catch {}
          if (pollingRef.current) clearInterval(pollingRef.current)
        }
      }
    }, 1500) as any
  }, [])
  async function fetchStatusOnce(id: string) {
    try {
      const s = await fetch(`/api/presentations/${id}/status`).then((r) => r.ok ? r.json() : null)
      if (s) setStatus(s as any)
    } catch {}
  }
  useEffect(() => {
    try {
      const saved = localStorage.getItem('slides_theme')
      if (saved === 'modern-dark' || saved === 'modern-light') setTheme(saved)
      const savedLang = localStorage.getItem('slides_lang')
      if (savedLang === 'pt-BR' || savedLang === 'en-US' || savedLang === 'es-ES') setLanguage(savedLang)
    } catch {}
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])
  useEffect(() => {
    try { localStorage.setItem('slides_theme', theme) } catch {}
  }, [theme])
  useEffect(() => {
    try { localStorage.setItem('slides_lang', language) } catch {}
  }, [language])

  // Load and persist image preset per presentation (server with local fallback)
  useEffect(() => {
    if (!presentationId) return
    try {
      fetch(`/api/presentations/${presentationId}/image-preset`).then(r=>r.ok?r.json():null).then((j)=>{
        if (j?.preset) {
          const p = j.preset
          if (p.ratio) setRatio(p.ratio)
          if (p.quality) setImgQuality(p.quality)
          if (typeof p.guidance === 'number') setImgGuidance(p.guidance)
          if (Array.isArray(p.palette)) setImgPalette(p.palette)
          if (typeof p.negative === 'string') setImgNegative(p.negative)
          if (typeof p.styles === 'string') setImgStylesInput(p.styles)
          if (typeof p.seedLocked === 'boolean') setImgSeedLocked(p.seedLocked)
        } else {
          throw new Error('no preset')
        }
      }).catch(()=>{
        const key = `slides:img-preset:${presentationId}`
        const raw = localStorage.getItem(key)
        if (raw) {
          const p = JSON.parse(raw)
          if (p.ratio) setRatio(p.ratio)
          if (p.quality) setImgQuality(p.quality)
          if (typeof p.guidance === 'number') setImgGuidance(p.guidance)
          if (Array.isArray(p.palette)) setImgPalette(p.palette)
          if (typeof p.negative === 'string') setImgNegative(p.negative)
          if (typeof p.styles === 'string') setImgStylesInput(p.styles)
          if (typeof p.seedLocked === 'boolean') setImgSeedLocked(p.seedLocked)
        }
      })
    } catch {}
  }, [presentationId])
  
  async function duplicateSlide(sid: string) {
    if (!presentationId) return
    const res = await fetch(`/api/presentations/${presentationId}/slides/${sid}/duplicate`, { method: 'POST' })
    if (res.ok) {
      toast({ title: 'Slide duplicado' })
      await fetchStatusOnce(presentationId)
    } else {
      toast({ title: 'Falha ao duplicar', variant: 'destructive' as any })
    }
  }
  async function deleteSlide(sid: string) {
    if (!presentationId) return
    if (!confirm('Excluir este slide?')) return
    const res = await fetch(`/api/presentations/${presentationId}/slides/${sid}`, { method: 'DELETE' })
    if (res.ok) {
      toast({ title: 'Slide excluído' })
      await fetchStatusOnce(presentationId)
      setSelectedIndex((i) => Math.max(0, i - 1))
    } else {
      toast({ title: 'Falha ao excluir', variant: 'destructive' as any })
    }
  }
  async function moveSlide(sid: string, dir: 'up'|'down') {
    if (!presentationId || !status) return
    const slides = [...status.slides].sort((a,b)=>a.index-b.index)
    const idx = slides.findIndex(s => s.id === sid)
    if (idx < 0) return
    const swapWith = dir === 'up' ? idx - 1 : idx + 1
    if (swapWith < 0 || swapWith >= slides.length) return
    const newOrder = [...slides]
    const [a, b] = [newOrder[idx], newOrder[swapWith]]
    newOrder[idx] = b
    newOrder[swapWith] = a
    const orderIds = newOrder.map(s => s.id)
    setStatus(s => s ? { ...s, slides: newOrder.map((s,i)=>({ ...s, index: i })) } as any : s)
    await fetch(`/api/presentations/${presentationId}/slides/reorder`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: orderIds })
    })
  }
  async function copySlideJson(sid: string) {
    try {
      const s = (status?.slides || []).find(x=>x.id===sid)
      if (!s) return
      await navigator.clipboard.writeText(s.contentJson)
      toast({ title: 'JSON copiado', description: 'Conteúdo do slide copiado.' })
    } catch { toast({ title: 'Falha ao copiar', variant: 'destructive' as any }) }
  }
const slides = status?.slides || []
  const filteredSlides = useMemo(() => {
    if (!query) return slides
    const q = query.toLowerCase().trim()
    return slides.filter((s) => {
      try {
        const j = JSON.parse(s.contentJson)
        const heading = (j?.elements || []).find((e: any) => e?.type === 'heading')?.text || ''
        if (heading.toLowerCase().includes(q)) return true
      } catch {}
      const n = String(s.index + 1)
      return n === q || ('pagina ' + n) === q
    })
  }, [slides, query])
  const current = slides[selectedIndex]
  const headingFromSlide = useCallback((s: SlideDTO) => {
    try {
      const json = JSON.parse(s.contentJson)
      const h = (json?.elements || []).find((e: any) => e?.type === 'heading')
      return typeof h?.text === 'string' ? h.text : `Slide ${s.index + 1}`
    } catch {
      return `Slide ${s.index + 1}`
    }
  }, [])
  const previewFromSlide = useCallback((s: SlideDTO) => {
    try {
      const json = JSON.parse(s.contentJson)
      const els = json?.elements || []
      const sub = (els.find((e: any) => e?.type === 'subtitle')?.text || '') as string
      const bullets = (els.find((e: any) => e?.type === 'bullets')?.items || []) as string[]
      const imgUrl = (() => { try { return els.find((e: any) => e?.type==='image')?.source?.url as string } catch { return '' } })()
      const layout = (json?.layout || '') as string
      return { sub, bullets: bullets.slice(0, 2), imgUrl, layout }
    } catch { return { sub: '', bullets: [] as string[] } }
  }, [])
  const codeHtml = useMemo(() => {
    try {
      const json = current ? JSON.parse(current.contentJson) : null
      return json ? JSON.stringify(json, null, 2) : ''
    } catch {
      return ''
    }
  }, [current])
  const enablePlate = process.env.NEXT_PUBLIC_ENABLE_PLATE === '1'
  const tokens = useMemo(() => (
    theme === 'modern-dark'
      ? { bg: '#0B1220', fg: '#F8FAFC', muted: '#94A3B8' }
      : { bg: '#FFFFFF', fg: '#0F172A', muted: '#64748b' }
  ), [theme])
  const isDarkTheme = (status?.theme || theme) === 'modern-dark'
  const dndDisabled = Boolean(query.trim())
  // DnD sensors
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const [localOrder, setLocalOrder] = useState<string[] | null>(null)
  const items = (status?.slides || []).map((s) => s.id)
  // Image generation options (Slides → Nova imagem)
  const [imgQuality, setImgQuality] = useState<'fast'|'quality'|'premium'>('fast')
  const [imgNegative, setImgNegative] = useState<string>('')
  const [imgGuidance, setImgGuidance] = useState<number>(4)
  const [imgPalette, setImgPalette] = useState<string[]>(() => ((theme === 'modern-dark') ? ['#0ea5e9','#22d3ee','#0c4a6e'] : ['#f59e0b','#f97316','#ffedd5']))
  const [imgStylesInput, setImgStylesInput] = useState<string>('')
  const imgStyleTags = useMemo(() => imgStylesInput.split(',').map(s => s.trim()).filter(Boolean), [imgStylesInput])
  const [imgSeed, setImgSeed] = useState<number>(() => Math.floor(Math.random()*1e9))
  const [imgSeedLocked, setImgSeedLocked] = useState<boolean>(false)
  const [useSlideSeed, setUseSlideSeed] = useState<boolean>(false)
  const [creditBalance, setCreditBalance] = useState<number>(0)
  const [estCreditCost, setEstCreditCost] = useState<number>(0)
  const [creditRates, setCreditRates] = useState<number[] | null>(null)
  const [displayCurrency, setDisplayCurrency] = useState<'BRL' | 'USD'>('BRL')
  const brlToUsd = useMemo(() => {
    try { return Number((process as any).env?.NEXT_PUBLIC_BRL_TO_USD) || 0.19 } catch { return 0.19 }
  }, [])

  const estimateCredits = useCallback((r: string, quality: 'fast'|'quality'|'premium') => {
    const [rw, rh] = (() => { const m = r.split(':').map(Number); return (m.length===2 && m[0]>0 && m[1]>0) ? m : [16,9] })() as [number, number]
    const MAX = 1024
    const scale = MAX / Math.max(rw, rh)
    const width = Math.round(rw * scale)
    const height = Math.round(rh * scale)
    const megapixels = (width * height) / (1024 * 1024)
    const base = quality === 'premium' ? 135 : 90
    return Math.max(10, Math.round(base * megapixels))
  }, [])

  const refreshBalance = useCallback(async () => {
    try {
      const r = await fetch('/api/credits/balance').then(r => r.ok ? r.json() : null)
      if (r && typeof r.balance === 'number') setCreditBalance(r.balance)
    } catch {}
  }, [])
  useEffect(() => { refreshBalance() }, [refreshBalance])
  useEffect(() => { setEstCreditCost(estimateCredits(ratio, imgQuality)) }, [ratio, imgQuality, estimateCredits])
  useEffect(() => {
    try {
      const lang = navigator.language || ''
      setDisplayCurrency(/en(-|_)?US/i.test(lang) ? 'USD' : 'BRL')
    } catch {}
  }, [])
  useEffect(() => {
    // Fetch credit packages to estimate BRL cost
    ;(async () => {
      try {
        const res = await fetch('/api/credits/packages')
        if (!res.ok) throw new Error('packages')
        const j = await res.json().catch(()=>null)
        const pkgs = Array.isArray(j?.packages) ? j.packages : []
        const rates = pkgs
          .map((p: any) => {
            const credits = Number(p?.credits || 0)
            const price = Number(p?.price || p?.priceCents/100 || 0)
            if (!credits || !price) return null
            return price / credits
          })
          .filter((x: any) => typeof x === 'number' && isFinite(x)) as number[]
        if (rates.length > 0) setCreditRates(rates)
        else setCreditRates([0.0118, 0.0099, 0.00795]) // fallback heuristic (Básico/Popular/Premium)
      } catch {
        setCreditRates([0.0118, 0.0099, 0.00795])
      }
    })()
  }, [])

  // Persist image preset per-presentation and sync to server
  useEffect(() => {
    if (!presentationId) return
    const key = `slides:img-preset:${presentationId}`
    const data = { ratio, quality: imgQuality, guidance: imgGuidance, palette: imgPalette, negative: imgNegative, styles: imgStylesInput, seedLocked: imgSeedLocked }
    try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
    const t = setTimeout(() => {
      fetch(`/api/presentations/${presentationId}/image-preset`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => {})
    }, 500)
    return () => clearTimeout(t)
  }, [presentationId, ratio, imgQuality, imgGuidance, imgPalette, imgNegative, imgStylesInput, imgSeedLocked])
  // Keep seed in sync from current slide when toggled
  useEffect(() => {
    if (!useSlideSeed || !current) return
    try {
      const j = JSON.parse(current.contentJson)
      const el = (j.elements||[]).find((e:any)=>e?.type==='image')
      if (typeof el?.source?.seed === 'number') {
        setImgSeed(el.source.seed)
        setImgSeedLocked(true)
      }
    } catch {}
  }, [useSlideSeed, current?.id])

  // Auto-apply recommended layout on ratio change for slides with layout 'auto'
  useEffect(() => {
    if (!presentationId || !status?.slides?.length) return
    const t = setTimeout(async () => {
      try {
        const slidesList = status.slides.slice().sort((a,b)=>a.index-b.index)
        for (const s of slidesList) {
          try {
            const j = JSON.parse(s.contentJson)
            if ((j.layout || '') !== 'auto') continue
            const rec = recommendLayout(ratio, s.contentJson)
            if (j.layout === rec) continue
            const next = { ...(j||{}), layout: rec }
            await fetch(`/api/presentations/${presentationId}/slides/${s.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentJson: JSON.stringify(next) }) })
          } catch {}
        }
        await fetchStatusOnce(presentationId)
      } catch {}
    }, 500)
    return () => clearTimeout(t)
  }, [ratio, presentationId, status?.slides])

  // Recommended layout heuristic based on ratio + content
  const recommendLayout = useCallback((ratioStr: string, contentJson: string) => {
    let rw = 16, rh = 9
    try { const m = ratioStr.split(':').map(Number); if (m.length===2 && m[0]>0 && m[1]>0) { rw=m[0]; rh=m[1] } } catch {}
    let j: any = {}
    try { j = JSON.parse(contentJson || '{}') } catch {}
    const els: any[] = Array.isArray(j.elements) ? j.elements : []
    const imageIdx = els.findIndex((e:any)=>e?.type==='image')
    const bulletsEl = els.find((e:any)=>e?.type==='bullets')
    const bulletsCount = Array.isArray(bulletsEl?.items) ? bulletsEl.items.length : 0
    const firstTextIdx = (()=>{
      const idxs = [
        els.findIndex((e:any)=>e?.type==='heading'),
        els.findIndex((e:any)=>e?.type==='subtitle'),
        els.findIndex((e:any)=>e?.type==='bullets'),
      ].filter((i)=>i>=0)
      return idxs.length ? Math.min(...idxs) : -1
    })()
    const hasImage = imageIdx >= 0
    const imageFirst = hasImage && (firstTextIdx < 0 || imageIdx < firstTextIdx)
    // Heurística:
    // 1:1 → title-centered
    if (rw === 1 && rh === 1) return 'title-centered'
    // 16:9 → se tem imagem e poucos bullets (<=3), usar cover; senão 2 colunas com imagem conforme ordem
    if (rw === 16 && rh === 9) {
      if (hasImage && bulletsCount <= 3) return 'title-cover'
      if (hasImage) return imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right'
      return 'title-centered'
    }
    // 4:3 → se tem imagem, 2 colunas; caso contrário central
    if (rw === 4 && rh === 3) {
      if (hasImage) return imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right'
      return 'title-centered'
    }
    // Default
    return hasImage ? (imageFirst ? 'media-left-bullets-right' : 'bullets-left-media-right') : 'title-centered'
  }, [])
  function SortableSlide({ slideId, children }: { slideId: string; children: (drag: { setNodeRef: any; handleAttrs: any; handleListeners: any; style: any }) => React.ReactNode }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: slideId, disabled: dndDisabled })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 } as any
    return (<>{children({ setNodeRef, handleAttrs: attributes, handleListeners: listeners, style })}</>)
  }
  function OutlineSortableItem({ itemId, children }: { itemId: string; children: (drag: { setNodeRef: any; handleAttrs: any; handleListeners: any; style: any }) => React.ReactNode }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: itemId, disabled: outlineBusy })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 } as any
    return (<>{children({ setNodeRef, handleAttrs: attributes, handleListeners: listeners, style })}</>)
  }
  function MiniThumb({ isDark }: { isDark: boolean }) {
    const bg = isDark ? '#0B1220' : '#FFFFFF'
    const bd = isDark ? 'rgba(148,163,184,0.30)' : '#e5e7eb'
    const head = isDark ? '#E2E8F0' : '#0F172A'
    const bullet = '#94A3B8'
    return (
      <div className="w-16 h-10 rounded border overflow-hidden" style={{ backgroundColor: bg, borderColor: bd }}>
        <div className="p-1 h-full flex flex-col">
          <div className="h-2 rounded-sm" style={{ backgroundColor: head, opacity: 0.9 }} />
          <div className="mt-1 space-y-0.5">
            <div className="h-1.5 rounded-sm" style={{ backgroundColor: bullet, opacity: 0.9, width: '90%' }} />
            <div className="h-1.5 rounded-sm" style={{ backgroundColor: bullet, opacity: 0.8, width: '70%' }} />
          </div>
        </div>
      </div>
    )
  }
  function VisualThumb({ palette, dark, label, src }: { palette: string[]; dark: boolean; label?: string; src?: string }) {
    const bg = dark ? '#0B1220' : '#FFFFFF'
    const border = dark ? 'rgba(148,163,184,0.30)' : '#e5e7eb'
    const grad = palette.length >= 2 ? `linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 50%, ${palette[2] || palette[0]} 100%)` : palette[0] || (dark ? '#111827' : '#f3f4f6')
    return (
      <div className="w-48 h-28 rounded-md border overflow-hidden relative" style={{ background: bg, borderColor: border }}>
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={label || 'thumb'} className="absolute inset-0 w-full h-full object-cover" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg" />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: grad, opacity: 0.25 }} />
        )}
        <div className="relative p-3 h-full flex flex-col justify-end">
          <div className="h-2 w-24 rounded-sm mb-1" style={{ backgroundColor: dark ? '#E2E8F0' : '#0F172A', opacity: 0.9 }} />
          <div className="space-y-1">
            <div className="h-1.5 w-36 rounded-sm" style={{ backgroundColor: '#94A3B8', opacity: 0.9 }} />
            <div className="h-1.5 w-28 rounded-sm" style={{ backgroundColor: '#94A3B8', opacity: 0.8 }} />
          </div>
          {label ? <div className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-white">{label}</div> : null}
        </div>
      </div>
    )
  }
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!active?.id || !over?.id || active.id == over.id) return
    const current = localOrder ?? items
    const oldIndex = current.indexOf(String(active.id))
    const newIndex = current.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(current, oldIndex, newIndex)
    setLocalOrder(next)
    try {
      if (presentationId) {
        await fetch(`/api/presentations/${presentationId}/slides/reorder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: next }) })
        await fetchStatusOnce(presentationId)
      }
    } catch {}
  }
  // Simple editor (MVP) for heading/subtitle/bullets with autosave
  const [edHeading, setEdHeading] = useState('')
  const [edSubtitle, setEdSubtitle] = useState('')
  const [edBullets, setEdBullets] = useState('')
  const [saving, setSaving] = useState(false)
  // Load editor from current slide
  useEffect(() => {
    try {
      const json = current ? JSON.parse(current.contentJson) : null
      if (!json) return
      const els = json?.elements || []
      const h = els.find((e: any) => e?.type === 'heading')?.text || ''
      const s2 = els.find((e: any) => e?.type === 'subtitle')?.text || ''
      const b = (els.find((e: any) => e?.type === 'bullets')?.items || []).join('\n')
      setEdHeading(h)
      setEdSubtitle(s2)
      setEdBullets(b)
    } catch {}
  }, [current?.id])
  // Autosave editor changes when edit mode is enabled
  useEffect(() => {
    if (!presentationId || !current || !(editIA || advanced)) return
    const t = setTimeout(async () => {
      try {
        setSaving(true)
        let base: any = {}
        try { base = JSON.parse(current.contentJson) } catch {}
        const others = Array.isArray(base.elements) ? base.elements.filter((e: any) => e?.type === 'image') : []
        const next = {
          ...(base || {}),
          elements: [
            ...(edHeading ? [{ type: 'heading', text: edHeading }] : []),
            ...(edSubtitle ? [{ type: 'subtitle', text: edSubtitle }] : []),
            ...(edBullets.trim() ? [{ type: 'bullets', items: edBullets.split(/\n?\n/).filter(Boolean) }] : []),
            ...others,
          ],
        }
        const res = await fetch(`/api/presentations/${presentationId}/slides/${current.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contentJson: JSON.stringify(next) }),
        })
        if (res.ok) {
          const s = await fetch(`/api/presentations/${presentationId}/status`).then(r => r.ok ? r.json() : null).catch(() => null)
          if (s) setStatus(s)
        }
      } catch {}
      finally { setSaving(false) }
    }, 700)
    return () => clearTimeout(t)
  }, [edHeading, edSubtitle, edBullets, presentationId, current?.id, editIA, advanced])
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Hero */}
      <div className="rounded-lg overflow-hidden border" style={{ background: isDarkTheme ? 'linear-gradient(135deg,#0b1220,#111827)' : 'linear-gradient(135deg,#f8fafc,#e2e8f0)' }}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-2xl md:text-3xl font-semibold">Criador de Slides com IA</div>
            <div className="text-sm md:text-base text-muted-foreground mt-1">Gere apresentações lindas a partir de um tópico, templates ou documentos.</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setTplGalleryOpen(true)} className="">Criar com IA</Button>
            <Button variant="secondary" onClick={onCreateBlank}>Criar em branco</Button>
            <Button variant="outline" onClick={() => setPickerOpen(true)}>Importar & Converter</Button>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold">Modo de Apresentações AI</h2>
      {/* Top Bar */}
      <Card>
        <CardContent className="p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar slides (título ou número)" className="pl-9" />
          </div>
          <Button variant={factCheck ? 'default' : 'outline'} size="sm" onClick={() => setFactCheck((v) => !v)}>Verificação de fatos</Button>
          <Button variant={editIA ? 'default' : 'outline'} size="sm" onClick={() => setEditIA((v) => !v)}>Edição por IA</Button>
          <Button variant={advanced ? 'default' : 'outline'} size="sm" onClick={() => setAdvanced((v) => !v)}>Edição Avançada</Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Visualizar e Exportar</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" disabled={!status || status.status !== 'ready'} onClick={() => presentationId && window.open(`/api/presentations/${presentationId}/export?format=pdf&ratio=${encodeURIComponent(ratio)}`, '_blank')}>Exportar PDF</Button>
                <Button variant="default" size="sm" disabled={!status || status.status !== 'ready'} onClick={async () => {
                  if (!presentationId) return
                  try {
                    const res = await fetch(`/api/presentations/${presentationId}/export?format=pdf&ratio=${encodeURIComponent(ratio)}`)
                    if (!res.ok) return
                    const blob = await res.blob()
                    await saveBlobToDrive(`slides-${presentationId}.pdf`, 'application/pdf', blob, 'slides')
                  } catch {}
                }}><HardDrive className="h-4 w-4 mr-2"/> Salvar PDF no AI Drive</Button>
                <Button variant="outline" size="sm" disabled={!status || status.status !== 'ready'} onClick={() => presentationId && window.open(`/api/presentations/${presentationId}/export?format=html&ratio=${encodeURIComponent(ratio)}`, '_blank')}>Exportar HTML</Button>
                <Button variant="default" size="sm" disabled={!status || status.status !== 'ready'} onClick={async () => {
                  if (!presentationId) return
                  try {
                    const res = await fetch(`/api/presentations/${presentationId}/export?format=html&ratio=${encodeURIComponent(ratio)}`)
                    if (!res.ok) return
                    const blob = await res.blob()
                    await saveBlobToDrive(`slides-${presentationId}.html`, 'text/html', blob, 'slides')
                  } catch {}
                }}><HardDrive className="h-4 w-4 mr-2"/> Salvar HTML no AI Drive</Button>
                <Button variant="outline" size="sm" disabled={!status || status.status !== 'ready'} onClick={() => presentationId && window.open(`/api/presentations/${presentationId}/export?format=pptx&ratio=${encodeURIComponent(ratio)}`, '_blank')}>Exportar PPTX</Button>
                <Button variant="default" size="sm" disabled={!status || status.status !== 'ready'} onClick={async () => {
                  if (!presentationId) return
                  try {
                    const res = await fetch(`/api/presentations/${presentationId}/export?format=pptx&ratio=${encodeURIComponent(ratio)}`)
                    if (!res.ok) return
                    const blob = await res.blob()
                    await saveBlobToDrive(`slides-${presentationId}.pptx`, 'application/vnd.openxmlformats-officedocument.presentationml.presentation', blob, 'slides')
                  } catch {}
                }}><HardDrive className="h-4 w-4 mr-2"/> Salvar PPTX no AI Drive</Button>
                <Button variant="outline" size="sm" disabled={!presentationId} onClick={() => presentationId && window.open(`/presentations/${presentationId}/present`, "_blank")}>Apresentar</Button>
                <Button variant="outline" size="sm" disabled={!presentationId} onClick={() => {
                  if (!presentationId) return
                  const idx = typeof selectedIndex === 'number' ? (selectedIndex + 1) : 1
                  window.open(`/presentations/${presentationId}/present#slide=${idx}`, '_blank')
                }}>Apresentar (slide atual)</Button>
              </div>
            </PopoverContent>
          </Popover>
          {presentationId && (
            <Button variant="outline" size="sm" onClick={async () => {
              try {
                await fetch(`/api/presentations/${presentationId}/build`, { method: 'POST' })
                startPolling(presentationId)
                toast({ title: 'Build iniciado', description: 'Reconstruindo apresentação' })
              } catch {
                toast({ title: 'Falha ao iniciar build', variant: 'destructive' as any })
              }
            }}>
              <RefreshCw className="h-4 w-4 mr-2" /> Forçar build
            </Button>
          )}
          {presentationId && status?.slides && status.slides.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const curr = (status?.slides || []).find((s:any)=>s.index===selectedIndex)
                    if (!curr?.id) { toast({ title: 'Selecione um slide', variant: 'destructive' as any }); return }
                    const url = `/dashboard/slides?open=${encodeURIComponent(presentationId)}&slide=${encodeURIComponent(curr.id)}`
                    await navigator.clipboard.writeText((window.location.origin || '') + url)
                    toast({ title: 'Link do slide copiado', description: url })
                  } catch {}
                }}
                title="Copiar link do slide atual"
              >
                <LinkIcon className="h-4 w-4 mr-2" /> Copiar link do slide atual
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const url = `/dashboard/slides?open=${encodeURIComponent(presentationId)}`
                    await navigator.clipboard.writeText((window.location.origin || '') + url)
                    toast({ title: 'Link da apresentação copiado', description: url })
                  } catch {}
                }}
                title="Copiar link da apresentação"
              >
                <LinkIcon className="h-4 w-4 mr-2" /> Copiar link da apresentação
              </Button>
            </>
          )}
          {presentationId && initialSlideId && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const url = `/dashboard/slides?open=${encodeURIComponent(presentationId)}&slide=${encodeURIComponent(initialSlideId)}`
                    await navigator.clipboard.writeText((window.location.origin || '') + url)
                    toast({ title: 'Link copiado', description: url })
                  } catch {}
                }}
              >
                Copiar link do slide
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  try {
                    const idx = (status?.slides || []).find((s:any) => s.id === initialSlideId)?.index
                    if (typeof idx === 'number') {
                      setSelectedIndex(idx)
                      setHighlightSlideId(initialSlideId)
                      setTimeout(() => setHighlightSlideId(null), 2000)
                      setTimeout(() => {
                        try { document.querySelector(`[data-slide-id="${initialSlideId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }) } catch {}
                      }, 50)
                    }
                  } catch {}
                }}
              >
                Ir para slide
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Input + anexos */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {/* Templates com filtros, favoritos e último aplicado */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">Modelos rápidos</div>
              <div className="flex items-center gap-2 text-xs">
                <Select value={tplStyle} onValueChange={(v)=>setTplStyle(v)}>
                  <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Estilo" /></SelectTrigger>
                  <SelectContent>
                    {['all','Corporate','Minimal','Vibrant','Education','Pitch','Pastel','Mono','Photo','Retro','Creative'].map(s => (
                      <SelectItem key={s} value={s}>{s === 'all' ? 'Todos os estilos' : s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={tplTheme} onValueChange={(v)=>setTplTheme(v as any)}>
                  <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Tema" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os temas</SelectItem>
                    <SelectItem value="modern-light">Claro</SelectItem>
                    <SelectItem value="modern-dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tplRatio} onValueChange={(v)=>setTplRatio(v as any)}>
                  <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Proporção" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tplSort} onValueChange={(v)=>setTplSort(v as any)}>
                  <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Ordenar por" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pop">Popularidade</SelectItem>
                    <SelectItem value="recent">Recentes</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Somente favoritos</span>
                  <Switch checked={tplOnlyFav} onCheckedChange={setTplOnlyFav} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Minha linguagem</span>
                  <Switch checked={tplMyLang} onCheckedChange={setTplMyLang} />
                </div>
                <Button size="sm" variant="ghost" onClick={()=>setTplGalleryOpen(true)}>Ver todos</Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {templates
                .filter(t => tplStyle === 'all' ? true : t.style === tplStyle)
                .filter(t => tplTheme === 'all' ? true : t.theme === tplTheme)
                .filter(t => tplRatio === 'all' ? true : t.ratio === tplRatio)
                .filter(t => tplOnlyFav ? Boolean(tplFavs[t.id]) : true)
                .filter(t => tplMyLang ? ((t.langs || ['pt-BR','en-US','es-ES']).includes(language)) : true)
                .sort((a,b)=>{
                  if (tplSort === 'pop') return (b.pop||0) - (a.pop||0)
                  if (tplSort === 'recent') return (b.addedAt||0) - (a.addedAt||0)
                  return a.name.localeCompare(b.name)
                })
                .map((tpl) => (
                <div key={tpl.id} className={`p-3 rounded border min-w-[260px] relative ${tplLast === tpl.id ? 'ring-1 ring-primary' : ''}`}>
                  <button
                    className={`absolute top-2 right-2 p-1 rounded ${tplFavs[tpl.id] ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
                    title={tplFavs[tpl.id] ? 'Favorito' : 'Favoritar'}
                    onClick={() => setTplFavs(prev => ({ ...prev, [tpl.id]: prev[tpl.id] ? 0 as any : 1 }))}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={tplFavs[tpl.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9 17 13.5 18.5 20.5 12 17 5.5 20.5 7 13.5 2 9 9 8.5 12 2"></polygon></svg>
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="space-y-1">
                      <VisualThumb palette={tpl.palette} dark={tpl.theme === 'modern-dark'} src={(tpl.pages && tpl.pages[0]) || tpl.thumb} />
                      <div className="flex items-center gap-1">
                        {((tpl.pages && tpl.pages.slice(1,4)) || []).map((p, i) => (
                          <div key={i} className="w-16"><VisualThumb palette={tpl.palette} dark={tpl.theme === 'modern-dark'} src={p} /></div>
                        ))}
                        {(!tpl.pages || tpl.pages.length < 2) && (
                          <>
                            <div className="w-16"><VisualThumb palette={tpl.palette} dark={tpl.theme === 'modern-dark'} /></div>
                            <div className="w-16"><VisualThumb palette={tpl.palette} dark={tpl.theme === 'modern-dark'} /></div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm line-clamp-1 flex items-center gap-2">
                        <span>{tpl.name}</span>
                        {tplLast === tpl.id ? <Badge variant="secondary" className="text-[10px]">Último</Badge> : null}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{tpl.style} • {tpl.tags}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{tpl.ratio}</Badge>
                    <div className="flex items-center gap-1">
                      {tpl.palette.map((c, i) => (<div key={i} className="h-3 w-3 rounded-full border" style={{ backgroundColor: c }} />))}
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Slides</span>
                        <Input type="number" min={1} max={50} className="h-8 w-16" value={tplCounts[tpl.id] ?? slideCount} onChange={(e)=>setTplCounts(prev => ({ ...prev, [tpl.id]: Math.max(1, Math.min(50, Number(e.target.value)||1)) }))} />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => applyTemplate(tpl)}>Aplicar</Button>
                      <Button size="sm" onClick={() => { applyTemplate(tpl); onCreateAIWithTheme(tpl.theme, (tplCounts[tpl.id] ?? slideCount)) }}>Aplicar e Criar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Full templates gallery dialog */}
          <Dialog open={tplGalleryOpen} onOpenChange={setTplGalleryOpen}>
            <DialogContent className="max-w-5xl">
              <DialogHeader>
                <DialogTitle>Todos os modelos</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input className="flex-1" placeholder="Pesquisar modelos" value={tplSearch} onChange={(e)=>setTplSearch(e.target.value)} />
                  <Select value={tplStyle} onValueChange={(v)=>setTplStyle(v)}>
                    <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="Estilo" /></SelectTrigger>
                    <SelectContent>
                      {['all','Corporate','Minimal','Vibrant','Education','Pitch','Pastel','Mono','Photo','Retro','Creative'].map(s => (
                        <SelectItem key={s} value={s}>{s === 'all' ? 'Todos os estilos' : s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={tplTheme} onValueChange={(v)=>setTplTheme(v as any)}>
                    <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Tema" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os temas</SelectItem>
                      <SelectItem value="modern-light">Claro</SelectItem>
                      <SelectItem value="modern-dark">Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tplRatio} onValueChange={(v)=>setTplRatio(v as any)}>
                    <SelectTrigger className="h-8 w-[120px]"><SelectValue placeholder="Proporção" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="16:9">16:9</SelectItem>
                      <SelectItem value="4:3">4:3</SelectItem>
                      <SelectItem value="1:1">1:1</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">Somente favoritos</span>
                    <Switch checked={tplOnlyFav} onCheckedChange={setTplOnlyFav} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-auto">
                  {filteredTemplates.map((tpl) => (
                    <div key={tpl.id} className={`p-3 rounded border relative ${tplLast === tpl.id ? 'ring-1 ring-primary' : ''}`}>
                      <button
                        className={`absolute top-2 right-2 p-1 rounded ${tplFavs[tpl.id] ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'}`}
                        title={tplFavs[tpl.id] ? 'Favorito' : 'Favoritar'}
                        onClick={() => setTplFavs(prev => ({ ...prev, [tpl.id]: prev[tpl.id] ? 0 as any : 1 }))}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={tplFavs[tpl.id] ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 8.5 22 9 17 13.5 18.5 20.5 12 17 5.5 20.5 7 13.5 2 9 9 8.5 12 2"></polygon></svg>
                      </button>
                      <div className="flex items-start gap-3">
                        <VisualThumb palette={tpl.palette} dark={tpl.theme === 'modern-dark'} src={(tpl.pages && tpl.pages[0]) || tpl.thumb} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm line-clamp-1 flex items-center gap-2">
                            <span>{tpl.name}</span>
                            {tplLast === tpl.id ? <Badge variant="secondary" className="text-[10px]">Último</Badge> : null}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{tpl.style} • {tpl.tags}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{tpl.ratio}</Badge>
                        <div className="flex items-center gap-1">
                          {tpl.palette.map((c, i) => (<div key={i} className="h-3 w-3 rounded-full border" style={{ backgroundColor: c }} />))}
                        </div>
                        <div className="flex-1" />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>Slides</span>
                            <Input type="number" min={1} max={50} className="h-8 w-16" value={tplCounts[tpl.id] ?? slideCount} onChange={(e)=>setTplCounts(prev => ({ ...prev, [tpl.id]: Math.max(1, Math.min(50, Number(e.target.value)||1)) }))} />
                          </div>
                          <Button size="sm" variant="outline" onClick={() => applyTemplate(tpl)}>Aplicar</Button>
                          <Button size="sm" onClick={() => { applyTemplate(tpl); onCreateAIWithTheme(tpl.theme, (tplCounts[tpl.id] ?? slideCount)) }}>Aplicar e Criar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTemplates.length === 0 && <div className="text-sm text-muted-foreground">Nenhum modelo encontrado</div>}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* Outline Editor */}
          <div className="flex items-center justify-between">
            <div className="font-medium flex items-center gap-2"><Sparkles className="h-4 w-4" /> Outline</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={genOutline} disabled={!presentationId || outlineBusy}><Sparkles className="h-4 w-4 mr-1" /> Gerar Outline</Button>
              <Button size="sm" onClick={genSlidesFromOutline} disabled={!presentationId || outline.length === 0 || outlineBusy}>Gerar Slides</Button>
            </div>
          </div>
          {outline.length > 0 && (
            <div className="border rounded">
              <DndContext sensors={sensors} onDragEnd={(e) => {
                const { active, over } = e
                if (!active?.id || !over?.id || active.id === over.id) return
                const oldIndex = outline.findIndex(o => o.id === String(active.id))
                const newIndex = outline.findIndex(o => o.id === String(over.id))
                if (oldIndex === -1 || newIndex === -1) return
                setOutline(ol => arrayMove(ol, oldIndex, newIndex))
              }}>
                <SortableContext items={outline.map(o => o.id)} strategy={verticalListSortingStrategy}>
                  {outline.map((it, idx) => (
                    <OutlineSortableItem key={it.id} itemId={it.id}>{({ setNodeRef, handleAttrs, handleListeners, style }) => (
                      <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2 border-b last:border-0 transition-shadow ${!outlineBusy ? 'hover:shadow-sm' : ''}`}>
                        <div className="w-6 text-xs text-muted-foreground">{idx + 1}</div>
                        <Button size="icon" variant="ghost" {...(!outlineBusy ? handleAttrs : {})} {...(!outlineBusy ? handleListeners : {})} disabled={outlineBusy} title={outlineBusy ? 'Arrastar indisponível' : 'Arrastar'}>
                          <GripVertical className="h-4 w-4" />
                        </Button>
                        <Input className="flex-1" value={it.title} onChange={(e) => setOutline(ol => ol.map((o,i)=> i===idx?{...o,title:e.target.value}:o))} placeholder={`Seção ${idx+1}`} />
                        <Input className="flex-1" value={it.description || ''} onChange={(e) => setOutline(ol => ol.map((o,i)=> i===idx?{...o,description:e.target.value}:o))} placeholder="Descrição" />
                        <Button size="icon" variant="ghost" onClick={() => setOutline(ol => ol.filter((_,i)=> i!==idx))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}</OutlineSortableItem>
                  ))}
                </SortableContext>
              </DndContext>
              <div className="p-2">
                <Button size="sm" variant="outline" onClick={() => setOutline(ol => [...ol, { id: newOutlineId(), title: 'Nova seção', description: '' }])}><Plus className="h-4 w-4 mr-1" />Adicionar seção</Button>
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap items-center">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Digite seu pedido de slides aqui" />
            <Input value={audience} onChange={(e)=>setAudience(e.target.value)} placeholder="Público (ex.: Diretores de Marketing)" />
            <label className="inline-flex items-center">
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
              <Button variant="outline" type="button" onClick={(e) => (e.currentTarget.previousElementSibling as HTMLInputElement).click()}>Anexar</Button>
            </label>
            <div className="flex items-center gap-2 min-w-[180px]">
              <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modern-light">Tema: Claro</SelectItem>
                  <SelectItem value="modern-dark">Tema: Escuro</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratio} onValueChange={(v)=>setRatio(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Proporção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
              <Select value={language} onValueChange={(v)=>setLanguage(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português</SelectItem>
                  <SelectItem value="en-US">Inglês</SelectItem>
                  <SelectItem value="es-ES">Espanhol</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Slides</span>
                <Input type="number" min={1} max={50} className="w-16" value={slideCount} onChange={(e)=>setSlideCount(Number(e.target.value)||8)} />
              </div>
              {presentationId && (
                <Button
                  variant="outline"
                  size="sm"
                  title="Aplicar tema nesta apresentação"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/presentations/${presentationId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme }) })
                      if (!res.ok) throw new Error('Falha ao salvar tema')
                      const data = await res.json()
                      setStatus((s) => s ? { ...s, theme: data.theme } as any : s)
                      toast({ title: 'Tema aplicado', description: `Agora: ${data.theme === 'modern-dark' ? 'Escuro' : 'Claro'}` })
                    } catch (e) {
                      toast({ title: 'Erro ao aplicar tema', description: 'Tente novamente em instantes', variant: 'destructive' as any })
                    }
                  }}
                >
                  Aplicar tema
                </Button>
              )}
              </div>
              {/* Opções de imagem (Designer) */}
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={imgQuality} onValueChange={(v)=>setImgQuality(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Qualidade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Rápido</SelectItem>
                    <SelectItem value="quality">Qualidade</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Estilo</span>
                  <input type="range" min={1} max={10} value={imgGuidance} onChange={(e)=>setImgGuidance(Number(e.target.value))} className="w-36"/>
                  <span className="text-xs text-muted-foreground">{imgGuidance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Seed</span>
                  <Input type="number" className="w-28" value={imgSeed} onChange={(e)=>setImgSeed(Number(e.target.value)||0)} />
                  <Button size="sm" variant="ghost" onClick={()=>setImgSeed(Math.floor(Math.random()*1e9))}>Rolar</Button>
                  <label className="text-xs inline-flex items-center gap-1"><input type="checkbox" checked={imgSeedLocked} onChange={(e)=>setImgSeedLocked(e.target.checked)} />Fixar</label>
                  <label className="text-xs inline-flex items-center gap-1"><input type="checkbox" checked={useSlideSeed} onChange={(e)=>setUseSlideSeed(e.target.checked)} />Usar seed do slide</label>
                </div>
                <Input value={imgStylesInput} onChange={(e)=>setImgStylesInput(e.target.value)} placeholder="Tags (ex.: Minimal, Corporate)" className="max-w-xs" />
                <Input value={imgNegative} onChange={(e)=>setImgNegative(e.target.value)} placeholder="Negative (ex.: sem texto)" className="max-w-xs" />
                <div className="flex items-center gap-2">
                  <input aria-label="Cor 1" type="color" value={imgPalette[0] || '#0ea5e9'} onChange={(e)=>setImgPalette([e.target.value, imgPalette[1] || '#22d3ee', imgPalette[2] || '#0c4a6e'])} />
                  <input aria-label="Cor 2" type="color" value={imgPalette[1] || '#22d3ee'} onChange={(e)=>setImgPalette([imgPalette[0] || '#0ea5e9', e.target.value, imgPalette[2] || '#0c4a6e'])} />
                  <input aria-label="Cor 3" type="color" value={imgPalette[2] || '#0c4a6e'} onChange={(e)=>setImgPalette([imgPalette[0] || '#0ea5e9', imgPalette[1] || '#22d3ee', e.target.value])} />
                </div>
                <div className="text-xs text-muted-foreground">
                  Custo estimado: <span className="font-medium text-foreground">{estCreditCost} cr</span>
                  {(() => {
                    try {
                      const rates = creditRates && creditRates.length ? creditRates : [0.0118, 0.0099, 0.00795]
                      const minR = Math.min(...rates)
                      const maxR = Math.max(...rates)
                      let minV = estCreditCost * minR
                      let maxV = estCreditCost * maxR
                      let currency = 'BRL'
                      if (displayCurrency === 'USD') {
                        minV = minV * brlToUsd
                        maxV = maxV * brlToUsd
                        currency = 'USD'
                      }
                      const fmt = (v: number) => new Intl.NumberFormat(displayCurrency === 'USD' ? 'en-US' : 'pt-BR', { style: 'currency', currency }).format(v)
                      return <span> • ≈ {fmt(minV)}{(Math.abs(maxV-minV) > 0.01) ? `–${fmt(maxV)}` : ''}</span>
                    } catch { return null }
                  })()}
                  {' '}• Saldo: {creditBalance} cr
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onCreate} disabled={!topic && attachments.length === 0}>Criar</Button>
                <Button variant="secondary" onClick={onCreateBlank}>Criar em branco</Button>
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Importar e Converter</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Importar do AI Drive</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input value={driveQuery} onChange={(e)=>setDriveQuery(e.target.value)} placeholder="Buscar arquivos (PDF, DOCX, PPTX, TXT)" />
                        <Button variant="outline" onClick={()=>fetchDrive(driveQuery || undefined, null)} disabled={driveLoading}>Buscar</Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[360px] overflow-auto">
                        {driveItems.map((it) => (
                          <label key={it.id} className="border rounded p-2 flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!selectedAssets[it.id]} onChange={(e)=>setSelectedAssets(s=>({...s,[it.id]: e.target.checked}))} />
                            <div className="relative shrink-0 w-12 h-12 bg-muted rounded overflow-hidden flex items-center justify-center">
                              {it.thumbUrl ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={it.thumbUrl} alt={it.title || it.id} className="w-full h-full object-cover" />
                                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/50 to-transparent" />
                                </>
                              ) : (
                                <div className="text-xs text-muted-foreground">{(it.mime||'file').split('/')[1] || 'file'}</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm line-clamp-1">{it.title || it.id}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{it.mime}</div>
                            </div>
                          </label>
                        ))}
                        {driveItems.length === 0 && !driveLoading && <div className="text-sm text-muted-foreground col-span-3">Nenhum arquivo</div>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">Somente arquivos: PDF, DOCX, PPTX, TXT</div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" disabled={!driveCursor || driveLoading} onClick={()=>fetchDrive(driveQuery || undefined, driveCursor)}>Carregar mais</Button>
                          <Button onClick={onImportConvert} disabled={driveLoading || Object.values(selectedAssets).every(v=>!v)}>Importar</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => (
                <span key={a.fileName} className="text-xs px-2 py-1 rounded-full bg-muted border">
                  {a.fileName}
                  <button className="ml-2 text-muted-foreground hover:text-foreground" onClick={() => removeAttachment(a.fileName)}>×</button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Status */}
      {presentationId && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Apresentação</div>
                <div className="font-medium flex items-center gap-2">
                  <span>{status?.title || topic}</span>
                  <Badge variant="outline" className="text-xs">
                    {(status?.theme || theme) === 'modern-dark' ? 'Tema: Escuro' : 'Tema: Claro'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm">{status?.status || 'queued'} • {status?.currentTask || '—'}</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/presentations/${presentationId}/export?format=pdf&ratio=${encodeURIComponent(ratio)}`, '_blank')}
                    disabled={!status || status.status !== 'ready' || (status.slides?.length ?? 0) === 0}
                    title={!status || status.status !== 'ready' ? 'Aguarde finalizar' : 'Exportar PDF'}
                  >
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/presentations/${presentationId}/export?format=html&ratio=${encodeURIComponent(ratio)}`, '_blank')}
                    disabled={!status || status.status !== 'ready' || (status.slides?.length ?? 0) === 0}
                    title={!status || status.status !== 'ready' ? 'Aguarde finalizar' : 'Exportar HTML'}
                  >
                    Exportar HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/api/presentations/${presentationId}/export?format=pptx&ratio=${encodeURIComponent(ratio)}`, '_blank')}
                    disabled={!status || status.status !== 'ready' || (status.slides?.length ?? 0) === 0}
                    title={!status || status.status !== 'ready' ? 'Aguarde finalizar' : 'Exportar PPTX'}
                  >
                    Exportar PPTX
                  </Button>
                </div>
              </div>
            </div>
            <Progress value={status?.progress || 0} />
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar: estrutura */}
        <div className="col-span-12 md:col-span-4 space-y-3">
          <Card>
  <CardContent className="p-4 space-y-2">
              <div className="font-medium flex items-center justify-between">
                <span>Estrutura</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Mini layout</span>
  <Switch checked={useMiniThumbs} onCheckedChange={(v) => setUseMiniThumbs(v)} />
  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <DropdownTrigger variant="outline" className="h-8 px-2 rounded-md text-xs">
                        Adicionar
                      </DropdownTrigger>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'title-cover', heading: status?.title || topic || 'Nova Apresentação' }) }); await fetchStatusOnce(presentationId) }}>Capa</DropdownMenuItem>
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'title-centered', heading: 'Título' }) }); await fetchStatusOnce(presentationId) }}>Título Central</DropdownMenuItem>
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'bullets-left-media-right', heading:'Tópico', bullets:['Ponto 1','Ponto 2','Ponto 3'] }) }); await fetchStatusOnce(presentationId) }}>Bullets + Imagem</DropdownMenuItem>
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'media-left-bullets-right', heading:'Tópico', bullets:['Ponto 1','Ponto 2','Ponto 3'] }) }); await fetchStatusOnce(presentationId) }}>Imagem + Bullets</DropdownMenuItem>
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; const url = window.prompt('URL do vídeo (YouTube/Vimeo/arquivo)?'); if (!url) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'title-centered', heading:'Vídeo', video:{ kind:'url', url } }) }); await fetchStatusOnce(presentationId) }}>Vídeo</DropdownMenuItem>
                      <DropdownMenuItem onClick={async()=>{ if (!presentationId) return; const url = window.prompt('URL do áudio (MP3/stream)?'); if (!url) return; await fetch(`/api/presentations/${presentationId}/slides/add`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ layout:'title-centered', heading:'Áudio', audio:{ kind:'url', url } }) }); await fetchStatusOnce(presentationId) }}>Áudio</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {filteredSlides.length === 0 && <div className="text-sm text-muted-foreground">Nenhum slide encontrado</div>}
                <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                  <SortableContext items={(localOrder ?? items)} strategy={verticalListSortingStrategy}>
                {(filteredSlides).map((s) => (
                  <SortableSlide slideId={s.id}>{({ setNodeRef, handleAttrs, handleListeners, style }) => (
                    <div ref={setNodeRef} data-slide-id={s.id} style={style} className={`flex items-center justify-between gap-2 px-3 py-2 rounded border transition-shadow ${selectedIndex === s.index ? 'bg-primary/10 border-primary' : 'hover:bg-muted'} ${highlightSlideId === s.id ? 'ring-2 ring-emerald-400' : ''} ${!dndDisabled ? 'hover:shadow-sm' : ''}`}>
                      <button className="text-left flex-1" onClick={() => setSelectedIndex(s.index)} title={(() => { const p = previewFromSlide(s); const l = (!p.layout || p.layout === 'auto') ? recommendLayout(ratio, s.contentJson) : p.layout; const map: any = { 'title-cover': 'Capa', 'media-left-bullets-right': '2 col (Imagem+Bullets)', 'bullets-left-media-right': '2 col (Bullets+Imagem)', 'title-centered': 'Central' }; return `Layout: ${map[l] || 'Auto'}` })()}>
                        {useMiniThumbs ? (
                          (() => {
                            const p = previewFromSlide(s)
                            const small = p.bullets[0] || p.sub || `Página ${s.index + 1}`
                            return (
                              <div className="flex items-start gap-2">
                                <div className="shrink-0 mt-0.5 relative">
                                  <MiniThumb isDark={isDarkTheme} />
                                  {p.imgUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={(p.imgUrl || '').replace(/\.[^./]+$/, '_thumb.jpg')} data-full={p.imgUrl} alt="thumb" className="absolute inset-0 w-16 h-10 object-cover rounded" style={{ opacity: 0.4 }} loading="lazy" onError={(e)=>{ const full=e.currentTarget.getAttribute('data-full'); if(full) e.currentTarget.src = full }} />
                                  ) : null}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium line-clamp-1 flex items-center gap-2">
                                    <span>{headingFromSlide(s)}</span>
                                    {(!p.layout || p.layout === 'auto') && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-muted text-muted-foreground">Auto</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground line-clamp-1">{small}</div>
                                </div>
                              </div>
                            )
                          })()
                        ) : (
                          (() => {
                            const p = previewFromSlide(s)
                            return (
                              <div>
                                <div className="text-sm font-medium line-clamp-1">{headingFromSlide(s)}</div>
                                <div className="mt-0.5">
                                  {p.sub ? <div className="text-[11px] text-muted-foreground line-clamp-1">{p.sub}</div> : null}
                                  {p.bullets.length > 0 ? (
                                    <ul className="text-[11px] text-muted-foreground list-disc pl-4">
                                      <li className="line-clamp-1">{p.bullets[0]}</li>
                                      {p.bullets[1] ? <li className="line-clamp-1">{p.bullets[1]}</li> : null}
                                    </ul>
                                  ) : <div className="text-[11px] text-muted-foreground">Página {s.index + 1}</div>}
                                </div>
                              </div>
                            )
                          })()
                        )}
                      </button>
                      <DropdownMenu>
                        <Button size="icon" variant="ghost" {...(!dndDisabled ? handleAttrs : {})} {...(!dndDisabled ? handleListeners : {})} title={dndDisabled ? 'Arrastar desabilitado (filtro ativo)' : 'Arrastar'} disabled={dndDisabled}><GripVertical className="h-4 w-4" /></Button>
                        <DropdownMenuTrigger asChild>
                          <DropdownTrigger variant="ghost" className="h-8 w-8 p-0 items-center justify-center">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownTrigger>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => moveSlide(s.id, 'up')}>Mover para cima</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => moveSlide(s.id, 'down')}>Mover para baixo</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateSlide(s.id)}>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copySlideJson(s.id)}>Copiar JSON</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteSlide(s.id)}>Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}</SortableSlide>
                ))}
                  </SortableContext>
                </DndContext>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Workspace */}
        <div className="col-span-12 md:col-span-8">
          <Card>
            <CardContent className="p-4">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList>
                  <TabsTrigger value="view">Visualizar</TabsTrigger>
                  <TabsTrigger value="code">Código</TabsTrigger>
                  <TabsTrigger value="thinking">Pensando</TabsTrigger>
                </TabsList>
                <TabsContent value="view" className="mt-4">
                  {(editIA || advanced) && (enablePlate ? (<PlateEditor heading={edHeading} subtitle={edSubtitle} bulletsText={edBullets} onHeading={setEdHeading} onSubtitle={setEdSubtitle} onBulletsText={setEdBullets} saving={saving} />) : (
                    <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded">
                      <div>
                        <label className="text-xs text-muted-foreground">Título</label>
                        <Input value={edHeading} onChange={(e) => setEdHeading(e.target.value)} placeholder="Título do slide" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Subtítulo</label>
                        <Input value={edSubtitle} onChange={(e) => setEdSubtitle(e.target.value)} placeholder="Subtítulo" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-muted-foreground">Bullets (um por linha)</label>
                        <textarea className="w-full text-sm p-2 border rounded min-h-[100px]" value={edBullets} onChange={(e) => setEdBullets(e.target.value)} placeholder="Ponto 1\nPonto 2\nPonto 3" />
                        <div className="text-xs text-muted-foreground mt-1">{saving ? "Salvando..." : "Auto-salvo"}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">Página {selectedIndex + 1} / {slides.length || 0}</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goPrev} disabled={selectedIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={goNext} disabled={selectedIndex >= (slides.length - 1)}><ChevronRight className="h-4 w-4" /></Button>
                    {current && (
                      <>
                        <Button variant="secondary" size="sm" onClick={async ()=>{
                          if (!presentationId || !current) return
                          await fetch(`/api/presentations/${presentationId}/slides/${current.id}/regenerate-text`, { method: 'POST' })
                          await fetchStatusOnce(presentationId)
                          toast({ title: 'Texto atualizado' })
                        }}>Regenerar texto</Button>
                        <Button variant="secondary" size="sm" disabled={creditBalance < estCreditCost} title={creditBalance < estCreditCost ? 'Créditos insuficientes' : 'Gerar imagem'} onClick={async ()=>{
                          if (!presentationId || !current) return
                          const seed = imgSeedLocked ? (imgSeed || 0) : Math.floor(Math.random()*1e9)
                          const res = await fetch(`/api/presentations/${presentationId}/slides/${current.id}/regenerate-image`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                              ratio,
                              styleTags: imgStyleTags,
                              negative: imgNegative || undefined,
                              guidance: imgGuidance,
                              palette: imgPalette,
                              quality: imgQuality,
                              seed,
                            })
                          })
                          if (!res.ok) {
                            const j = await res.json().catch(()=>null)
                            toast({ title: 'Falha ao gerar', description: j?.error || 'Erro ao gerar imagem', variant: 'destructive' as any })
                            await refreshBalance(); return
                          }
                          await fetchStatusOnce(presentationId)
                          toast({ title: 'Imagem atualizada' })
                          await refreshBalance()
                        }}>Nova imagem</Button>
                        <Button variant="outline" size="sm" disabled={creditBalance < estCreditCost} title={creditBalance < estCreditCost ? 'Créditos insuficientes' : 'Gerar variação'} onClick={async ()=>{
                          if (!presentationId || !current) return
                          let baseSeed = imgSeed
                          try {
                            const j = JSON.parse(current.contentJson)
                            const el = (j.elements||[]).find((e:any)=>e?.type==='image')
                            if (typeof el?.source?.seed === 'number') baseSeed = el.source.seed
                          } catch {}
                          const nextSeed = (baseSeed || 0) + 1; setImgSeed(nextSeed)
                          const res = await fetch(`/api/presentations/${presentationId}/slides/${current.id}/regenerate-image`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                              ratio,
                              styleTags: imgStyleTags,
                              negative: imgNegative || undefined,
                              guidance: imgGuidance,
                              palette: imgPalette,
                              quality: imgQuality,
                              seed: nextSeed,
                            })
                          })
                          if (!res.ok) {
                            const j = await res.json().catch(()=>null)
                            toast({ title: 'Falha ao gerar', description: j?.error || 'Erro ao gerar imagem', variant: 'destructive' as any })
                            await refreshBalance(); return
                          }
                          await fetchStatusOnce(presentationId)
                          toast({ title: 'Variação gerada' })
                          await refreshBalance()
                        }}>Variação</Button>
                        <Select onValueChange={async (v)=>{
                          if (!presentationId || !current) return
                          try {
                            const j = JSON.parse(current.contentJson)
                            const next = { ...(j||{}), layout: v }
                            await fetch(`/api/presentations/${presentationId}/slides/${current.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentJson: JSON.stringify(next) }) })
                            await fetchStatusOnce(presentationId)
                            toast({ title: 'Layout aplicado' })
                          } catch {}
                        }}>
                          <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Trocar layout" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto</SelectItem>
                            <SelectItem value="title-cover">Capa</SelectItem>
                            <SelectItem value="bullets-left-media-right">Bullets + Imagem</SelectItem>
                            <SelectItem value="media-left-bullets-right">Imagem + Bullets</SelectItem>
                            <SelectItem value="title-centered">Título Central</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" title="Aplicar layout por proporção" onClick={async ()=>{
                          if (!presentationId || !current) return
                          try {
                            const j = JSON.parse(current.contentJson)
                            const recommended = recommendLayout(ratio, current.contentJson)
                            const next = { ...(j||{}), layout: recommended }
                            await fetch(`/api/presentations/${presentationId}/slides/${current.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentJson: JSON.stringify(next) }) })
                            await fetchStatusOnce(presentationId)
                            toast({ title: 'Layout recomendado aplicado', description: recommended })
                          } catch {}
                        }}>Layout por proporção</Button>
                        <Button variant="outline" size="sm" title="Aplicar layout recomendado em todos" onClick={async ()=>{
                          if (!presentationId || !status) return
                          try {
                            const slidesList = (status.slides || []).slice().sort((a,b)=>a.index-b.index)
                            let changed = 0
                            for (const s of slidesList) {
                              try {
                                const rec = recommendLayout(ratio, s.contentJson)
                                const j = JSON.parse(s.contentJson)
                                if (j.layout === rec) continue
                                const next = { ...(j||{}), layout: rec }
                                await fetch(`/api/presentations/${presentationId}/slides/${s.id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ contentJson: JSON.stringify(next) }) })
                                changed++
                              } catch {}
                            }
                            await fetchStatusOnce(presentationId)
                            toast({ title: 'Layouts aplicados', description: `${changed} slide(s) atualizados` })
                          } catch {}
                        }}>Aplicar a todos</Button>
                      </>
                    )}
                  </div>
                  </div>
                  {current ? (
                    <div className={`border rounded overflow-hidden ${highlightSlideId === current.id ? 'ring-2 ring-emerald-400' : ''}`} style={{ background: tokens.bg }}>
                      {/* Apply aspect ratio to composition */}
                      {(() => {
                        const [rw, rh] = (() => { const m = ratio.split(':').map(Number); return (m.length===2 && m[0]>0 && m[1]>0) ? m : [16,9] })() as [number, number]
                        const aspect = `${rw} / ${rh}`
                        try {
                          const json = JSON.parse(current.contentJson)
                          const layoutRaw = (json.layout || '').toString()
                          const layout = (!layoutRaw || layoutRaw === 'auto') ? recommendLayout(ratio, current.contentJson) : layoutRaw
                          const els = Array.isArray(json.elements) ? json.elements : []
                          const heading = els.find((e:any)=>e?.type==='heading')
                          const subtitle = els.find((e:any)=>e?.type==='subtitle')
                          const bullets = els.find((e:any)=>e?.type==='bullets')
                          const image = els.find((e:any)=>e?.type==='image')

                          const twoCols = layout === 'bullets-left-media-right' || layout === 'media-left-bullets-right'
                          const imageFirst = layout === 'media-left-bullets-right'
                          const isSquare = rw === 1 && rh === 1
                          const isFourThree = rw === 4 && rh === 3
                          const colTemplate = isSquare ? '1fr' : isFourThree ? '1fr 1fr' : '3fr 2fr'

                          return (
                            <div className="w-full" style={{ aspectRatio: aspect }}>
                              <div className="w-full h-full p-6 relative" style={{ background: tokens.bg, color: tokens.fg }}>
                                {layout === 'title-cover' ? (
                                  <div className="absolute inset-0">
                                    {image?.source?.url && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={image.source.url} alt="bg" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute inset-0" style={{ background: isDarkTheme ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.25)' }} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="text-center max-w-[70%]">
                                        {heading && <div className="text-4xl font-bold drop-shadow" style={{ color: tokens.fg }}>{heading.text}</div>}
                                        {subtitle && <div className="mt-2 text-lg drop-shadow" style={{ color: tokens.fg, opacity: 0.9 }}>{subtitle.text}</div>}
                                      </div>
                                    </div>
                                  </div>
                                ) : layout === 'title-centered' ? (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-center gap-3">
                                    {heading && <div className="text-3xl font-bold" style={{ color: tokens.fg }}>{heading.text}</div>}
                                    {subtitle && <div className="max-w-[70%] mx-auto" style={{ color: tokens.muted }}>{subtitle.text}</div>}
                                  </div>
                                ) : twoCols ? (
                                  <div className={isSquare ? 'grid grid-cols-1 gap-4 h-full' : 'grid gap-4 h-full'} style={{ gridTemplateColumns: isSquare ? undefined : colTemplate }}>
                                    <div className="flex flex-col gap-3 min-w-0">
                                      {(!imageFirst) ? (
                                        <>
                                          {heading && <div className="text-2xl font-bold" style={{ color: tokens.fg }}>{heading.text}</div>}
                                          {subtitle && <div style={{ color: tokens.muted }}>{subtitle.text}</div>}
                                          {bullets && (
                                            <ul className="list-disc pl-5 text-sm" style={{ color: tokens.fg }}>
                                              {bullets.items?.map((it: string, i: number) => (<li key={i}>{it}</li>))}
                                            </ul>
                                          )}
                                        </>
                                      ) : (
                                        image?.source?.url ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={image.source.thumbUrl || (image.source.url ? image.source.url.replace(/\.[^./]+$/, '_thumb.jpg') : '')} data-full={image.source.url} alt="Imagem do slide" className="w-full h-auto object-contain rounded" loading="lazy" onError={(e)=>{ const t=e.currentTarget; const full=t.getAttribute('data-full'); if(full) t.src=full }} />
                                        ) : null
                                      )}
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-0">
                                      {(imageFirst) ? (
                                        <>
                                          {heading && <div className="text-2xl font-bold" style={{ color: tokens.fg }}>{heading.text}</div>}
                                          {subtitle && <div style={{ color: tokens.muted }}>{subtitle.text}</div>}
                                          {bullets && (
                                            <ul className="list-disc pl-5 text-sm" style={{ color: tokens.fg }}>
                                              {bullets.items?.map((it: string, i: number) => (<li key={i}>{it}</li>))}
                                            </ul>
                                          )}
                                        </>
                                      ) : (
                                        image?.source?.url ? (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={image.source.thumbUrl || (image.source.url ? image.source.url.replace(/\.[^./]+$/, '_thumb.jpg') : '')} data-full={image.source.url} alt="Imagem do slide" className="w-full h-auto object-contain rounded" loading="lazy" onError={(e)=>{ const t=e.currentTarget; const full=t.getAttribute('data-full'); if(full) t.src=full }} />
                                        ) : null
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {heading && <div className="text-2xl font-bold" style={{ color: tokens.fg }}>{heading.text}</div>}
                                    {subtitle && <div style={{ color: tokens.muted }}>{subtitle.text}</div>}
                                    {bullets && (
                                      <ul className="list-disc pl-5 text-sm" style={{ color: tokens.fg }}>
                                        {bullets.items?.map((it: string, i: number) => (<li key={i}>{it}</li>))}
                                      </ul>
                                    )}
                                    {image?.source?.url && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={image.source.thumbUrl || (image.source.url ? image.source.url.replace(/\.[^./]+$/, '_thumb.jpg') : '')} data-full={image.source.url} alt="Imagem do slide" className="max-h-64 w-full object-contain rounded" loading="lazy" onError={(e)=>{ const t=e.currentTarget; const full=t.getAttribute('data-full'); if(full) t.src=full }} />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        } catch {
                          return <div className="p-6 text-sm text-muted-foreground">Falha ao renderizar este slide.</div>
                        }
                      })()}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Selecione um slide</div>
                  )}
                </TabsContent>
                <TabsContent value="code" className="mt-4">
                  <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[480px]"><code>{codeHtml}</code></pre>
                </TabsContent>
                <TabsContent value="thinking" className="mt-4">
                  <div className="space-y-3 text-sm">
                    <div className="font-medium">Checklist</div>
                    {(() => {
                      const steps = [
                        'Analisar anexos',
                        'Examinar documentos',
                        'Inicializar apresentação',
                        'Criar slides',
                        'Compilar slides',
                      ]
                      const items = steps.map((name, i) => {
                        const done = (status?.progress || 0) >= ([5,20,35,60,80][i] || 100)
                        const isCurrent = (status?.currentTask || '').toLowerCase().includes(name.split(' ')[0].toLowerCase())
                        return (<div key={i} className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${done ? 'bg-green-500' : isCurrent ? 'bg-yellow-500' : 'bg-muted-foreground'}`}></div>
                          <span>{name}</span>
                        </div>)
                      })
                      return <div className="space-y-2">{items}</div>
                    })()}
                    <div className="text-muted-foreground">Atualizado: {new Date(status?.updatedAt || Date.now()).toLocaleTimeString()}</div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
