// Simplified content script that works without ES modules

let banListEditor = null;

function createBanListEditor() {
  if (banListEditor) return;
  
  banListEditor = document.createElement('div');
  banListEditor.id = 'ban-list-editor';
  banListEditor.innerHTML = `
    <div class="ban-list-header">
      <h3>🚫 Ban List Editor</h3>
      <button class="ban-list-close" id="closeBanList">×</button>
    </div>
    <div class="ban-list-content">
      <div class="input-section">
        <input type="text" id="banUrlInput" placeholder="Enter URL to ban (e.g., facebook.com, *.example.com)">
        <button class="add-btn" id="addBanUrl">Add</button>
      </div>
      <div class="url-list" id="banUrlList">
        <div class="loading">Loading banned URLs...</div>
      </div>
    </div>
  `;
  
  banListEditor.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    max-height: 500px;
    background: white;
    border: 2px solid #333;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 2147483647;
    font-family: Arial, sans-serif;
    font-size: 14px;
    overflow: hidden;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    #ban-list-editor .ban-list-header {
      background: #333;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #ban-list-editor .ban-list-header h3 {
      margin: 0;
      font-size: 16px;
    }
    #ban-list-editor .ban-list-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #ban-list-editor .ban-list-close:hover {
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
    }
    #ban-list-editor .ban-list-content {
      padding: 20px;
    }
    #ban-list-editor .input-section {
      margin-bottom: 20px;
    }
    #ban-list-editor input[type="text"] {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }
    #ban-list-editor .add-btn {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    #ban-list-editor .add-btn:hover {
      background: #45a049;
    }
    #ban-list-editor .url-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 10px;
      background: #f9f9f9;
    }
    #ban-list-editor .url-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    #ban-list-editor .url-item:last-child {
      border-bottom: none;
    }
    #ban-list-editor .remove-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    #ban-list-editor .remove-btn:hover {
      background: #da190b;
    }
    #ban-list-editor .loading {
      text-align: center;
      color: #666;
      padding: 20px;
    }
    #ban-list-editor .empty-state {
      text-align: center;
      color: #666;
      padding: 20px;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(banListEditor);
  
  setupEventListeners();
  loadBannedUrls();
}

function setupEventListeners() {
  const closeBtn = document.getElementById('closeBanList');
  const addBtn = document.getElementById('addBanUrl');
  const urlInput = document.getElementById('banUrlInput');
  
  closeBtn.addEventListener('click', hideBanListEditor);
  addBtn.addEventListener('click', addUrl);
  urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      addUrl();
    }
  });
}

function addUrl() {
  const urlInput = document.getElementById('banUrlInput');
  const url = urlInput.value.trim();
  
  if (url) {
    chrome.runtime.sendMessage({
      action: 'addBannedUrl',
      url: url
    }, function(response) {
      if (response && response.success) {
        urlInput.value = '';
        loadBannedUrls();
      }
    });
  }
}

function removeUrl(url) {
  chrome.runtime.sendMessage({
    action: 'removeBannedUrl',
    url: url
  }, function(response) {
    if (response && response.success) {
      loadBannedUrls();
    }
  });
}

function loadBannedUrls() {
  chrome.runtime.sendMessage({action: 'getBannedUrls'}, function(response) {
    const urlList = document.getElementById('banUrlList');
    const bannedUrls = response.bannedUrls || [];
    
    if (bannedUrls.length === 0) {
      urlList.innerHTML = '<div class="empty-state">No banned URLs yet</div>';
      return;
    }
    
    urlList.innerHTML = '';
    bannedUrls.forEach(function(url) {
      const urlItem = document.createElement('div');
      urlItem.className = 'url-item';
      urlItem.innerHTML = `
        <span>${url}</span>
        <button class="remove-btn" onclick="removeUrl('${url}')">Remove</button>
      `;
      urlList.appendChild(urlItem);
    });
  });
}

function showBanListEditor() {
  if (!banListEditor) {
    createBanListEditor();
  } else {
    banListEditor.style.display = 'block';
    loadBannedUrls();
  }
}

function hideBanListEditor() {
  if (banListEditor) {
    banListEditor.style.display = 'none';
  }
}

function toggleBanListEditor() {
  if (!banListEditor || banListEditor.style.display === 'none') {
    showBanListEditor();
  } else {
    hideBanListEditor();
  }
}

window.removeUrl = removeUrl;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleBanListEditor') {
    toggleBanListEditor();
    sendResponse({success: true});
  }
});