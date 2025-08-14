"use strict";
// Script para verificar modelos disponíveis no OpenRouter
async function checkOpenRouterModels() {
    console.log('🔍 Verificando modelos disponíveis no OpenRouter...\n');
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();
        // Modelos que queremos verificar
        const targetModels = [
            'gpt-4o',
            'claude-3.5',
            'gemini',
            'grok',
            'perplexity',
            'llama-3',
            'qwen',
            'mistral-large'
        ];
        console.log('📊 Total de modelos disponíveis:', data.data.length);
        console.log('\n🎯 Modelos relevantes encontrados:\n');
        const relevantModels = data.data.filter((model) => targetModels.some(target => model.id.toLowerCase().includes(target)));
        // Organizar por categoria
        const categories = {
            'OpenAI': [],
            'Anthropic': [],
            'Google': [],
            'xAI': [],
            'Perplexity': [],
            'Meta': [],
            'Outros': []
        };
        relevantModels.forEach((model) => {
            const modelInfo = {
                id: model.id,
                name: model.name,
                contextLength: model.context_length,
                pricing: model.pricing
            };
            if (model.id.includes('openai/'))
                categories['OpenAI'].push(modelInfo);
            else if (model.id.includes('anthropic/'))
                categories['Anthropic'].push(modelInfo);
            else if (model.id.includes('google/'))
                categories['Google'].push(modelInfo);
            else if (model.id.includes('x-ai/'))
                categories['xAI'].push(modelInfo);
            else if (model.id.includes('perplexity/'))
                categories['Perplexity'].push(modelInfo);
            else if (model.id.includes('meta-llama/'))
                categories['Meta'].push(modelInfo);
            else
                categories['Outros'].push(modelInfo);
        });
        // Exibir resultados organizados
        Object.entries(categories).forEach(([category, models]) => {
            if (models.length > 0) {
                console.log(`\n### ${category}`);
                models.forEach(model => {
                    console.log(`- ${model.name}`);
                    console.log(`  ID: ${model.id}`);
                    console.log(`  Context: ${model.contextLength} tokens`);
                    if (model.pricing) {
                        console.log(`  Custo: $${model.pricing.prompt}/1k prompt, $${model.pricing.completion}/1k completion`);
                    }
                });
            }
        });
        // Salvar em arquivo JSON
        const output = {
            timestamp: new Date().toISOString(),
            totalModels: data.data.length,
            relevantModels: categories
        };
        await Bun.write('./openrouter-models-available.json', JSON.stringify(output, null, 2));
        console.log('\n✅ Resultado salvo em openrouter-models-available.json');
    }
    catch (error) {
        console.error('❌ Erro ao buscar modelos:', error);
    }
}
checkOpenRouterModels();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stb3BlbnJvdXRlci1tb2RlbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGVjay1vcGVucm91dGVyLW1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMERBQTBEO0FBQzFELEtBQUssVUFBVSxxQkFBcUI7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO0lBRXJFLElBQUksQ0FBQztRQUNILE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxJQUFJLEdBQUcsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFbkMsaUNBQWlDO1FBQ2pDLE1BQU0sWUFBWSxHQUFHO1lBQ25CLFFBQVE7WUFDUixZQUFZO1lBQ1osUUFBUTtZQUNSLE1BQU07WUFDTixZQUFZO1lBQ1osU0FBUztZQUNULE1BQU07WUFDTixlQUFlO1NBQ2hCLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBRXRELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FDckQsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQ3JFLENBQUM7UUFFRiwwQkFBMEI7UUFDMUIsTUFBTSxVQUFVLEdBQTBCO1lBQ3hDLFFBQVEsRUFBRSxFQUFFO1lBQ1osV0FBVyxFQUFFLEVBQUU7WUFDZixRQUFRLEVBQUUsRUFBRTtZQUNaLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLEVBQUU7WUFDaEIsTUFB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