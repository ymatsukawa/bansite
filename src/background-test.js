// Test-compatible CommonJS version of background.js
// This provides the same functionality but with CommonJS exports for Jest

let messageListener;
let installedListener;

// Mock DI container for testing
const mockContainer = {
  urlRepository: {
    add: async (url) => {
      const normalized = url.trim().toLowerCase();
      const data = await mockStorage.get('bannedUrls');
      const bannedUrls = data.bannedUrls || [];
      
      if (bannedUrls.includes(normalized)) {
        return { success: false, error: 'URL already banned' };
      }
      
      bannedUrls.push(normalized);
      await mockStorage.set({ bannedUrls });
      return { success: true };
    },
    
    remove: async (url) => {
      const normalized = url.trim().toLowerCase();
      const data = await mockStorage.get('bannedUrls');
      const bannedUrls = data.bannedUrls || [];
      
      const index = bannedUrls.indexOf(normalized);
      if (index === -1) {
        return { success: false, error: 'URL not found' };
      }
      
      bannedUrls.splice(index, 1);
      await mockStorage.set({ bannedUrls });
      return { success: true };
    },
    
    getAll: async () => {
      const data = await mockStorage.get('bannedUrls');
      const urls = data.bannedUrls || [];
      return urls.map(url => ({ getUrl: () => url, generatePatterns: () => generatePatterns(url) }));
    }
  },
  
  ruleManager: {
    updateRules: async () => {
      const patterns = await mockContainer.urlRepository.getAll();
      const allPatterns = [];
      patterns.forEach(p => allPatterns.push(...p.generatePatterns()));
      
      const rules = allPatterns.map((pattern, index) => ({
        id: index + 1,
        priority: 1,
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' }},
        condition: { urlFilter: pattern, resourceTypes: ['main_frame'] }
      }));
      
      chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
        const ruleIdsToRemove = existingRules.map(rule => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIdsToRemove,
          addRules: rules
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error updating blocking rules:', chrome.runtime.lastError);
          } else {
            console.log('Successfully updated blocking rules. Total rules:', rules.length);
          }
        });
      });
    }
  }
};

// Mock storage
const mockStorage = {
  get: (key) => new Promise(resolve => chrome.storage.sync.get(key, resolve)),
  set: (data) => new Promise(resolve => chrome.storage.sync.set(data, resolve))
};

function generatePatterns(url) {
  if (url.startsWith('*.')) {
    return [`*://${url}/*`, `*://${url}`];
  } else if (url.includes('*')) {
    return [`*://${url}/*`, `*://${url}`];
  } else {
    return [`*://${url}/*`, `*://${url}`, `*://*.${url}/*`, `*://*.${url}`];
  }
}

// Set up listeners
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  messageListener = function(req, send, sendResp) {
    if (req.action === 'updateRules') {
      mockContainer.ruleManager.updateRules();
      return false;
    } else if (req.action === 'addBannedUrl') {
      mockContainer.urlRepository.add(req.url).then(result => {
        if (sendResp) sendResp(result);
        if (result.success) mockContainer.ruleManager.updateRules();
      });
      return true;
    } else if (req.action === 'removeBannedUrl') {
      mockContainer.urlRepository.remove(req.url).then(result => {
        if (sendResp) sendResp(result);
        if (result.success) mockContainer.ruleManager.updateRules();
      });
      return true;
    } else if (req.action === 'getBannedUrls') {
      mockContainer.urlRepository.getAll().then(urls => {
        const result = { bannedUrls: urls.map(u => u.getUrl()) };
        if (sendResp) sendResp(result);
      });
      return true;
    }
    return false;
  };
  return messageListener(request, sender, sendResponse);
});

chrome.runtime.onInstalled.addListener(function() {
  installedListener = () => mockContainer.ruleManager.updateRules();
  installedListener();
});