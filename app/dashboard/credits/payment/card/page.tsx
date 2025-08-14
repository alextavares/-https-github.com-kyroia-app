"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function CardPaymentPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [last4, setLast4] = useState<string | null>(null)
  const { toast } = useToast()

  const pay = async () => {
    const pkg = params.get('package')
    if (!pkg) return setError('Pacote inválido')
    setLoading(true)
    try {
      // Em produção: coletar token do cartão no frontend do MP.
      // Aqui usamos um token mock para fluxo simplificado.
      const r = await fetch('/api/payments/mp/checkout/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg, amount: undefined, cardToken: 'TEST-1234567890' }),
      })
      if (!r.ok) {
        const t = await r.text()
        throw new Error(t || 'Falha ao iniciar cartão')
      }
      const json = await r.json()
      setLast4(json.cardLast4 ?? null)
      toast({ title: 'Pagamento iniciado', description: `Cartão final ${json.cardLast4 ?? '****'}` })
      router.push('/payment/pending')
    } catch (e: any) {
      setError(e?.message || 'Erro ao iniciar pagamento cartão')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    pay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Pagamento com Cartão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div>Processando...</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {last4 && (
            <div className="text-xs text-gray-400">Cartão final {last4}</div>
          )}
          {!loading && !error && !last4 && (
            <Button className="w-full" onClick={pay}>Tentar novamente</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/guards";
import CardForm from "@/components/payments/CardForm";

export const dynamic = "force-dynamic";

export default async function CardPaymentPageServer(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // no-store via dynamic config (force-dynamic)

  const session = await requireAuth(); // garante usuário autenticado

  const sp = await props.searchParams;
  const packageIdParam = sp?.package;
  const packageId =
    typeof packageIdParam === "string"
      ? packageIdParam
      : Array.isArray(packageIdParam)
      ? packageIdParam[0]
      : undefined;

  if (!packageId) {
    return (
      <div className="max-w-md w-full">
        <h1 className="text-lg font-semibold mb-2">Pagamento com Cartão</h1>
        <p className="text-sm text-red-600">
          Parâmetro &quot;package&quot; ausente. Volte e selecione um pacote de créditos.
        </p>
      </div>
    );
  }

  // Renderiza apenas o formulário cliente, passando o packageId
  return (
    <div className="max-w-md w-full">
      <h1 className="text-lg font-semibold mb-4">Pagamento com Cartão</h1>
      <CardForm packageId={packageId} />
      {/* Exibir apenas userId (guards.ts retorna { ok: true; userId: string } no caso mais estrito) */}
      <p className="text-xs text-gray-500 mt-3">Usuário ID: {("userId" in session ? session.userId : "autenticado")}</p>
    </div>
  );
}