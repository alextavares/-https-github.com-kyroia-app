"use client";

import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    MercadoPago?: any;
  }
}

type Props = { packageId: string; amount?: number };

export default function CardForm({ packageId, amount }: Props) {
  const [mpReady, setMpReady] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [brickInstance, setBrickInstance] = useState<any>(null);

  useEffect(() => {
    const existing = document.querySelector('script[src*="mercadopago"]') as HTMLScriptElement | null;
    const ensure = () => setMpReady(!!window.MercadoPago && !!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
    if (existing) {
      ensure();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = ensure;
    script.onerror = () => setMessage({ type: "error", text: "Falha ao carregar SDK do Mercado Pago." });
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mpReady || !window.MercadoPago) return;
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string | undefined;
    if (!publicKey) {
      setMessage({ type: "error", text: "Chave pública do Mercado Pago ausente (NEXT_PUBLIC_MP_PUBLIC_KEY)." });
      return;
    }
    try {
      const mp = new window.MercadoPago(publicKey, { locale: "pt-BR" });
      const bricksBuilder = mp.bricks();
      const initAmount = typeof amount === "number" && amount > 0 ? amount : undefined;
      bricksBuilder
        .create("cardPayment", "mp-card-brick", {
          initialization: {
            amount: initAmount, // recomendado
          },
          customization: {
            paymentMethods: {
              maxInstallments: 12,
            },
          },
          callbacks: {
            onReady: () => {},
            onError: (error: any) => {
              setMessage({ type: "error", text: error?.message || "Erro no componente de cartão." });
            },
            onSubmit: async ({ token, installments, payer }: any) => {
              try {
      const res = await fetch("/api/payments/mp/checkout/card", {
        method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    packageId,
                    cardToken: token,
                    installments,
                    payer: payer?.email ? { email: payer.email } : undefined,
                  }),
                });
      if (!res.ok) {
                  const t = await res.text();
                  throw new Error(t || "Falha no pagamento");
                }
                setMessage({ type: "success", text: "Pagamento iniciado. Acompanhe o status." });
              } catch (e: any) {
                setMessage({ type: "error", text: e?.message || "Erro ao processar pagamento." });
              }
            },
          },
        })
        .then((inst: any) => setBrickInstance(inst))
        .catch((e: any) => setMessage({ type: "error", text: e?.message || "Erro ao iniciar componente." }));

      return () => {
        try { brickInstance?.unmount?.() } catch {}
      };
    } catch (e: any) {
      setMessage({ type: "error", text: e?.message || "Erro ao inicializar Mercado Pago." });
    }
  }, [mpReady, amount]);

  return (
    <div className="max-w-md w-full">
      {!mpReady && <p className="text-sm text-gray-500">Carregando SDK do Mercado Pago...</p>}
      <div id="mp-card-brick" />
        {message && (
          <div
          className={`mt-3 text-sm px-3 py-2 rounded ${
              message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {message.text}
          </div>
        )}
    </div>
  );
}