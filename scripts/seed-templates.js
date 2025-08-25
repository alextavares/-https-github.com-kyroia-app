const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const userEmail = process.env.SEED_USER || 'pro.user@example.com'
  const user = await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, email: true } })
  if (!user) {
    throw new Error(`User not found: ${userEmail}. Crie um usuário antes de semear templates.`)
  }

  const templates = [
    {
      name: 'Email Marketing Curto',
      description: 'Campanha simples para divulgar um produto',
      category: 'MARKETING',
      templateContent: 'Escreva um email curto anunciando {produto} para {publico}. Tom: {tom}.',
      variables: JSON.stringify(['produto','publico','tom']),
      tags: JSON.stringify(['marketing','email']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Análise de Código Rápida',
      description: 'Checklist de análise focada em bugs e melhorias',
      category: 'ENGENHARIA',
      templateContent: 'Analise o código abaixo e identifique 3 melhorias. Linguagem: {linguagem}. Código: {codigo}.',
      variables: JSON.stringify(['linguagem','codigo']),
      tags: JSON.stringify(['engenharia','codigo']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Pitch de Produto',
      description: 'Pitch curto de produto para vendas',
      category: 'VENDAS',
      templateContent: 'Crie um pitch de 5 frases para {produto} voltado a {segmento}, destacando {beneficio}.',
      variables: JSON.stringify(['produto','segmento','beneficio']),
      tags: JSON.stringify(['vendas','pitch']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Post para Instagram',
      description: 'Legenda curta para post com CTA',
      category: 'MARKETING',
      templateContent: 'Escreva uma legenda para Instagram promovendo {produto} para {publico}, com CTA para {acao}. Tom: {tom}.',
      variables: JSON.stringify(['produto','publico','acao','tom']),
      tags: JSON.stringify(['marketing','social']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Resumo Executivo',
      description: 'Resumo de proposta de projeto',
      category: 'VENDAS',
      templateContent: 'Resuma a proposta para {cliente} em 5 pontos: problema, solução, benefícios, prazo, investimento.',
      variables: JSON.stringify(['cliente']),
      tags: JSON.stringify(['resumo','executivo']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Briefing de Projeto',
      description: 'Perguntas chave para entender o projeto',
      category: 'OPERACOES',
      templateContent: 'Monte um briefing com perguntas para escopo de {tipo_projeto} do cliente {cliente}.',
      variables: JSON.stringify(['tipo_projeto','cliente']),
      tags: JSON.stringify(['briefing']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Política de Privacidade',
      description: 'Rascunho de política de privacidade',
      category: 'JURIDICO',
      templateContent: 'Crie uma política de privacidade para {empresa} considerando LGPD. Inclua: dados coletados, base legal, direitos do titular.',
      variables: JSON.stringify(['empresa']),
      tags: JSON.stringify(['juridico','lgpd']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Descrição de Produto (E-commerce)',
      description: 'Descrição otimizada para SEO',
      category: 'MARKETING',
      templateContent: 'Descreva o produto {produto} destacando {beneficios} e diferenciais para o público {publico}.',
      variables: JSON.stringify(['produto','beneficios','publico']),
      tags: JSON.stringify(['seo','ecommerce']),
      isPublic: true,
      createdBy: user.id,
    },
    {
      name: 'Roadmap Técnico Simplificado',
      description: 'Roadmap de entregas técnicas em alto nível',
      category: 'ENGENHARIA',
      templateContent: 'Monte um roadmap técnico para {projeto} em 3 fases com entregáveis e riscos.',
      variables: JSON.stringify(['projeto']),
      tags: JSON.stringify(['engenharia','roadmap']),
      isPublic: true,
      createdBy: user.id,
    }
  ]

  for (const t of templates) {
    const existing = await prisma.promptTemplate.findFirst({ where: { name: t.name, createdBy: t.createdBy } })
    if (!existing) {
      await prisma.promptTemplate.create({ data: t })
      console.log('✅ Template criado:', t.name)
    } else {
      console.log('⏭️  Template já existe:', t.name)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) }).finally(async()=>{ await prisma.$disconnect() })
