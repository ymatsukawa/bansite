module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.js',
    '<rootDir>/tests/e2e/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/jest.setup.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'tests/e2e/**/*.js',
    '!tests/e2e/jest.setup.js'
  ],
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html']
};