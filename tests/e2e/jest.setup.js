// E2E test setup
const path = require('path');

// Set longer timeout for E2E tests
jest.setTimeout(30000);

// Global setup for all E2E tests
beforeAll(() => {
  // Ensure we're using absolute paths
  process.env.EXTENSION_PATH = path.resolve(__dirname, '../../src');
});