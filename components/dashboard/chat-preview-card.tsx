import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export function ChatPreviewCard() {
  return (
    <Link href="/dashboard/chat" className="block group">
      <Card className="border border-border/60 bg-card rounded-lg shadow-none hover:border-primary/40 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Converse com a IA</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-muted-foreground text-sm">
                Digite sua mensagem...
              </div>
              <Button size="sm" className="h-8 px-3">Abrir chat</Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Clique para começar uma nova conversa.
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

