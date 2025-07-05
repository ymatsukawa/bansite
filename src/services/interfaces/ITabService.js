/**
 * Interface for tab management operations
 */
export class ITabService {
  /**
   * Query for tabs matching criteria
   * @param {Object} queryInfo - Query criteria
   * @returns {Promise<Array>} Matching tabs
   */
  async query(queryInfo) {
    throw new Error('Method must be implemented');
  }
}