"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { SocialLoginButtons } from "@/components/auth/social-login-buttons"
import { useState } from "react"
import { signIn } from "next-auth/react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError("Credenciais inválidas. Verifique seu email e senha.")
        return
      }
      window.location.href = "/dashboard"
    } catch (err) {
      setError("Falha ao entrar. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">IA</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Entrar no Kyroia</CardTitle>
          <CardDescription className="text-center">
            Faça login usando sua conta Google/Apple ou email e senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OAuth Providers - apenas Google e Apple */}
          <SocialLoginButtons />

          <div className="relative my-2 text-center text-xs text-muted-foreground">
            <span>ou</span>
          </div>

          <form onSubmit={handleEmailLogin} className="grid gap-3">
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary text-primary-foreground py-2 text-sm disabled:opacity-50"
            >
              {isSubmitting ? "Entrando..." : "Entrar com email"}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}