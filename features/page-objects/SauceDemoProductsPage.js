const { BasePage } = require('../support/basePage');

/**
 * SauceDemo Products Page
 * Handles product listing and interactions for the SauceDemo website
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
   * Add a product to the cart by name
   * @param {string} productName - Name of the product to add
   */
  async addProductToCart(productName) {
    // Find the product by name
    const productCard = await this.page.locator(`${this.inventoryItem}:has-text("${productName}")`).first();
    
    // Click the add to cart button within that product card
    await productCard.locator('button[data-test^="add-to-cart"]').click();
  }

  /**
   * Remove a product from the cart by name
   * @param {string} productName - Name of the product to remove
   */
  async removeProductFromCart(productName) {
    // Find the product by name
    const productCard = await this.page.locator(`${this.inventoryItem}:has-text("${productName}")`).first();
    
    // Click the remove button within that product card
    await productCard.locator('button[data-test^="remove"]').click();
  }

  /**
   * Get the cart badge count
   * @returns {string} The cart badge count as text
   */
  async getCartBadgeCount() {
    try {
      return await this.getText(this.cartBadge);
    } catch (e) {
      return "0"; // Return 0 if the badge is not present
    }
  }

  /**
   * Click on the cart icon to navigate to the cart
   */
  async goToCart() {
    await this.clickElement(this.cartIcon);
  }

  /**
   * Sort products by the given option
   * @param {string} sortOption - Option to sort by (e.g., "Price (low to high)")
   */
  async sortProductsBy(sortOption) {
    await this.page.selectOption(this.productSortContainer, { label: sortOption });
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
}

module.exports = { SauceDemoProductsPage };
