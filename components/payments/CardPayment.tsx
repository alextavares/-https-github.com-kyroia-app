"use client";

import { useState } from "react";

type Props = {
  packageId: string;
};

type CardRequestBody = {
  packageId: string;
  amount: number;
  cardToken: string;
  installments: number;
};

type CardResponse = {
  method: "card";
  externalReference: string;
  mpPaymentId: string | null;
  status: "PENDING";
  cardLast4: string | null;
};

export default function CardPayment({ packageId }: Props) {
  const [cardToken, setCardToken] = useState("");
  const [installments, setInstallments] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CardResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/payments/mp/checkout/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          amount: 0, // será calculado no backend
          cardToken,
          installments,
        } as CardRequestBody),
        cache: "no-store",
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Erro ao processar pagamento.");
      }

      const data: CardResponse = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  if (response) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-green-700">Pagamento enviado com sucesso!</p>
        <p className="text-xs text-gray-500">
          Referência: <strong>{response.externalReference}</strong>
        </p>
        {response.cardLast4 && (
          <p className="text-xs text-gray-500">
            Cartão final: **** {response.cardLast4}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Token do Cartão (tokenizado pelo Mercado Pago)
        </label>
        <input
          type="text"
          required
          value={cardToken}
          onChange={(e) => setCardToken(e.target.value)}
          placeholder="tok_visa_1234..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Parcelas</label>
        <select
          value={installments}
          onChange={(e) => setInstallments(Number(e.target.value))}
          className="w-full border rounded px-3 py-2 text-sm"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <option key={n} value={n}>
              {n}x
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Processando..." : "Pagar com Cartão"}
      </button>
    </form>
  );
}