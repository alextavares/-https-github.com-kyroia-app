import { prisma } from '../lib/prisma';
async function fixModelsDatabase() {
    console.log('🔍 Verificando e corrigindo modelos no banco de dados...\n');
    try {
        // 1. Verificar modelos existentes no banco
        console.log('1. Verificando modelos existentes no banco...');
        const existingModels = await prisma.aIModel.findMany({
            select: { id: true, name: true, provider: true }
        });
        console.log(`✅ Modelos no banco: ${existingModels.length}`);
        if (existingModels.length > 0) {
            existingModels.forEach(model => {
                console.log(`   - ${model.id} (${model.name}) - ${model.provider}`);
            });
        }
        else {
            console.log('❌ Nenhum modelo encontrado no banco!');
        }
        // 2. Listar modelos que a aplicação está tentando usar
        console.log('\n2. Modelos que a aplicação tenta usar:');
        const frontendModels = [
            'mistral-7b', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo',
            'gpt-4.1', 'gpt-4o', 'claude-3-opus', 'claude-3-sonnet',
            'claude-4-sonnet', 'gemini-pro', 'sabia-3.1'
        ];
        frontendModels.forEach(modelId => {
            const exists = existingModels.some(m => m.id === modelId);
            console.log(`   ${exists ? '✅' : '❌'} ${modelId}`);
        });
        // 3. Verificar conversas que falharam
        console.log('\n3. Verificando conversas problemáticas...');
        const conversationsWithNullModel = await prisma.conversation.findMany({
            where: {
                OR: [
                    { modelUsed: null },
                    { modelUsed: { notIn: existingModels.map(m => m.id) } }
                ]
            },
            select: { id: true, modelUsed: true, createdAt: true }
        });
        console.log(`⚠️  Conversas com modelos inválidos: ${conversationsWithNullModel.length}`);
        // 4. Criar modelos básicos necessários
        console.log('\n4. Criando modelos básicos necessários...');
        const basicModels = [
            {
                id: 'mistral-7b',
                name: 'Mistral 7B',
                provider: 'OPENROUTER',
                maxContextLength: 8192,
                costPerInputToken: 0.00000006,
                costPerOutputToken: 0.00000006,
                planRequired: 'FREE'
            },
            {
                id: 'gpt-4o',
                name: 'GPT-4o',
                provider: 'OPENROUTER',
                maxContextLength: 128000,
                costPerInputToken: 0.0000025,
                costPerOutputToken: 0.00001,
                planRequired: 'PRO'
            },
            {
                id: 'claude-3-sonnet',
                name: 'Claude 3 Sonnet',
                provider: 'OPENROUTER',
                maxContextLength: 200000,
                costPerInputToken: 0.000003,
                costPerOutputToken: 0.000015,
                planRequired: 'PRO'
            },
            {
                id: 'claude-4-sonnet',
                name: 'Claude 4 Sonnet',
                provider: 'OPENROUTER',
                maxContextLength: 200000,
                costPerInputToken: 0.000003,
                costPerOutputToken: 0.000015,
                planRequired: 'PRO'
            },
            {
                id: 'sabia-3.1',
                name: 'Sabiá 3.1',
                provider: 'OPENROUTER',
                maxContextLength: 32768,
                costPerInputToken: 0.000002,
                costPerOutputToken: 0.000008,
                planRequired: 'FREE'
            },
            {
                id: 'gemini-2.5-pro',
                name: 'Gemini 2.5 Pro',
                provider: 'OPENROUTER',
                maxContextLength: 1048576,
                costPerInputToken: 0.00000125,
                costPerOutputToken: 0.00001,
                planRequired: 'PRO'
            },
            {
                id: 'grok-3',
                name: 'Grok 3',
                provider: 'OPENROUTER',
                maxContextLength: 131072,
                costPerInputToken: 0.000003,
                costPerOutputToken: 0.000015,
                planRequired: 'PRO'
            }
        ];
        let createdCount = 0;
        for (const model of basicModels) {
            try {
                const existing = await prisma.aIModel.findUnique({
                    where: { id: model.id }
                });
                if (!existing) {
                    await prisma.aIModel.create({
                        data: model
                    });
                    console.log(`✅ Criado: ${model.id}`);
                    createdCount++;
                }
                else {
                    console.log(`ℹ️  Já existe: ${model.id}`);
                }
            }
            catch (error) {
                console.error(`❌ Erro ao criar ${model.id}:`, error.message);
            }
        }
        console.log(`\n🎉 Criados ${createdCount} novos modelos`);
        // 5. Verificar estado final
        console.log('\n5. Estado final do banco...');
        const finalModels = await prisma.aIModel.findMany({
            select: { id: true, name: true, provider: true }
        });
        console.log(`✅ Total de modelos: ${finalModels.length}`);
        // 6. Corrigir conversas problemáticas
        console.log('\n6. Corrigindo conversas problemáticas...');
        if (conversationsWithNullModel.length > 0) {
            const defaultModel = 'mistral-7b'; // Usar modelo padrão
            const updateResult = await prisma.conversation.updateMany({
                where: {
                    OR: [
                        { modelUsed: null },
                        { modelUsed: { notIn: finalModels.map(m => m.id) } }
                    ]
                },
                data: { modelUsed: defaultModel }
            });
            console.log(`✅ Corrigidas ${updateResult.count} conversas com modelo padrão`);
        }
        console.log('\n🎉 CORREÇÃO CONCLUÍDA!');
        console.log('💡 Agora o chat deve funcionar sem erros de foreign key');
    }
    catch (error) {
        console.error('❌ Erro durante a correção:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    fixModelsDatabase();
}
export { fixModelsDatabase };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4LW1vZGVscy1kYXRhYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImZpeC1tb2RlbHMtZGF0YWJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUV0QyxLQUFLLFVBQVUsaUJBQWlCO0lBQzlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNERBQTRELENBQUMsQ0FBQTtJQUV6RSxJQUFJLENBQUM7UUFDSCwyQ0FBMkM7UUFDM0MsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFBO1FBQzVELE1BQU0sY0FBYyxHQUFHLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7WUFDbkQsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7U0FDakQsQ0FBQyxDQUFBO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDM0QsSUFBSSxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzlCLGNBQWMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7WUFDckUsQ0FBQyxDQUFDLENBQUE7UUFDSixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0NBQXNDLENBQUMsQ0FBQTtRQUNyRCxDQUFDO1FBRUQsdURBQXVEO1FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsMENBQTBDLENBQUMsQ0FBQTtRQUN2RCxNQUFNLGNBQWMsR0FBRztZQUNyQixZQUFZLEVBQUUsZUFBZSxFQUFFLE9B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