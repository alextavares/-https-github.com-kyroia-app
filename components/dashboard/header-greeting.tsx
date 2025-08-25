"use client"

import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Brain } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function HeaderGreeting({ name }: { name?: string | null }) {

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{getGreeting()}, {name || 'Usuário'}</h1>
          <p className="text-xs text-muted-foreground">Pronto para começar uma conversa.</p>
        </div>
      </div>
    </div>
  )
}
