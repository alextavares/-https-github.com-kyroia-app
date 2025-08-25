module.exports = {
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userUsage: {
      findFirst: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    conversation: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    message: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    usage: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}

