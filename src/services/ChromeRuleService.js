import { IRuleService } from './interfaces/IRuleService.js';

/**
 * Chrome declarative net request service implementation
 */
export class ChromeRuleService extends IRuleService {
  /**
   * Get existing dynamic rules
   * @returns {Promise<Array>} Current dynamic rules
   */
  async getDynamicRules() {
    return new Promise((resolve) => {
      chrome.declarativeNetRequest.getDynamicRules((rules) => {
        resolve(rules);
      });
    });
  }

  /**
   * Update dynamic rules
   * @param {Object} options - Update options with removeRuleIds and addRules
   * @returns {Promise<void>}
   */
  async updateDynamicRules(options) {
    return new Promise((resolve, reject) => {
      chrome.declarativeNetRequest.updateDynamicRules(options, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}