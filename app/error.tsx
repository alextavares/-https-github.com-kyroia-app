"use client"

import { useEffect } from "react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App Error:", error)
  }, [error])

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-xl font-semibold">Ocorreu um erro</h2>
      <p className="text-sm text-muted-foreground">Tente recarregar ou voltar para o dashboard.</p>
      <div className="flex gap-3">
        <button className="px-3 py-2 rounded-md border" onClick={() => reset()}>Tentar novamente</button>
        <a className="px-3 py-2 rounded-md border" href="/dashboard">Ir ao Dashboard</a>
      </div>
    </div>
  )
}

