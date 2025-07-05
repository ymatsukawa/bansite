import { BaseComponent } from './BaseComponent.js';

/**
 * URL input component
 */
export class UrlInputComponent extends BaseComponent {
  /**
   * Create URL input component
   * @param {Element} container - Container element
   */
  constructor(container) {
    super(container);
    this.input = null;
    this.button = null;
  }

  /**
   * Render the component
   */
  render() {
    this.element = this.createElement('div', { class: 'input-section' });
    
    this.input = this.createElement('input', {
      type: 'text',
      id: 'banUrlInput',
      placeholder: 'Enter URL to ban (e.g., facebook.com, *.example.com)'
    });
    
    this.button = this.createElement('button', {
      class: 'add-btn',
      id: 'addBanUrl'
    }, 'Add');
    
    this.element.appendChild(this.input);
    this.element.appendChild(this.button);
    
    this.setupEventListeners();
    this.container.appendChild(this.element);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.button.addEventListener('click', () => {
      this.handleAddUrl();
    });

    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddUrl();
      }
    });
  }

  /**
   * Handle add URL action
   */
  handleAddUrl() {
    const url = this.input.value.trim();
    if (url) {
      this.emit('urlAdd', url);
      this.input.value = '';
    }
  }

  /**
   * Focus the input
   */
  focus() {
    if (this.input) {
      this.input.focus();
    }
  }

  /**
   * Clear the input
   */
  clear() {
    if (this.input) {
      this.input.value = '';
    }
  }
}