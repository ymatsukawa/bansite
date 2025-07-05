const puppeteer = require('puppeteer');
const path = require('path');

class ExtensionTestHelper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.extensionId = null;
  }

  async setup() {
    // Launch browser with extension loaded
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      args: [
        `--disable-extensions-except=${path.join(__dirname, '../../src')}`,
        `--load-extension=${path.join(__dirname, '../../src')}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    // Create new page for testing
    this.page = await this.browser.newPage();
    
    // Wait for extension to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get the extension ID by checking all targets
    const targets = await this.browser.targets();
    const extensionTarget = targets.find(
      target => target.url().includes('chrome-extension://')
    );
    
    if (extensionTarget) {
      this.extensionId = extensionTarget.url().split('/')[2];
    }

    // If we still don't have extension ID, try alternative method
    if (!this.extensionId) {
      // Create a page and go to chrome://extensions to find the extension
      const extensionsPage = await this.browser.newPage();
      await extensionsPage.goto('chrome://extensions/');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get extension ID from the page
      const extensionIds = await extensionsPage.evaluate(() => {
        const extensions = document.querySelectorAll('extensions-item');
        return Array.from(extensions).map(ext => ext.id);
      });
      
      if (extensionIds.length > 0) {
        this.extensionId = extensionIds[0];
      }
      
      await extensionsPage.close();
    }
    
    return { browser: this.browser, page: this.page, extensionId: this.extensionId };
  }

  async teardown() {
    if (this.page) {
      await this.page.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  async openPopup() {
    if (!this.extensionId) {
      throw new Error('Extension ID not found');
    }
    
    const popupUrl = `chrome-extension://${this.extensionId}/popup.html`;
    await this.page.goto(popupUrl);
    return this.page;
  }

  async navigateToSite(url) {
    await this.page.goto(url);
    return this.page;
  }

  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
    return this.page.$(selector);
  }

  async clickElement(selector) {
    await this.page.click(selector);
  }

  async typeText(selector, text) {
    await this.page.type(selector, text);
  }

  async getStorageData() {
    // Make sure we're on the extension popup page
    await this.openPopup();
    
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.get(['bannedUrls'], (result) => {
            resolve(result);
          });
        } else {
          resolve({ bannedUrls: [] });
        }
      });
    });
  }

  async clearStorage() {
    // Make sure we're on the extension popup page
    await this.openPopup();
    
    await this.page.evaluate(() => {
      return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
          chrome.storage.sync.clear(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  async isBlocked(url) {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      const currentUrl = this.page.url();
      return currentUrl.includes('blocked.html');
    } catch (error) {
      return false;
    }
  }
}

module.exports = ExtensionTestHelper;