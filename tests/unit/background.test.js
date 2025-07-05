describe('Background Service Worker', () => {
  let messageListener;
  let installedListener;
  
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock chrome.storage.sync.get to return empty banned URLs by default
    chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({ bannedUrls: [] });
    });
    
    // Mock chrome.storage.sync.set to succeed
    chrome.storage.sync.set.mockImplementation((data, callback) => {
      if (callback) callback();
    });
    
    // Mock chrome.declarativeNetRequest.getDynamicRules
    chrome.declarativeNetRequest.getDynamicRules.mockImplementation((callback) => {
      callback([]);
    });
    
    // Mock chrome.declarativeNetRequest.updateDynamicRules
    chrome.declarativeNetRequest.updateDynamicRules.mockImplementation((rules, callback) => {
      if (callback) callback();
    });
    
    // Capture listeners when they're registered
    chrome.runtime.onMessage.addListener = jest.fn((listener) => {
      messageListener = listener;
    });
    
    chrome.runtime.onInstalled.addListener = jest.fn((listener) => {
      installedListener = listener;
    });
    
    // Load the background script which will register listeners
    delete require.cache[require.resolve('../../src/background-test.js')];
    require('../../src/background-test.js');
  });

  describe('Message Handling', () => {
    test('should handle addBannedUrl message', (done) => {
      const request = { action: 'addBannedUrl', url: 'facebook.com' };
      const sender = {};
      const sendResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          { bannedUrls: ['facebook.com'] },
          expect.any(Function)
        );
        done();
      });

      const result = messageListener(request, sender, sendResponse);
      expect(result).toBe(true);
    });

    test('should handle removeBannedUrl message', (done) => {
      // Setup storage with existing URL
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['facebook.com', 'twitter.com'] });
      });

      const request = { action: 'removeBannedUrl', url: 'facebook.com' };
      const sender = {};
      const sendResponse = jest.fn((response) => {
        expect(response.success).toBe(true);
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          { bannedUrls: ['twitter.com'] },
          expect.any(Function)
        );
        done();
      });

      const result = messageListener(request, sender, sendResponse);
      expect(result).toBe(true);
    });

    test('should handle getBannedUrls message', (done) => {
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['facebook.com', 'twitter.com'] });
      });

      const request = { action: 'getBannedUrls' };
      const sender = {};
      const sendResponse = jest.fn((response) => {
        expect(response.bannedUrls).toEqual(['facebook.com', 'twitter.com']);
        done();
      });

      const result = messageListener(request, sender, sendResponse);
      expect(result).toBe(true);
    });

    test('should handle updateRules message', () => {
      const request = { action: 'updateRules' };
      const sender = {};
      const sendResponse = jest.fn();

      messageListener(request, sender, sendResponse);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith('bannedUrls', expect.any(Function));
    });
  });

  describe('URL Management', () => {
    test('should not add duplicate URLs', (done) => {
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['facebook.com'] });
      });

      const request = { action: 'addBannedUrl', url: 'facebook.com' };
      const sender = {};
      const sendResponse = jest.fn((response) => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('URL already banned');
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        done();
      });

      messageListener(request, sender, sendResponse);
    });

    test('should handle removing non-existent URL', (done) => {
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['facebook.com'] });
      });

      const request = { action: 'removeBannedUrl', url: 'twitter.com' };
      const sender = {};
      const sendResponse = jest.fn((response) => {
        expect(response.success).toBe(false);
        expect(response.error).toBe('URL not found');
        expect(chrome.storage.sync.set).not.toHaveBeenCalled();
        done();
      });

      messageListener(request, sender, sendResponse);
    });
  });

  describe('Rule Generation', () => {
    test('should generate correct rules for exact domain', () => {
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['facebook.com'] });
      });

      const request = { action: 'updateRules' };
      messageListener(request, {}, jest.fn());

      // Wait for async operations to complete
      setTimeout(() => {
        expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
          {
            removeRuleIds: [],
            addRules: expect.arrayContaining([
              expect.objectContaining({
                condition: {
                  urlFilter: '*://facebook.com/*',
                  resourceTypes: ['main_frame']
                }
              })
            ])
          },
          expect.any(Function)
        );
      }, 0);
    });

    test('should generate correct rules for wildcard domain', () => {
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ bannedUrls: ['*.facebook.com'] });
      });

      const request = { action: 'updateRules' };
      messageListener(request, {}, jest.fn());

      setTimeout(() => {
        expect(chrome.declarativeNetRequest.updateDynamicRules).toHaveBeenCalledWith(
          {
            removeRuleIds: [],
            addRules: expect.arrayContaining([
              expect.objectContaining({
                condition: {
                  urlFilter: '*://*.facebook.com/*',
                  resourceTypes: ['main_frame']
                }
              })
            ])
          },
          expect.any(Function)
        );
      }, 0);
    });
  });

  describe('Installation', () => {
    test('should update blocking rules on installation', () => {
      installedListener();
      expect(chrome.storage.sync.get).toHaveBeenCalledWith('bannedUrls', expect.any(Function));
    });
  });
});