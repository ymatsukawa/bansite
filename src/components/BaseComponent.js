import { EventEmitter } from '../utils/EventEmitter.js';

/**
 * Base UI component class
 */
export class BaseComponent extends EventEmitter {
  /**
   * Create a base component
   * @param {Element} container - Container element
   */
  constructor(container) {
    super();
    this.container = container;
    this.element = null;
  }

  /**
   * Render the component
   */
  render() {
    throw new Error('render() method must be implemented');
  }

  /**
   * Destroy the component
   */
  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  /**
   * Show the component
   */
  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  /**
   * Hide the component
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  /**
   * Create element with attributes
   * @param {string} tag - HTML tag
   * @param {Object} attributes - Element attributes
   * @param {string} content - Inner content
   * @returns {Element} Created element
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  }
}