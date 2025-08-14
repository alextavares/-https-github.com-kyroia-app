"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const message = params.get("message");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Usa redirect:false para capturar erro/sucesso e evitar fallback para /auth/signin
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        // callbackUrl será tratado manualmente abaixo
      });

      if (res?.error) {
        alert(res.error || "Falha ao entrar. Verifique suas credenciais.");
        return;
      }
      // sucesso
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Falha ao entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ width: 360, maxWidth: "95vw" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Entrar</h1>
        {message === "account-created" && (
          <div style={{ background: "#e6ffed", border: "1px solid #b7eb8f", color: "#135200", padding: 8, borderRadius: 6, marginBottom: 12 }}>
            Conta criada com sucesso. Faça login abaixo.
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 14 }}>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 14 }}>Senha</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#111827",
              color: "white",
              padding: "10px 14px",
              borderRadius: 6,
              border: 0,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 6,
            }}
          >
            {loading ? "Entrando..." : "Entrar com email"}
          </button>
        </form>
      </div>
    </main>
  );
}