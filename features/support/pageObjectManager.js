// Import page objects
const { SauceDemoPage } = require('../page-objects/SauceDemoPage');
const { SauceDemoLoginPage } = require('../page-objects/SauceDemoLoginPage');
const { SauceDemoProductsPage } = require('../page-objects/SauceDemoProductsPage');
const { SauceDemoCartPage } = require('../page-objects/SauceDemoCartPage');
const { SauceDemoCheckoutPage } = require('../page-objects/SauceDemoCheckoutPage');

/**
 * Page Object Manager - Manages all page objects and provides easy access
 */
class PageObjectManager {
  constructor(page) {
    this.page = page;
    this.pages = {};
  }

  getPage(pageName) {
    switch(pageName.toLowerCase()) {
      case 'saucedemo':
        return new SauceDemoPage(this.page);
      case 'saucedemo login':
        return new SauceDemoLoginPage(this.page);
      case 'saucedemo products':
        return new SauceDemoProductsPage(this.page);
      case 'saucedemo cart':
        return new SauceDemoCartPage(this.page);
      case 'saucedemo checkout':
        return new SauceDemoCheckoutPage(this.page);
      default:
        throw new Error(`Page ${pageName} is not supported`);
    }
  }
}

module.exports = { PageObjectManager };
