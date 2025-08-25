"use client"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
          <h2 className="text-xl font-semibold">Erro inesperado</h2>
          <p className="text-sm text-muted-foreground">Algo deu errado ao renderizar o app.</p>
          <div className="flex gap-3">
            <button className="px-3 py-2 rounded-md border" onClick={() => reset()}>Tentar novamente</button>
            <a className="px-3 py-2 rounded-md border" href="/dashboard">Ir ao Dashboard</a>
          </div>
          <pre className="text-xs opacity-70 whitespace-pre-wrap max-w-[80ch]">{String(error?.message || "")}</pre>
        </div>
      </body>
    </html>
  )
}

