#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding credit packages...');

  const packages = [
    {
      name: 'Pacote Básico',
      credits: 5000,
      price: 19.90,
      currency: 'BRL',
      planType: 'basic'
    },
    {
      name: 'Pacote Popular',
      credits: 10000,
      price: 34.90,
      currency: 'BRL',
      planType: 'popular'
    },
    {
      name: 'Pacote Premium',
      credits: 20000,
      price: 59.90,
      currency: 'BRL',
      planType: 'premium'
    }
  ];

  for (const pkg of packages) {
    const created = await prisma.creditPackage.create({
      data: pkg
    });
    console.log(`✅ Created package: ${created.name} (ID: ${created.id})`);
  }

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });