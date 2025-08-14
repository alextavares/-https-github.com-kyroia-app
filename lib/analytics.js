import { z } from 'zod';
const AnalyticsPeriodSchema = z.object({
    start: z.date(),
    end: z.date(),
    granularity: z.enum(['hour', 'day', 'week', 'month']).default('day')
});
const AnalyticsQuerySchema = z.object({
    userId: z.string().uuid().optional(),
    period: AnalyticsPeriodSchema,
    filters: z.object({
        models: z.array(z.string()).optional(),
        features: z.array(z.string()).optional(),
        minCost: z.number().optional(),
        maxCost: z.number().optional()
    }).optional()
});
export class AnalyticsService {
    // User-specific analytics
    static async getUserAnalytics(userId, period) {
        // This would query the database for user-specific analytics
        // For now, returning mock data structure
        return {
            userId,
            period,
            usage: {
                totalMessages: 0,
                totalTokens: 0,
                totalCost: 0,
                averageMessagesPerDay: 0,
                mostUsedModel: '',
                peakUsageHour: 14
            },
            models: [],
            features: [],
            trends: []
        };
    }
    // System-wide analytics
    static async getSystemAnalytics(period) {
        // This would aggregate system-wide metrics
        return {
            totalUsers: 0,
            activeUsers: {
                daily: 0,
                weekly: 0,
                monthly: 0
            },
            usage: {
                totalMessages: 0,
                totalTokens: 0,
                totalCost: 0,
                averageMessagesPerUser: 0
            },
            models: {
                mostPopular: [],
                fastest: [],
                mostCostEffective: []
            },
            performance: {
                averageResponseTime: 0,
                errorRate: 0,
                uptime: 99.9
            },
            revenue: {
                totalRevenue: 0,
                mrr: 0,
                churnRate: 0,
                customerLifetimeValue: 0
            }
        };
    }
    // Real-time metrics
    static async getRealTimeMetrics() {
        return {
            activeUsers: 0,
            messagesPerMinute: 0,
            averageResponseTime: 0,
            errorRate: 0,
            queueLength: 0,
            systemHealth: 'healthy'
        };
    }
    // Usage forecasting
    static async forecastUsage(userId, daysAhead = 30) {
        // This would use historical data to predict future usage
        // Simple linear prediction for now
        const historicalData = await this.getUserAnalytics(userId, {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
        });
        const dailyAverage = historicalData.usage.averageMessagesPerDay;
        return {
            estimatedMessages: dailyAverage * daysAhead,
            estimatedTokens: dailyAverage * daysAhead * 100, // Estimate ~100 tokens per message
            estimatedCost: dailyAverage * daysAhead * 0.001, // Estimate ~$0.001 per message
            confidence: 0.7
        };
    }
    // Cost optimization suggestions
    static async getCostOptimizationSuggestions(userId) {
        const analytics = await this.getUserAnalytics(userId, {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
        });
        const suggestions = [];
        // Example suggestions based on usage patterns
        if (analytics.usage.mostUsedModel === 'gpt-4o') {
            suggestions.push({
                type: 'model_switch',
                title: 'Considere usar GPT-4o Mini para tarefas básicas',
                description: 'Você pode economizar até 90% alternando para modelos mais eficientes em tarefas simples',
                potentialSavings: analytics.usage.totalCost * 0.4,
                difficulty: 'easy'
            });
        }
        if (analytics.usage.peakUsageHour >= 9 && analytics.usage.peakUsageHour <= 17) {
            suggestions.push({
                type: 'usage_pattern',
                title: 'Use horários de menor demanda',
                description: 'Considere usar a IA em horários alternativos para melhor performance',
                potentialSavings: 0,
                difficulty: 'easy'
            });
        }
        return suggestions;
    }
    // Model performance comparison
    static async compareModelPerformance(modelIds, period) {
        // This would analyze model performance across various metrics
        const models = modelIds.map(id => ({
            id,
            name: id, // Would lookup actual name
            metrics: {
                averageResponseTime: Math.random() * 2000 + 500,
                successRate: 0.95 + Math.random() * 0.04,
                costPerMessage: Math.random() * 0.01,
                userSatisfaction: 4 + Math.random(),
                qualityScore: 0.8 + Math.random() * 0.2
            }
        }));
        const bestModel = models.reduce((best, current) => current.metrics.qualityScore > best.metrics.qualityScore ? current : best);
        return {
            models,
            recommendation: `Baseado na análise, recomendamos o modelo ${bestModel.name} para melhor custo-benefício`
        };
    }
    // Export analytics data
    static async exportAnalytics(query, format) {
        // This would generate export files
        if (format === 'json') {
            const data = query.userId
                ? await this.getUserAnalytics(query.userId, query.period)
                : await this.getSystemAnalytics(query.period);
            return JSON.stringify(data, null, 2);
        }
        if (format === 'csv') {
            // Convert to CSV format
            return 'Date,Messages,Tokens,Cost\n' +
                '2024-01-01,100,5000,0.50\n' +
                '2024-01-02,120,6000,0.60\n';
        }
        throw new Error(`Format ${format} not implemented`);
    }
    // Custom dashboard metrics
    static async getCustomDashboard(userId, widgets) {
        const dashboard = [];
        for (const widget of widgets) {
            const period = this.getPeriodDates(widget.period);
            switch (widget.type) {
                case 'usage':
                    const usage = await this.getUserAnalytics(userId, period);
                    dashboard.push({
                        type: 'usage',
                        data: usage.usage,
                        period: widget.period
                    });
                    break;
                case 'cost':
                    const costData = await this.getUserAnalytics(userId, period);
                    dashboard.push({
                        type: 'cost',
                        data: {
                            total: costData.usage.totalCost,
                            trend: costData.trends.map(t => ({ date: t.date, cost: t.cost }))
                        },
                        period: widget.period
                    });
                    break;
                // Add more widget types...
            }
        }
        return dashboard;
    }
    static getPeriodDates(period) {
        const end = new Date();
        const start = new Date();
        switch (period) {
            case 'day':
                start.setDate(start.getDate() - 1);
                break;
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
        }
        return { start, end };
    }
    // Anomaly detection
    static async detectAnomalies(userId, thresholds = {
        costSpike: 2.0, // 200% increase
        usageSpike: 3.0, // 300% increase
        errorRate: 0.1 // 10% error rate
    }) {
        // This would analyze patterns and detect anomalies
        return [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5hbHl0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFnRnZCLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNyQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRTtJQUNmLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFO0lBQ2IsV0FBVyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Q0FDckUsQ0FBQyxDQUFBO0FBRUYsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQ3BDLE1BQU0sRUFBRSxxQkFBcUI7SUFDN0IsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDaEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ3RDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRTtRQUN4QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUM5QixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtLQUMvQixDQUFDLENBQUMsUUFBUSxFQUFFO0NBQ2QsQ0FBQyxDQUFBO0FBSUYsTUFBTSxPQUFPLGdCQUFnQjtJQUMzQiwwQkFBMEI7SUFDMUIsTUFBTSxDQUFDLEtBQUss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