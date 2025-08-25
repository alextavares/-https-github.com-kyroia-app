"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  BarChart3,
  Megaphone,
  FileText,
  HelpCircle,
  FileIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const items = [
  {
    id: "resumo-executivo",
    title: "Resumo Executivo",
    desc: "Crie um resumo conciso e impactante",
    icon: <BarChart3 className="h-5 w-5 text-blue-500" />,
    prompt: "Preciso de um resumo executivo profissional sobre",
  },
  {
    id: "comunicado-imprensa",
    title: "Comunicado de Imprensa",
    desc: "Divulgue notícias importantes",
    icon: <Megaphone className="h-5 w-5 text-green-500" />,
    prompt: "Crie um comunicado de imprensa profissional sobre",
  },
  {
    id: "artigo-suporte",
    title: "Artigo de Suporte",
    desc: "Oriente seus usuários",
    icon: <FileText className="h-5 w-5 text-purple-500" />,
    prompt: "Escreva um artigo de suporte completo sobre",
  },
  {
    id: "faqs",
    title: "Perguntas Frequentes",
    desc: "Respostas rápidas",
    icon: <HelpCircle className="h-5 w-5 text-orange-500" />,
    prompt: "Crie uma seção de perguntas frequentes (FAQ) sobre",
  },
  {
    id: "resumo",
    title: "Resumo",
    desc: "Sintetize conteúdo",
    icon: <FileIcon className="h-5 w-5 text-indigo-500" />,
    prompt: "Faça um resumo detalhado e organizado sobre",
  },
]

export default function TemplatesRow() {
  const router = useRouter()
  const rowRef = useRef<HTMLDivElement | null>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = () => {
    const el = rowRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    update()
    const onScroll = () => update()
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => update()
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const go = (dir: 'l'|'r') => {
    const el = rowRef.current
    if (!el) return
    const delta = dir === 'l' ? -320 : 320
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const openTemplate = (prompt: string) => {
    const encoded = encodeURIComponent(prompt)
    router.push(`/dashboard/chat?prompt=${encoded}`)
  }

  return (
    <div className="relative" data-templates-row>
      {/* gradient overlays */}
      <div className={`pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10 ${canLeft ? '' : 'opacity-0'}`}></div>
      <div className={`pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10 ${canRight ? '' : 'opacity-0'}`}></div>

      {/* arrows */}
      <Button type="button" size="icon" variant="outline"
        onClick={() => go('l')}
        className={`absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-20 ${canLeft ? '' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll left">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button type="button" size="icon" variant="outline"
        onClick={() => go('r')}
        className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full z-20 ${canRight ? '' : 'opacity-0 pointer-events-none'}`}
        aria-label="Scroll right">
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* row */}
      <div ref={rowRef} className="flex flex-nowrap gap-2 overflow-x-auto hide-scrollbar pr-1 w-full">
        {items.map((it) => (
          <Card key={it.id} className="min-w-[150px] sm:min-w-[170px] shrink-0 cursor-pointer border border-border bg-card hover:bg-accent/5 hover:shadow-md transition-all duration-200 rounded-2xl"
            onClick={() => openTemplate(it.prompt)}>
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-1.5 rounded-lg bg-muted">{it.icon}</div>
                <div className="space-y-1">
                  <h4 className="font-medium text-xs leading-tight truncate max-w-[140px] text-foreground">{it.title}</h4>
                  <p className="text-[11px] leading-snug text-muted-foreground truncate max-w-[140px]">{it.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

