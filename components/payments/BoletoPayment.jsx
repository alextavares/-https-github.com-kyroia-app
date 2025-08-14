"use client";
import { useEffect, useState } from "react";
export default function BoletoPayment({ packageId }) {
    const [boletoData, setBoletoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Erro desconhecido.");
            }
            finally {
                setLoading(false);
            }
        }
        fetchBoleto();
    }, [packageId]);
    if (loading)
        return <p className="text-sm text-gray-500">Gerando boleto...</p>;
    if (error)
        return <p className="text-sm text-red-600">{error}</p>;
    if (!boletoData)
        return <p className="text-sm text-gray-500">Nenhum dado de boleto retornado.</p>;
    return (<div className="space-y-4">
      <p className="text-sm text-gray-700">
        Utilize o código de barras ou o link abaixo para pagar o boleto.
      </p>

      <div>
        <label className="block text-sm font-medium mb-1">Código de Barras</label>
        <input type="text" readOnly value={boletoData.barcode} className="w-full border rounded px-3 py-2 text-sm font-mono bg-gray-50" onClick={(e) => e.currentTarget.select()}/>
        <button type="button" onClick={() => navigator.clipboard.writeText(boletoData.barcode)} className="mt-2 text-sm text-blue-600 hover:underline">
          Copiar código
        </button>
      </div>

      <div>
        <a href={boletoData.url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Abrir boleto
        </a>
      </div>

      <p className="text-xs text-gray-500">
        Após o pagamento, você será redirecionado automaticamente ou poderá verificar o status
        com a referência: <strong>{boletoData.externalReference}</strong>
      </p>
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQm9sZXRvUGF5bWVudC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJCb2xldG9QYXltZW50LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7QUFFYixPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVk1QyxNQUFNLENBQUMsT0FBTyxVQUFVLGFBQWEsQ0FBQyxFQUFFLFNBQVMsRUFBUztJQUN4RCxNQUFNLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxHQUFHLFFBQVEsQ0FBb0IsSUFBSSxDQUFDLENBQUM7SUFDdEUsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDN0MsTUFBTSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsR0FBRyxRQUFRLENBQWdCLElBQUksQ0FBQyxDQUFDO0lBRXhELFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixLQUFLLFVBQVUsV0FBVztZQUN4QixJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsa0NBQWtDLEVBQUU7b0JBQzFELE1BQU0sRUFBRSxNQUFNO29CQUNkLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRTtvQkFDL0MsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQztvQkFDbkMsS0FBSyxFQUFFLFVBQVU7aUJBQ2xCLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNaLE1BQU0sT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSx1QkFBdUIsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDO2dCQUNELE1BQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksRUFB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