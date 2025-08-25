// CommonJS helper to upsert a local user for E2E/login tests
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.EMAIL || 'test@example.com'
  const name = process.env.NAME || 'Test User'
  const passwordPlain = process.env.PASSWORD || 'Test@123456'

  const password = await bcrypt.hash(passwordPlain, 12)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { name, password, onboardingCompleted: true },
    })
    console.log('Updated user:', email)
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        creditBalance: 1000,
        onboardingCompleted: true,
        planType: 'FREE',
      },
    })
    console.log('Created user:', user.email)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

