// Simplified background script that works without ES modules

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'updateRules') {
    updateBlockingRules();
  } else if (request.action === 'addBannedUrl') {
    addBannedUrl(request.url, sendResponse);
    return true;
  } else if (request.action === 'removeBannedUrl') {
    removeBannedUrl(request.url, sendResponse);
    return true;
  } else if (request.action === 'getBannedUrls') {
    getBannedUrls(sendResponse);
    return true;
  }
});

chrome.runtime.onInstalled.addListener(function() {
  updateBlockingRules();
});

function addBannedUrl(url, sendResponse) {
  chrome.storage.sync.get('bannedUrls', function(data) {
    const bannedUrls = data.bannedUrls || [];
    const normalizedUrl = url.trim().toLowerCase();
    
    if (!bannedUrls.includes(normalizedUrl)) {
      bannedUrls.push(normalizedUrl);
      chrome.storage.sync.set({bannedUrls: bannedUrls}, function() {
        updateBlockingRules();
        sendResponse({success: true});
      });
    } else {
      sendResponse({success: false, error: 'URL already banned'});
    }
  });
}

function removeBannedUrl(url, sendResponse) {
  chrome.storage.sync.get('bannedUrls', function(data) {
    const bannedUrls = data.bannedUrls || [];
    const normalizedUrl = url.trim().toLowerCase();
    const index = bannedUrls.indexOf(normalizedUrl);
    
    if (index > -1) {
      bannedUrls.splice(index, 1);
      chrome.storage.sync.set({bannedUrls: bannedUrls}, function() {
        updateBlockingRules();
        sendResponse({success: true});
      });
    } else {
      sendResponse({success: false, error: 'URL not found'});
    }
  });
}

function getBannedUrls(sendResponse) {
  chrome.storage.sync.get('bannedUrls', function(data) {
    sendResponse({bannedUrls: data.bannedUrls || []});
  });
}

function generateUrlPatterns(url) {
  if (!url) return [];
  
  const patterns = [];
  
  if (url.startsWith('*.')) {
    // Wildcard subdomain: *.example.com
    patterns.push(`*://${url}/*`);
    patterns.push(`*://${url}`);
  } else if (url.includes('*')) {
    // Custom pattern: keep as-is but ensure proper formatting
    patterns.push(`*://${url}/*`);
    patterns.push(`*://${url}`);
  } else {
    // Exact domain: example.com
    // Match both exact domain and subdomains
    patterns.push(`*://${url}/*`);
    patterns.push(`*://${url}`);
    patterns.push(`*://*.${url}/*`);
    patterns.push(`*://*.${url}`);
  }
  
  return patterns;
}

function updateBlockingRules() {
  chrome.storage.sync.get('bannedUrls', function(data) {
    const bannedUrls = data.bannedUrls || [];
    
    const rules = [];
    let ruleId = 1;
    
    bannedUrls.forEach(function(url) {
      const patterns = generateUrlPatterns(url);
      
      patterns.forEach(function(pattern) {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: {
            type: 'redirect',
            redirect: {
              extensionPath: '/blocked.html'
            }
          },
          condition: {
            urlFilter: pattern,
            resourceTypes: ['main_frame']
          }
        });
      });
    });
    
    chrome.declarativeNetRequest.getDynamicRules(function(existingRules) {
      const ruleIdsToRemove = existingRules.map(rule => rule.id);
      
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove,
        addRules: rules
      }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error updating blocking rules:', chrome.runtime.lastError);
        } else {
          console.log('Successfully updated blocking rules. Total rules:', rules.length);
        }
      });
    });
  });
}