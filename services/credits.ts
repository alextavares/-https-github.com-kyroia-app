import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/credit-service";

/**
 * Tipos auxiliares
 */
export type CreditTransaction = {
  id: string;
  type: "PURCHASE" | "BONUS" | "CONSUMPTION" | string;
  amount: number;
  createdAt: Date;
  // outros campos relevantes podem ser adicionados conforme o schema real
};

export type MonthlyStats = {
  month: string; // e.g. "2025-07"
  purchased: number;
  consumed: number;
  balanceEnd: number;
};

export type UserCreditStats = {
  totalPurchased: number;
  totalConsumed: number;
  currentBalance: number;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
  // outros campos
};

export const CreditsService = {
  /**
   * Saldo atual do usuário (inteiro em créditos)
   * Mantém fallback em Prisma caso CreditService não implemente.
   */
  async getUserBalance(userId: string): Promise<number> {
    if (typeof CreditService?.getUserBalance === "function") {
      return CreditService.getUserBalance(userId);
    }
    const purchases = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: { in: ["PURCHASE", "BONUS"] } },
    });
    const consumptions = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: "CONSUMPTION" },
    });

    const inSum = purchases._sum.amount ?? 0;
    const outSum = consumptions._sum.amount ?? 0;
    return inSum - outSum;
  },

  /**
   * Histórico paginado de transações do usuário
   */
  async getTransactionHistory(
    userId: string,
    limit: number,
    offset: number
  ): Promise<CreditTransaction[]> {
    if (typeof CreditService?.getTransactionHistory === "function") {
      return CreditService.getTransactionHistory(userId, limit, offset) as unknown as CreditTransaction[];
    }

    const rows = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        type: true,
        amount: true,
        createdAt: true,
      },
    });

    return rows as unknown as CreditTransaction[];
  },

  /**
   * Estatísticas mensais (exemplo: agregações por mês)
   */
  async getMonthlyStats(userId: string): Promise<MonthlyStats[]> {
    if (typeof CreditService?.getMonthlyStats === "function") {
      return CreditService.getMonthlyStats(userId) as unknown as MonthlyStats[];
    }

    const rows = await prisma.$queryRawUnsafe<{
      month: string;
      purchased: number;
      consumed: number;
      balanceEnd: number;
    }[]>(
      `
      SELECT
        TO_CHAR(date_trunc('month', "createdAt"), 'YYYY-MM') as month,
        SUM(CASE WHEN type IN ('PURCHASE','BONUS') THEN amount ELSE 0 END)::int as purchased,
        SUM(CASE WHEN type = 'CONSUMPTION' THEN amount ELSE 0 END)::int as consumed,
        SUM(CASE WHEN type IN ('PURCHASE','BONUS') THEN amount ELSE -amount END)::int as balanceEnd
      FROM "creditTransaction"
      WHERE "userId" = $1
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `,
      userId
    );

    return rows.map((r) => ({
      month: r.month,
      purchased: r.purchased ?? 0,
      consumed: r.consumed ?? 0,
      balanceEnd: r.balanceEnd ?? 0,
    }));
  },

  /**
   * Estatísticas agregadas do usuário (totais)
   */
  async getUserCreditStats(userId: string): Promise<UserCreditStats> {
    if (typeof CreditService?.getUserCreditStats === "function") {
      return CreditService.getUserCreditStats(userId) as unknown as UserCreditStats;
    }

    const purchases = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: { in: ["PURCHASE", "BONUS"] } },
    });
    const consumptions = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { userId, type: "CONSUMPTION" },
    });

    const totalPurchased = purchases._sum.amount ?? 0;
    const totalConsumed = consumptions._sum.amount ?? 0;
    const currentBalance = totalPurchased - totalConsumed;

    return { totalPurchased, totalConsumed, currentBalance };
  },

  /**
   * Catálogo de pacotes disponíveis
   * Alinha com a rota atual que usa CreditService.getAvailablePackages()
   */
  async getAvailablePackages(): Promise<CreditPackage[]> {
    if (typeof CreditService?.getAvailablePackages === "function") {
      return CreditService.getAvailablePackages() as unknown as CreditPackage[];
    }
    // Fallback: caso não exista implementação no CreditService e também não exista tabela Prisma,
    // retornamos lista vazia para evitar quebra de build. Ajuste conforme schema real.
    return [];
  },
};