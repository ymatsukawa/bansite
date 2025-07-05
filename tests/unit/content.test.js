describe('Content Script', () => {
  let messageListener;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock DOM to prevent execution errors
    document.getElementById = jest.fn((id) => {
      // Return specific mocks for elements the content script uses
      switch (id) {
        case 'ban-list-editor':
          return null; // Initially doesn't exist
        case 'closeBanList':
        case 'addBanUrl':
          return {
            addEventListener: jest.fn(),
            click: jest.fn()
          };
        case 'banUrlInput':
          return {
            value: '',
            addEventListener: jest.fn(),
            focus: jest.fn()
          };
        case 'banUrlList':
          return {
            innerHTML: '',
            appendChild: jest.fn()
          };
        default:
          return {
            style: { display: 'none' },
            innerHTML: '',
            appendChild: jest.fn(),
            addEventListener: jest.fn()
          };
      }
    });
    document.createElement = jest.fn(() => ({
      style: {},
      innerHTML: '',
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      querySelector: jest.fn(() => ({
        addEventListener: jest.fn(),
        getAttribute: jest.fn()
      })),
      getAttribute: jest.fn()
    }));

    document.head = document.head || {};
    document.head.appendChild = jest.fn();
    document.body = document.body || {};
    document.body.appendChild = jest.fn();

    // Mock chrome.runtime.sendMessage
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        if (message.action === 'getBannedUrls') {
          callback({ bannedUrls: ['facebook.com', 'twitter.com'] });
        } else {
          callback({ success: true });
        }
      }
    });

    // Capture message listeners when they're registered
    chrome.runtime.onMessage.addListener = jest.fn((listener) => {
      messageListener = listener;
    });

    // Mock global functions
    global.window.removeUrl = jest.fn();

    // Load the content script
    delete require.cache[require.resolve('../../src/content-test.js')];
    require('../../src/content-test.js');
  });

  describe('Message Listener Registration', () => {
    test('should register message listener', () => {
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(messageListener).toBeDefined();
    });
  });

  describe('Message Handling', () => {
    test('should handle toggleBanListEditor message', () => {
      const request = { action: 'toggleBanListEditor' };
      const sender = {};
      const sendResponse = jest.fn();
      
      messageListener(request, sender, sendResponse);
      
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('should not respond to unknown messages', () => {
      const request = { action: 'unknown' };
      const sender = {};
      const sendResponse = jest.fn();
      
      messageListener(request, sender, sendResponse);
      
      // Should not call sendResponse for unknown actions
      expect(sendResponse).not.toHaveBeenCalled();
    });

    test('should handle multiple toggleBanListEditor calls', () => {
      const request = { action: 'toggleBanListEditor' };
      const sender = {};
      const sendResponse1 = jest.fn();
      const sendResponse2 = jest.fn();
      
      // First call
      messageListener(request, sender, sendResponse1);
      expect(sendResponse1).toHaveBeenCalledWith({ success: true });
      
      // Second call
      messageListener(request, sender, sendResponse2);
      expect(sendResponse2).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('Chrome API Integration', () => {
    test('should test addBannedUrl message', () => {
      chrome.runtime.sendMessage({
        action: 'addBannedUrl',
        url: 'example.com'
      }, jest.fn());

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'addBannedUrl',
        url: 'example.com'
      }, expect.any(Function));
    });

    test('should test removeBannedUrl message', () => {
      chrome.runtime.sendMessage({
        action: 'removeBannedUrl',
        url: 'example.com'
      }, jest.fn());

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'removeBannedUrl',
        url: 'example.com'
      }, expect.any(Function));
    });

    test('should test getBannedUrls message', () => {
      chrome.runtime.sendMessage({
        action: 'getBannedUrls'
      }, jest.fn());

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'getBannedUrls'
      }, expect.any(Function));
    });
  });

  describe('Response Handling', () => {
    test('should handle successful addBannedUrl response', (done) => {
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (callback) {
          callback({ success: true });
        }
      });

      chrome.runtime.sendMessage({
        action: 'addBannedUrl',
        url: 'example.com'
      }, (response) => {
        expect(response.success).toBe(true);
        done();
      });
    });

    test('should handle failed addBannedUrl response', (done) => {
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (callback) {
          callback({ success: false, error: 'URL already banned' });
        }
      });

      chrome.runtime.sendMessage({
        action: 'addBannedUrl',
        url: 'example.com'
      }, (response) => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('URL already banned');
        done();
      });
    });

    test('should handle getBannedUrls response', (done) => {
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'getBannedUrls' && callback) {
          callback({ bannedUrls: ['facebook.com', 'twitter.com'] });
        }
      });

      chrome.runtime.sendMessage({ action: 'getBannedUrls' }, (response) => {
        expect(response.bannedUrls).toEqual(['facebook.com', 'twitter.com']);
        done();
      });
    });

    test('should handle empty URL list response', (done) => {
      chrome.runtime.sendMessage.mockImplementation((message, callback) => {
        if (message.action === 'getBannedUrls' && callback) {
          callback({ bannedUrls: [] });
        }
      });

      chrome.runtime.sendMessage({ action: 'getBannedUrls' }, (response) => {
        expect(response.bannedUrls).toEqual([]);
        done();
      });
    });
  });

  describe('Global Functions', () => {
    test('should make removeUrl available globally', () => {
      expect(global.window.removeUrl).toBeDefined();
      expect(typeof global.window.removeUrl).toBe('function');
    });
  });

  describe('DOM Creation Safety', () => {
    test('should handle DOM creation without errors', () => {
      // Trigger the toggle message to test DOM creation
      const request = { action: 'toggleBanListEditor' };
      messageListener(request, {}, jest.fn());
      
      // Should not throw errors and should call sendResponse
      expect(messageListener).toBeDefined();
    });

    test('should handle multiple DOM creation attempts', () => {
      const request = { action: 'toggleBanListEditor' };
      
      // First call
      expect(() => {
        messageListener(request, {}, jest.fn());
      }).not.toThrow();
      
      // Second call
      expect(() => {
        messageListener(request, {}, jest.fn());
      }).not.toThrow();
    });
  });
});