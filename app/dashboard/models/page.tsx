"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ModelsPage() {
  return (
    <div className="max-w-[48rem] mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Modelos</h1>
        <p className="text-sm text-muted-foreground">Selecione o modelo diretamente no chat.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">A seleção de modelos foi simplificada. Use o seletor no topo do chat para alternar entre modelos rápidos e avançados.</p>
        <div className="mt-3">
          <Button asChild size="sm" className="h-9 rounded-md">
            <Link href="/dashboard/chat">Ir para o Chat</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

