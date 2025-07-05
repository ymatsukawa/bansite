import { UrlInputComponent } from '../components/UrlInputComponent.js';
import { UrlListComponent } from '../components/UrlListComponent.js';
import { MESSAGE_TYPES } from '../shared/constants.js';

/**
 * Controller for popup interface
 */
export class PopupController {
  /**
   * Create popup controller
   * @param {IMessagingService} messagingService - Messaging service
   * @param {ITabService} tabService - Tab service
   */
  constructor(messagingService, tabService) {
    this.messagingService = messagingService;
    this.tabService = tabService;
    this.inputComponent = null;
    this.listComponent = null;
    this.useInPageEditor = false;
  }

  /**
   * Initialize the popup interface
   */
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

  /**
   * Check if should use popup interface vs in-page editor
   * @returns {Promise<boolean>} True if should use popup
   */
  async shouldUsePopupInterface() {
    const tabs = await this.tabService.query({ active: true, currentWindow: true });
    
    if (!tabs[0]) {
      return true;
    }

    const result = await this.messagingService.sendTabMessage(
      tabs[0].id, 
      { action: MESSAGE_TYPES.TOGGLE_BAN_LIST_EDITOR }
    );

    return !!(result.error || !result.response);
  }

  /**
   * Show popup editor interface
   */
  showPopupEditor() {
    this.hideLoading();
    this.showPopupContainer();
    this.setupComponents();
    this.loadBannedUrls();
  }

  /**
   * Setup UI components
   */
  setupComponents() {
    const popupEditor = document.getElementById('popupEditor');
    
    this.inputComponent = new UrlInputComponent(
      popupEditor.querySelector('.input-container')
    );
    this.inputComponent.render();
    
    this.listComponent = new UrlListComponent(
      popupEditor.querySelector('.list-container')
    );
    this.listComponent.render();
    
    this.setupComponentEvents();
  }

  /**
   * Setup component event handlers
   */
  setupComponentEvents() {
    this.inputComponent.on('urlAdd', async (url) => {
      await this.addUrl(url);
    });

    this.listComponent.on('urlRemove', async (url) => {
      await this.removeUrl(url);
    });
  }

  /**
   * Add a banned URL
   * @param {string} url - URL to add
   */
  async addUrl(url) {
    try {
      const response = await this.messagingService.sendMessage({
        action: MESSAGE_TYPES.ADD_BANNED_URL,
        url: url
      });

      if (response && response.success) {
        this.inputComponent.clear();
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

  /**
   * Remove a banned URL
   * @param {string} url - URL to remove
   */
  async removeUrl(url) {
    try {
      const response = await this.messagingService.sendMessage({
        action: MESSAGE_TYPES.REMOVE_BANNED_URL,
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

  /**
   * Load banned URLs
   */
  async loadBannedUrls() {
    this.listComponent.showLoading();
    
    try {
      const response = await this.messagingService.sendMessage({
        action: MESSAGE_TYPES.GET_BANNED_URLS
      });

      if (!response || !response.bannedUrls) {
        this.listComponent.showError();
        return;
      }

      this.listComponent.updateUrls(response.bannedUrls);
    } catch (error) {
      console.error('Error loading banned URLs:', error);
      this.listComponent.showError();
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  /**
   * Show popup container
   */
  showPopupContainer() {
    const popupEditor = document.getElementById('popupEditor');
    if (popupEditor) {
      popupEditor.style.display = 'block';
    }
  }
}