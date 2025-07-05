import { IStorageService } from './interfaces/IStorageService.js';

/**
 * Chrome storage service implementation
 */
export class ChromeStorageService extends IStorageService {
  /**
   * Get data from Chrome sync storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} Storage data
   */
  async get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (data) => {
        resolve(data);
      });
    });
  }

  /**
   * Set data in Chrome sync storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async set(data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(data, () => {
        resolve();
      });
    });
  }
}