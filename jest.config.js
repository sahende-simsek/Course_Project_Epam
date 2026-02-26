/** Minimal Jest config for TypeScript + Node environment */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: ['/tests/e2e/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/src/auth/infra/prismaClient.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      lines: 80
    }
  }
};
