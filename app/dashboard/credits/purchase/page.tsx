import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
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
    iconKey: 'coins',
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
    iconKey: 'star',
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
    iconKey: 'crown',
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
    <div className="min-h-screen bg-background text-foreground">
      <AnchorHighlighter />
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h1 className="text-xl font-semibold">Adicionar Créditos</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm max-w-3xl mx-auto">
            Créditos adicionais nunca expiram e podem ser usados enquanto você tem uma assinatura ativa.
          </p>
        </div>

        {/* Credit Packages */}
        <div className="grid gap-3 md:grid-cols-3 mb-10">
          {(dbPackages.length > 0 ? dbPackages : fallbackCreditPackages).map((pkg: any) => (
            <CreditPackageCardClient key={pkg.id} pkg={pkg} />
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-2 bg-accent/20 border border-border/60 rounded-md px-3 py-1.5">
              <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent">PIX</span>
              </div>
              <span className="text-foreground text-sm">PIX</span>
            </div>
            <div className="flex items-center gap-2 bg-background/60 border border-border/60 rounded-md px-3 py-1.5">
              <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">M</span>
              </div>
              <span className="text-muted-foreground text-sm">Mastercard</span>
            </div>
            <div className="flex items-center gap-2 bg-background/60 border border-border/60 rounded-md px-3 py-1.5">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">V</span>
              </div>
              <span className="text-muted-foreground text-sm">Visa</span>
            </div>
            <div className="bg-background/60 border border-border/60 rounded-md px-3 py-1.5">
              <span className="text-muted-foreground text-sm">e outros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
