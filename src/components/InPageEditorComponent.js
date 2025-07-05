import { BaseComponent } from './BaseComponent.js';
import { UrlInputComponent } from './UrlInputComponent.js';
import { UrlListComponent } from './UrlListComponent.js';
import { StyleManager } from '../utils/StyleManager.js';

/**
 * In-page editor component for content scripts
 */
export class InPageEditorComponent extends BaseComponent {
  /**
   * Create in-page editor component
   * @param {IMessagingService} messagingService - Messaging service
   */
  constructor(messagingService) {
    super(document.body);
    this.messagingService = messagingService;
    this.styleManager = new StyleManager();
    this.inputComponent = null;
    this.listComponent = null;
    this.isVisible = false;
  }

  /**
   * Render the component
   */
  render() {
    if (this.element) {
      return;
    }

    this.styleManager.injectEditorStyles();
    
    this.element = this.createElement('div', { id: 'ban-list-editor' });
    this.element.innerHTML = `
      <div class="ban-list-header">
        <h3>🚫 Ban List Editor</h3>
        <button class="ban-list-close" id="closeBanList">×</button>
      </div>
      <div class="ban-list-content">
        <div class="input-container"></div>
        <div class="list-container"></div>
      </div>
    `;

    document.body.appendChild(this.element);
    this.setupComponents();
    this.setupEventListeners();
    this.loadBannedUrls();
  }

  /**
   * Setup child components
   */
  setupComponents() {
    const inputContainer = this.element.querySelector('.input-container');
    const listContainer = this.element.querySelector('.list-container');

    this.inputComponent = new UrlInputComponent(inputContainer);
    this.inputComponent.render();
    
    this.listComponent = new UrlListComponent(listContainer);
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
   * Setup event listeners
   */
  setupEventListeners() {
    const closeBtn = this.element.querySelector('#closeBanList');
    closeBtn.addEventListener('click', () => {
      this.hide();
    });
  }

  /**
   * Add a banned URL
   * @param {string} url - URL to add
   */
  async addUrl(url) {
    try {
      const response = await this.messagingService.sendMessage({
        action: 'addBannedUrl',
        url: url
      });

      if (response && response.success) {
        this.inputComponent.clear();
        await this.loadBannedUrls();
      }
    } catch (error) {
      console.error('Error adding URL:', error);
    }
  }

  /**
   * Remove a banned URL
   * @param {string} url - URL to remove
   */
  async removeUrl(url) {
    try {
      const response = await this.messagingService.sendMessage({
        action: 'removeBannedUrl',
        url: url
      });

      if (response && response.success) {
        await this.loadBannedUrls();
      }
    } catch (error) {
      console.error('Error removing URL:', error);
    }
  }

  /**
   * Load banned URLs
   */
  async loadBannedUrls() {
    this.listComponent.showLoading();
    
    try {
      const response = await this.messagingService.sendMessage({
        action: 'getBannedUrls'
      });

      if (response && response.bannedUrls) {
        this.listComponent.updateUrls(response.bannedUrls);
      } else {
        this.listComponent.showError();
      }
    } catch (error) {
      console.error('Error loading banned URLs:', error);
      this.listComponent.showError();
    }
  }

  /**
   * Toggle editor visibility
   */
  toggle() {
    if (!this.element) {
      this.render();
      this.show();
    } else if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Show the editor
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
      this.isVisible = true;
      this.loadBannedUrls();
    }
  }

  /**
   * Hide the editor
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isVisible = false;
    }
  }
}