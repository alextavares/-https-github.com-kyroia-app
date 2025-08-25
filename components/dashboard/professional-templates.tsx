"use client"

import { useRouter } from "next/navigation"
import { useRef, useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Megaphone, 
  HelpCircle, 
  BarChart3, 
  FileIcon,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"

const professionalTemplates = [
  {
    id: "resumo-executivo",
    title: "Resumo Executivo",
    description: "Crie um resumo conciso e impactante que destaque os principais pontos e recomendações",
    icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
    prompt: "Preciso de um resumo executivo profissional sobre",
    category: "Trabalho"
  },
  {
    id: "comunicado-imprensa",
    title: "Comunicado de Imprensa",
    description: "Elabore um comunicado de imprensa profissional para divulgar notícias importantes",
    icon: <Megaphone className="h-4 w-4 text-green-500" />,
    prompt: "Crie um comunicado de imprensa profissional sobre",
    category: "Trabalho"
  },
  {
    id: "artigo-suporte",
    title: "Artigo de Suporte",
    description: "Desenvolva artigos de suporte detalhados para orientar os usuários",
    icon: <FileText className="h-4 w-4 text-purple-500" />,
    prompt: "Escreva um artigo de suporte completo sobre como",
    category: "Trabalho"
  },
  {
    id: "faqs",
    title: "Perguntas Frequentes (FAQs)",
    description: "Compile uma lista de perguntas frequentes e suas respostas detalhadas",
    icon: <HelpCircle className="h-4 w-4 text-orange-500" />,
    prompt: "Crie uma seção de perguntas frequentes (FAQ) sobre",
    category: "Trabalho"
  },
  {
    id: "resumo-documento",
    title: "Resumo",
    description: "Resuma de forma eficiente conteúdo extenso mantendo os pontos principais",
    icon: <FileIcon className="h-4 w-4 text-indigo-500" />,
    prompt: "Faça um resumo detalhado e organizado sobre",
    category: "Trabalho"
  }
]

const professionalCategories = [
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "juridico", name: "Jurídico", icon: "⚖️" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "operacoes", name: "Operações", icon: "⚙️" },
  { id: "financas", name: "Finanças", icon: "💰" },
  { id: "vendas", name: "Vendas", icon: "📈" },
  { id: "engenharia", name: "Engenharia", icon: "🔧" },
  { id: "conteudo", name: "Criador de Conteúdo", icon: "📝" },
  { id: "rh", name: "Recursos Humanos", icon: "👥" },
  { id: "outro", name: "Outro...", icon: "📋" }
]

interface ProfessionalTemplatesProps {
  className?: string
  variant?: 'neutral' | 'dark'
  showHeadings?: boolean
  showCategories?: boolean
  maxItems?: number
  compact?: boolean
  horizontal?: boolean
  scrollAmount?: number
  onActivate?: () => void
}

