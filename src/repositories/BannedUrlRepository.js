import { BannedUrl } from '../models/BannedUrl.js';
import { STORAGE_KEYS, ERROR_MESSAGES } from '../shared/constants.js';

/**
 * Repository for managing banned URLs
 */
export class BannedUrlRepository {
  /**
   * Create a repository instance
   * @param {IStorageService} storageService - Storage service implementation
   */
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Get all banned URLs
   * @returns {Promise<Array<BannedUrl>>} Array of banned URLs
   */
  async getAll() {
    const data = await this.storageService.get(STORAGE_KEYS.BANNED_URLS);
    const urls = data[STORAGE_KEYS.BANNED_URLS] || [];
    return urls.map(url => new BannedUrl(url));
  }

  /**
   * Add a new banned URL
   * @param {string} url - URL to ban
   * @returns {Promise<{success: boolean, error?: string}>} Operation result
   */
  async add(url) {
    const bannedUrl = new BannedUrl(url);
    
    if (!bannedUrl.isValid()) {
      return { success: false, error: 'Invalid URL' };
    }

    const existingUrls = await this.getAll();
    
    if (existingUrls.some(existing => existing.equals(bannedUrl))) {
      return { success: false, error: ERROR_MESSAGES.URL_ALREADY_BANNED };
    }

    const allUrls = existingUrls.map(u => u.getUrl());
    allUrls.push(bannedUrl.getUrl());
    
    await this.storageService.set({ [STORAGE_KEYS.BANNED_URLS]: allUrls });
    return { success: true };
  }

  /**
   * Remove a banned URL
   * @param {string} url - URL to remove
   * @returns {Promise<{success: boolean, error?: string}>} Operation result
   */
  async remove(url) {
    const targetUrl = new BannedUrl(url);
    const existingUrls = await this.getAll();
    
    const filteredUrls = existingUrls.filter(existing => !existing.equals(targetUrl));
    
    if (filteredUrls.length === existingUrls.length) {
      return { success: false, error: ERROR_MESSAGES.URL_NOT_FOUND };
    }

    const urlStrings = filteredUrls.map(u => u.getUrl());
    await this.storageService.set({ [STORAGE_KEYS.BANNED_URLS]: urlStrings });
    return { success: true };
  }

  /**
   * Get all URL patterns for rule generation
   * @returns {Promise<Array<string>>} Array of URL patterns
   */
  async getAllPatterns() {
    const bannedUrls = await this.getAll();
    const allPatterns = [];
    
    bannedUrls.forEach(bannedUrl => {
      const patterns = bannedUrl.generatePatterns();
      allPatterns.push(...patterns);
    });
    
    return allPatterns;
  }
}