"use client"

import { useEffect, useMemo, useState } from "react"
import { getProviders, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

interface SocialLoginButtonsProps {
  className?: string
  callbackUrl?: string
}

export function SocialLoginButtons({ 
  className,
  callbackUrl = "/dashboard" 
}: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    getProviders()
      .then((prov) => setAvailableProviders(prov ?? {}))
      .catch(() => setAvailableProviders({}))
  }, [])

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  const socialProviders = [
    {
      id: "google",
      name: "Google",
      icon: Icons.google,
      className: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
    },
    {
      id: "apple",
      name: "Apple",
      icon: Icons.apple,
      className: "bg-black hover:bg-gray-900 text-white"
    }
  ]

  const providersToRender = useMemo(() => {
    if (!availableProviders) return [] as typeof socialProviders
    return socialProviders.filter(p => !!availableProviders[p.id])
  }, [availableProviders])

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {providersToRender.map((provider) => {
        const Icon = provider.icon
        return (
          <Button
            key={provider.id}
            variant="outline"
            className={cn(
              "relative w-full",
              provider.className
            )}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading !== null}
          >
            {isLoading === provider.id ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icon className="mr-2 h-4 w-4" />
            )}
            Continuar com {provider.name}
          </Button>
        )
      })}
      {availableProviders && providersToRender.length === 0 && (
        <div className="col-span-2 text-center text-sm text-muted-foreground">
          Login social não configurado. Use login por email.
        </div>
      )}
    </div>
  )
}