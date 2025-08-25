"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  modelUsed: string
  isPinned?: boolean
  isFavorite?: boolean
  messagesCount?: number
}

interface ConversationHistoryProps {
  currentConversationId?: string
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
}

export default function ConversationHistory({
  currentConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/conversations")
      if (response.ok) {
        const data = await response.json()
        const conversationsArray = Array.isArray(data) ? data : (data.conversations || [])
        setConversations(
          conversationsArray.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messagesCount: conv.messagesCount,
          }))
        )
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const groupConversationsByDate = (convs: Conversation[]) => {
    const groups: { [key: string]: Conversation[] } = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    convs.forEach((conv) => {
      let key: string
      const convDate = conv.createdAt
      if (convDate.toDateString() === today.toDateString()) key = "Hoje"
      else if (convDate.toDateString() === yesterday.toDateString()) key = "Ontem"
      else if (convDate > lastWeek) key = "Últimos 7 dias"
      else key = "Mais antigos"

      if (!groups[key]) groups[key] = []
      groups[key].push(conv)
    })
    return groups
  }

  const groupedConversations = groupConversationsByDate(conversations)

  const handleNewConversation = async () => {
    try {
      const savedPlan = localStorage.getItem("lastPlanType") || "FREE"
      const byPlan = localStorage.getItem(`selectedModel:${savedPlan}`)
      const globalSelected = localStorage.getItem("selectedModel")
      const modelUsed = (byPlan || globalSelected || "gpt-4o-mini") as string
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Conversa", modelUsed }),
      })
      if (!res.ok) throw new Error("failed")
      const created = await res.json()
      setConversations((prev) => [
        {
          id: created.id,
          title: created.title,
          createdAt: new Date(created.createdAt),
          updatedAt: new Date(created.updatedAt),
          modelUsed: created.modelUsed,
          isPinned: created.isPinned,
          isFavorite: created.isFavorite,
          messagesCount: 0,
        },
        ...prev,
      ])
      onSelectConversation(created.id)
    } catch {
      onNewConversation()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header minimalista da sidebar */}
      <div className="p-3 border-b border-border/50">
        <Button
          onClick={handleNewConversation}
          className="w-full justify-start h-9"
          variant="outline"
          aria-label="Nova conversa"
        >
          + Nova Conversa
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="text-center text-muted-foreground">Carregando conversas...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-muted-foreground">Nenhuma conversa</div>
          ) : (
            Object.entries(groupedConversations).map(([dateGroup, convs]) => (
              <div key={dateGroup}>
                <h3 className="text-xs font-medium text-muted-foreground mb-2">{dateGroup}</h3>
                <div className="space-y-1.5">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-2.5 rounded-lg cursor-pointer transition-colors border ${
                        currentConversationId === conv.id
                          ? "bg-black/40 border-border/60"
                          : "border-transparent hover:bg-black/20"
                      }`}
                      onClick={() => onSelectConversation(conv.id)}
                    >
                      <p className="text-sm font-medium line-clamp-1">{conv.title}</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">{conv.modelUsed}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}