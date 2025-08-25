"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookText, PlusCircle, LogIn } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type TemplateLite = {
  id: string
  name: string
  description?: string | null
  templateContent: string
}

export function RecentTemplatesCard() {
  const [templates, setTemplates] = useState<TemplateLite[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true)
        // Busca apenas os templates do usuário, ordenados pelos mais recentes
        const response = await fetch('/api/templates?mine=1&orderBy=updatedAt&orderDirection=desc&limit=3', { cache: 'no-store' })
        if (response.status === 401) {
          setUnauthorized(true)
          setTemplates([])
          return
        }
        if (response.ok) {
          const data = await response.json()
          const list = Array.isArray(data) ? data : (Array.isArray(data?.templates) ? data.templates : [])
          setTemplates(list as any)
        }
      } catch (error) {
        console.error('Failed to fetch recent templates:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTemplates()
  }, [])

  const handlePrefillChat = (content: string) => {
    // Dispara um evento customizado para pré-preencher o chat em uma nova aba
    localStorage.setItem('kyroia:prefill', content)
    window.open('/dashboard/chat', '_blank')
  }

  return (
    <Card className="border border-border/60 bg-card rounded-2xl shadow-soft">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Templates Recentes</CardTitle>
          <Link href="/dashboard/templates?mine=1" className="text-xs text-muted-foreground hover:text-foreground">
            Ver todos
          </Link>
        </div>
        <CardDescription className="text-xs">
          Seus templates mais recentes para acesso rápido.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : unauthorized ? (
          <div className="text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-lg p-4">
            <p>Faça login para ver seus templates recentes.</p>
            <Button asChild size="sm" className="mt-2 h-8">
              <Link href="/auth/signin"><LogIn className="mr-2 h-3.5 w-3.5" /> Entrar</Link>
            </Button>
          </div>
        ) : templates.length > 0 ? (
          <ul className="space-y-2">
            {templates.map(template => (
              <li key={template.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-9 px-3 rounded-lg"
                  onClick={() => handlePrefillChat((template as any).templateContent || (template as any).content || '')}
                >
                  <BookText className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="flex-grow truncate text-sm">{template.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-xs text-muted-foreground border-2 border-dashed border-border/60 rounded-lg p-4">
            <p>Nenhum template encontrado.</p>
            <Button variant="link" asChild className="mt-2 text-sm">
              <Link href="/dashboard/templates?scope=MINE&action=new">
                <PlusCircle className="mr-2 h-3.5 w-3.5" />
                Criar novo template
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
