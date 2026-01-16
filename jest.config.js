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
    '!src/prompts/**',
    '!src/agents/**',
    '!src/services/ai-service.js',
  ],
  coverageThreshold: {
    global: {
      branches: 87,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/.vercel/',
    '/controllers/',
    '/prompts/',
    '/agents/',
    'ai-service.js',
  ],
  testTimeout: 30000,
};
