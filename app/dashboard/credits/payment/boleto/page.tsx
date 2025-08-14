"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

function BoletoPaymentPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null)
  const [barcode, setBarcode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const run = async () => {
      const pkg = params.get('package')
      if (!pkg) return setError('Pacote inválido')
      setLoading(true)
      try {
        const r = await fetch('/api/payments/mp/checkout/boleto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg, amount: undefined }),
        })
        if (!r.ok) {
          const t = await r.text()
          throw new Error(t || 'Falha ao iniciar boleto')
        }
        const json = await r.json()
        setBoletoUrl(json.boletoUrl ?? null)
        setBarcode(json.boletoBarcode ?? null)
        toast({ title: 'Boleto gerado', description: 'Abra o boleto para pagar. A confirmação pode levar 1-3 dias úteis.' })
      } catch (e: any) {
        setError(e?.message || 'Erro ao iniciar boleto')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [params])

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle>Pagamento por Boleto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <div>Gerando boleto...</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {boletoUrl && (
            <Button className="w-full" asChild>
              <a href={boletoUrl} target="_blank" rel="noreferrer">Abrir boleto</a>
            </Button>
          )}
          {barcode && (
            <div className="text-xs text-gray-400 break-all">{barcode}</div>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/payment/pending')}
          >
            Ver status
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/guards";
import BoletoPayment from "@/components/payments/BoletoPayment";

export const dynamic = "force-dynamic";

export default async function BoletoPaymentPageServer(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // no-store via dynamic config (force-dynamic)

  await requireAuth();

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
        <h1 className="text-lg font-semibold mb-2">Pagamento via Boleto</h1>
        <p className="text-sm text-red-600">
          Parâmetro &quot;package&quot; ausente. Volte e selecione um pacote de créditos.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <h1 className="text-lg font-semibold mb-4">Pagamento via Boleto</h1>
      <BoletoPayment packageId={packageId} />
    </div>
  );
}