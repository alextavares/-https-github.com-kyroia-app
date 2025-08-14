import { z } from 'zod';
import crypto from 'crypto';
const APIKeySchema = z.object({
    name: z.string().min(1).max(100),
    provider: z.enum(['openai', 'anthropic', 'google', 'openrouter', 'custom']),
    key: z.string().min(10),
    limits: z.object({
        maxRequestsPerDay: z.number().positive().optional(),
        maxTokensPerDay: z.number().positive().optional(),
        maxCostPerDay: z.number().positive().optional()
    }).optional(),
    permissions: z.object({
        models: z.array(z.string()),
        features: z.array(z.string())
    }).optional(),
    expiresAt: z.date().optional()
});
export const PROVIDER_CONFIGS = {
    openai: {
        provider: 'openai',
        name: 'OpenAI',
        description: 'GPT-4, GPT-3.5, DALL-E, Whisper',
        keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
        testEndpoint: 'https://api.openai.com/v1/models',
        supportedModels: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
        features: ['chat', 'completion', 'vision', 'audio', 'image-generation'],
        pricing: {
            inputCost: 0.000015,
            outputCost: 0.00006,
            currency: 'USD'
        }
    },
    anthropic: {
        provider: 'anthropic',
        name: 'Anthropic',
        description: 'Claude 3.5 Sonnet, Claude 3 Haiku',
        keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
        testEndpoint: 'https://api.anthropic.com/v1/messages',
        supportedModels: ['claude-3-5-sonnet', 'claude-3-haiku'],
        features: ['chat', 'completion', 'vision', 'document-analysis'],
        pricing: {
            inputCost: 0.000015,
            outputCost: 0.000075,
            currency: 'USD'
        }
    },
    google: {
        provider: 'google',
        name: 'Google AI',
        description: 'Gemini Pro, PaLM, Vertex AI',
        keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
        testEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
        supportedModels: ['gemini-pro', 'gemini-pro-vision'],
        features: ['chat', 'completion', 'vision', 'reasoning'],
        pricing: {
            inputCost: 0.00001,
            outputCost: 0.00004,
            currency: 'USD'
        }
    },
    openrouter: {
        provider: 'openrouter',
        name: 'OpenRouter',
        description: 'Acesso unificado a múltiplos modelos',
        keyFormat: /^sk-or-v1-[a-zA-Z0-9]{64,}$/,
        testEndpoint: 'https://openrouter.ai/api/v1/models',
        supportedModels: ['all'],
        features: ['chat', 'completion', 'vision', 'multi-model'],
        pricing: {
            inputCost: 0.00001,
            outputCost: 0.00003,
            currency: 'USD'
        }
    }
};
export class APIKeyManager {
    // Encrypt API key for storage
    static encryptKey(key) {
        const algorithm = 'aes-256-cbc';
        // Derive a 32-byte key from the provided encryptionKey
        const derivedKey = crypto.createHash('sha256').update(this.encryptionKey).digest();
        // IV must be 16 bytes for aes-256-cbc
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
        const encrypted = Buffer.concat([cipher.update(key, 'utf8'), cipher.final()]);
        // Store IV + ciphertext in hex
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
    // Decrypt API key for use
    static decryptKey(encryptedKey) {
        try {
            const algorithm = 'aes-256-cbc';
            const derivedKey = crypto.createHash('sha256').update(this.encryptionKey).digest();
            const [ivHex, dataHex] = encryptedKey.split(':');
            if (!ivHex || !dataHex) {
                throw new Error('Invalid encrypted payload format');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const ciphertext = Buffer.from(dataHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
            const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
            return decrypted.toString('utf8');
        }
        catch (_a) {
            throw new Error('Failed to decrypt API key');
        }
    }
    // Create API key preview (show only last 4 characters)
    static createKeyPreview(key) {
        if (key.length < 4)
            return '****';
        return '***' + key.slice(-4);
    }
    // Validate API key format
    static validateKeyFormat(provider, key) {
        const config = PROVIDER_CONFIGS[provider];
        if (!config)
            return false;
        return config.keyFormat.test(key);
    }
    // Test API key by making a test request
    static async testAPIKey(provider, key) {
        var _a;
        const config = PROVIDER_CONFIGS[provider];
        if (!config) {
            return { isValid: false, error: 'Provider not supported' };
        }
        try {
            const headers = {
                'User-Agent': 'Kyroia/1.0'
            };
            // Set authorization header based on provider
            switch (provider) {
                case 'openai':
                case 'openrouter':
                    headers['Authorization'] = `Bearer ${key}`;
                    break;
                case 'anthropic':
                    headers['x-api-key'] = key;
                    headers['anthropic-version'] = '2023-06-01';
                    break;
                case 'google':
                    // Google uses query parameter
                    break;
            }
            const url = provider === 'google'
                ? `${config.testEndpoint}?key=${key}`
                : config.testEndpoint;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: controller.signal
            }).finally(() => clearTimeout(timeoutId));
            if (response.ok) {
                const data = await response.json();
                return {
                    isValid: true,
                    metadata: {
                        modelsCount: ((_a = data.data) === null || _a === void 0 ? void 0 : _a.length) || 0,
                        organization: data.organization || null
                    }
                };
            }
            else {
                return {
                    isValid: false,
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }
        }
        catch (error) {
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Network error'
            };
        }
    }
    // Add new API key
    static async addAPIKey(userId, keyData) {
        // Validate key format
        if (!this.validateKeyFormat(keyData.provider, keyData.key)) {
            throw new Error('Invalid API key format for this provider');
        }
        // Test key validity
        const testResult = await this.testAPIKey(keyData.provider, keyData.key);
        if (!testResult.isValid) {
            throw new Error(`API key test failed: ${testResult.error}`);
        }
        const apiKey = {
            id: crypto.randomUUID(),
            userId,
            name: keyData.name,
            provider: keyData.provider,
            key: this.encryptKey(keyData.key),
            keyPreview: this.createKeyPreview(keyData.key),
            isActive: true,
            usage: {
                totalRequests: 0,
                totalTokens: 0,
                totalCost: 0
            },
            limits: keyData.limits || {},
            permissions: keyData.permissions || {
                models: PROVIDER_CONFIGS[keyData.provider].supportedModels,
                features: PROVIDER_CONFIGS[keyData.provider].features
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            expiresAt: keyData.expiresAt
        };
        // In a real implementation, this would save to database
        return apiKey;
    }
    // Get user's API keys
    static async getUserAPIKeys(userId) {
        // In a real implementation, this would query the database
        return [];
    }
    // Get active API key for provider
    static async getActiveKey(userId, provider) {
        const keys = await this.getUserAPIKeys(userId);
        const activeKey = keys.find(k => k.provider === provider &&
            k.isActive &&
            (!k.expiresAt || k.expiresAt > new Date()));
        if (!activeKey)
            return null;
        return this.decryptKey(activeKey.key);
    }
    // Update API key usage
    static async updateKeyUsage(keyId, usage) {
        // In a real implementation, this would update the database
        // and check against limits
        console.log(`Updating usage for key ${keyId}:`, usage);
    }
    // Check if key usage is within limits
    static async checkUsageLimits(keyId) {
        // In a real implementation, this would check actual usage against limits
        return {
            withinLimits: true,
            violations: []
        };
    }
    // Rotate API key (generate new key for same provider)
    static async rotateAPIKey(keyId, newKey) {
        // In a real implementation, this would update the existing key
        // after validating the new key
        throw new Error('Not implemented');
    }
    // Delete API key
    static async deleteAPIKey(keyId, userId) {
        // In a real implementation, this would soft-delete the key
        console.log(`Deleting API key ${keyId} for user ${userId}`);
    }
    // Get usage analytics for API keys
    static async getKeyAnalytics(userId, period) {
        // In a real implementation, this would aggregate usage data
        return [];
    }
    // Auto-detect provider from key format
    static detectProvider(key) {
        for (const [provider, config] of Object.entries(PROVIDER_CONFIGS)) {
            if (config.keyFormat.test(key)) {
                return provider;
            }
        }
        return null;
    }
    // Get cost estimation for a request
    static estimateRequestCost(provider, inputTokens, outputTokens) {
        const config = PROVIDER_CONFIGS[provider];
        if (!config)
            return 0;
        return (inputTokens * config.pricing.inputCost) +
            (outputTokens * config.pricing.outputCost);
    }
    // Bulk import API keys
    static async bulkImportKeys(userId, keys) {
        const successful = [];
        const failed = [];
        for (const keyData of keys) {
            try {
                const apiKey = await this.addAPIKey(userId, Object.assign(Object.assign({}, keyData), { provider: keyData.provider }));
                successful.push(apiKey);
            }
            catch (error) {
                failed.push({
                    key: keyData,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return { successful, failed };
    }
}
APIKeyManager.encryptionKey = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';
/* removed duplicate re-exports to avoid conflicts */
export { APIKeySchema };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLWtleS1tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLWtleS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFDdkIsT0FBTyxNQUFNLE1BQU0sUUFBUSxDQUFBO0FBNkMzQixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzVCLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7SUFDaEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDM0UsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2YsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNuRCxlQUFlLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtRQUNqRCxhQUFhLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtLQUNoRCxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ2IsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzNCLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUM5QixDQUFDLENB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