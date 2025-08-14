"use client";

import { useEffect, useState } from "react";

type Props = {
  packageId: string;
};

type BoletoData = {
  barcode: string;
  url: string;
  externalReference: string;
};

export default function BoletoPayment({ packageId }: Props) {
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBoleto() {
      try {
        const res = await fetch("/api/payments/mp/checkout/boleto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId }),
          cache: "no-store",
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Erro ao gerar boleto.");
        }
        const data = await res.json();
        setBoletoData({
          barcode: data.boletoBarcode,
          url: data.boletoUrl,
          externalReference: data.externalReference,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }
    fetchBoleto();
  }, [packageId]);

  if (loading) return <p className="text-sm text-gray-500">Gerando boleto...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!boletoData) return <p className="text-sm text-gray-500">Nenhum dado de boleto retornado.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        Utilize o código de barras ou o link abaixo para pagar o boleto.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Código de Barras</label>
        <input
          type="text"
          readOnly
          value={boletoData.barcode}
          className="w-full border rounded px-3 py-2 text-sm font-mono bg-gray-50"
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(boletoData.barcode)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Copiar código
        </button>
      </div>

      <div>
        <a
          href={boletoData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Abrir boleto
        </a>
      </div>

      <p className="text-xs text-gray-500">
        Após o pagamento, você será redirecionado automaticamente ou poderá verificar o status
        com a referência: <strong>{boletoData.externalReference}</strong>
      </p>
    </div>
  );
}