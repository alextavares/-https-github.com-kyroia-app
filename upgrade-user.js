const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function upgradeUser() {
  try {
    console.log('🔍 Buscando usuários no sistema...')
    
    // Buscar todos os usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        planType: true,
        creditBalance: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('\n📋 Usuários encontrados:')
    console.log('================================================')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email || 'Sem email'}`)
      console.log(`   Nome: ${user.name || 'Sem nome'}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Plano: ${user.planType}`)
      console.log(`   Créditos: ${user.creditBalance || 0}`)
      console.log(`   Criado: ${user.createdAt.toLocaleString('pt-BR')}`)
      console.log('   ----------------------------------------')
    })

    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado!')
      return
    }

    // Pegar o usuário mais recente (provavelmente o de teste)
    const targetUser = users[0]
    console.log(`\n🎯 Fazendo upgrade do usuário: ${targetUser.email || targetUser.name}`)
    console.log(`   Plano atual: ${targetUser.planType}`)
    console.log(`   Créditos atuais: ${targetUser.creditBalance || 0}`)

    // Fazer upgrade para PRO e adicionar créditos
    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        planType: 'PRO',
        creditBalance: 10000 // 10k créditos para teste
      }
    })

    // Registrar transação de créditos
    await prisma.creditTransaction.create({
      data: {
        userId: targetUser.id,
        type: 'PURCHASE',
        amount: 10000,
        description: 'Créditos de teste - Upgrade para PRO'
      }
    })

    console.log('\n✅ Upgrade realizado com sucesso!')
    console.log(`   Novo plano: ${updatedUser.planType}`)
    console.log(`   Novos créditos: ${updatedUser.creditBalance}`)

    console.log('\n🎮 Modelos agora disponíveis para PRO:')
    console.log('   Fast Models:')
    console.log('   - gpt-3.5-turbo, gpt-4o-mini')
    console.log('   - claude-3-haiku, claude-3.5-haiku')
    console.log('   - gemini-2-flash, gemini-2-flash-free')
    console.log('   - mistral-7b, llama-2-13b, llama-3.3-70b')
    console.log('   - deepseek-r1, grok-3-mini, perplexity-sonar')
    console.log('   - qwen-qwq, qwen-2.5-coder')
    
    console.log('\n   Advanced Models:')
    console.log('   - gpt-4, gpt-4-turbo, gpt-4o')
    console.log('   - claude-3-sonnet, claude-3.5-sonnet')
    console.log('   - gemini-pro, gemini-2-pro')
    console.log('   - mixtral-8x7b, mistral-large-2')
    console.log('   - llama-2-70b, llama-3.1-405b')
    console.log('   - grok-3, grok-2-vision')
    console.log('   - perplexity-sonar-pro, perplexity-reasoning')
    console.log('   - qwen-2.5-72b')

    console.log('\n🔥 Agora você pode testar modelos premium no chat!')
    console.log('   Acesse: http://localhost:3025/dashboard')

  } catch (error) {
    console.error('❌ Erro ao fazer upgrade:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upgradeUser()