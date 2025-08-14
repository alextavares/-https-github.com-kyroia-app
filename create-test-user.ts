import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const email = 'teste@innerai.com'
    const password = 'Test@123456'
    
    console.log('🚀 Creating test user...')
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Test user already exists with email:', email)
      console.log('🔑 Use password:', password)
      return
    }

    // Create test user
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name: 'Test User',
        planType: 'FREE',
        onboardingCompleted: true,
        usageType: 'USO_PESSOAL',
        professionCategory: 'Desenvolvedor',
        organization: 'Kyroia Test',
        phone: '+5511999999999',
      }
    })

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('🆔 User ID:', user.id)
    console.log('\n🌐 Login at: https://seahorse-app-k5pag.ondigitalocean.app/auth/signin')
  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
