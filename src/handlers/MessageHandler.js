import { MESSAGE_TYPES } from '../shared/constants.js';

/**
 * Base message handler with command pattern implementation
 */
export class MessageHandler {
  /**
   * Create a message handler
   * @param {BannedUrlRepository} urlRepository - URL repository
   * @param {BlockingRuleManager} ruleManager - Rule manager
   */
  constructor(urlRepository, ruleManager) {
    this.urlRepository = urlRepository;
    this.ruleManager = ruleManager;
    this.commands = this._initializeCommands();
  }

  /**
   * Initialize command handlers
   * @returns {Object} Command mapping
   * @private
   */
  _initializeCommands() {
    return {
      [MESSAGE_TYPES.UPDATE_RULES]: () => this.ruleManager.updateRules(),
      [MESSAGE_TYPES.ADD_BANNED_URL]: (request) => this.urlRepository.add(request.url),
      [MESSAGE_TYPES.REMOVE_BANNED_URL]: (request) => this.urlRepository.remove(request.url),
      [MESSAGE_TYPES.GET_BANNED_URLS]: async () => {
        const urls = await this.urlRepository.getAll();
        return { bannedUrls: urls.map(url => url.getUrl()) };
      }
    };
  }

  /**
   * Handle incoming messages
   * @param {Object} request - Message request
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response callback
   * @returns {boolean} True if response is async
   */
  async handleMessage(request, sender, sendResponse) {
    const command = this.commands[request.action];
    
    if (!command) {
      return false;
    }

    try {
      const result = await command(request);
      
      if (request.action === MESSAGE_TYPES.UPDATE_RULES) {
        return false;
      }
      
      if (result && typeof sendResponse === 'function') {
        sendResponse(result);
      }
      
      if (request.action === MESSAGE_TYPES.ADD_BANNED_URL || 
          request.action === MESSAGE_TYPES.REMOVE_BANNED_URL) {
        await this.ruleManager.updateRules();
      }
      
      return true;
    } catch (error) {
      console.error('Error handling message:', error);
      if (typeof sendResponse === 'function') {
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }
  }
}