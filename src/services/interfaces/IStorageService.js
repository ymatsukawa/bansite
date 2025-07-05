/**
 * Interface for storage operations
 */
export class IStorageService {
  /**
   * Get data from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} Storage data
   */
  async get(key) {
    throw new Error('Method must be implemented');
  }

  /**
   * Set data in storage
   * @param {Object} data - Data to store
   * @returns {Promise<void>}
   */
  async set(data) {
    throw new Error('Method must be implemented');
  }
}