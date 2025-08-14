import { prisma } from './prisma';
export class CreditService {
    // Get user's current credit balance
    static async getUserBalance(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { creditBalance: true }
            });
            return (user === null || user === void 0 ? void 0 : user.creditBalance) || 0;
        }
        catch (error) {
            console.error('Error getting user balance:', error);
            // Return 0 if creditBalance column doesn't exist yet
            return 0;
        }
    }
    // Alias for getUserBalance (for dashboard compatibility)
    static async getBalance(userId) {
        return this.getUserBalance(userId);
    }
    // Get monthly statistics for credit usage
    static async getMonthlyStats(userId) {
        try {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const endOfMonth = new Date();
            endOfMonth.setMonth(endOfMonth.getMonth() + 1);
            endOfMonth.setDate(0);
            endOfMonth.setHours(23, 59, 59, 999);
            const transactions = await prisma.creditTransaction.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth
                    }
                },
                select: {
                    amount: true,
                    type: true
                }
            });
            const consumed = transactions
                .filter(t => t.type === 'CONSUMPTION')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            const purchased = transactions
                .filter(t => t.type === 'PURCHASE')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                consumed,
                purchased
            };
        }
        catch (error) {
            console.error('Error getting monthly stats:', error);
            // Return default values if tables don't exist yet
            return {
                consumed: 0,
                purchased: 0
            };
        }
    }
    // Removidos métodos que dependem de tabelas não existentes
    // consumeCreditsForModel e consumeCreditsForTool
    // Agora usamos apenas o método genérico consumeCredits
    // Generic credit consumption with transaction
    static async consumeCredits(userId, amount, description, referenceId, referenceType) {
        if (amount <= 0) {
            return { success: false, message: 'Invalid credit amount' };
        }
        return prisma.$transaction(async (tx) => {
            // Get current user balance
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { creditBalance: true }
            });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            // Check if user has enough credits
            if (user.creditBalance < amount) {
                return {
                    success: false,
                    message: `Insufficient credits. Required: ${amount}, Available: ${user.creditBalance}`
                };
            }
            const newBalance = user.creditBalance - amount;
            // Update user balance
            await tx.user.update({
                where: { id: userId },
                data: { creditBalance: newBalance }
            });
            // Create transaction record
            await tx.creditTransaction.create({
                data: {
                    userId,
                    type: 'CONSUMPTION',
                    amount: -amount // negative for consumption
                }
            });
            return { success: true, creditsConsumed: amount };
        });
    }
    // Add credits to user account
    static async addCredits(userId, amount, description, packageId, type = 'PURCHASE') {
        if (amount <= 0) {
            return { success: false, message: 'Invalid credit amount' };
        }
        return prisma.$transaction(async (tx) => {
            // Get current user balance
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: { creditBalance: true }
            });
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            const newBalance = user.creditBalance + amount;
            // Update user balance
            await tx.user.update({
                where: { id: userId },
                data: { creditBalance: newBalance }
            });
            // Create transaction record
            await tx.creditTransaction.create({
                data: {
                    userId,
                    type,
                    amount // positive for additions
                }
            });
            return { success: true, newBalance };
        });
    }
    // Get credit transaction history
    static async getTransactionHistory(userId, limit = 50, offset = 0) {
        return prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset
        });
    }
    // Get available credit packages (hardcoded for now)
    static async getAvailablePackages() {
        // Retornar pacotes hardcoded por enquanto
        // Em produção, isso viria de uma tabela no banco
        return [
            {
                id: 'basic',
                name: 'Pacote Básico',
                credits: 5000,
                price: 59.00,
                isActive: true
            },
            {
                id: 'popular',
                name: 'Pacote Popular',
                credits: 10000,
                price: 99.00,
                isActive: true
            },
            {
                id: 'premium',
                name: 'Pacote Premium',
                credits: 20000,
                price: 159.00,
                isActive: true
            }
        ];
    }
    // Check if user has enough credits for operation
    static async checkCreditsAvailable(userId, creditsNeeded) {
        const currentBalance = await this.getUserBalance(userId);
        return {
            available: currentBalance >= creditsNeeded,
            currentBalance,
            needed: creditsNeeded
        };
    }
    // Get user's credit statistics
    static async getUserCreditStats(userId) {
        const [balance, totalConsumed, totalPurchased] = await Promise.all([
            this.getUserBalance(userId),
            prisma.creditTransaction.aggregate({
                where: {
                    userId,
                    type: 'CONSUMPTION'
                },
                _sum: { amount: true }
            }),
            prisma.creditTransaction.aggregate({
                where: {
                    userId,
                    type: 'PURCHASE'
                },
                _sum: { amount: true }
            })
        ]);
        return {
            currentBalance: balance,
            totalConsumed: Math.abs(totalConsumed._sum.amount || 0),
            totalPurchased: totalPurchased._sum.amount || 0
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGl0LXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjcmVkaXQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRWpDLE1BQU0sT0FBTyxhQUFhO0lBQ3hCLG9DQUFvQztJQUNwQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFjO1FBQ3hDLElBQUksQ0FBQztZQUNILE1BQU0sSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ3hDLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUU7Z0JBQ3JCLE1BQU0sRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUU7YUFDaEMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxhQUFhLEtBQUksQ0FBQyxDQUFBO1FBQ2pDLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUNuRCxxREFBcUQ7WUFDckQsT0FBTyxDQUFDLENBQUE7UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUVELHlEQUF5RDtJQUN6RCxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFjO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNwQyxDQUFDO0lBRUQsMENBQTBDO0lBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQWM7UUFJekMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxZQUFZLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTtZQUMvQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFF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