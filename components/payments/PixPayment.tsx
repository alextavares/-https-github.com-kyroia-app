"use client";

import { useEffect, useState } from "react";

type Props = {
  packageId: string;
};

type PixData = {
  qrCode: string;
  copiaECola: string;
  externalReference: string;
};

export default function PixPayment({ packageId }: Props) {
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPix() {
      try {
        const res = await fetch("/api/payments/mp/checkout/pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageId }),
          cache: "no-store",
        });
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Erro ao gerar PIX.");
        }
        const data = await res.json();
        setPixData({
          qrCode: data.qrCode,
          copiaECola: data.copiaECola,
          externalReference: data.externalReference,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }
    fetchPix();
  }, [packageId]);

  if (loading) return <p className="text-sm text-gray-500">Gerando QR Code PIX...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!pixData) return <p className="text-sm text-gray-500">Nenhum dado PIX retornado.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        Escaneie o QR Code ou copie o código abaixo para pagar via PIX.
      </p>

      <div className="flex justify-center">
        <img
          src={pixData.qrCode}
          alt="QR Code PIX"
          className="w-48 h-48 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Código PIX (Copia e Cola)</label>
        <textarea
          readOnly
          value={pixData.copiaECola}
          className="w-full h-24 border rounded px-3 py-2 text-sm font-mono bg-gray-50"
          onClick={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(pixData.copiaECola)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Copiar código
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Após o pagamento, você será redirecionado automaticamente ou poderá verificar o status
        com a referência: <strong>{pixData.externalReference}</strong>
      </p>
    </div>
  );
}