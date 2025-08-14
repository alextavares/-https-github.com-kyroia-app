#!/usr/bin/env npx tsx
import { config } from 'dotenv';
config();
import { aiService } from '../lib/ai/ai-service';
async function debugAIService() {
    console.log('🔍 DEBUGANDO AI SERVICE\n');
    console.log('1️⃣ Testando providers disponíveis...');
    try {
        // @ts-ignore - Acessando propriedade privada
        const providers = aiService.providers;
        console.log('   - Providers registrados:');
        for (const [name, provider] of providers) {
            console.log(`     ${name}: ${provider.isConfigured() ? '✅' : '❌'}`);
        }
    }
    catch (error) {
        console.log('   ❌ ERRO:', error.message);
    }
    console.log('\n2️⃣ Testando getProviderForModel...');
    try {
        // @ts-ignore - Acessando método privado
        const provider = aiService.getProviderForModel('mistral-7b');
        console.log('   ✅ Provider encontrado:', provider.id);
        console.log('   - Configurado:', provider.isConfigured());
    }
    catch (error) {
        console.log('   ❌ ERRO:', error.message);
    }
    console.log('\n3️⃣ Testando geração direta...');
    try {
        const response = await aiService.generateResponse([{ role: 'user', content: 'Teste rápido' }], 'mistral-7b');
        console.log('   ✅ Sucesso! Resposta:', response.content.substring(0, 50));
    }
    catch (error) {
        console.log('   ❌ ERRO:', error.message);
    }
    console.log('\n4️⃣ Testando OpenRouter Provider diretamente...');
    try {
        // @ts-ignore
        const openRouterProvider = aiService.getProvider('openrouter');
        console.log('   - Provider ID:', openRouterProvider.id);
        console.log('   - Configurado:', openRouterProvider.isConfigured());
        const response = await openRouterProvider.generateResponse([{ role: 'user', content: 'Test direto' }], 'mistral-7b');
        console.log('   ✅ Teste direto funcionou!');
    }
    catch (error) {
        console.log('   ❌ ERRO no teste direto:', error.message);
    }
}
debugAIService().catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWctYWktc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRlYnVnLWFpLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDL0IsTUFBTSxFQUFFLENBQUE7QUFFUixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFFaEQsS0FBSyxVQUFVLGNBQWM7SUFDM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO0lBRXhDLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtJQUNwRCxJQUFJLENBQUM7UUFDSCw2Q0FBNkM7UUFDN0MsTUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQTtRQUNyQyxPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUE7UUFDMUMsS0FBSyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEtBQUssUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7UUFDckUsQ0FBQztJQUNILENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxDQUFDLENBQUE7SUFDcEQsSUFBSSxDQUFDO1FBQ0gsd0NBQXdDO1FBQ3hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM1RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLFFBQVEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFDLENBQUM7SUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7SUFDL0MsSUFBSSxDQUFDO1FBQ0gsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsZ0JBQWdCLENBQy9DLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUMzQyxZQUFZLENBQ2IsQ0FBQTtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDM0UsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDMUMsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQTtJQUNoRSxJQUFJLENBQUM7UUFDSCxhQUFhO1FBQ2IsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFBO1FBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFBO1FBRW5FLE1BQU0sUUFBUSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsZ0JBQWdCLENBQ3hELENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUMxQyxZQUFZLENBQ2IsQ0FBQTtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzFELENBQUM7QUFDSCxDQUFDO0FBRUQsY0FBYyxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQSJ9