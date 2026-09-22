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
  // Floors, not targets. Set a few points under actual coverage so normal
  // churn doesn't trip CI, but a real regression does. Actual at time of
  // writing: 87.78% lines / 86.9% statements / 83.29% branches / 87.41% functions.
  //
  // The 80% branch floor is load-bearing: ForgeKit claims the OpenSSF Best
  // Practices `dynamic_analysis` criterion on the strength of "an automated
  // test suite with at least 80% branch coverage". If this floor drops below
  // 80, that claim stops being true.
  coverageThreshold: {
    global: {
      lines: 85,
      statements: 84,
      branches: 80,
      functions: 85,
    },
  },
};
