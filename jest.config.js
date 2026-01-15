export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!src/controllers/**',
    '!src/services/scenario.service.js',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/.vercel/',
    '/controllers/',
    '/scenario.service.js',
  ],
  testTimeout: 30000,
};
