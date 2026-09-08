import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding tokens...')
  
  const tokens = []
  for (let i = 0; i < 10; i++) {
    // Generate a random 6-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    tokens.push({ code })
  }
  
  await prisma.token.createMany({
    data: tokens,
    skipDuplicates: true
  })
  
  console.log('Created the following tokens for testing:')
  tokens.forEach(t => console.log(`- ${t.code}`))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
