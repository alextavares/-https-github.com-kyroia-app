"use client"

import { useRouter } from 'next/navigation'
import { ArrowRight, MessageSquare, Sparkles, Zap } from 'lucide-react'
import { ModelSelector } from './model-selector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function NewConversationCard() {
  const router = useRouter()

  const handleStartChat = () => {
    // A seleção do modelo já é salva no localStorage pelo ModelSelector,
    // então podemos simplesmente navegar para a página de chat.
    router.push('/dashboard/chat')
  }

  return (
    <Card className="border border-border bg-card rounded-lg shadow-none h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">Nova conversa</CardTitle>
        </div>
        <CardDescription className="text-xs">Selecione um modelo e comece a conversar.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between p-3">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Modelo de IA</div>
            <div className="rounded-md border border-border bg-background p-2.5">
              <ModelSelector />
            </div>
          </div>
        </div>

        <Button onClick={handleStartChat} size="sm" className="w-full mt-3 h-9 rounded-md">
          <MessageSquare className="mr-2 h-4 w-4" />
          Iniciar conversa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
