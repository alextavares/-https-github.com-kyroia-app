"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type SimpleConversation = { id: string; title: string }

export default function HistoryPage() {
  const [recent, setRecent] = useState<SimpleConversation[]>([])

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/conversations')
        if (r.ok) {
          const j = await r.json()
          const arr = Array.isArray(j) ? j : (j?.conversations || [])
          setRecent(arr.slice(0, 5).map((c: any) => ({ id: c.id, title: c.title || 'Sem título' })))
        }
      } catch {}
    })()
  }, [])

  return (
    <div className="max-w-[48rem] mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Histórico</h1>
        <p className="text-sm text-muted-foreground">Acompanhe suas últimas conversas e continue no chat.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem conversas recentes.</p>
        ) : (
          <ul className="text-sm list-disc pl-5 space-y-1">
            {recent.map((c) => (
              <li key={c.id} className="truncate">{c.title}</li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Button asChild size="sm" className="h-9 rounded-md">
            <Link href="/dashboard/chat">Abrir Chat</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

