import { Card, CardContent } from '@/components/ui/card'

export function WelcomeHero({ name }: { name?: string | null }) {
  return (
    <Card className="relative overflow-hidden border border-border/60 bg-gradient-to-br from-purple-600/15 via-purple-500/10 to-blue-500/10">
      <CardContent className="p-5 md:p-6">
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold">
            {name ? `Olá, ${name}` : 'Bem-vindo(a)'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um modelo e comece uma nova conversa ou retome onde parou.
          </p>
          <div className="mt-4">
            <a
              href="/dashboard/chat"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
            >
              Abrir Chat
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      </CardContent>
    </Card>
  )
}

