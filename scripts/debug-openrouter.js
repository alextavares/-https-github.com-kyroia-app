#!/usr/bin/env npx tsx
/**
 * Script para debugar especificamente o OpenRouter Provider
 */
import { config } from 'dotenv';
config(); // Carregar .env
import { OpenRouterProvider } from '../lib/ai/openrouter-provider';
async function debugOpenRouter() {
    console.log('🔍 DEBUGANDO OPENROUTER PROVIDER\n');
    console.log('1️⃣ Variáveis de ambiente:');
    console.log('   OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ?
        `${process.env.OPENROUTER_API_KEY.substring(0, 20)}...` : 'não definida');
    console.log('\n2️⃣ Criando provider...');
    const provider = new OpenRouterProvider();
    console.log('   - Provider ID:', provider.id);
    console.log('   - isConfigured():', provider.isConfigured());
    // Verificar internamente
    console.log('\n3️⃣ Verificação interna:');
    // @ts-ignore - Acessando propriedade privada
    console.log('   - API Key interno:', provider.apiKey ?
        `${provider.apiKey.substring(0, 20)}...` : 'vazio');
    // Testar com chave específica
    console.log('\n4️⃣ Testando com chave específica...');
    const testProvider = new OpenRouterProvider('test-key');
    console.log('   - Com chave de teste, isConfigured():', testProvider.isConfigured());
    // Verificar se consegue mapear modelos
    console.log('\n5️⃣ Testando mapeamento de modelos...');
    try {
        const models = provider.getAvailableModels();
        console.log(`   - Modelos disponíveis: ${models.length}`);
        const mistralModel = models.find(m => m.id === 'mistral-7b');
        console.log('   - Modelo mistral-7b encontrado:', !!mistralModel);
    }
    catch (error) {
        console.log('   ❌ ERRO ao buscar modelos:', error.message);
    }
    console.log('\n6️⃣ Testando geração (só se configurado):');
    if (provider.isConfigured() && process.env.OPENROUTER_API_KEY &&
        !process.env.OPENROUTER_API_KEY.includes('placeholder')) {
        try {
            console.log('   - Tentando chamada real...');
            const response = await provider.generateResponse([{ role: 'user', content: 'Hello' }], 'mistral-7b');
            console.log('   ✅ Sucesso! Resposta:', response.content.substring(0, 50));
        }
        catch (error) {
            console.log('   ❌ ERRO na geração:', error.message);
        }
    }
    else {
        console.log('   ⚠️  Provider não configurado ou chave é placeholder');
    }
}
debugOpenRouter().catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWctb3BlbnJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRlYnVnLW9wZW5yb3V0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBOztHQUVHO0FBRUgsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQSxDQUFDLGdCQUFnQjtBQUV6QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUVsRSxLQUFLLFVBQVUsZUFBZTtJQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7SUFFakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3BFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRTNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtJQUN4QyxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUE7SUFFekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsRUFBRSxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQTtJQUU1RCx5QkFBeUI7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO0lBQ3pDLDZDQUE2QztJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUVyRCw4QkFBOEI7SUFDOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO0lBQ3JELE1BQU0sWUFBWSxHQUFHLElBQUksa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQ0FBMEMsRUFBRSxZQUFZLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQTtJQUVwRix1Q0FBdUM7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0lBQ3RELElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1FBRXpELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLFlBQVksQ0FBQyxDQUFBO1FBQzVELE9BQU8sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ25FLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDNUQsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtJQUMxRCxJQUFJLFFBQVEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFrQjtRQUN6RCxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDNUQsSUFBSSxDQUFDO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFBO1lBQzVDLE1BQU0sUUFBUSxHQUFHLE1BQU0sUUFBUSxDQUFDLGdCQUFnQixDQUM5QyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFDcEMsWUFBWSxDQUNiLENBQUE7WUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQzNFLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDckQsQ0FBQztJQUNILENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsQ0FBQyxDQUFBO0lBQ3ZFLENBQUM7QUFDSCxDQUFDO0FBRUQsZUFBZSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSJ9