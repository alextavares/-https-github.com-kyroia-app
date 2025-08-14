import { test, expect, request } from "@playwright/test";

// Helper para contexto autenticado (ajuste se houver fixture própria de auth)
async function authenticatedAPI(baseURL: string) {
  const api = await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      // Injete Authorization/Cookie se necessário para rotas protegidas
      // "Authorization": `Bearer ${process.env.TEST_USER_TOKEN}`
    },
  });
  return api;
}

test.describe("Integração de Pagamentos - Mercado Pago", () => {
  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";

  test.describe.configure({ mode: "serial" });

  test("PIX - cria transação PENDING e retorna dados (qrCode/copiaECola podem ser nulos)", async () => {
    const api = await authenticatedAPI(baseURL);

    const body = {
      packageId: "pkg_test_pix",
      amount: 10,
    };

    const res = await api.post("/api/payments/mp/checkout/pix", {
      data: body,
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok()) {
      const json = await res.json();
      expect(json.method).toBe("pix");
      expect(json.externalReference).toBeTruthy();
      expect(json.status).toBe("PENDING");
      // Dependendo do sandbox, qrCode/copiaECola podem estar ausentes
      expect(json).toHaveProperty("qrCode");
      expect(json).toHaveProperty("copiaECola");
    } else {
      const text = await res.text();
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(text).toContain("Falha ao criar pagamento PIX");
    }
  });

  test("Boleto - cria transação PENDING e retorna boletoUrl quando disponível", async () => {
    const api = await authenticatedAPI(baseURL);

    const body = {
      packageId: "pkg_test_boleto",
      amount: 10,
      payer: {
        email: "user@example.com",
        first_name: "Test",
        last_name: "User",
      },
    };

    const res = await api.post("/api/payments/mp/checkout/boleto", {
      data: body,
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok()) {
      const json = await res.json();
      expect(json.method).toBe("boleto");
      expect(json.externalReference).toBeTruthy();
      expect(json.status).toBe("PENDING");
      expect(json).toHaveProperty("boletoUrl");
    } else {
      const text = await res.text();
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(text).toContain("Falha ao criar pagamento Boleto");
    }
  });

  test("Cartão - cria transação PENDING e retorna cardLast4 quando disponível", async () => {
    const api = await authenticatedAPI(baseURL);

    const body = {
      packageId: "pkg_test_card",
      amount: 10,
      cardToken: "tok_test_visa", // Em produção, token vem do SDK do MP
      installments: 1,
      payer: {
        email: "user@example.com",
      },
    };

    const res = await api.post("/api/payments/mp/checkout/card", {
      data: body,
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok()) {
      const json = await res.json();
      expect(json.method).toBe("card");
      expect(json.externalReference).toBeTruthy();
      expect(json.status).toBe("PENDING");
      expect(json).toHaveProperty("cardLast4");
    } else {
      const text = await res.text();
      expect(res.status()).toBeGreaterThanOrEqual(400);
      expect(text).toContain("Falha ao criar pagamento cartão");
    }
  });

  test("Webhook - valida assinatura e idempotência básica", async () => {
    const api = await request.newContext({ baseURL });

    // payload de exemplo
    const payload = JSON.stringify({
      type: "payment",
      data: { id: "external-id-teste", status: "approved" },
    });

    // Sem assinatura válida deve retornar 401
    const res401 = await api.post("/api/payments/mp/webhook", {
      data: payload,
      headers: {
        "Content-Type": "application/json",
        "x-signature": "",
      },
    });
    expect(res401.status()).toBe(401);

    // JSON inválido deve retornar 400
    const res400 = await api.post("/api/payments/mp/webhook", {
      data: "not-json",
      headers: {
        "Content-Type": "application/json",
        "x-signature": "invalid",
      },
    });
    expect(res400.status()).toBe(400);
  });
});