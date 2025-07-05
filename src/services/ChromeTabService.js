import { ITabService } from './interfaces/ITabService.js';

/**
 * Chrome tab service implementation
 */
export class ChromeTabService extends ITabService {
  /**
   * Query for tabs matching criteria
   * @param {Object} queryInfo - Query criteria
   * @returns {Promise<Array>} Matching tabs
   */
  async query(queryInfo) {
    return new Promise((resolve) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        resolve(tabs);
      });
    });
  }
}