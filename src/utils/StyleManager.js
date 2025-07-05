import { UI_CONFIG } from '../shared/constants.js';

/**
 * Manages CSS styles for content script components
 */
export class StyleManager {
  constructor() {
    this.injectedStyles = new Set();
  }

  /**
   * Inject editor styles into the page
   */
  injectEditorStyles() {
    if (this.injectedStyles.has('editor')) {
      return;
    }

    const style = document.createElement('style');
    style.textContent = this.getEditorCSS();
    document.head.appendChild(style);
    this.injectedStyles.add('editor');
  }

  /**
   * Get CSS for the ban list editor
   * @returns {string} CSS content
   */
  getEditorCSS() {
    return `
      #ban-list-editor {
        position: fixed;
        top: 20px;
        right: 20px;
        width: ${UI_CONFIG.EDITOR_WIDTH};
        max-height: ${UI_CONFIG.EDITOR_MAX_HEIGHT};
        background: white;
        border: 2px solid #333;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: ${UI_CONFIG.EDITOR_Z_INDEX};
        font-family: Arial, sans-serif;
        font-size: 14px;
        overflow: hidden;
      }
      
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
  }
}