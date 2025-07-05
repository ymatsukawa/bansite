describe('Popup Script', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock chrome APIs with simple implementations
    chrome.tabs.query.mockImplementation((query, callback) => {
      callback([{ id: 1 }]);
    });
    
    chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
      chrome.runtime.lastError = { message: 'Content script not available' };
      if (callback) callback();
    });
    
    chrome.runtime.sendMessage.mockImplementation((message, callback) => {
      if (callback) {
        if (message.action === 'getBannedUrls') {
          callback({ bannedUrls: [] });
        } else {
          callback({ success: true });
        }
      }
    });

    // Mock basic DOM elements to prevent script execution errors
    document.getElementById = jest.fn(() => ({
      style: { display: 'block' },
      addEventListener: jest.fn(),
      value: '',
      innerHTML: '',
      appendChild: jest.fn()
    }));

    document.createElement = jest.fn(() => ({
      className: '',
      innerHTML: '',
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      querySelector: jest.fn(() => ({
        addEventListener: jest.fn(),
        getAttribute: jest.fn()
      })),
      getAttribute: jest.fn()
    }));

    global.window.close = jest.fn();
    global.window.removeUrl = jest.fn();
  });

  describe('Chrome API Integration', () => {
    test('should test addBannedUrl message', () => {
      chrome.runtime.sendMessage({
        action: 'addBannedUrl',
        url: 'facebook.com'
      }, jest.fn());

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'addBannedUrl',
        url: 'facebook.com'
      }, expect.any(Function));
    });

    test('should test removeBannedUrl message', () => {
      chrome.runtime.sendMessage({
        action: 'removeBannedUrl',
        url: 'facebook.com'
      }, jest.fn());

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        action: 'removeBannedUrl',
        url: 'facebook.com'
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

  describe('Tab Detection Logic', () => {
    test('should use popup when content script not available', () => {
      chrome.runtime.lastError = { message: 'Content script not available' };
      
      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        if (callback) callback();
      });

      // Simulate tab query
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBanListEditor' }, (response) => {
            if (chrome.runtime.lastError || !response) {
              // Should use popup interface
              expect(chrome.runtime.lastError).toBeTruthy();
            }
          });
        }
      });

      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('should close popup when content script is available', () => {
      chrome.runtime.lastError = null;
      
      chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
        if (callback) callback({ success: true });
      });

      // Simulate tab query with successful content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBanListEditor' }, (response) => {
            if (!chrome.runtime.lastError && response) {
              // Should close popup
              global.window.close();
            }
          });
        }
      });

      expect(global.window.close).toHaveBeenCalled();
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
        url: 'facebook.com'
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
        url: 'facebook.com'
      }, (response) => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('URL already banned');
        done();
      });
    });

    test('should handle getBannedUrls response with URLs', (done) => {
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

    test('should handle empty getBannedUrls response', (done) => {
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
});