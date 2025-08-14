import { prisma } from "@/lib/prisma";
import { CreditService } from "@/lib/credit-service";
export const CreditsService = {
    /**
     * Saldo atual do usuário (inteiro em créditos)
     * Mantém fallback em Prisma caso CreditService não implemente.
     */
    async getUserBalance(userId) {
        var _a, _b;
        if (typeof (CreditService === null || CreditService === void 0 ? void 0 : CreditService.getUserBalance) === "function") {
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
        const inSum = (_a = purchases._sum.amount) !== null && _a !== void 0 ? _a : 0;
        const outSum = (_b = consumptions._sum.amount) !== null && _b !== void 0 ? _b : 0;
        return inSum - outSum;
    },
    /**
     * Histórico paginado de transações do usuário
     */
    async getTransactionHistory(userId, limit, offset) {
        if (typeof (CreditService === null || CreditService === void 0 ? void 0 : CreditService.getTransactionHistory) === "function") {
            return CreditService.getTransactionHistory(userId, limit, offset);
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
        return rows;
    },
    /**
     * Estatísticas mensais (exemplo: agregações por mês)
     */
    async getMonthlyStats(userId) {
        if (typeof (CreditService === null || CreditService === void 0 ? void 0 : CreditService.getMonthlyStats) === "function") {
            return CreditService.getMonthlyStats(userId);
        }
        const rows = await prisma.$queryRawUnsafe(`
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
    `, userId);
        return rows.map((r) => {
            var _a, _b, _c;
            return ({
                month: r.month,
                purchased: (_a = r.purchased) !== null && _a !== void 0 ? _a : 0,
                consumed: (_b = r.consumed) !== null && _b !== void 0 ? _b : 0,
                balanceEnd: (_c = r.balanceEnd) !== null && _c !== void 0 ? _c : 0,
            });
        });
    },
    /**
     * Estatísticas agregadas do usuário (totais)
     */
    async getUserCreditStats(userId) {
        var _a, _b;
        if (typeof (CreditService === null || CreditService === void 0 ? void 0 : CreditService.getUserCreditStats) === "function") {
            return CreditService.getUserCreditStats(userId);
        }
        const purchases = await prisma.creditTransaction.aggregate({
            _sum: { amount: true },
            where: { userId, type: { in: ["PURCHASE", "BONUS"] } },
        });
        const consumptions = await prisma.creditTransaction.aggregate({
            _sum: { amount: true },
            where: { userId, type: "CONSUMPTION" },
        });
        const totalPurchased = (_a = purchases._sum.amount) !== null && _a !== void 0 ? _a : 0;
        const totalConsumed = (_b = consumptions._sum.amount) !== null && _b !== void 0 ? _b : 0;
        const currentBalance = totalPurchased - totalConsumed;
        return { totalPurchased, totalConsumed, currentBalance };
    },
    /**
     * Catálogo de pacotes disponíveis
     * Alinha com a rota atual que usa CreditService.getAvailablePackages()
     */
    async getAvailablePackages() {
        if (typeof (CreditService === null || CreditService === void 0 ? void 0 : CreditService.getAvailablePackages) === "function") {
            return CreditService.getAvailablePackages();
        }
        // Fallback: caso não exista implementação no CreditService e também não exista tabela Prisma,
        // retornamos lista vazia para evitar quebra de build. Ajuste conforme schema real.
        return [];
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWRpdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFtQ3JELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRztJQUM1Qjs7O09BR0c7SUFDSCxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQWM7O1FBQ2pDLElBQUksT0FBTyxDQUFBLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxjQUFjLENBQUEsS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN4RCxPQUFPLGFBQWEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQztZQUN6RCxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ3RCLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRTtTQUN2RCxDQUFDLENBQUM7UUFDSCxNQUFNLFlBQVksR0FBRyxNQUFNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7WUFDNUQsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtZQUN0QixLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRTtTQUN2QyxDQUFDLENBQUM7UUFFSCxNQUFNLEtBQUssR0FBRyxNQUFBLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxtQ0FBSSxDQUFDLENBQUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsTUFBQSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sbUNBQUksQ0FBQyxDQUFDO1FB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