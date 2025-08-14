"use client";
import { useEffect, useState } from "react";
export default function PixPayment({ packageId }) {
    const [pixData, setPixData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Erro desconhecido.");
            }
            finally {
                setLoading(false);
            }
        }
        fetchPix();
    }, [packageId]);
    if (loading)
        return <p className="text-sm text-gray-500">Gerando QR Code PIX...</p>;
    if (error)
        return <p className="text-sm text-red-600">{error}</p>;
    if (!pixData)
        return <p className="text-sm text-gray-500">Nenhum dado PIX retornado.</p>;
    return (<div className="space-y-4">
      <p className="text-sm text-gray-700">
        Escaneie o QR Code ou copie o código abaixo para pagar via PIX.
      </p>

      <div className="flex justify-center">
        <img src={pixData.qrCode} alt="QR Code PIX" className="w-48 h-48 border border-gray-300 rounded"/>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Código PIX (Copia e Cola)</label>
        <textarea readOnly value={pixData.copiaECola} className="w-full h-24 border rounded px-3 py-2 text-sm font-mono bg-gray-50" onClick={(e) => e.currentTarget.select()}/>
        <button type="button" onClick={() => navigator.clipboard.writeText(pixData.copiaECola)} className="mt-2 text-sm text-blue-600 hover:underline">
          Copiar código
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Após o pagamento, você será redirecionado automaticamente ou poderá verificar o status
        com a referência: <strong>{pixData.externalReference}</strong>
      </p>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGl4UGF5bWVudC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQaXhQYXltZW50LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVk1QyxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBUztJQUNyRCxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBaUIsSUFBSSxDQUFDLENBQUM7SUFDN0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQWdCLElBQUksQ0FBQyxDQUFDO0lBRXhELFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixLQUFLLFVBQVUsUUFBUTtZQUNyQixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsK0JBQStCLEVBQUU7b0JBQ3ZELE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtvQkFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztvQkFDbkMsS0FBSyxFQUFFLFVBQVU7aUJBQ2xCLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO2dCQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFD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