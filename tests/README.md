# Ban List Extension Tests

This directory contains comprehensive test coverage for the Ban List Chrome extension.

## Test Structure

```
tests/
├── unit/                   # Unit tests for individual modules
│   ├── background.test.js  # Service worker tests
│   ├── popup.test.js      # Popup interface tests
│   └── content.test.js    # Content script tests
├── e2e/                   # End-to-end integration tests
│   ├── extension.test.js  # Full extension functionality tests
│   ├── setup.js          # E2E test helper utilities
│   └── jest.setup.js     # E2E Jest configuration
├── setup.js              # Unit test setup and mocks
└── README.md            # This file
```

## Running Tests

### Unit Tests
```bash
npm run test:unit          # Run all unit tests
npm run test:unit -- --watch  # Run unit tests in watch mode
```

### E2E Tests
```bash
npm run test:e2e           # Run end-to-end tests
```

### All Tests
```bash
npm run test:all           # Run both unit and E2E tests
npm run test               # Run default test suite (unit tests)
npm run test:coverage      # Run tests with coverage report
```

## Test Coverage

### Unit Tests Cover:
- **Background Service Worker** (`background.js`)
  - Message handling (add/remove/get banned URLs)
  - URL validation and deduplication
  - Dynamic rule generation for different URL patterns
  - Chrome storage integration
  - Extension installation handling

- **Popup Interface** (`popup.js`)
  - UI interaction (add/remove URLs)
  - Content script fallback detection
  - Event handling (click, keypress)
  - Storage integration
  - Error handling

- **Content Script** (`content.js`)
  - In-page editor creation and styling
  - Message passing with background script
  - DOM manipulation and event handling
  - Editor visibility toggle
  - URL management interface

### E2E Tests Cover:
- **Extension Installation**
  - Extension loading and initialization
  - Service worker registration
  - Popup accessibility

- **URL Blocking Functionality**
  - Exact domain blocking
  - Subdomain blocking
  - Wildcard domain patterns
  - Blocked page display

- **User Interface**
  - Popup editor interactions
  - URL addition and removal
  - Input validation
  - Empty state handling

- **Storage Persistence**
  - Data persistence across sessions
  - Chrome storage sync integration
  - State management

- **Content Script Integration**
  - In-page editor functionality
  - Message passing between scripts
  - DOM integration

## Test Environment

### Unit Tests
- **Framework**: Jest with jsdom environment
- **Mocking**: Chrome APIs, DOM methods, storage
- **Configuration**: `jest.config.js`

### E2E Tests
- **Framework**: Jest with Puppeteer
- **Browser**: Chrome with extension loaded
- **Configuration**: `jest.e2e.config.js`
- **Timeout**: 30 seconds for extension loading

## Mock Implementation

The unit tests use comprehensive Chrome API mocks:
- `chrome.runtime.*` - Message passing and extension lifecycle
- `chrome.storage.sync.*` - Storage operations
- `chrome.declarativeNetRequest.*` - Dynamic rule management
- `chrome.tabs.*` - Tab management
- DOM methods and properties

## Test Utilities

### ExtensionTestHelper (`tests/e2e/setup.js`)
A utility class for E2E tests that provides:
- Extension loading and initialization
- Popup navigation
- Element interaction helpers
- Storage manipulation
- URL blocking verification

## Adding New Tests

### Unit Tests
1. Create test file in `tests/unit/`
2. Import the module under test
3. Use provided mocks for Chrome APIs
4. Test individual functions and edge cases

### E2E Tests
1. Add test cases to `tests/e2e/extension.test.js`
2. Use `ExtensionTestHelper` for browser automation
3. Test complete user workflows
4. Verify extension behavior in real Chrome environment

## Continuous Integration

Tests are designed to run in CI/CD environments:
- E2E tests can run headless: `headless: true` in Puppeteer config
- No external dependencies required
- Chrome/Chromium automatically installed by Puppeteer
- Coverage reports generated in `coverage/` directory

## Troubleshooting

### Common Issues
1. **E2E tests timeout**: Increase timeout in `jest.e2e.config.js`
2. **Extension not loading**: Check path resolution in `ExtensionTestHelper`
3. **Chrome API mocks**: Ensure mocks match actual Chrome API signatures
4. **DOM manipulation**: Verify jsdom environment setup for unit tests

### Debug Mode
```bash
# Run E2E tests with visible browser
npm run test:e2e -- --verbose

# Run specific test file
npm run test:unit -- background.test.js

# Run tests with coverage
npm run test:coverage
```