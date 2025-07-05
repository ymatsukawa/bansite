/**
 * Domain model for banned URL management
 */
export class BannedUrl {
  /**
   * Create a BannedUrl instance
   * @param {string} url - The URL string
   */
  constructor(url) {
    this.originalUrl = url;
    this.normalizedUrl = this._normalize(url);
  }

  /**
   * Normalize the URL by trimming and converting to lowercase
   * @param {string} url - Raw URL
   * @returns {string} Normalized URL
   * @private
   */
  _normalize(url) {
    return url.trim().toLowerCase();
  }

  /**
   * Check if the URL is valid (non-empty after normalization)
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.normalizedUrl.length > 0;
  }

  /**
   * Get the normalized URL
   * @returns {string} Normalized URL
   */
  getUrl() {
    return this.normalizedUrl;
  }

  /**
   * Generate URL patterns for declarative net request
   * @returns {Array<string>} Array of URL patterns
   */
  generatePatterns() {
    if (!this.isValid()) {
      return [];
    }

    const url = this.normalizedUrl;
    const patterns = [];

    if (url.startsWith('*.')) {
      // Wildcard subdomain: *.example.com
      patterns.push(`*://${url}/*`);
      patterns.push(`*://${url}`);
    } else if (url.includes('*')) {
      // Custom pattern: keep as-is but ensure proper formatting
      patterns.push(`*://${url}/*`);
      patterns.push(`*://${url}`);
    } else {
      // Exact domain: example.com
      // Match both exact domain and subdomains
      patterns.push(`*://${url}/*`);
      patterns.push(`*://${url}`);
      patterns.push(`*://*.${url}/*`);
      patterns.push(`*://*.${url}`);
    }

    return patterns;
  }

  /**
   * Check if this URL equals another URL
   * @param {string|BannedUrl} other - URL to compare
   * @returns {boolean} True if equal
   */
  equals(other) {
    const otherUrl = other instanceof BannedUrl ? other.getUrl() : this._normalize(other);
    return this.normalizedUrl === otherUrl;
  }
}