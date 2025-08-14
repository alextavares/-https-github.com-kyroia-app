import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Coins, Star, Crown, X } from 'lucide-react'
import Link from 'next/link'
import { CreditService } from '@/lib/credit-service'
import { prisma } from '@/lib/prisma'
import { AnchorHighlighter } from '@/components/dashboard/anchor-highlighter'
import { CreditPackageCardClient } from '@/components/dashboard/credit-package-card-client'

const fallbackCreditPackages = [
  {
    id: 'basic',
    credits: 5000,
    price: 59.00,
    originalPrice: null,
    discount: null,
    icon: Coins,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    features: [
      '56 imagens com Flux Pro ou 37 imagens com GPT Images',
      '30 minutos de modo de voz da IA',
      '32 mil caracteres no recurso de áudio sintético',
      '14 vídeos com Haiper'
    ]
  },
  {
    id: 'popular',
    credits: 10000,
    price: 99.00,
    originalPrice: 116.47,
    discount: '15% off',
    icon: Star,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    popular: true,
    features: [
      '112 imagens com Flux Pro ou 74 imagens com GPT Images',
      '60 minutos de modo de voz da IA',
      '64 mil caracteres no recurso de áudio sintético',
      '28 vídeos com Haiper'
    ]
  },
  {
    id: 'premium',
    credits: 20000,
    price: 159.00,
    originalPrice: 227.06,
    discount: '30% off',
    icon: Crown,
    color: 'from-amber-500 to-amber-600',
    borderColor: 'border-amber-500/30',
    features: [
      '224 imagens com Flux Pro ou 148 imagens com GPT Images',
      '120 minutos de modo de voz da IA',
      '128 mil caracteres no recurso de áudio sintético',
      '56 vídeos com Haiper'
    ]
  }
]

export default async function PurchaseCreditsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  let creditBalance = 0
  try {
    creditBalance = await CreditService.getBalance(session.user.id)
  } catch (error) {
    console.error('Error fetching credit balance:', error)
  }

  // Load dynamic packages from DB; fallback to static if none
  let dbPackages: Array<{ id: string; name: string; credits: number; price: number; currency: string | null }> = []
  try {
    const rows = await prisma.creditPackage.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, credits: true, price: true, currency: true }
    })
    dbPackages = rows.map(r => ({ id: r.id, name: r.name, credits: r.credits, price: r.price, currency: r.currency }))
  } catch (e) {
    // ignore and use fallback
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <AnchorHighlighter />
      {/* Header with close button */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">Adicionar Créditos</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Description */}
        <div className="text-center mb-12">
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Créditos adicionais nunca expiram e podem ser usados enquanto você tem uma assinatura ativa.
          </p>
        </div>

        {/* Credit Packages */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {(dbPackages.length > 0 ? dbPackages : fallbackCreditPackages).map((pkg: any) => (
            <CreditPackageCardClient key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center space-y-6">
          <div className="flex justify-center items-center gap-6">
            <div className="flex items-center gap-2 bg-teal-600 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-xs font-bold text-teal-600">PIX</span>
              </div>
              <span className="text-white font-medium">PIX</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">M</span>
              </div>
              <span className="text-gray-300">Mastercard</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-white">V</span>
              </div>
              <span className="text-gray-300">Visa</span>
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-gray-300">e outros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}