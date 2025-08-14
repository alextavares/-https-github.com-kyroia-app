#!/usr/bin/env node
import { aiService } from '../lib/ai/ai-service';
import { PLAN_LIMITS, getModelType } from '../lib/usage-limits';
console.log('🔍 Verificando Modelos na UI');
console.log('============================\n');
// Verificar modelos por plano
const plans = ['FREE', 'PRO', 'ENTERPRISE'];
for (const plan of plans) {
    console.log(`\n📋 Plano ${plan}:`);
    console.log('-------------------');
    const models = aiService.getModelsForPlan(plan);
    const limits = PLAN_LIMITS[plan];
    console.log(`Total de modelos: ${models.length}`);
    console.log(`Modelos rápidos: ${limits.modelsAllowed.fast.length}`);
    console.log(`Modelos avançados: ${limits.modelsAllowed.advanced.length}`);
    // Listar alguns modelos de exemplo
    console.log('\nExemplos de modelos disponíveis:');
    const fastExamples = models.filter(m => limits.modelsAllowed.fast.includes(m.id)).slice(0, 3);
    const advancedExamples = models.filter(m => limits.modelsAllowed.advanced.includes(m.id)).slice(0, 3);
    if (fastExamples.length > 0) {
        console.log('\n  🚀 Modelos Rápidos:');
        fastExamples.forEach(m => {
            console.log(`     - ${m.name} (${m.id})`);
        });
    }
    if (advancedExamples.length > 0) {
        console.log('\n  💎 Modelos Avançados:');
        advancedExamples.forEach(m => {
            console.log(`     - ${m.name} (${m.id})`);
        });
    }
}
// Verificar categorização
console.log('\n\n🏷️  Verificando Categorização de Modelos:');
console.log('=========================================');
const testModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3.5-sonnet',
    'claude-3.5-haiku',
    'deepseek-r1',
    'gemini-2-flash-free',
    'grok-3',
    'perplexity-sonar-pro'
];
for (const modelId of testModels) {
    const type = getModelType(modelId);
    const emoji = type === 'fast' ? '🚀' : type === 'advanced' ? '💎' : '❓';
    console.log(`${emoji} ${modelId}: ${type || 'não categorizado'}`);
}
// Verificar novos modelos
console.log('\n\n✨ Novos Modelos Implementados:');
console.log('================================');
const newModels = [
    'gpt-4o',
    'gpt-4o-mini',
    'claude-3.5-sonnet',
    'claude-3.5-haiku',
    'gemini-2-flash',
    'gemini-2-pro',
    'gemini-2-flash-free',
    'grok-3',
    'grok-3-mini',
    'grok-2-vision',
    'perplexity-sonar',
    'perplexity-sonar-pro',
    'perplexity-reasoning',
    'llama-3.3-70b',
    'llama-3.1-405b',
    'llama-3.2-90b-vision',
    'qwq-32b',
    'qwen-2.5-72b',
    'qwen-2.5-coder',
    'mistral-large-2'
];
const allModels = aiService.getAllAvailableModels();
let foundCount = 0;
for (const modelId of newModels) {
    const model = allModels.find(m => m.id === modelId);
    if (model) {
        console.log(`✅ ${model.name} (${modelId})`);
        foundCount++;
    }
    else {
        console.log(`❌ ${modelId} - NÃO ENCONTRADO`);
    }
}
console.log(`\n📊 Total: ${foundCount}/${newModels.length} modelos encontrados`);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyaWZ5LW1vZGVsLXVpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidmVyaWZ5LW1vZGVsLXVpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDaEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUUvRCxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUE7QUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTdDLDhCQUE4QjtBQUM5QixNQUFNLEtBQUssR0FBRyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsWUFBWSxDQUFVLENBQUE7QUFFcEQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQUMsQ0FBQTtJQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUE7SUFFbEMsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFBO0lBQy9DLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVoQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ25FLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFFekUsbUNBQW1DO0lBQ25DLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQTtJQUVqRCxN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