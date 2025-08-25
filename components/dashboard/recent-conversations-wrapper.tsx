"use client"

import { useEffect, useState } from 'react'
import { RecentConversationsCard, type RecentConversation } from '@/components/dashboard/recent-conversations-card'

export function RecentConversationsWrapper() {
  const [items, setItems] = useState<RecentConversation[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/conversations?limit=5', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : Array.isArray((data as any)?.conversations) ? (data as any).conversations : []
        const mapped: RecentConversation[] = list.slice(0,5).map((c: any) => ({
          id: String(c.id),
          title: (c.title ?? '') as string,
          updatedAt: new Date(c.updatedAt ?? Date.now()),
          messageCount: Number(c._count?.messages ?? c.messageCount ?? 0),
        }))
        if (!cancelled) setItems(mapped)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [])

  return <RecentConversationsCard conversations={items} />
}

