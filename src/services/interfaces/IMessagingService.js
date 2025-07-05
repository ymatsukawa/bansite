/**
 * Interface for Chrome messaging operations
 */
export class IMessagingService {
  /**
   * Send a message to the runtime
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from message handler
   */
  async sendMessage(message) {
    throw new Error('Method must be implemented');
  }

  /**
   * Send a message to a specific tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   * @returns {Promise<any>} Response from message handler
   */
  async sendTabMessage(tabId, message) {
    throw new Error('Method must be implemented');
  }

  /**
   * Add a message listener
   * @param {Function} listener - Message listener function
   */
  addMessageListener(listener) {
    throw new Error('Method must be implemented');
  }
}