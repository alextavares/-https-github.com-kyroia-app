"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Zap, Brain, Gauge, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { DropdownTrigger } from "@/components/ui/dropdown-trigger"
import { cn } from "@/lib/utils"
import { getModelsForPlan, getModelById } from "@/lib/ai/innerai-models-config.ts"

type Category = 'fast' | 'advanced' | 'reasoning'
type SimpleModel = { id: string; name: string; provider: string; category: Category; planRequired: 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE' }

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode }> = {
  fast: { label: 'Rápidos', icon: <Zap className="h-3.5 w-3.5" /> },
  advanced: { label: 'Avançados', icon: <Brain className="h-3.5 w-3.5" /> },
  reasoning: { label: 'Raciocínio', icon: <Gauge className="h-3.5 w-3.5" /> },
}

function loadModels(): SimpleModel[] {
  try {
    return getModelsForPlan('PRO')
      .filter(m => m.isAvailable)
      .map(m => ({ id: m.id, name: m.name, provider: m.provider, category: m.category, planRequired: m.planRequired }))
  } catch {
    return []
  }
}

export function ModelSelector({ compact = false }: { compact?: boolean }) {
  const [models, setModels] = useState<SimpleModel[]>([])
  const [planType, setPlanType] = useState<'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE'>('FREE')
  const [selectedId, setSelectedId] = useState<string>('')
  const [open, setOpen] = useState(false)

  // Abrir via evento global (Alt+M)
  useEffect(() => {
    const onOpen = () => setOpen(true)
    if (typeof window !== 'undefined') {
      window.addEventListener('kyroia:model:open', onOpen as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('kyroia:model:open', onOpen as any)
      }
    }
  }, [])

  useEffect(() => {
    const ms = loadModels()
    setModels(ms)
    let initial = 'gpt-4o-mini'
    try {
      const lastPlan = (localStorage.getItem('lastPlanType') as any) || 'FREE'
      setPlanType(lastPlan)
      const saved = localStorage.getItem(`selectedModel:${lastPlan}`) || localStorage.getItem('selectedModel')
      if (saved && ms.some(m => m.id === saved)) initial = saved
    } catch {}
    if (!ms.some(m => m.id === initial)) initial = ms[0]?.id || ''
    setSelectedId(initial)
  }, [])

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await fetch('/api/subscription', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          const pt = (j?.planType || 'FREE') as typeof planType
          setPlanType(pt)
          localStorage.setItem('lastPlanType', pt)
        }
      } catch {}
    }
    loadPlan()
  }, [])

  const grouped = useMemo(() => {
    const groups: Record<Category, SimpleModel[]> = { fast: [], advanced: [], reasoning: [] }
    for (const m of models) groups[m.category].push(m)
    return groups
  }, [models])

  const applySelection = (id: string) => {
    setSelectedId(id)
    try {
      const meta = getModelById(id)
      localStorage.setItem('selectedModel', id)
      localStorage.setItem(`selectedModel:${planType}`, id)
      sessionStorage.setItem('modelAppliedName', meta?.name || id)
    } catch {}
    setOpen(false)
  }

  const selected = models.find(m => m.id === selectedId)
  const selectedName = selected?.name || 'Selecionar modelo'

  const renderItem = (m: SimpleModel) => (
    <DropdownMenuItem
      key={m.id}
      onSelect={() => applySelection(m.id)}
      className={cn(
        'flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer',
        m.id === selectedId && 'bg-primary/10'
      )}
    >
      <span className="text-muted-foreground/70">
        {m.category === 'fast' ? <Zap className="h-3.5 w-3.5" /> : m.category === 'advanced' ? <Brain className="h-3.5 w-3.5" /> : <Gauge className="h-3.5 w-3.5" />}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate max-w-[240px]">{m.name}</span>
          {m.planRequired !== 'FREE' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">PRO</span>
          )}
        </div>
        <div className="text-[11px] text-text-tertiary truncate">{m.provider}</div>
      </div>
      {m.id === selectedId && <Check className="h-4 w-4 text-primary" />}
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <DropdownTrigger
          data-testid="model-selector-trigger"
          className={cn(
            'rounded-full border border-border/60 bg-card/80 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-soft hover:shadow-soft-md',
            compact ? 'h-9 px-3 min-w-[220px]' : 'h-10 px-4 min-w-[260px]'
          )}
        >
          <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
            <span className="text-muted-foreground/80">
              {selected?.category === 'fast' ? <Zap className="h-4 w-4" /> : selected?.category === 'advanced' ? <Brain className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
            </span>
            <div className={cn('leading-tight', compact ? 'flex items-center gap-2' : 'flex flex-col items-start')}>
              <span className={cn('font-medium truncate', compact ? 'text-sm max-w-[160px]' : 'max-w-[200px]')}>{selectedName}</span>
              {!compact && (
                <span className="text-[11px] text-text-tertiary">
                  {selected?.provider || '—'} {selected && selected.planRequired !== 'FREE' ? '· 💳' : ''}
                </span>
              )}
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </DropdownTrigger>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={cn('bg-card/95 backdrop-blur border border-border shadow-soft-lg rounded-xl', compact ? 'w-[420px]' : 'w-[500px]') }>
        <div className={cn(compact ? 'p-2' : 'p-3')}>
          <DropdownMenuLabel className={cn('text-text-primary font-semibold', compact ? 'text-sm' : 'text-base')}>Selecione um modelo</DropdownMenuLabel>
          <p className={cn('text-text-secondary', compact ? 'text-[11px] mt-0.5 mb-2' : 'text-xs mt-1 mb-3')}>Escolha um modelo de IA para sua conversa</p>
        </div>
        {(['fast','advanced','reasoning'] as Category[]).map(cat => (
          grouped[cat].length > 0 ? (
            <div key={cat} className="px-2">
              <div className="flex items-center gap-2 px-1 py-1.5 text-xs text-text-secondary">
                {CATEGORY_META[cat].icon}
                <span className="font-semibold">{CATEGORY_META[cat].label}</span>
                <div className="ml-2 h-px flex-1 bg-border/80" />
              </div>
              {grouped[cat].map(renderItem)}
              <DropdownMenuSeparator className="my-2" />
            </div>
          ) : null
        ))}
        <div className={cn(compact ? 'px-2 pb-2' : 'px-3 pb-3', 'text-right text-[11px]')}>
          <a href="/dashboard/models" className="underline text-muted-foreground hover:text-foreground">Ver todos os modelos</a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

