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
      branches: 94,
      functions: 100,
      lines: 96,
      statements: 98,
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
