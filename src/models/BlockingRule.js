import { RULE_CONFIG } from '../shared/constants.js';

/**
 * Domain model for blocking rule generation
 */
export class BlockingRule {
  /**
   * Create a BlockingRule instance
   * @param {number} id - Rule ID
   * @param {string} urlPattern - URL pattern to block
   */
  constructor(id, urlPattern) {
    this.id = id;
    this.urlPattern = urlPattern;
  }

  /**
   * Convert to Chrome declarative net request rule format
   * @returns {Object} Chrome rule object
   */
  toChromeRule() {
    return {
      id: this.id,
      priority: RULE_CONFIG.PRIORITY,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: RULE_CONFIG.BLOCKED_PAGE_PATH
        }
      },
      condition: {
        urlFilter: this.urlPattern,
        resourceTypes: RULE_CONFIG.RESOURCE_TYPES
      }
    };
  }

  /**
   * Generate multiple blocking rules from URL patterns
   * @param {Array<string>} patterns - URL patterns
   * @param {number} startId - Starting rule ID
   * @returns {Array<BlockingRule>} Array of blocking rules
   */
  static fromPatterns(patterns, startId = 1) {
    return patterns.map((pattern, index) => 
      new BlockingRule(startId + index, pattern)
    );
  }
}