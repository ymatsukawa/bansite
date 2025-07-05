/**
 * Interface for declarative net request rule management
 */
export class IRuleService {
  /**
   * Get existing dynamic rules
   * @returns {Promise<Array>} Current dynamic rules
   */
  async getDynamicRules() {
    throw new Error('Method must be implemented');
  }

  /**
   * Update dynamic rules
   * @param {Object} options - Update options with removeRuleIds and addRules
   * @returns {Promise<void>}
   */
  async updateDynamicRules(options) {
    throw new Error('Method must be implemented');
  }
}