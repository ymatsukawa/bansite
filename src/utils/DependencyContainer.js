import { ChromeStorageService } from '../services/ChromeStorageService.js';
import { ChromeRuleService } from '../services/ChromeRuleService.js';
import { ChromeMessagingService } from '../services/ChromeMessagingService.js';
import { ChromeTabService } from '../services/ChromeTabService.js';
import { BannedUrlRepository } from '../repositories/BannedUrlRepository.js';
import { BlockingRuleManager } from '../services/BlockingRuleManager.js';
import { MessageHandler } from '../handlers/MessageHandler.js';

/**
 * Dependency injection container
 */
export class DependencyContainer {
  constructor() {
    this._services = new Map();
    this._initializeServices();
  }

  /**
   * Initialize all services and their dependencies
   * @private
   */
  _initializeServices() {
    // Core Chrome API services
    this._services.set('storageService', new ChromeStorageService());
    this._services.set('ruleService', new ChromeRuleService());
    this._services.set('messagingService', new ChromeMessagingService());
    this._services.set('tabService', new ChromeTabService());

    // Repository layer
    const urlRepository = new BannedUrlRepository(this.get('storageService'));
    this._services.set('urlRepository', urlRepository);

    // Service layer
    const ruleManager = new BlockingRuleManager(
      this.get('ruleService'),
      urlRepository
    );
    this._services.set('ruleManager', ruleManager);

    // Handler layer
    const messageHandler = new MessageHandler(urlRepository, ruleManager);
    this._services.set('messageHandler', messageHandler);
  }

  /**
   * Get a service by name
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  get(name) {
    if (!this._services.has(name)) {
      throw new Error(`Service '${name}' not found`);
    }
    return this._services.get(name);
  }
}