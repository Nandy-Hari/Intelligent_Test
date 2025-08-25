const { BasePage } = require('../support/basePage');

/**
 * SauceDemo Cart Page
 * Handles shopping cart functionality for the SauceDemo website
 */
class SauceDemoCartPage extends BasePage {
  /**
   * Constructor for SauceDemo Cart Page
   * @param {Object} page - Playwright page object
   */
  constructor(page) {
    super(page);
    // Selectors
    this.pageTitle = '.title';
    this.cartItem = '.cart_item';
    this.itemName = '.inventory_item_name';
    this.itemPrice = '.inventory_item_price';
    this.removeButton = 'button[data-test^="remove"]';
    this.continueShoppingButton = '[data-test="continue-shopping"]';
    this.checkoutButton = '[data-test="checkout"]';
    this.url = 'https://www.saucedemo.com/cart.html';
  }

  /**
   * Navigate to the cart page
   */
  async navigateToCartPage() {
    await this.navigateTo(this.url);
  }

  /**
   * Get the title of the cart page
   * @returns {string} The title text
   */
  async getCartPageTitle() {
    return await this.getText(this.pageTitle);
  }

  /**
   * Get all items in the cart
   * @returns {Array<string>} Array of item names
   */
  async getCartItemNames() {
    return await this.page.$$eval(this.itemName, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  /**
   * Get all item prices in the cart
   * @returns {Array<string>} Array of item prices
   */
  async getCartItemPrices() {
    return await this.page.$$eval(this.itemPrice, elements => 
      elements.map(el => el.textContent.trim())
    );
  }

  /**
   * Remove an item from the cart by name
   * @param {string} itemName - Name of the item to remove
   */
  async removeItemFromCart(itemName) {
    // Find the item by name
    const itemRow = await this.page.locator(`${this.cartItem}:has-text("${itemName}")`).first();
    
    // Click the remove button within that item row
    await itemRow.locator(this.removeButton).click();
  }

  /**
   * Continue shopping (go back to products)
   */
  async continueShopping() {
    await this.clickElement(this.continueShoppingButton);
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.clickElement(this.checkoutButton);
  }

  /**
   * Check if cart is empty
   * @returns {boolean} True if cart is empty
   */
  async isCartEmpty() {
    const cartItems = await this.page.$$(this.cartItem);
    return cartItems.length === 0;
  }
}

module.exports = { SauceDemoCartPage };
