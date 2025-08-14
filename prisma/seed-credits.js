import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function seedCredits() {
    console.log('🌱 Seeding credit system...');
    // Create credit packages based on InnerAI reference
    const packages = [
        {
            name: '5.000 créditos',
            credits: 5000,
            price: 59.00,
            currency: 'BRL',
            discountPercent: null
        },
        {
            name: '10.000 créditos',
            credits: 10000,
            price: 99.00,
            currency: 'BRL',
            discountPercent: 15
        },
        {
            name: '20.000 créditos',
            credits: 20000,
            price: 159.00,
            currency: 'BRL',
            discountPercent: 30
        }
    ];
    // Upsert credit packages
    for (const pkg of packages) {
        await prisma.creditPackage.upsert({
            where: { name: pkg.name },
            update: pkg,
            create: pkg
        });
    }
    // Update AI models with credit costs (based on InnerAI usage patterns)
    const modelUpdates = [
        {
            name: 'gpt-4o-mini',
            creditsPerInputToken: 1,
            creditsPerOutputToken: 2
        },
        {
            name: 'gpt-4o',
            creditsPerInputToken: 5,
            creditsPerOutputToken: 10
        },
        {
            name: 'claude-3-haiku-20240307',
            creditsPerInputToken: 1,
            creditsPerOutputToken: 3
        },
        {
            name: 'claude-3-5-sonnet-20241022',
            creditsPerInputToken: 8,
            creditsPerOutputToken: 15
        }
    ];
    for (const update of modelUpdates) {
        await prisma.aIModel.updateMany({
            where: { name: update.name },
            data: {
                creditsPerInputToken: update.creditsPerInputToken,
                creditsPerOutputToken: update.creditsPerOutputToken
            }
        });
    }
    // Create/update tools with credit costs (based on InnerAI reference)
    const toolUpdates = [
        {
            name: 'Geração de Imagens',
            type: 'IMAGE_GENERATION',
            creditsPerUse: 135,
            costPerUse: 0.10
        },
        {
            name: 'Transcrição de Vídeo',
            type: 'TRANSCRIPTION',
            creditsPerUse: 80,
            costPerUse: 0.05
        },
        {
            name: 'Modo de Voz da IA',
            type: 'VOICE_GENERATION',
            creditsPerUse: 50,
            costPerUse: 0.03
        },
        {
            name: 'Efeitos Sonoros',
            type: 'SOUND_EFFECTS',
            creditsPerUse: 30,
            costPerUse: 0.02
        }
    ];
    for (const tool of toolUpdates) {
        await prisma.tool.upsert({
            where: { name: tool.name },
            update: {
                creditsPerUse: tool.creditsPerUse,
                costPerUse: tool.costPerUse
            },
            create: {
                name: tool.name,
                type: tool.type,
                creditsPerUse: tool.creditsPerUse,
                costPerUse: tool.costPerUse,
                planRequired: 'FREE'
            }
        });
    }
    // Give initial credits to existing users (migration bonus)
    const users = await prisma.user.findMany({
        where: { creditBalance: 0 },
        select: { id: true }
    });
    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { creditBalance: 500 } // Initial bonus credits
        });
        await prisma.creditTransaction.create({
            data: {
                userId: user.id,
                type: 'BONUS',
                amount: 500,
                description: 'Bônus de migração - créditos iniciais',
                balanceBefore: 0,
                balanceAfter: 500
            }
        });
    }
    console.log('✅ Credit system seeded successfully!');
}
seedCredits()
    .catch((e) => {
    console.error('❌ Error seeding credits:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC1jcmVkaXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VlZC1jcmVkaXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUU3QyxNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFBO0FBRWpDLEtBQUssVUFBVSxXQUFXO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtJQUUxQyxvREFBb0Q7SUFDcEQsTUFBTSxRQUFRLEdBQUc7UUFDZjtZQUNFLElBQUksRUFBRSxnQkFBZ0I7WUFDdEIsT0FBTyxFQUFFLElBQUk7WUFDYixLQUFLLEVBQUUsS0FBSztZQUNaLFFBQVEsRUFBRSxLQUFLO1lBQ2YsZUFBZSxFQUFFLElBQUk7U0FDdEI7UUFDRDtZQUNFLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSztZQUNaLFFBQVEsRUFBRSxLQUFLO1lBQ2YsZUFBZSxFQUFFLEVBQUU7U0FDcEI7UUFDRDtZQUNFLElBQUksRUFBRSxpQkFBaUI7WUFDdkIsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsTUFBTTtZQUNiLFFBQVEsRUFBRSxLQUFLO1lBQ2YsZUFBZSxFQUFFLEVBQUU7U0FDcEI7S0FDRixDQUFBO0lBRUQseUJBQXlCO0lBQ3pCLEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDM0IsTUFBTSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztZQUNoQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRTtZQUN6QixNQUFNLEVBQUUsR0FBRztZQUNYLE1BQU0sRUFBRSxHQUFHO1NBQ1osQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVELHVFQUF1RTtJQUN2RSxNQUFNLFlBQVksR0FBRztRQUNuQjtZQUNFLElBQUks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