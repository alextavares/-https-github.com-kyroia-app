/**
 * Onboarding removido.
 * Esta página agora apenas redireciona para /dashboard.
 */
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OnboardingRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  return null
}