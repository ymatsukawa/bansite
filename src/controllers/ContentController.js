import { InPageEditorComponent } from '../components/InPageEditorComponent.js';
import { MESSAGE_TYPES } from '../shared/constants.js';

/**
 * Controller for content script functionality
 */
export class ContentController {
  /**
   * Create content controller
   * @param {IMessagingService} messagingService - Messaging service
   */
  constructor(messagingService) {
    this.messagingService = messagingService;
    this.editorComponent = null;
  }

  /**
   * Initialize the content script
   */
  initialize() {
    this.setupMessageHandling();
    this.createEditor();
  }

  /**
   * Setup message handling
   */
  setupMessageHandling() {
    this.messagingService.addMessageListener((request, sender, sendResponse) => {
      return this.handleMessage(request, sender, sendResponse);
    });
  }

  /**
   * Handle incoming messages
   * @param {Object} request - Message request
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response callback
   * @returns {boolean} True if response is async
   */
  handleMessage(request, sender, sendResponse) {
    if (request.action === MESSAGE_TYPES.TOGGLE_BAN_LIST_EDITOR) {
      this.toggleEditor();
      sendResponse({ success: true });
      return false;
    }
    
    return false;
  }

  /**
   * Create the editor component
   */
  createEditor() {
    if (!this.editorComponent) {
      this.editorComponent = new InPageEditorComponent(this.messagingService);
    }
  }

  /**
   * Toggle the editor
   */
  toggleEditor() {
    this.createEditor();
    this.editorComponent.toggle();
  }

  /**
   * Show the editor
   */
  showEditor() {
    this.createEditor();
    this.editorComponent.show();
  }

  /**
   * Hide the editor
   */
  hideEditor() {
    if (this.editorComponent) {
      this.editorComponent.hide();
    }
  }
}