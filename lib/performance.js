// Simple in-memory cache with LRU eviction
class LRUCache {
    constructor(maxSize = 1000, ttl = 3600) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.ttl = ttl * 1000; // Convert to milliseconds
    }
    get(key) {
        const item = this.cache.get(key);
        if (item) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, item);
        }
        return item;
    }
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.maxSize) {
            // Remove least recently used item
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
// Request queue for managing concurrent API calls
class RequestQueue {
    constructor(maxConcurrent = 10) {
        this.queue = [];
        this.processing = 0;
        this.maxConcurrent = maxConcurrent;
    }
    async add(request, priority = 0) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                id: crypto.randomUUID(),
                request,
                resolve,
                reject,
                priority,
                timestamp: new Date()
            });
            // Sort by priority (higher priority first)
            this.queue.sort((a, b) => b.priority - a.priority);
            this.processQueue();
        });
    }
    async processQueue() {
        if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        const item = this.queue.shift();
        this.processing++;
        try {
            const result = await item.request();
            item.resolve(result);
        }
        catch (error) {
            item.reject(error);
        }
        finally {
            this.processing--;
            this.processQueue(); // Process next item
        }
    }
    getQueueLength() {
        return this.queue.length;
    }
    getProcessingCount() {
        return this.processing;
    }
}
// Rate limiter using sliding window
class RateLimiter {
    constructor(config) {
        this.windows = new Map();
        this.config = config;
    }
    isAllowed(identifier) {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        if (!this.windows.has(identifier)) {
            this.windows.set(identifier, []);
        }
        const requests = this.windows.get(identifier);
        // Remove old requests outside the window
        const validRequests = requests.filter(time => time > windowStart);
        this.windows.set(identifier, validRequests);
        // Check if limit is exceeded
        if (validRequests.length >= this.config.maxRequests) {
            return false;
        }
        // Add current request
        validRequests.push(now);
        return true;
    }
    getRemainingRequests(identifier) {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        if (!this.windows.has(identifier)) {
            return this.config.maxRequests;
        }
        const requests = this.windows.get(identifier);
        const validRequests = requests.filter(time => time > windowStart);
        return Math.max(0, this.config.maxRequests - validRequests.length);
    }
    getResetTime(identifier) {
        const now = Date.now();
        if (!this.windows.has(identifier)) {
            return new Date(now + this.config.windowMs);
        }
        const requests = this.windows.get(identifier);
        const oldestRequest = Math.min(...requests, now);
        return new Date(oldestRequest + this.config.windowMs);
    }
}
// Performance monitoring
export class PerformanceMonitor {
    constructor() {
        this.metrics = [];
        this.caches = new Map();
        this.rateLimiters = new Map();
        this.requestQueue = new RequestQueue(20); // Max 20 concurrent requests
        this.startMetricsCollection();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PerformanceMonitor();
        }
        return this.instance;
    }
    // Cache management
    createCache(name, config = {
        ttl: 3600,
        maxSize: 1000,
        strategy: 'lru',
        compression: false
    }) {
        this.caches.set(name, new LRUCache(config.maxSize, config.ttl));
    }
    getFromCache(cacheName, key) {
        const cache = this.caches.get(cacheName);
        return cache === null || cache === void 0 ? void 0 : cache.get(key);
    }
    setCache(cacheName, key, value) {
        const cache = this.caches.get(cacheName);
        cache === null || cache === void 0 ? void 0 : cache.set(key, value);
    }
    clearCache(cacheName) {
        const cache = this.caches.get(cacheName);
        cache === null || cache === void 0 ? void 0 : cache.clear();
    }
    getCacheStats(cacheName) {
        const cache = this.caches.get(cacheName);
        return {
            size: (cache === null || cache === void 0 ? void 0 : cache.size()) || 0,
            maxSize: 1000, // Would be stored in config
            hitRate: 0 // Would be calculated from hit/miss counters
        };
    }
    // Request queuing
    async queueRequest(request, priority = 0) {
        return this.requestQueue.add(request, priority);
    }
    getQueueStatus() {
        return {
            queueLength: this.requestQueue.getQueueLength(),
            processing: this.requestQueue.getProcessingCount()
        };
    }
    // Rate limiting
    createRateLimiter(name, config) {
        this.rateLimiters.set(name, new RateLimiter(config));
    }
    checkRateLimit(limiterName, identifier) {
        const limiter = this.rateLimiters.get(limiterName);
        if (!limiter) {
            throw new Error(`Rate limiter '${limiterName}' not found`);
        }
        return {
            allowed: limiter.isAllowed(identifier),
            remaining: limiter.getRemainingRequests(identifier),
            resetTime: limiter.getResetTime(identifier)
        };
    }
    // Performance metrics
    recordMetric(metric) {
        const fullMetric = Object.assign({ responseTime: 0, throughput: 0, errorRate: 0, cacheHitRate: 0, queueLength: this.requestQueue.getQueueLength(), memoryUsage: 0, cpuUsage: 0, timestamp: new Date() }, metric);
        this.metrics.push(fullMetric);
        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
            this.metrics.shift();
        }
    }
    getMetrics(period) {
        return this.metrics.filter(m => m.timestamp >= period.start && m.timestamp <= period.end);
    }
    getAverageMetrics(period) {
        const metrics = this.getMetrics(period);
        if (metrics.length === 0)
            return null;
        const sum = metrics.reduce((acc, m) => ({
            responseTime: acc.responseTime + m.responseTime,
            throughput: acc.throughput + m.throughput,
            errorRate: acc.errorRate + m.errorRate,
            cacheHitRate: acc.cacheHitRate + m.cacheHitRate,
            queueLength: acc.queueLength + m.queueLength,
            memoryUsage: acc.memoryUsage + m.memoryUsage,
            cpuUsage: acc.cpuUsage + m.cpuUsage
        }), {
            responseTime: 0,
            throughput: 0,
            errorRate: 0,
            cacheHitRate: 0,
            queueLength: 0,
            memoryUsage: 0,
            cpuUsage: 0
        });
        const count = metrics.length;
        return {
            responseTime: sum.responseTime / count,
            throughput: sum.throughput / count,
            errorRate: sum.errorRate / count,
            cacheHitRate: sum.cacheHitRate / count,
            queueLength: sum.queueLength / count,
            memoryUsage: sum.memoryUsage / count,
            cpuUsage: sum.cpuUsage / count
        };
    }
    // System health check
    getSystemHealth() {
        const checks = [];
        let overallStatus = 'healthy';
        // Check queue length
        const queueLength = this.requestQueue.getQueueLength();
        if (queueLength > 100) {
            checks.push({
                name: 'Queue Length',
                status: 'fail',
                message: `Queue too long: ${queueLength} requests`
            });
            overallStatus = 'critical';
        }
        else if (queueLength > 50) {
            checks.push({
                name: 'Queue Length',
                status: 'fail',
                message: `Queue getting long: ${queueLength} requests`
            });
            if (overallStatus === 'healthy')
                overallStatus = 'warning';
        }
        else {
            checks.push({
                name: 'Queue Length',
                status: 'pass',
                message: `Queue normal: ${queueLength} requests`
            });
        }
        // Check error rate
        const recentMetrics = this.getMetrics({
            start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            end: new Date()
        });
        if (recentMetrics.length > 0) {
            const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;
            if (avgErrorRate > 0.1) { // >10% error rate
                checks.push({
                    name: 'Error Rate',
                    status: 'fail',
                    message: `High error rate: ${(avgErrorRate * 100).toFixed(1)}%`
                });
                overallStatus = 'critical';
            }
            else if (avgErrorRate > 0.05) { // >5% error rate
                checks.push({
                    name: 'Error Rate',
                    status: 'fail',
                    message: `Elevated error rate: ${(avgErrorRate * 100).toFixed(1)}%`
                });
                if (overallStatus === 'healthy')
                    overallStatus = 'warning';
            }
            else {
                checks.push({
                    name: 'Error Rate',
                    status: 'pass',
                    message: `Error rate normal: ${(avgErrorRate * 100).toFixed(1)}%`
                });
            }
        }
        return { status: overallStatus, checks };
    }
    startMetricsCollection() {
        // Collect system metrics every 30 seconds
        setInterval(() => {
            // In a real implementation, this would collect actual system metrics
            this.recordMetric({
                responseTime: Math.random() * 1000 + 200,
                throughput: Math.random() * 100 + 50,
                errorRate: Math.random() * 0.05,
                cacheHitRate: 0.8 + Math.random() * 0.2,
                memoryUsage: 50 + Math.random() * 30,
                cpuUsage: 20 + Math.random() * 40
            });
        }, 30000);
    }
    // Request/response timing wrapper
    async measureRequest(name, request) {
        const startTime = Date.now();
        let error = null;
        try {
            const result = await request();
            return result;
        }
        catch (err) {
            error = err;
            throw err;
        }
        finally {
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            this.recordMetric({
                responseTime,
                errorRate: error ? 1 : 0,
                timestamp: new Date(endTime)
            });
        }
    }
    // Optimization suggestions
    getOptimizationSuggestions() {
        const suggestions = [];
        const queueLength = this.requestQueue.getQueueLength();
        const recentMetrics = this.getAverageMetrics({
            start: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            end: new Date()
        });
        if (queueLength > 20) {
            suggestions.push({
                type: 'queue',
                priority: 'high',
                title: 'Increase Concurrent Request Limit',
                description: 'Queue is consistently long, consider increasing max concurrent requests',
                impact: 'Reduce user wait times by 20-30%'
            });
        }
        if (recentMetrics && recentMetrics.cacheHitRate < 0.6) {
            suggestions.push({
                type: 'cache',
                priority: 'medium',
                title: 'Improve Cache Strategy',
                description: 'Cache hit rate is low, review caching strategy and TTL settings',
                impact: 'Reduce response times by 40-50%'
            });
        }
        if (recentMetrics && recentMetrics.responseTime > 2000) {
            suggestions.push({
                type: 'system',
                priority: 'high',
                title: 'Optimize Response Times',
                description: 'Average response time is high, consider request optimization',
                impact: 'Improve user experience significantly'
            });
        }
        return suggestions;
    }
}
// Singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
// Initialize common caches and rate limiters
performanceMonitor.createCache('responses', {
    ttl: 3600, // 1 hour
    maxSize: 10000,
    strategy: 'lru',
    compression: true
});
performanceMonitor.createCache('user-sessions', {
    ttl: 1800, // 30 minutes
    maxSize: 5000,
    strategy: 'lru',
    compression: false
});
performanceMonitor.createRateLimiter('api-calls', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
});
performanceMonitor.createRateLimiter('chat-messages', {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    skipSuccessfulRequests: false,
    skipFailedRequests: true
});
/* removed duplicate re-exports to avoid conflicts */ 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwZXJmb3JtYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQkEsMkNBQTJDO0FBQzNDLE1BQU0sUUFBUTtJQUtaLFlBQVksVUFBa0IsSUFBSSxFQUFFLE1BQWMsSUFBSTtRQUo5QyxVQUFLLEdBQUcsSUFBSSxHQUFHLEVBQVEsQ0FBQTtRQUs3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUEsQ0FBQywwQkFBMEI7SUFDbEQsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFNO1FBQ1IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDaEMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNULG1DQUFtQztZQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDM0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELEdBQUcsQ0FBQyxHQUFNLEVBQUUsS0FBUTtRQUNsQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDeEIsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzNDLGtDQUFrQztZQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQXNCLENBQUE7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