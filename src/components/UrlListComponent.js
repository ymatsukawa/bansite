import { BaseComponent } from './BaseComponent.js';

/**
 * URL list component
 */
export class UrlListComponent extends BaseComponent {
  /**
   * Create URL list component
   * @param {Element} container - Container element
   */
  constructor(container) {
    super(container);
    this.urls = [];
  }

  /**
   * Render the component
   */
  render() {
    this.element = this.createElement('div', {
      class: 'url-list',
      id: 'banUrlList'
    });
    
    this.container.appendChild(this.element);
    this.renderList();
  }

  /**
   * Update the URL list
   * @param {Array<string>} urls - Array of URLs
   */
  updateUrls(urls) {
    this.urls = urls;
    this.renderList();
  }

  /**
   * Render the URL list
   */
  renderList() {
    if (!this.element) return;

    if (this.urls.length === 0) {
      this.element.innerHTML = '<div class="empty-state">No banned URLs yet</div>';
      return;
    }

    this.element.innerHTML = '';
    
    this.urls.forEach(url => {
      const urlItem = this.createUrlItem(url);
      this.element.appendChild(urlItem);
    });
  }

  /**
   * Create a URL item element
   * @param {string} url - URL string
   * @returns {Element} URL item element
   */
  createUrlItem(url) {
    const urlItem = this.createElement('div', { class: 'url-item' });
    
    const urlSpan = this.createElement('span', {}, url);
    const removeBtn = this.createElement('button', {
      class: 'remove-btn'
    }, 'Remove');
    
    removeBtn.addEventListener('click', () => {
      this.emit('urlRemove', url);
    });
    
    urlItem.appendChild(urlSpan);
    urlItem.appendChild(removeBtn);
    
    return urlItem;
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.element) {
      this.element.innerHTML = '<div class="loading">Loading banned URLs...</div>';
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message
   */
  showError(message = 'Error loading URLs') {
    if (this.element) {
      this.element.innerHTML = `<div class="empty-state">${message}</div>`;
    }
  }
}