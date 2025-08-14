"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CreditPackageButtonProps {
  packageId: string
}

export function CreditPackageButton({ packageId }: CreditPackageButtonProps) {
  const router = useRouter()
  
  const handleClick = () => {
    console.log('Clicking package:', packageId)
    router.push(`/dashboard/credits/purchase/${packageId}`)
  }
  
  return (
    <Button 
      className="w-full bg-white text-black hover:bg-gray-100 font-medium py-3"
      onClick={handleClick}
    >
      Comprar
    </Button>
  )
}