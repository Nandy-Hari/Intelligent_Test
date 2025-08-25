const { BasePage } = require('../support/pageObjectManager');

/**
 * Enhanced SauceDemo Products Page with filtering capabilities
 */
class SauceDemoProductsPage extends BasePage {
  /**
   * Constructor for SauceDemo Products Page
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    // Selectors
    this.productTitle = '.title';
    this.inventoryItem = '.inventory_item';
    this.productName = '.inventory_item_name';
    this.productPrice = '.inventory_item_price';
    this.addToCartButton = 'button[data-test^="add-to-cart"]';
    this.removeFromCartButton = 'button[data-test^="remove"]';
    this.cartBadge = '.shopping_cart_badge';
    this.cartIcon = '.shopping_cart_link';
    this.productSortContainer = '[data-test="product_sort_container"]';
    this.backButton = '#back-to-products';
    this.url = 'https://www.saucedemo.com/inventory.html';
  }

  /**
   * Navigate to the products page
   */
  async navigateToProductsPage() {
    await this.navigateTo(this.url);
  }

  /**
   * Get the title of the products page
   * @returns {string} The title text
   */
  async getProductsTitle() {
    return await this.getText(this.productTitle);
  }

  /**
   * Sort products by the given option
   * @param {string} sortOption - Option to sort by (e.g., "Price (low to high)")
   */
  async sortProductsBy(sortOption) {
    await this.page.selectOption(this.productSortContainer, { label: sortOption });
    // Wait for sorting to complete
    await this.page.waitForTimeout(500);
  }

  /**
   * Get all product names
   * @returns {Array<string>} Array of product names
   */
  async getAllProductNames() {
    return await this.page.$$eval(this.productName, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  /**
   * Get all product prices
   * @returns {Array<string>} Array of product prices
   */
  async getAllProductPrices() {
    return await this.page.$$eval(this.productPrice, elements => 
      elements.map(el => el.textContent.trim())
    );
  }
  
  /**
   * Click on a product by name
   * @param {string} productName - Name of the product to click
   */
  async clickOnProduct(productName) {
    await this.page.click(`${this.productName}:has-text("${productName}")`);
  }
  
  /**
   * Click on back to products button
   */
  async clickBackToProducts() {
    await this.clickElement(this.backButton);
  }
  
  /**
   * Get the current sort option
   * @returns {string} The currently selected sort option
   */
  async getCurrentSortOption() {
    const value = await this.page.$eval(this.productSortContainer, el => el.value);
    switch (value) {
      case 'az': return 'Name (A to Z)';
      case 'za': return 'Name (Z to A)';
      case 'lohi': return 'Price (low to high)';
      case 'hilo': return 'Price (high to low)';
      default: return value;
    }
  }
}

module.exports = { SauceDemoProductsPage };
