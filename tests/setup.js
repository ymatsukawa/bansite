// Mock Chrome APIs for testing
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onInstalled: {
      addListener: jest.fn()
    },
    sendMessage: jest.fn(),
    lastError: null
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      clear: jest.fn()
    }
  },
  declarativeNetRequest: {
    getDynamicRules: jest.fn(),
    updateDynamicRules: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  }
};

// Mock DOM methods with more complete implementation
global.document = {
  createElement: jest.fn(() => ({
    style: {},
    innerHTML: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    querySelector: jest.fn(),
    getElementById: jest.fn(),
    className: '',
    textContent: '',
    dispatchEvent: jest.fn(),
    getAttribute: jest.fn(),
    click: jest.fn(),
    tagName: 'DIV',
    id: '',
    value: ''
  })),
  getElementById: jest.fn(() => null),
  head: {
    appendChild: jest.fn()
  },
  body: {
    appendChild: jest.fn(),
    innerHTML: ''
  }
};

global.window = {
  close: jest.fn(),
  removeUrl: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  chrome.runtime.lastError = null;
});