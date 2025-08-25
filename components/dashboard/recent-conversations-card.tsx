import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type RecentConversation = {
  id: string
  title: string | null
  updatedAt: Date
  messageCount: number
}

export function RecentConversationsCard({ conversations }: { conversations: RecentConversation[] }) {
  return (
    <Card className="border border-border bg-card rounded-lg shadow-none">
      <CardHeader className="pb-1.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Conversas recentes</CardTitle>
          <Link href="/dashboard/history" className="text-xs text-muted-foreground hover:text-foreground">Ver todas</Link>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        {conversations.length === 0 ? (
          <div className="text-sm text-muted-foreground p-1.5">Nenhuma conversa recente.</div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted/50">
                <div className="min-w-0">
                  <div className="truncate text-sm">{c.title || 'Sem título'}</div>
                  <div className="text-[11px] text-muted-foreground">{c.messageCount} mensagens</div>
                </div>
                <Link href={`/dashboard/chat?conversation=${encodeURIComponent(c.id)}`} className="text-xs text-muted-foreground hover:text-foreground">Abrir</Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
