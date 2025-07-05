// Simplified popup that works with existing HTML structure and doesn't require ES modules

let useInPageEditor = false;

class SimplePopupController {
  constructor() {
    this.initialize();
  }

  async initialize() {
    try {
      const shouldUsePopup = await this.shouldUsePopupInterface();
      
      if (shouldUsePopup) {
        this.showPopupEditor();
      } else {
        window.close();
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
      this.showPopupEditor();
    }
  }

  async shouldUsePopupInterface() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) {
          resolve(true);
          return;
        }

        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleBanListEditor' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    });
  }

  showPopupEditor() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('popupEditor').style.display = 'block';
    this.setupEventListeners();
    this.loadBannedUrls();
  }

  setupEventListeners() {
    // Create elements if they don't exist
    const popupContent = document.querySelector('.popup-content');
    
    if (!document.getElementById('banUrlInput')) {
      const inputContainer = document.querySelector('.input-container');
      inputContainer.innerHTML = `
        <input type="text" id="banUrlInput" placeholder="Enter URL to ban (e.g., facebook.com, *.example.com)">
        <button class="add-btn" id="addBanUrl">Add to Ban List</button>
      `;
    }

    if (!document.getElementById('banUrlList')) {
      const listContainer = document.querySelector('.list-container');
      listContainer.innerHTML = `<div class="url-list" id="banUrlList">
        <div class="empty-state">Loading banned URLs...</div>
      </div>`;
    }

    const addBtn = document.getElementById('addBanUrl');
    const urlInput = document.getElementById('banUrlInput');
    
    if (addBtn) {
      addBtn.addEventListener('click', () => this.addUrl());
    }
    
    if (urlInput) {
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addUrl();
        }
      });
    }
  }

  async addUrl() {
    const urlInput = document.getElementById('banUrlInput');
    const url = urlInput.value.trim();
    
    if (url) {
      try {
        const response = await this.sendMessage({
          action: 'addBannedUrl',
          url: url
        });

        if (response && response.success) {
          urlInput.value = '';
          await this.loadBannedUrls();
        } else {
          const error = response ? response.error : 'Unknown error';
          alert(`Failed to add URL: ${error}`);
        }
      } catch (error) {
        console.error('Error adding URL:', error);
        alert('Failed to add URL: Unknown error');
      }
    }
  }

  async removeUrl(url) {
    try {
      const response = await this.sendMessage({
        action: 'removeBannedUrl',
        url: url
      });

      if (response && response.success) {
        await this.loadBannedUrls();
      } else {
        const error = response ? response.error : 'Unknown error';
        alert(`Failed to remove URL: ${error}`);
      }
    } catch (error) {
      console.error('Error removing URL:', error);
      alert('Failed to remove URL: Unknown error');
    }
  }

  async loadBannedUrls() {
    const urlList = document.getElementById('banUrlList');
    if (!urlList) return;

    urlList.innerHTML = '<div class="loading">Loading banned URLs...</div>';
    
    try {
      const response = await this.sendMessage({
        action: 'getBannedUrls'
      });

      if (!response || !response.bannedUrls) {
        urlList.innerHTML = '<div class="empty-state">Error loading URLs</div>';
        return;
      }

      const bannedUrls = response.bannedUrls;
      
      if (bannedUrls.length === 0) {
        urlList.innerHTML = '<div class="empty-state">No banned URLs yet</div>';
        return;
      }

      urlList.innerHTML = '';
      bannedUrls.forEach((url) => {
        const urlItem = document.createElement('div');
        urlItem.className = 'url-item';
        urlItem.innerHTML = `
          <span>${url}</span>
          <button class="remove-btn" data-url="${url}">Remove</button>
        `;
        
        const removeBtn = urlItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
          this.removeUrl(removeBtn.getAttribute('data-url'));
        });
        
        urlList.appendChild(urlItem);
      });
    } catch (error) {
      console.error('Error loading banned URLs:', error);
      urlList.innerHTML = '<div class="empty-state">Error loading URLs</div>';
    }
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const controller = new SimplePopupController();
  
  // Make removeUrl available globally for compatibility
  window.removeUrl = (url) => {
    controller.removeUrl(url);
  };
});