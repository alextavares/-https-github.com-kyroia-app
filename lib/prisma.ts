import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

// Singleton para evitar múltiplas instâncias em dev (HMR)
export const prisma: PrismaClient =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

// Alias de compatibilidade: alguns trechos antigos usam `paymentTransaction`
// No schema atual o modelo é `Payment`. Mantemos um alias em runtime.
// @ts-ignore – adicionamos a propriedade dinamicamente para compatibilidade
(prisma as any).paymentTransaction = (prisma as any).payment;
