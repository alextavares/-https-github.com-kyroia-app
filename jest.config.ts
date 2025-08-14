import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  clearMocks: true,
  restoreMocks: true,
  verbose: true,
  // Silencia warnings de ESM de next/edge em ambiente de testes Node
  transformIgnorePatterns: ['/node_modules/'],
}

export default config