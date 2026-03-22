module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/commands/**',   // commands are covered by smoke/integration tests
  ],
  coverageThreshold: {
    global: {
      lines: 38,
      functions: 33,
      branches: 30,
    },
  },
};
