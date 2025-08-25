"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TemplatesPage() {
  return (
    <div className="max-w-[48rem] mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Templates</h1>
        <p className="text-sm text-muted-foreground">Use ou salve templates a partir do chat.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Para uma experiência mais simples, centralizamos o uso de templates no fluxo do chat. Selecione um template recente ou salve um novo diretamente na conversa.</p>
        <div className="mt-3">
          <Button asChild size="sm" className="h-9 rounded-md">
            <Link href="/dashboard/chat">Ir para o Chat</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

