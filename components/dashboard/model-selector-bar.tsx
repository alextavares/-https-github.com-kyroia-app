"use client"

// Forçar a versão TSX do seletor para evitar colisão com o arquivo JSX legado
import { ModelSelector } from '@/components/dashboard/model-selector.tsx'

export function ModelSelectorBar() {
  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-2">
        <ModelSelector compact />
      </div>
    </div>
  )
}
