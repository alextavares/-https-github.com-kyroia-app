"use client";
import React, { useEffect, useState } from "react";
export default function CardForm({ packageId, amount }) {
    const [mpReady, setMpReady] = useState(false);
    const [message, setMessage] = useState(null);
    const [brickInstance, setBrickInstance] = useState(null);
    useEffect(() => {
        const existing = document.querySelector('script[src*="mercadopago"]');
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
        if (!mpReady || !window.MercadoPago)
            return;
        const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
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
                    onReady: () => { },
                    onError: (error) => {
                        setMessage({ type: "error", text: (error === null || error === void 0 ? void 0 : error.message) || "Erro no componente de cartão." });
                    },
                    onSubmit: async ({ token, installments, payer }) => {
                        try {
                            const res = await fetch("/api/payments/mp/checkout/card", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    packageId,
                                    cardToken: token,
                                    installments,
                                    payer: (payer === null || payer === void 0 ? void 0 : payer.email) ? { email: payer.email } : undefined,
                                }),
                            });
                            if (!res.ok) {
                                const t = await res.text();
                                throw new Error(t || "Falha no pagamento");
                            }
                            setMessage({ type: "success", text: "Pagamento iniciado. Acompanhe o status." });
                        }
                        catch (e) {
                            setMessage({ type: "error", text: (e === null || e === void 0 ? void 0 : e.message) || "Erro ao processar pagamento." });
                        }
                    },
                },
            })
                .then((inst) => setBrickInstance(inst))
                .catch((e) => setMessage({ type: "error", text: (e === null || e === void 0 ? void 0 : e.message) || "Erro ao iniciar componente." }));
            return () => {
                var _a;
                try {
                    (_a = brickInstance === null || brickInstance === void 0 ? void 0 : brickInstance.unmount) === null || _a === void 0 ? void 0 : _a.call(brickInstance);
                }
                catch (_b) { }
            };
        }
        catch (e) {
            setMessage({ type: "error", text: (e === null || e === void 0 ? void 0 : e.message) || "Erro ao inicializar Mercado Pago." });
        }
    }, [mpReady, amount]);
    return (<div className="max-w-md w-full">
      {!mpReady && <p className="text-sm text-gray-500">Carregando SDK do Mercado Pago...</p>}
      <div id="mp-card-brick"/>
        {message && (<div className={`mt-3 text-sm px-3 py-2 rounded ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {message.text}
          </div>)}
    </div>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FyZEZvcm0uanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2FyZEZvcm0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQztBQUViLE9BQU8sS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVVuRCxNQUFNLENBQUMsT0FBTyxVQUFVLFFBQVEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQVM7SUFDM0QsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsR0FBRyxRQUFRLENBQXFELElBQUksQ0FBQyxDQUFDO0lBQ2pHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxRQUFRLENBQU0sSUFBSSxDQUFDLENBQUM7SUFFOUQsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNiLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQTZCLENBQUM7UUFDbEcsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDakcsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBTztRQUNULENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sQ0FBQyxHQUFHLEdBQUcsbUNBQW1DLENBQUM7UUFDakQsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDdkIsTUFBTSxDQUFDLE9BQU8sR0FB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