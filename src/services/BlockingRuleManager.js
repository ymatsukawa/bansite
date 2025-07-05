import { BlockingRule } from '../models/BlockingRule.js';

/**
 * Service for managing blocking rules
 */
export class BlockingRuleManager {
  /**
   * Create a rule manager instance
   * @param {IRuleService} ruleService - Rule service implementation
   * @param {BannedUrlRepository} urlRepository - URL repository
   */
  constructor(ruleService, urlRepository) {
    this.ruleService = ruleService;
    this.urlRepository = urlRepository;
  }

  /**
   * Update blocking rules based on current banned URLs
   * @returns {Promise<void>}
   */
  async updateRules() {
    try {
      const patterns = await this.urlRepository.getAllPatterns();
      const existingRules = await this.ruleService.getDynamicRules();
      
      const ruleIdsToRemove = existingRules.map(rule => rule.id);
      const blockingRules = BlockingRule.fromPatterns(patterns);
      const chromeRules = blockingRules.map(rule => rule.toChromeRule());
      
      await this.ruleService.updateDynamicRules({
        removeRuleIds: ruleIdsToRemove,
        addRules: chromeRules
      });
      
      console.log('Successfully updated blocking rules. Total rules:', chromeRules.length);
    } catch (error) {
      console.error('Error updating blocking rules:', error);
      throw error;
    }
  }
}