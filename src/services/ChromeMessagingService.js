import { IMessagingService } from './interfaces/IMessagingService.js';

/**
 * Chrome messaging service implementation
 */
export class ChromeMessagingService extends IMessagingService {
  /**
   * Send a message to the runtime
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from message handler
   */
  async sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }

  /**
   * Send a message to a specific tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from message handler
   */
  async sendTabMessage(tabId, message) {
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        resolve({
          response,
          error: chrome.runtime.lastError
        });
      });
    });
  }

  /**
   * Add a message listener
   * @param {Function} listener - Message listener function
   */
  addMessageListener(listener) {
    chrome.runtime.onMessage.addListener(listener);
  }
}