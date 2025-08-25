import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Zap } from 'lucide-react'

export function QuickActionsCard() {
  const actions = [
    {
      href: '/dashboard/chat',
      icon: MessageSquare,
      label: 'Abrir Chat',
      description: 'Iniciar nova conversa',
      gradient: 'from-purple-500 to-purple-600'
    },
    // Itens de templates removidos conforme solicitado
  ]

  return (
    <Card className="relative overflow-hidden border border-border/50 bg-card shadow-none rounded-lg">
      {/* Background decorative element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-xl"></div>
      
      <CardHeader className="relative z-10 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <CardTitle className="text-base font-semibold text-foreground">
            Ações Rápidas
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 p-3 space-y-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Button 
              key={action.href}
              asChild 
              variant="ghost" 
              className="w-full h-auto p-3 justify-start hover:bg-background/80 border border-border/50 rounded-xl transition-all duration-200 hover:shadow-md group"
            >
              <Link href={action.href} className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-foreground">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Link>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