export function ProfessionalTemplates({ className, variant = 'neutral', showHeadings = true, showCategories = true, maxItems, compact = false, horizontal = false, scrollAmount = 360, onActivate }: ProfessionalTemplatesProps) {
  const router = useRouter()
  const isDark = variant === 'dark'

  const titleTextCls = isDark ? 'text-white' : 'text-foreground'
  const hintTextCls = isDark ? 'text-gray-400' : 'text-muted-foreground'
  const cardBaseCls = isDark
    ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
    : 'bg-card border-border hover:bg-accent/5'
  const chipCls = isDark
    ? 'bg-gray-700/50'
    : 'bg-muted'
  const badgeCls = isDark ? 'bg-purple-600 text-white' : ''

  const handleTemplateClick = (template: typeof professionalTemplates[0]) => {
    // Prefill inline chat on dashboard instead of redirecting
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kyroia:inline-prefill', template.prompt)
        const el = document.getElementById('inline-chat')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const input = document.getElementById('inline-chat-input') as HTMLTextAreaElement | null
          input?.focus()
        }, 250)
      }
    } catch {}
    onActivate?.()
  }

  const handleCategoryClick = (category: typeof professionalCategories[0]) => {
    // Prefill inline chat on dashboard
    const prompt = `Como especialista em ${category.name.toLowerCase()}, me ajude com:`
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('kyroia:inline-prefill', prompt)
        const el = document.getElementById('inline-chat')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const input = document.getElementById('inline-chat-input') as HTMLTextAreaElement | null
          input?.focus()
        }, 250)
      }
    } catch {}
    onActivate?.()
  }

  // Limit visible items; allow forcing a single row
  const categoriesShort = professionalCategories.slice(0, 5)
  const max = typeof maxItems === 'number' ? Math.max(0, maxItems) : 6
  const templatesShort = professionalTemplates.slice(0, max)

  // Horizontal scrolling state
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollButtons = () => {
    const el = rowRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    if (!horizontal) return
    const el = rowRef.current
    if (!el) return
    updateScrollButtons()
    const onScroll = () => updateScrollButtons()
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => updateScrollButtons()
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [horizontal])

  const scrollBy = (dir: 'left' | 'right') => {
    const el = rowRef.current
    if (!el) return
    const delta = dir === 'left' ? -scrollAmount : scrollAmount
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Categorias Profissionais (opcional) */}
      {showCategories && (
        <div>
          {showHeadings && (
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${titleTextCls}`}>Conte para gente de qual time você faz parte...</h3>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categoriesShort.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${cardBaseCls} transition-colors ${titleTextCls}`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Profissionais */}
      <div>
        {showHeadings && (
          <div className="mb-3">
            <h3 className={`text-xl md:text-2xl font-semibold ${titleTextCls}`}>Templates Prontos</h3>
            <p className={`text-sm ${hintTextCls}`}>Modelos prontos para acelerar seu trabalho</p>
          </div>
        )}
        {horizontal ? (
          <div className="relative" data-templates-horizontal="true">
            {/* Left gradient + arrow */}
            <div className={`pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent z-10 ${canScrollLeft ? '' : 'opacity-0'}`}></div>
            <button
              type="button"
              aria-label="Scroll left"
              onClick={() => scrollBy('left')}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full border bg-card shadow-soft ${canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {/* Row */}
            <div
              ref={rowRef}
              className="flex flex-nowrap items-stretch gap-2.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory pr-1 w-full"
            >
              {templatesShort.map((template) => (
                <Card
                  key={template.id}
                  className={`min-w-[130px] sm:min-w-[150px] shrink-0 snap-start cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.005] rounded-xl group ${cardBaseCls}`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <CardContent className="p-2.5">
                    <div className="flex flex-col items-center text-center space-y-1.5 min-h-[88px]">
                      <div className={`p-1 rounded-lg ${chipCls} group-hover:opacity-90 transition-colors [&_svg]:h-4 [&_svg]:w-4`}>
                        {template.icon}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-medium text-xs leading-tight truncate max-w-[110px] ${titleTextCls}`}>
                          {template.title}
                        </h4>
                        {(!compact) && (
                          <p className={`text-[11px] leading-snug ${hintTextCls}`}>
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Right gradient + arrow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10 ${canScrollRight ? '' : 'opacity-0'}`}></div>
            <button
              type="button"
              aria-label="Scroll right"
              onClick={() => scrollBy('right')}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center h-9 w-9 rounded-full border bg-card shadow-soft ${canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templatesShort.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] group ${cardBaseCls}`}
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent className={compact ? "p-4" : "p-6"}>
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className={`p-2 rounded-lg ${chipCls} group-hover:opacity-90 transition-colors`}>
                      {template.icon}
                    </div>
                    <div className="space-y-2">
                      <h4 className={`font-medium text-sm leading-tight ${titleTextCls}`}>
                        {template.title}
                      </h4>
                      <p className={`text-xs leading-relaxed ${hintTextCls} ${compact ? 'line-clamp-2' : ''}`}>
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Botão removido: o CTA de chat ficará em um card separado abaixo */}
    </div>
  )
}
