"use client"

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Coins, Star, Crown } from 'lucide-react'
import { useState } from 'react'

interface CreditPackageCardProps {
  pkg: {
    id: string
    name?: string
    credits: number
    price: number
    originalPrice?: number | null
    discount?: string | null
    iconKey?: 'coins' | 'star' | 'crown'
    color?: string
    borderColor?: string
    features?: string[]
    popular?: boolean
  }
}

export function CreditPackageCardClient({ pkg }: CreditPackageCardProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  // Map safe string keys to actual icon components inside the Client Component
  const iconMap = {
    coins: Coins,
    star: Star,
    crown: Crown,
  } as const
  const Icon = pkg.iconKey ? iconMap[pkg.iconKey] : undefined
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    console.log('Card clicked for package:', pkg.id)
    console.log('Package details:', { id: pkg.id, name: pkg.name, credits: pkg.credits })
    setIsNavigating(true)
    
    // Navegação direta via window.location
    const targetUrl = `/dashboard/credits/purchase/${pkg.id}`
    console.log('Navigating to:', targetUrl)
    window.location.href = targetUrl
  }
  
  return (
    <Card 
      key={pkg.id}
      className="relative bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-200"
      id={pkg.id}
    >
      {/* Discount Badge */}
      {pkg.discount && (
        <div className="absolute -top-3 -right-3 z-10">
          <Badge className="bg-red-600 text-white px-3 py-1 text-sm">
            {pkg.discount}
          </Badge>
        </div>
      )}

      <CardHeader className="text-center space-y-4 pb-4">
        {Icon ? (
          <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Icon className="h-6 w-6 text-white" />
          </div>
        ) : null}
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {pkg.credits.toLocaleString('pt-BR')} créditos
          </h3>
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white">
              R$ {(Number(pkg.price) || 0).toFixed(2).replace('.', ',')}
            </div>
            {pkg.originalPrice && (
              <div className="text-sm text-gray-400 line-through">
                R$ {pkg.originalPrice.toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {pkg.features ? (
          <>
            <div className="text-sm text-gray-300">
              Com {pkg.credits.toLocaleString('pt-BR')} créditos você pode:
            </div>
            <div className="space-y-3">
              {pkg.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <Button 
          className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3"
          onClick={handleClick}
          disabled={isNavigating}
        >
          {isNavigating ? 'Carregando...' : 'Comprar'}
        </Button>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-2">
          ID: {pkg.id}
        </div>
      </CardContent>
    </Card>
  )
}