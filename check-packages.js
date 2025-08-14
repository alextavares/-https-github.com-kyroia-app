const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkPackages() {
  try {
    console.log('Checking database for credit packages...\n')
    
    const packages = await prisma.creditPackage.findMany({
      select: {
        id: true,
        name: true,
        credits: true,
        price: true,
        currency: true,
        planType: true,
      },
      orderBy: {
        credits: 'asc'
      }
    })
    
    if (packages.length === 0) {
      console.log('❌ No packages found in database!')
      console.log('Run: node scripts/dev/seed-credit-packages.js')
    } else {
      console.log(`✅ Found ${packages.length} packages:\n`)
      packages.forEach(pkg => {
        console.log(`ID: ${pkg.id}`)
        console.log(`Name: ${pkg.name}`)
        console.log(`Credits: ${pkg.credits}`)
        console.log(`Price: R$ ${pkg.price}`)
        console.log(`Plan Type: ${pkg.planType || 'N/A'}`)
        console.log('---')
      })
      
      console.log('\n📋 Test URLs:')
      packages.forEach(pkg => {
        console.log(`http://localhost:3000/dashboard/credits/purchase/${pkg.id}`)
      })
    }
  } catch (error) {
    console.error('Error:', error.message)
    console.log('\n💡 Hint: Make sure Prisma is configured for your environment')
  } finally {
    await prisma.$disconnect()
  }
}

checkPackages()