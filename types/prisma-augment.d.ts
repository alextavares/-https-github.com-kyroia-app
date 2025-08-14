// Augmenta PrismaClient para incluir alias de compatibilidade
import '@prisma/client'

declare module '@prisma/client' {
  interface PrismaClient {
    // Alias: em versões anteriores do schema havia PaymentTransaction
    // Mapeamos para o delegate atual `payment`
    // Isso permite que usos existentes de prisma.paymentTransaction
    // passem na checagem de tipos.
    paymentTransaction: PrismaClient['payment']
  }
}

